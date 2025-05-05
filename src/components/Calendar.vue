<template>
  <v-container>
    <!-- Botão de novo atendimento -->
    <v-btn
      color="primary"
      @click="openEventModal"
      prepend-icon="mdi-plus"
    >
      Novo Atendimento
    </v-btn>
    <!-- Calendário -->
    <FullCalendar
      ref="calendarRef"
      :options="calendarOptions"
      class="mt-4"
    />



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
                <v-text-field
                  label="Título"
                  v-model="eventData.title"
                  required
                />
              </v-col>

              <v-col cols="6">
                <v-text-field
                  label="Data"
                  v-model="eventData.startDate"
                  type="date"
                  required
                />
              </v-col>

              <v-col cols="6">
                <v-text-field
                  label="Hora"
                  v-model="eventData.startTime"
                  type="time"
                  required
                />
              </v-col>

              <v-col cols="6">
                <v-text-field
                  label="Duração (minutos)"
                  v-model="eventData.duration"
                  type="number"
                  required
                />
              </v-col>

              <v-col cols="6">
                <v-select
                  label="Tipo de Atendimento"
                  v-model="eventData.tipoAtendimento"
                  :items="['Avulso', 'Plano Mensal']"
                  required
                />
              </v-col>

              <v-col cols="12" v-if="eventData.tipoAtendimento === 'Avulso'">
                <v-text-field
                  label="Valor do Atendimento Avulso"
                  v-model="eventData.valorAtendimentoAvulso"
                  prefix="R$"
                  type="number"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  label="Cliente"
                  v-model="eventData.cliente"
                />
              </v-col>

              <v-col cols="12">
                <v-color-picker
                  v-model="eventData.color"
                  label="Cor do Evento"
                  hide-canvas
                  hide-inputs
                  show-swatches
                  flat
                  swatches-max-height="120"
                />
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
          <v-btn
            color="primary"
            @click="startAtendimento"
            v-if="showStartButton"
          >
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
import { ref, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import ptBr from '@fullcalendar/core/locales/pt-br'
import AtendimentoModal from '@/components/AtendimentoModal.vue'

const calendarRef = ref()
const showModal = ref(false)
const showAtendimentoModal = ref(false)
const showStartButton = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('error')
const events = ref<any[]>([])

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
  color: '#1976d2'
})

const eventData = ref(defaultEventData())

function resetEventData() {
  eventData.value = defaultEventData()
}

onMounted(() => {
  calendarApi = calendarRef.value?.getApi()
})

function showMessage(message: string, color = 'error') {
  snackbarText.value = message
  snackbarColor.value = color
  snackbar.value = true
}

function openEventModal() {
  resetEventData()
  showStartButton.value = false
  showModal.value = true
}

function saveEvent() {
  const { title, startDate, startTime, duration, tipoAtendimento, valorAtendimentoAvulso, color } = eventData.value

  if (!title || !startDate || !startTime || !duration || !tipoAtendimento || (tipoAtendimento === 'Avulso' && !valorAtendimentoAvulso)) {
    showMessage('Preencha todos os campos obrigatórios!')
    return
  }

  const start = new Date(`${startDate}T${startTime}`)
  const end = new Date(start.getTime() + parseInt(duration) * 60000)

  if (end <= start) {
    showMessage('A duração deve ser maior que zero.')
    return
  }

  const newEvent = {
    id: eventData.value.id || String(Date.now()),
    title,
    start: start.toISOString(),
    end: end.toISOString(),
    backgroundColor: color,
    extendedProps: {
      cliente: eventData.value.cliente,
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
}

function deleteEvent() {
  if (!eventData.value.id) return
  events.value = events.value.filter(e => e.id !== eventData.value.id)
  calendarApi?.refetchEvents()
  showModal.value = false
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
    resetEventData()
    eventData.value.startDate = info.dateStr
    showModal.value = true
  },
  eventClick(info) {
    const [startDate, startTimeRaw] = info.event.startStr.split('T')
    const start = new Date(info.event.startStr)
    const end = new Date(info.event.endStr)

    const durationInMinutes = Math.round((end.getTime() - start.getTime()) / 60000)

    eventData.value = {
      id: info.event.id,
      title: info.event.title,
      startDate,
      startTime: startTimeRaw?.slice(0, 5),
      duration: durationInMinutes.toString(),  // <-- aqui está a duração sendo adicionada
      color: info.event.backgroundColor || '#1976d2',
      tipoAtendimento: info.event.extendedProps.tipoAtendimento || '',
      valorAtendimentoAvulso: info.event.extendedProps.valorAtendimentoAvulso || '',
      cliente: info.event.extendedProps.cliente || ''
    }

    showStartButton.value = true
    showModal.value = true
  }
  ,
  eventDidMount(info) {
    info.el.style.backgroundColor = info.event.backgroundColor
    info.el.style.borderRadius = '4px'
    info.el.style.padding = '4px'
  }
})
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

