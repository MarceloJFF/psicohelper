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
      <AtendimentoModal v-model="showAtendimentoModal" :title="eventData.title" />
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
import { ResponsavelService } from '@/services/responsavelService'

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
const clientes = ref<any[]>([])
const aprendenteService = new AprendenteService()
const agendamentoService = new AgendamentoService()
const eventos = ref<any[]>([])
const type = ref('month')

let calendarApi: any = null

const defaultEventData = () => ({
  id: '',
  title: '',
  startDate: '',
  startTime: '',
  duration: '',
  cliente: '',
  tipoAtendimento: '',
  valorAtendimentoAvulso: '',
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

    // Load configuration
    await storeConfig.loadConfiguracao(storeAuth.userDetails.id);
    if (!storeConfig.configuracao?.id) {
      showError('Configuração não encontrada');
      return;
    }

    // Load feriados
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

    // Load agendamentos
    await storeCalendario.loadAgendamentos();
    const agendamentosEvents = storeCalendario.agendamentos.map(agendamento => {
      console.log('COISO AGENDAMENTO:', agendamento);

      const start = new Date(agendamento.data_agendamento);
      const end = new Date(start.getTime() + (agendamento.duracao || 60) * 60000); // Default to 60 min if no duration

      return {
        id: agendamento.id_agendamento,
        title: agendamento.titulo,
        start: start.toISOString(),
        end: end.toISOString(),
        allDay: false, // Agendamentos typically have specific times
        backgroundColor: agendamento.color || '#1976d2', // Use stored color or default
        textColor: '#fff',
        editable: true, // Allow editing for agendamentos
        selectable: true,
        classNames: ['agendamento-event'],
        extendedProps: {
          cliente: agendamento.clienteId,
          tipoAtendimento: agendamento.tipoAtendimento,
          valorAtendimentoAvulso: agendamento.valorAtendimento,
          observacoes: agendamento.observacoes
        }
      };
    });

    // Combine feriados and agendamentos
    events.value = [...feriadosEvents, ...agendamentosEvents];
    console.log('Events populated:', events.value);

    // Refresh calendar
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
  const { title, startDate, startTime, duration, tipoAtendimento, valorAtendimentoAvulso, color, cliente: aprendente, observacoes } = eventData.value

  if (!title || !startDate || !startTime || !duration || !tipoAtendimento || (tipoAtendimento === 'Avulso' && !valorAtendimentoAvulso) || !aprendente) {
    showMessage('Preencha todos os campos obrigatórios!')
    return
  }

  const start = new Date(`${startDate}T${startTime}`)
  const end = new Date(start.getTime() + parseInt(duration) * 60000)

  if (end <= start) {
    showMessage('A duração deve ser maior que zero.')
    return
  }

  // Verifica se a data selecionada é um feriado
  const selectedDate = new Date(`${startDate}T00:00:00`)
  if (isDateFeriado(selectedDate)) {
    showMessage('Não é possível salvar atendimentos em dias de feriado.')
    return
  }

  // busca responsvel pelo id do aprendente
  const responsavelService = new ResponsavelService()
  const responsavelId = await responsavelService.getResponsavelIdByAprendenteId(aprendente.id)

  try {

    const agendamento: Agendamento = {
      id: eventData.value.id ?? '',
      titulo: title,
      dataAgendamento: start,
      horarioInicio: startTime,
      duracao: parseInt(duration),
      responsavel_id: responsavelId,
      idDependente: aprendente.tipo === 'aprendente' ? aprendente.id : '',
      idProfissional: storeAuth.userDetails.id,
      tipoAtendimento: tipoAtendimento as 'Avulso' | 'Contrato',
      valorAtendimento: tipoAtendimento === 'Avulso' ? parseFloat(valorAtendimentoAvulso) : 0,
      observacoes: observacoes
    }



    if (eventData.value.id) {

      const { error: agendamentoError } = await agendamentoService.updateAgendamento(agendamento)
      if (agendamentoError) {

        throw new Error('Erro ao criar agendamento' + agendamentoError.message)
      }
    } else {
      console.log('Criando agendamento:', agendamento);
      const { error: agendamentoError } = await agendamentoService.createAgendamento(agendamento)
      if (agendamentoError) {
        throw new Error('Erro ao criar agendamento' + agendamentoError.message)
      }
    }

    const newEvent = {
      id: agendamento.id,
      title,
      start: start.toISOString(),
      end: end.toISOString(),
      backgroundColor: color,
      extendedProps: {
        cliente: agendamento.clienteId,
        tipoAtendimento,
        valorAtendimentoAvulso
      }
    }

    const existingIndex = events.value.findIndex(e => e.id === newEvent.id)
    if (existingIndex !== -1) {
      events.value[existingIndex] = newEvent
    } else {
      events.value.push(newEvent)
    }

    calendarApi?.refetchEvents()
    showModal.value = false
    showMessage('Evento salvo com sucesso!', 'success')
  } catch (err: any) {
    showMessage(err.message || 'Erro ao salvar evento')
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
  eventClick(info) {

    if (info.event.display === 'background') {
      return;
    }
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
      cliente: info.event.extendedProps.cliente || '',
      observacoes: info.event.extendedProps.observacoes || ''
    };
    console.log('eventClick', eventData.value);
    showStartButton.value = true;
    showModal.value = true;
  },
  eventDidMount(info) {
    info.el.style.backgroundColor = info.event.backgroundColor;
    info.el.style.borderRadius = '4px';
    info.el.style.padding = '4px';
    info.el.style.cursor = 'pointer';
    if (info.event.display === 'background') {
      info.el.style.cursor = 'not-allowed';
      info.el.style.pointerEvents = 'none';
    }
  },
  eventMouseEnter(info) {



    if (info.event.display === 'background') return;
    const event = info.event;
    console.log("COISO: ", event.extendedProps);
    const el = info.el;
    const jsEvent = info.jsEvent;
    el.style.border = '2px solid #5E35B1';
    el.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.innerHTML = `
    <strong>${event.title}</strong><br>
    Cliente: ${event.extendedProps.cliente || 'N/A'}<br>
    Tipo: ${event.extendedProps.tipoAtendimento || 'N/A'}<br>
    Data: ${new Date(event.start).toLocaleDateString('pt-BR')}<br>
    Horário: ${new Date(event.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}<br>
    Observações: ${event.extendedProps.observacoes || 'Nenhuma'}
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
    el._tooltip = tooltip; // Store directly on el as a custom property
  },

  eventMouseLeave(info) {
    if (info.event.display === 'background') return;
    const el = info.el;
    el.style.border = '';
    el.style.boxShadow = '';
    const tooltip = el._tooltip;
    if (tooltip) {
      tooltip.remove(); // Now works because tooltip is the DOM element
      delete el._tooltip;
    }
  }
});

const filteredClientes = ref<any[]>([])

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

/* FullCalendar geral */
:deep(.fc) {
  padding: 1.5%;
  background-color: #FFFFFF;
  color: #0a0a0a;
  font-size: 1rem;
}

/* Célula do calendário */
:deep(.fc-daygrid-day) {
  /* border: 1px solid red !important; */
}

:deep(.fc-daygrid-day-frame) {
  /* border: 1px solid red !important; */
}

:deep(.fc-daygrid-day-frame:hover) {
  cursor: pointer !important;
  background-color: #B39DDB !important;
}

:deep(.fc-daygrid-day-events) {
  /* border: 1px solid red !important; */
}

/* Título do calendário */
:deep(.fc-toolbar-title) {
  font-size: clamp(1.2rem, 2vw, 2rem);
  font-weight: 600;
}

/* Evento no calendário */
:deep(.fc-event-main) {
  height: auto !important;
  min-height: 40px;
  font-size: clamp(0.8rem, 1.5vw, 1rem);
}

/* Botões do calendário */
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

/* Botão "Hoje" */
:deep(.fc-button.fc-today-button) {
  background-color: #311B92 !important;
  color: white !important;

}

/* Botão ativo */
:deep(.fc-button.fc-button-active) {
  background-color: #5E35B1 !important;
  color: white !important;
  outline: none;
}

/* Botão hover */
:deep(.fc-button:hover) {
  background-color: #B39DDB !important;
  border-color: #B39DDB !important;
  outline: none;
}

/* Responsividade extra para a tela toda */
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
