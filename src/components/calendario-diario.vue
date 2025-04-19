<template>
    <FullCalendar :options="calendarOptions" class="calendar-container" />
</template>

<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import ptBr from '@fullcalendar/core/locales/pt-br'

const calendarOptions = {
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  height: 'auto',
  locale: ptBr

}
</script>

<style>
  .calendar-container{
    width: 100%;
  }
</style>
