<template>
  <v-container>
    <!-- Botão de novo atendimento -->
    <v-btn color="primary" @click="openEventModal" prepend-icon="mdi-plus">
      Novo Atendimento
    </v-btn>
    <!-- Calendário -->
    <FullCalendar :options="calendarOptions" class="mt-4"  />

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

    <!-- Modal de Atendimento (em andamento) -->
    <v-dialog v-model="showAtendimentoModal" max-width="1200px" min-width="900px">
      <AtendimentoModal v-model="showAtendimentoModal" :title="eventData.title" />
    </v-dialog>

    <!-- Snackbar de mensagens -->
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

const calendarRef = ref()
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
  // const agendamentos: Agendamento[] = await agendamentoService.getAllAgendamentos() ?? []
  isLoading.value = true
  try {
    if (!storeAuth.userDetails.id) {
      showError('Usuário não autenticado')
      return
    }

    // Primeiro carrega a configuração
    await storeConfig.loadConfiguracao(storeAuth.userDetails.id)

    if (!storeConfig.configuracao?.id) {
      showError('Configuração não encontrada')
      return
    }

    // Depois carrega os feriados
    await storeConfig.loadFeriados()
    console.log('Feriados carregados:', storeConfig.feriados)

    const feriadosEvents = storeConfig.feriados.map(feriado => ({
      id: `feriado-${feriado.id}`,
      title: feriado.descricao,
      start: feriado.data_feriado,
      allDay: true,
      backgroundColor: '#ff5252',
      color: 'white',
      display: 'background',
      editable: false,
      selectable: false,
      classNames: ['feriado-event'],
      interactive: false // Impede interação com o evento
    }))

    console.log('Eventos de feriados criados:', feriadosEvents)
    events.value = [...feriadosEvents]
    console.log('Events atualizado:', events.value)

    
    // Carrega os agendamentos
    await storeCalendario.loadAgendamentos()
    const agendamentos = storeCalendario.agendamentos.map(agendamento => ({
      id: `agendamento-${agendamento.id}`,
      title: agendamento.titulo,
      start: agendamento.data_agendamento,
      end: agendamento.data_agendamento,
      allDay: true,
      backgroundColor: '#1976d2',
      color:'#000',
      display: 'background',
      editable: false,
      selectable: false,
      classNames: ['agendamento-event'],
      interactive: false
    }))
    events.value = [...events.value, ...agendamentos]
    

  } catch (err) {
    console.error('Erro ao carregar eventos:', err)
    showError('Erro ao carregar eventos')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  // console.log('Iniciando montagem do componente...')
  // calendarApi = calendarRef.value?.getApi()
  // console.log('calendarApi inicializado:', calendarApi.value)
  await loadEventos()
})

function showMessage(message: string, color = 'error') {
  snackbarText.value = message
  snackbarColor.value = color
  snackbar.value = true
}

function normalizeDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function isDateFeriado(date: Date): boolean {
  const normalizedDate = normalizeDate(date)
  return events.value.some(event => {
    if (event.display === 'background') {
      const feriadoDate = normalizeDate(new Date(event.start))
      return feriadoDate === normalizedDate
    }
    return false
  })
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




  try {
    console.log('Criando agendamento:', eventData.value.id);

    const agendamento: Agendamento = {
      titulo: title,
      dataAgendamento: start,
      horarioInicio: startTime,
      duracao: parseInt(duration),
      //@ts-ignore
      // id: aprendente.id as string,
      idDependente: aprendente.tipo === 'aprendente' ? aprendente.id : '',
      idProfissional: storeAuth.userDetails.id,
      tipoAtendimento: tipoAtendimento as 'Avulso' | 'Contrato',
      valorAtendimento: tipoAtendimento === 'Avulso' ? parseFloat(valorAtendimentoAvulso) : 0,
      observacoes: observacoes
    }

    if (eventData.value.id) {
      console.log('id', eventData.value.id);

      const { error: agendamentoError } = await agendamentoService.updateAgendamento(agendamento)
      if (agendamentoError) {

        throw new Error('Erro ao criar agendamento' + agendamentoError.message)
      }
    } else {
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
    // Verifica se a data selecionada não é um feriado
    const isFeriado = events.value.some(event =>
      event.display === 'background' &&
      new Date(event.start).toDateString() === new Date(selectInfo.start).toDateString()
    )
    if (isFeriado) {
      showMessage('Não é possível agendar em dias de feriado')
    }
    return !isFeriado
  },
  eventSources: [
    (info, successCallback) => {

      const filtered = events.value.filter(event => {
        const eventStart = new Date(event.start)
        return eventStart >= new Date(info.startStr) && eventStart <= new Date(info.endStr)
      })
      successCallback(filtered)
    }
  ],
  dateClick(info) {
    const clickedDate = new Date(info.date)
    if (isDateFeriado(clickedDate)) {
      showMessage('Não é possível agendar em dias de feriado')
      return
    }

    resetEventData()
    eventData.value.startDate = info.dateStr
    showModal.value = true
  },
  eventClick(info) {
    // Não permite clicar em eventos de feriado
    if (info.event.display === 'background') {
      return
    }

    const [startDate, startTimeRaw] = info.event.startStr.split('T')
    const start = new Date(info.event.startStr)
    const end = new Date(info.event.endStr)

    const durationInMinutes = Math.round((end.getTime() - start.getTime()) / 60000)

    eventData.value = {
      id: info.event.id,
      title: info.event.title,
      startDate,
      startTime: startTimeRaw?.slice(0, 5),
      duration: durationInMinutes.toString(),
      color: info.event.backgroundColor || '#1976d2',
      tipoAtendimento: info.event.extendedProps.tipoAtendimento || '',
      valorAtendimentoAvulso: info.event.extendedProps.valorAtendimentoAvulso || '',
      cliente: info.event.extendedProps.cliente || ''
    }

    showStartButton.value = true
    showModal.value = true
  },
  eventDidMount(info) {
    info.el.style.backgroundColor = info.event.backgroundColor
    info.el.style.borderRadius = '4px'
    info.el.style.padding = '4px'
    info.el.style.cursor = 'pointer'

    // Adiciona cursor not-allowed para feriados
    if (info.event.display === 'background') {
      info.el.style.cursor = 'not-allowed'
      info.el.style.pointerEvents = 'none' // Impede qualquer interação com o elemento
    }
  }
})

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
