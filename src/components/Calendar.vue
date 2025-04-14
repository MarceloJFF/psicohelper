<template>
  <div class="calendar-container pa-10 my-4">
    <v-btn color="deep-purple-accent-4" class="mb-4" @click="openEventModal">Add Agendamento</v-btn>

    <FullCalendar
      :options="calendarOptions"
      ref="calendarRef"
    />

    <v-dialog v-model="showModal" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h6">Novo Agendamento</span>
        </v-card-title>
        <v-card-text>
          <v-text-field label="Título *" v-model="eventData.title" rounded/>
          <v-textarea label="Descrição" v-model="eventData.description" auto-grow  />

          <v-row>
            <v-col cols="6">
              <v-text-field label="Data de início *" v-model="eventData.startDate" type="date"  />
            </v-col>
            <v-col cols="6">
              <v-text-field label="Hora de início *" v-model="eventData.startTime" type="time" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6">
              <v-text-field label="Data de término *" v-model="eventData.endDate" type="date" />
            </v-col>
            <v-col cols="6">
              <v-text-field label="Hora de término *" v-model="eventData.endTime" type="time" />
            </v-col>
          </v-row>

          <v-color-picker
            v-model="eventData.color"
            hide-header
            hide-canvas
            hide-inputs
            hide-sliders
            mode="hexa"
            flat
            show-swatches
            swatches-max-height="150"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn v-if="eventData.id" color="red" text @click="deleteEvent">Excluir</v-btn>
          <v-btn color="primary" text @click="saveEvent">Salvar</v-btn>
          <v-btn text @click="showModal = false">Cancelar</v-btn>
        </v-card-actions>


      </v-card>
    </v-dialog>
  </div>
  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top>
    {{ snackbarText }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'

const calendarRef = ref()
const showModal = ref(false)

const eventData = ref({
  id: '',
  title: '',
  description: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  color: '#1976d2'
})
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('error')

function showMessage(message: string, color = 'error') {
  snackbarText.value = message
  snackbarColor.value = color
  snackbar.value = true
}
const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'timeGridDay',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
  },
  selectable: true,
  editable: true,
  events: [],
  dateClick(info) {
    eventData.value = {
      id: '',
      title: '',
      description: '',
      startDate: info.dateStr,
      startTime: '08:00',
      endDate: info.dateStr,
      endTime: '09:00',
      color: '#1976d2'
    }
    showModal.value = true
  },
  eventClick: (info) => {
    const [startDate, startTimeRaw] = info.event.startStr.split('T')
    const [endDate, endTimeRaw] = info.event.endStr?.split('T') || [startDate, startTimeRaw]

    eventData.value = {
      id: info.event.id,
      title: info.event.title,
      description: info.event.extendedProps.description || '',
      startDate,
      startTime: startTimeRaw?.slice(0, 5),
      endDate,
      endTime: endTimeRaw?.slice(0, 5),
      color: info.event.backgroundColor || '#1976d2'
    }
    showModal.value = true
  },
  locale: 'pt-br',
  eventContent: (arg) => ({
    html: `
      <div class="custom-event" style="background-color:${arg.event.backgroundColor}; padding:4px; border-radius:4px">
        <strong>${arg.event.title}</strong>
        ${arg.event.extendedProps.description ?
      `<div class="event-description">${arg.event.extendedProps.description}</div>` :
      ''
    }
      </div>
    `
  })
})

function openEventModal() {
  eventData.value = {
    id: '',
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    color: '#1976d2'
  }
  showModal.value = true
}

function saveEvent() {
  const { title, startDate, startTime, endDate, endTime, color } = eventData.value

  if (!title || !startDate || !startTime || !endDate || !endTime) {
    showMessage('Preencha todos os campos obrigatórios!')
    return
  }

  const start = `${startDate}T${startTime}`
  const end = `${endDate}T${endTime}`

  if (new Date(end) <= new Date(start)) {
    showMessage('A data/hora de término deve ser após o início.')
    return
  }

  // Verifica se estamos editando (evento já existe)
  if (eventData.value.id) {
    const eventApi = calendarRef.value.getApi().getEventById(eventData.value.id)
    if (eventApi) {
      eventApi.setProp('title', title)
      eventApi.setExtendedProp('description', eventData.value.description)
      eventApi.setStart(start)
      eventApi.setEnd(end)
      eventApi.setProp('backgroundColor', color)
    }
  } else {
    const newEvent = {
      id: String(Date.now()),
      title,
      start,
      end,
      backgroundColor: color,
      extendedProps: {
        description: eventData.value.description
      }
    }
    calendarRef.value.getApi().addEvent(newEvent)
  }

  showModal.value = false
  showMessage('Evento salvo com sucesso!', 'success')

}

function deleteEvent() {
  if (!eventData.value.id) return
  const eventApi = calendarRef.value.getApi().getEventById(eventData.value.id)
  if (eventApi) {
    eventApi.remove()
  }
  showModal.value = false
}

</script>

<style scoped>
.calendar-container {
  background-color: #D1C4E9;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  color: #fff;
  //padding: 16px;
  border-radius: 12px;
}

:deep(.fc) {
  padding: 1.5%;
  background-color: #FFFFFF;
  color: #0a0a0a;
}

:deep(.fc-toolbar-title) {
  font-size: 1.5rem;
}

:deep(.custom-event) {
  padding: 4px;
  margin: 2px;
  border-radius: 4px;
}

:deep(.event-description) {
  font-size: 0.8em;
  margin-top: 4px;
  white-space: normal !important;
}

:deep(.fc-event-main) {
  height: auto !important;
  min-height: 40px;
}
:deep(.fc-button) {
  background-color: white !important;
  color: #4527A0 !important;
  font-weight: 500;
  border: 2px solid #8d6ee1 !important;
  border-radius: 6px;
  padding: 6px 12px;
  margin: 0 2px;
  transition: 0.3s;
  text-transform: none;
}

:deep(.fc-button.fc-today-button){
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
</style>
