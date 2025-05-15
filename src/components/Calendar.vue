<template>
  <v-container>
    <!-- Botão de novo atendimento -->
    <v-btn color="primary" @click="openEventModal" prepend-icon="mdi-plus">
      Novo Atendimento
    </v-btn>
    <!-- Calendário -->
    <FullCalendar ref="calendar" :options="calendarOptions" class="mt-4" />

    <!-- Modal de Cadastro/Alteração de Evento -->
    <v-dialog v-model="showModal" max-width="600px">
      <v-card>
        <v-card-title class="text-h6">
          {{ eventData.id ? 'Editar Atendimento' : 'Novo Atendimento' }}
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Título" v-model="eventData.title" required />
              </v-col>

              <v-col cols="6">
                <v-text-field label="Data" v-model="eventData.startDate" type="date" required />
              </v-col>

              <v-col cols="6">
                <v-text-field label="Hora" v-model="eventData.startTime" type="time" required />
              </v-col>

              <v-col cols="6">
                <v-text-field label="Duração (minutos)" v-model="eventData.duration" type="number" required />
              </v-col>

              <v-col cols="6">
                <v-select label="Tipo de Atendimento" v-model="eventData.tipoAtendimento"
                  :items="['Avulso', 'Contrato']" required />
              </v-col>

              <v-col cols="12" v-if="eventData.tipoAtendimento === 'Avulso'">
                <v-text-field label="Valor do Atendimento Avulso" v-model="eventData.valorAtendimentoAvulso" prefix="R$"
                  type="number" />
              </v-col>

              <v-col cols="12">
                <v-autocomplete v-model="eventData.cliente" :items="filteredClientes" v-model:search="searchQuery"
                  label="Cliente" item-title="displayName" item-value="id" :loading="isLoading" return-object clearable
                  :filter="() => true" :menu-props="{ maxHeight: 400 }">
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <v-list-item-title>
                        {{ item.aprendente ? item.aprendente : item.responsavel }}
                      </v-list-item-title>
                    </v-list-item>
                  </template>

                </v-autocomplete>
              </v-col>

              <v-col cols="12">
                <v-text-field label="Observações" v-model="eventData.observacoes" />
              </v-col>

              <v-col cols="12">
                <v-color-picker v-model="eventData.color" label="Cor do Evento" hide-canvas hide-inputs show-swatches
                  flat swatches-max-height="120" />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="error" @click="deleteEvent" v-if="eventData.id">
            Excluir
          </v-btn>
          <v-btn color="success" @click="saveEvent">
            Salvar
          </v-btn>
          <v-btn color="primary" @click="startAtendimento" v-if="showStartButton">
            Iniciar Atendimento
          </v-btn>
          <v-btn text @click="showModal = false">
            Cancelar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showAtendimentoModal" max-width="1200px" min-width="900px">
      <AtendimentoModal v-model="showAtendimentoModal" :title="eventData.title"
        :idAgendamento="eventData.id ? eventData.id.replace('agendamento-', '') : null" />
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="4000">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import ptBr from '@fullcalendar/core/locales/pt-br'
import AtendimentoModal from '@/components/AtendimentoModal.vue'
import { useStoreConfig } from '@/stores/storeConfig'
import { useStoreAuth } from '@/stores/storeAuth'
import { useStoreCalendario } from '@/stores/storeCalendario'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'
import { AprendenteService } from '@/services/AprendenteService'
import { AgendamentoService } from '@/services/AgendamentoService'
import type Agendamento from '@/models/Agendamento'
import { ContratoService } from '@/services/contratoService'

const calendar = ref()
const showModal = ref(false)
const showAtendimentoModal = ref(false)
const showStartButton = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('error')
const events = ref<any[]>([])
const storeConfig = useStoreConfig()
const storeAuth = useStoreAuth()
const storeCalendario = useStoreCalendario()
const { showError } = useShowErrorMessage()
const isLoading = ref(false)
const searchQuery = ref('')
const aprendenteService = new AprendenteService()
const agendamentoService = new AgendamentoService()
const aprendenteCache = new Map()
const filteredClientes = ref<any[]>([])


let calendarApi: any = null

const defaultEventData = () => ({
  id: '',
  title: '',
  startDate: '',
  startTime: '',
  duration: '',
  cliente: null,
  tipoAtendimento: '',
  valorAtendimentoAvulso: '',
  id_contrato: '',
  color: '#1976d2',
  observacoes: ''
})

const eventData = ref(defaultEventData())

function resetEventData() {
  eventData.value = defaultEventData()
}

const loadEventos = async () => {
  isLoading.value = true;
  try {
    if (!storeAuth.userDetails.id) {
      showError('Usuário não autenticado');
      return;
    }

    await storeConfig.loadConfiguracao(storeAuth.userDetails.id);
    if (!storeConfig.configuracao?.id) {
      showError('Configuração não encontrada');
      return;
    }

    await storeConfig.loadFeriados();
    console.log('Feriados carregados:', storeConfig.feriados);

    const feriadosEvents = storeConfig.feriados.map(feriado => ({
      id: `feriado-${feriado.id}`,
      title: feriado.descricao,
      start: feriado.data_feriado,
      allDay: true,
      backgroundColor: '#ff5252',
      textColor: 'white',
      display: 'background',
      editable: false,
      selectable: false,
      classNames: ['feriado-event'],
      interactive: false
    }));

    await storeCalendario.loadAgendamentos();
    const agendamentosEvents = await Promise.all(
      storeCalendario.agendamentos.map(async (agendamento) => {
        const start = new Date(agendamento.data_agendamento + 'T' + agendamento.horario_inicio);
        const end = new Date(start.getTime() + agendamento.duracao * 60000);

        let aprendente = null;
        if (agendamento.id_aprendente) {
          if (aprendenteCache.has(agendamento.id_aprendente)) {
            aprendente = aprendenteCache.get(agendamento.id_aprendente);
          } else {
            aprendente = await aprendenteService.getAprendenteById(agendamento.id_aprendente);
            aprendenteCache.set(agendamento.id_aprendente, aprendente);
          }
        }

        const formatDateTime = (date) => {
          const pad = (num) => String(num).padStart(2, '0');
          return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };

        return {
          id: agendamento.id_agendamento,
          title: agendamento.titulo,
          start: formatDateTime(start),
          end: formatDateTime(end),
          allDay: false,
          backgroundColor: agendamento.color || '#1976d2',
          textColor: '#fff',
          editable: true,
          selectable: true,
          classNames: ['agendamento-event'],
          extendedProps: {
            cliente: aprendente ? {
              id: agendamento.id_aprendente,
              id_aprendente: agendamento.id_aprendente,
              id_responsavel: aprendente.id_responsavel || null,
              displayName: aprendente.nome_aprendente || 'N/A',
              aprendente: aprendente.nome_aprendente || 'N/A',
              responsavel: aprendente.nome_responsavel || 'N/A'
            } : null,
            tipoAtendimento: agendamento.tipo_atendimento,
            valorAtendimentoAvulso: agendamento.valor_atendimento,
            observacoes: agendamento.observacoes,
            horario_inicio: agendamento.horario_inicio,
            nomeAprendente: aprendente?.nome_aprendente || 'N/A'
          }
        };
      })
    );

    events.value = [...feriadosEvents, ...agendamentosEvents];
    console.log('Events populated:', events.value);

    if (calendarApi) {
      calendarApi.refetchEvents();
    }
  } catch (err) {
    console.error('Erro ao carregar eventos:', err);
    showError('Erro ao carregar eventos');
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  if (calendar.value) {
    calendarApi = calendar.value.getApi();
    console.log('calendarApi initialized:', calendarApi);
  }
  await loadEventos();
})

watch(events, () => {
  if (calendarApi) {
    calendarApi.refetchEvents();
  }
});

function showMessage(message: string, color = 'error') {
  snackbarText.value = message
  snackbarColor.value = color
  snackbar.value = true
}

function normalizeDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function isDateFeriado(date: Date): boolean {
  const normalizedDate = normalizeDate(date);
  let isFeriado = false;

  storeConfig.feriados.forEach(feriado => {
    if (feriado.data_feriado === normalizedDate) {
      isFeriado = true;
    }
  });
  return isFeriado;
}

function openEventModal() {
  resetEventData()
  showStartButton.value = false
  showModal.value = true
}

async function saveEvent() {
  const { title, startDate, startTime, duration, tipoAtendimento, valorAtendimentoAvulso, color, cliente, observacoes } = eventData.value;
  if (!title || !startDate || !startTime || !duration || !tipoAtendimento || (tipoAtendimento === 'Avulso' && !valorAtendimentoAvulso) || !cliente) {
    showMessage('Preencha todos os campos obrigatórios!');
    return;
  }

  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(start.getTime() + parseInt(duration) * 60000);

  if (end <= start) {
    showMessage('A duração deve ser maior que zero.');
    return;
  }

  const selectedDate = new Date(`${startDate}T00:00:00`);
  if (isDateFeriado(selectedDate)) {
    showMessage('Não é possível salvar atendimentos em dias de feriado.');
    return;
  }

  try {
    const agendamento: Agendamento = {
      id: eventData.value.id || undefined,
      titulo: title,
      dataAgendamento: startDate,
      horarioInicio: startTime,
      duracao: parseInt(duration),
      responsavel_id: cliente.id_responsavel || null,
      idDependente: cliente.id_aprendente || cliente.id_responsavel || null,
      idProfissional: storeAuth.userDetails.id,
      tipoAtendimento: tipoAtendimento as 'Avulso' | 'Contrato',
      valorAtendimento: tipoAtendimento === 'Avulso' ? parseFloat(valorAtendimentoAvulso) : 0,
      observacoes,
      id_contrato: null,
      color: eventData.value.color
    };

    if (tipoAtendimento === 'Contrato' && cliente.id_responsavel) {
      const contratoService = new ContratoService();
      const contratos = await contratoService.loadContratos(cliente.id_responsavel);
      if (contratos.length > 0) {
        agendamento.id_contrato = contratos[0].id_contrato;
      } else {
        showMessage('Nenhum contrato ativo encontrado para o responsável.');
        return;
      }
    }

    let agendamentoId = agendamento.id;
    if (agendamento.id) {
      await agendamentoService.updateAgendamento(agendamento);
    } else {
      const response = await agendamentoService.createAgendamento(agendamento);
      agendamentoId = response;
    }

    console.log('[Calendar] Evento a ser salvo:', agendamento);
    console.log('[Calendar] Cliente:', cliente);

    const formatDateTime = (date) => {
      const pad = (num) => String(num).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const newEvent = {
      id: `agendamento-${agendamentoId}`,
      title,
      start: formatDateTime(start),
      end: formatDateTime(end),
      allDay: false,
      backgroundColor: color || '#1976d2',
      textColor: '#fff',
      editable: true,
      selectable: true,
      classNames: ['agendamento-event'],
      extendedProps: {
        cliente: cliente,
        tipoAtendimento,
        valorAtendimentoAvulso: tipoAtendimento === 'Avulso' ? parseFloat(valorAtendimentoAvulso) : 0,
        observacoes,
        horario_inicio: startTime,
        nomeAprendente: cliente.displayName || cliente.aprendente || cliente.responsavel || 'N/A'
      }
    };

    const existingIndex = events.value.findIndex(e => e.id === newEvent.id);
    if (existingIndex !== -1) {
      events.value[existingIndex] = newEvent;
    } else {
      events.value.push(newEvent);
    }

    if (calendarApi) {
      calendarApi.refetchEvents();
    } else {
      console.warn('calendarApi not initialized, cannot refresh events');
    }

    showModal.value = false;
    showMessage('Evento salvo com sucesso!', 'success');
  } catch (err: any) {
    console.error('Error saving event:', err);
    showMessage(err.message || 'Erro ao salvar evento');
  }
}

async function deleteEvent() {
  if (!eventData.value.id) return

  try {
    await agendamentoService.deleteAgendamento(eventData.value.id)
    events.value = events.value.filter(e => e.id !== eventData.value.id)
    calendarApi?.refetchEvents()
    showModal.value = false
    showMessage('Evento excluído com sucesso!', 'success')
  } catch (err: any) {
    showMessage(err.message || 'Erro ao excluir evento')
  }
}

function startAtendimento() {
  showModal.value = false
  showAtendimentoModal.value = true
}

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  height: 'auto',
  initialView: 'timeGridDay',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
  },
  locale: ptBr,
  timeZone: 'local',
  editable: true,
  selectable: true,
  selectConstraint: {
    startTime: '00:00',
    endTime: '24:00',
    dows: [0, 1, 2, 3, 4, 5, 6]
  },
  selectAllow: (selectInfo) => {
    const isFeriado = isDateFeriado(new Date(selectInfo.startStr));
    if (isFeriado) {
      showMessage('Não é possível agendar em dias de feriado');
    }
    return !isFeriado;
  },
  eventSources: [
    (info, successCallback) => {
      const filtered = events.value.filter(event => {
        const eventStart = new Date(event.start);
        return eventStart >= new Date(info.startStr) && eventStart <= new Date(info.endStr);
      });
      successCallback(filtered);
    }
  ],
  dateClick(info) {
    const clickedDate = new Date(info.date);
    if (isDateFeriado(clickedDate)) {
      showMessage('Não é possível agendar em dias de feriado');
      return;
    }
    resetEventData();
    eventData.value.startDate = info.dateStr.split('T')[0];
    eventData.value.startTime = info.dateStr.split('T')[1]?.slice(0, 5) || '09:00';
    showModal.value = true;
  },
  eventDidMount(info) {
    info.el.style.color = '#fff';
    info.el.style.backgroundColor = info.event.backgroundColor;
    info.el.style.borderRadius = '4px';
    info.el.style.padding = '4px';
    info.el.style.cursor = 'pointer';
    if (info.event.display === 'background') {
      info.el.style.cursor = 'not-allowed';
      info.el.style.pointerEvents = 'none';
    }
  },
  eventClick(info) {
    if (info.event.display === 'background') return;
    const [startDate, startTimeRaw] = info.event.startStr.split('T');
    const start = new Date(info.event.startStr);
    const end = new Date(info.event.endStr);
    const durationInMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    eventData.value = {
      id: info.event.id,
      title: info.event.title,
      startDate,
      startTime: startTimeRaw?.slice(0, 5),
      duration: durationInMinutes.toString(),
      color: info.event.backgroundColor || '#1976d2',
      tipoAtendimento: info.event.extendedProps.tipoAtendimento || '',
      valorAtendimentoAvulso: info.event.extendedProps.valorAtendimentoAvulso || '',
      cliente: info.event.extendedProps.cliente || null,
      observacoes: info.event.extendedProps.observacoes || '',
    };
    showStartButton.value = true;
    showModal.value = true;
  },
  eventMouseEnter(info) {
    if (info.event.display === 'background') return;
    const event = info.event;
    const el = info.el;
    const jsEvent = info.jsEvent;
    // el.style.border = '2px solid #5E35B1';
    el.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';

    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.innerHTML = `
      <div class="tooltip-content">
        <strong>${event.title}</strong><br>
        Aprendente: ${event.extendedProps.nomeAprendente || 'N/A'}<br>
        Tipo: ${event.extendedProps.tipoAtendimento || 'N/A'}<br>
        Data: ${new Date(event.start).toLocaleDateString('pt-BR')}<br>
        Horário: ${event.extendedProps.horario_inicio}<br>
        Observações: ${event.extendedProps.observacoes || 'Nenhuma'}
      </div>
    `;
    tooltip.style.position = 'absolute';
    tooltip.style.background = '#fff';
    tooltip.style.border = '1px solid #ccc';
    tooltip.style.padding = '8px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    tooltip.style.zIndex = '1000';
    tooltip.style.left = `${jsEvent.pageX + 10}px`;
    tooltip.style.top = `${jsEvent.pageY + 10}px`;

    document.body.appendChild(tooltip);
    el._tooltip = tooltip;

  },
  eventMouseLeave(info) {
    if (info.event.display === 'background') return;
    const el = info.el;
    el.style.border = '';
    el.style.boxShadow = '';
    if (el._tooltip) {
      el._tooltip.remove();
      delete el._tooltip;
    }
  }
});


watch(searchQuery, async (newValue) => {
  if (!newValue) {
    filteredClientes.value = []
    return
  }

  isLoading.value = true
  try {
    const resultados = await aprendenteService.buscarClientesPorNome(newValue)
    filteredClientes.value = resultados
  } catch (err) {
    console.error('Erro na busca:', err)
    showError('Erro ao buscar clientes')
  } finally {
    isLoading.value = false
  }
}, { debounce: 300 })
</script>

<style scoped>
.calendar-container {
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: #fff;
}

:deep(.fc) {
  padding: 1.5%;
  background-color: #FFFFFF;
  color: #0a0a0a;
  font-size: 1rem;
}

:deep(.fc-daygrid-day) {}

:deep(.fc-daygrid-day-frame) {}

:deep(.fc-daygrid-day-frame:hover) {
  cursor: pointer !important;
  background-color: #B39DDB !important;
}

:deep(.fc-daygrid-day-events) {}

:deep(.fc-toolbar-title) {
  font-size: clamp(1.2rem, 2vw, 2rem);
  font-weight: 600;
}

:deep(.fc-event-main) {
  height: auto !important;
  min-height: 40px;
  font-size: clamp(0.8rem, 1.5vw, 1rem);
}

:deep(.fc-button) {
  background-color: white !important;
  color: #4527A0 !important;
  font-weight: 500;
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  border: 2px solid #8d6ee1 !important;
  border-radius: 6px;
  padding: 6px 12px;
  margin: 0 2px;
  transition: 0.3s;
  text-transform: none;
}

:deep(.fc-button.fc-today-button) {
  background-color: #311B92 !important;
  color: white !important;
}

:deep(.fc-button.fc-button-active) {
  background-color: #5E35B1 !important;
  color: white !important;
  outline: none;
}

:deep(.fc-button:hover) {
  background-color: #B39DDB !important;
  border-color: #B39DDB !important;
  outline: none;
}

@media (max-width: 600px) {
  :deep(.fc-toolbar-title) {
    font-size: 1.2rem;
  }

  :deep(.fc-event-main) {
    font-size: 0.8rem;
  }

  :deep(.fc-button) {
    font-size: 0.8rem;
    padding: 5px 10px;
  }
}
</style>