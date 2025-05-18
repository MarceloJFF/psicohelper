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
                  @update:search="searchQuery = $event" label="Cliente" item-title="nomeAprendente" item-value="id"
                  return-object clearable :loading="isLoading" :filter="() => true" :menu-props="{ maxHeight: 400 }">
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <v-list-item-title>{{ nomeAprendente }}</v-list-item-title>
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
          <v-btn color="primary" @click="openAtendimentoModal">
            {{ agendamentoPossuiSessao ? 'Editar Sessão' : 'Nova Sessão' }}
          </v-btn>
          <v-btn text @click="showModal = false">
            Cancelar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showAtendimentoModal" max-width="1200px" min-width="900px">
      <AtendimentoModal v-model="showAtendimentoModal" :title="eventData.title"
        :idAgendamento="eventData.id ? eventData.id.toString().replace('agendamento-', '') : undefined"
        :sessao="sessaoModal" @sessao-salva="handleSessaoSalva" />
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="4000">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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
import { ContratoService } from '@/services/contratoService'
import ViewAprendenteLogadoProfissional from '@/models/ViewAprendenteLogadoProfissional'
import type { CalendarOptions } from '@fullcalendar/core'
import { SessaoService } from '@/services/SessaoService'

const calendar = ref()
const showModal = ref(false)
const showAtendimentoModal = ref(false)
const agendamentoPossuiSessao = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('error')
const events = ref<Record<string, unknown>[]>([])
const storeConfig = useStoreConfig()
const storeAuth = useStoreAuth()
const storeCalendario = useStoreCalendario()
const { showError } = useShowErrorMessage()
const isLoading = ref(false)
const searchQuery = ref('')
const aprendenteService = new AprendenteService()
const agendamentoService = new AgendamentoService()
const sessaoService = new SessaoService()
const sessoes = ref([])
const sessaoModal: any = ref()
const aprendenteCache = new Map()
const filteredClientes = ref<ViewAprendenteLogadoProfissional[]>([])
const sessaoAtendimentoModal: any = ref()

// Interfaces for FullCalendar API and Events
interface CalendarApi {
  refetchEvents: () => void;
}

let calendarApi: CalendarApi | null = null;

// Define type for event data
interface EventData {
  id: string;
  title: string;
  startDate: string;
  startTime: string;
  duration: string;
  cliente: ViewAprendenteLogadoProfissional | null;
  tipoAtendimento: string;
  valorAtendimentoAvulso: string;
  idContrato: string;
  color: string;
  observacoes: string;
}

const defaultEventData = (): EventData => ({
  id: '',
  title: '',
  startDate: '',
  startTime: '',
  duration: '',
  cliente: null,
  tipoAtendimento: '',
  valorAtendimentoAvulso: '',
  idContrato: '',
  color: '#1976d2',
  observacoes: ''
})

const eventData = ref<EventData>(defaultEventData())

function resetEventData() {
  eventData.value = defaultEventData()
}

async function handleSessaoSalva(data: { idAgendamento: string | number }) {
  if (data.idAgendamento === eventData.value.id.replace('agendamento-', '')) {
    agendamentoPossuiSessao.value = true;
    console.log('Sessão salva, agendamentoPossuiSessao atualizado para true');

    // Buscar os dados da sessão atualizada
    try {
      const sessao = await sessaoService.getSessaoByAgendamentoId(data.idAgendamento.toString());
      sessaoModal.value = sessao || {};
      console.log('Dados da sessão atualizados em sessaoModal:', sessaoModal.value);

      // Atualizar o evento específico no calendário
      const eventIndex = events.value.findIndex(e => e.id === `agendamento-${data.idAgendamento}`);
      if (eventIndex !== -1) {
        events.value[eventIndex] = {
          ...events.value[eventIndex],
          extendedProps: {
            ...events.value[eventIndex].extendedProps,
            sessao: sessaoModal.value
          }
        };
        if (calendarApi) {
          calendarApi.refetchEvents();
        }
      }
    } catch (err) {
      console.error('Erro ao buscar sessão atualizada:', err);
      showError('Erro ao carregar dados da sessão');
    }
  }
}

async function openAtendimentoModal() {
  if (eventData.value.id) {
    const agendamentoId = eventData.value.id.replace('agendamento-', '');
    try {
      // Garantir que sessaoModal esteja atualizado antes de abrir o modal
      const sessao = await sessaoService.getSessaoByAgendamentoId(agendamentoId);
      sessaoModal.value = sessao || {};
      agendamentoPossuiSessao.value = Object.keys(sessaoModal.value).length > 0;
      console.log('sessaoModal antes de abrir AtendimentoModal:', sessaoModal.value);
    } catch (err) {
      console.error('Erro ao carregar sessão para AtendimentoModal:', err);
      showError('Erro ao carregar dados da sessão');
      return;
    }
  }
  showAtendimentoModal.value = true;
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

        const formatDateTime = (date: Date): string => {
          const pad = (num: number): string => String(num).padStart(2, '0');
          return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };

        console.log('[COISOOO]:', agendamento.id_agendamento);
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
              responsavel: aprendente.nome_responsavel || 'N/A',
            } : null,
            tipoAtendimento: agendamento.tipo_atendimento,
            valorAtendimentoAvulso: agendamento.valor_atendimento,
            observacoes: agendamento.observacoes,
            horario_inicio: agendamento.horario_inicio,
            nomeAprendente: aprendente?.nome_aprendente || 'N/A',
            sessao: await sessaoService.getSessaoByAgendamentoId(agendamento.id_agendamento),
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
  agendamentoPossuiSessao.value = false
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
    // Ensure tipo_atendimento has a default value
    const actualTipoAtendimento = tipoAtendimento || 'Avulso';

    // Check for contract if selected
    if (actualTipoAtendimento === 'Contrato' && cliente.idResponsavel) {
      const contratoService = new ContratoService();
      const contratos = await contratoService.loadContratos(cliente.idResponsavel);
      if (contratos.length === 0) {
        showMessage('Nenhum contrato ativo encontrado para o responsável.');
        return;
      }
      // We'll use the first contract
      eventData.value.idContrato = contratos[0].idContrato;
    }

    // Create object matching database schema
    const agendamento = {
      id: eventData.value.id ? eventData.value.id.replace('agendamento-', '') : '',
      titulo: title || '',
      data_agendamento: startDate, // Keep as string format YYYY-MM-DD
      horario_inicio: startTime,
      duracao: parseInt(duration),
      responsavel_id: cliente.idResponsavel || null,
      id_aprendente: cliente.id || null,
      id_profissional: storeAuth.userDetails.id,
      tipo_atendimento: actualTipoAtendimento, // Ensure this is never null
      valor_atendimento: actualTipoAtendimento === 'Avulso' ? parseFloat(valorAtendimentoAvulso || '0') : 0,
      observacoes: observacoes || '',
      id_contrato: eventData.value.idContrato || null,
      color: color || '#1976d2',
      // For API matching only, not sent to database
      id_agendamento: eventData.value.id ? eventData.value.id.replace('agendamento-', '') : null,
    };

    let agendamentoId = eventData.value.id ? eventData.value.id.replace('agendamento-', '') : '';
    const isUpdate = !!agendamentoId;

    if (isUpdate) {
      console.log('Updating agendamento:', agendamento);

      // Create Agendamento object with correct properties
      const agendamentoToUpdate = {
        id: agendamento.id,
        titulo: agendamento.titulo,
        dataAgendamento: agendamento.data_agendamento,
        horarioInicio: agendamento.horario_inicio,
        duracao: agendamento.duracao,
        responsavel_id: agendamento.responsavel_id,
        idDependente: agendamento.id_aprendente,
        idProfissional: agendamento.id_profissional,
        tipoAtendimento: agendamento.tipo_atendimento as 'Avulso' | 'Contrato',
        valorAtendimento: agendamento.valor_atendimento,
        observacoes: agendamento.observacoes,
        idContrato: agendamento.id_contrato,
        color: agendamento.color,
        agendamentoId: agendamento.id,
        clienteId: agendamento.id_aprendente,
      };

      await agendamentoService.updateAgendamento(agendamentoToUpdate);
    } else {
      console.log('Creating new agendamento:', agendamento);

      // Create Agendamento object with correct properties
      const agendamentoToCreate = {
        titulo: agendamento.titulo,
        dataAgendamento: agendamento.data_agendamento,
        horarioInicio: agendamento.horario_inicio,
        duracao: agendamento.duracao,
        responsavel_id: agendamento.responsavel_id,
        idDependente: agendamento.id_aprendente,
        idProfissional: agendamento.id_profissional,
        tipoAtendimento: agendamento.tipo_atendimento as 'Avulso' | 'Contrato',
        valorAtendimento: agendamento.valor_atendimento,
        observacoes: agendamento.observacoes,
        idContrato: agendamento.id_contrato,
        color: agendamento.color,
        clienteId: agendamento.id_aprendente,
      };

      const response = await agendamentoService.createAgendamento(agendamentoToCreate);
      if (response) {
        agendamentoId = response;
      }
    }

    console.log('[Calendar] Evento a ser salvo:', agendamento);
    console.log('[Calendar] Cliente:', cliente);

    const formatDateTime = (date: Date): string => {
      const pad = (num: number): string => String(num).padStart(2, '0');
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
        nomeAprendente: cliente.nomeAprendente || 'N/A'
      }
    };

    if (isUpdate) {
      events.value = events.value.filter(e => e.id !== newEvent.id);
    }

    events.value.push(newEvent);

    if (calendarApi) {
      calendarApi.refetchEvents();
    } else {
      console.warn('calendarApi not initialized, cannot refresh events');
    }

    showModal.value = false;
    showMessage('Evento salvo com sucesso!', 'success');
  } catch (err: Error | unknown) {
    console.error('Error saving event:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar evento';
    showMessage(errorMessage);
  }
}

async function deleteEvent() {
  if (!eventData.value.id) return

  try {
    await agendamentoService.deleteAgendamento(eventData.value.id)
    events.value = events.value.filter(e => e.id !== eventData.value.id)
    if (calendarApi) {
      calendarApi.refetchEvents()
    } else {
      console.warn('calendarApi not initialized, cannot refresh events')
    }
    showModal.value = false
    showMessage('Evento excluído com sucesso!', 'success')
    await loadEventos()
  } catch (err: Error | unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir evento';
    showMessage(errorMessage);
  }
}

const calendarOptions = ref<CalendarOptions>({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  height: 'auto',
  initialView: 'dayGridMonth',
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
  selectAllow: (selectInfo: { startStr: string }) => {
    const isFeriado = isDateFeriado(new Date(selectInfo.startStr));
    if (isFeriado) {
      showMessage('Não é possível agendar em dias de feriado');
    }
    return !isFeriado;
  },
  eventSources: [
    (info: { startStr: string, endStr: string }, successCallback: (events: Record<string, unknown>[]) => void) => {
      const filtered = events.value.filter(event => {
        const eventStart = new Date(event.start as string);
        return eventStart >= new Date(info.startStr) && eventStart <= new Date(info.endStr);
      });
      successCallback(filtered);
    }
  ],
  dateClick(info: { dateStr: string, date: Date }) {
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
  eventDidMount(info: { el: HTMLElement, event: { backgroundColor: string, display: string } }) {
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
  eventClick(info: {
    event: {
      id: string,
      title: string,
      startStr: string,
      endStr: string,
      backgroundColor: string,
      display: string,
      extendedProps: Record<string, unknown>
    }
  }) {
    if (info.event.display === 'background') return;
    const [startDate, startTimeRaw] = info.event.startStr.split('T');
    const start = new Date(info.event.startStr);
    const end = new Date(info.event.endStr);
    const durationInMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

    const clienteData = info.event.extendedProps.cliente as Record<string, string | null | undefined>;
    let cliente: ViewAprendenteLogadoProfissional | null = null;

    if (clienteData) {
      cliente = new ViewAprendenteLogadoProfissional();
      cliente.id = clienteData.id || clienteData.id_aprendente || '';
      cliente.nomeAprendente = clienteData.nomeAprendente || clienteData.aprendente || clienteData.displayName || 'N/A';
      cliente.idResponsavel = clienteData.idResponsavel || clienteData.id_responsavel || '';
      cliente.nomeResponsavel = clienteData.nomeResponsavel || clienteData.responsavel || '';
    }

    eventData.value = {
      id: info.event.id,
      title: info.event.title,
      startDate: startDate || '',
      startTime: startTimeRaw?.slice(0, 5) || '',
      duration: durationInMinutes.toString(),
      color: info.event.backgroundColor || '#1976d2',
      tipoAtendimento: info.event.extendedProps.tipoAtendimento as string || '',
      valorAtendimentoAvulso: info.event.extendedProps.valorAtendimentoAvulso as string || '',
      cliente: cliente,
      observacoes: info.event.extendedProps.observacoes as string || '',
      idContrato: '',
    };

    sessaoModal.value = info.event.extendedProps.sessao as Record<string, unknown> || {};

    showModal.value = true;
    // Corrigir a lógica: true se houver sessão, false caso contrário
    agendamentoPossuiSessao.value = Object.keys(sessaoModal.value).length > 0;
  },
  eventMouseEnter(info: {
    event: {
      title: string,
      start: Date | null,
      display: string,
      extendedProps: Record<string, unknown>
    },
    el: HTMLElement & { _tooltip?: HTMLElement },
    jsEvent: MouseEvent
  }) {
    if (info.event.display === 'background') return;
    const event = info.event;
    const el = info.el;
    const jsEvent = info.jsEvent;
    el.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';

    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.innerHTML = `
      <div class="tooltip-content">
        <strong>${event.title}</strong><br>
        Aprendente: ${event.extendedProps.nomeAprendente as string || 'N/A'}<br>
        Tipo: ${event.extendedProps.tipoAtendimento as string || 'N/A'}<br>
        Data: ${event.start ? new Date(event.start).toLocaleDateString('pt-BR') : 'N/A'}<br>
        Horário: ${event.extendedProps.horario_inicio as string}<br>
        Observações: ${event.extendedProps.observacoes as string || 'Nenhuma'}
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
  eventMouseLeave(info: {
    event: { display: string },
    el: HTMLElement & { _tooltip?: HTMLElement }
  }) {
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

watch(searchQuery, async (val) => {
  if (!val || val.length < 3) {
    filteredClientes.value = []
    return
  }

  isLoading.value = true
  try {
    const resultados = await aprendenteService.loadAprendentesPorProfissionalENome(val)
    filteredClientes.value = resultados
    console.log(filteredClientes.value)
  } catch {
    showError('Erro ao buscar clientes')
  } finally {
    isLoading.value = false
  }
})
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