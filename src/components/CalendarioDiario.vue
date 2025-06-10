<template>
  <v-card class="pa-4 bg-white">
    <v-date-picker
      v-model="date"
      :locale="locale"
      full-width
      :events="events"
      color="blue lighten-4"
      event-color="primary"
      @click:date="handleDateClick"
    ></v-date-picker>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const date = ref(new Date().toISOString().substr(0, 10));
const locale = 'pt-br';

// Exemplo de eventos (opcional)
const events = ref([
  new Date().toISOString().substr(0, 10) // Mostra o dia atual com um marcador
]);

const handleDateClick = (date: string) => {
  console.log('Data selecionada:', date);
  // Adicione sua lógica aqui quando uma data é clicada
};
</script>

<style scoped>
.v-card {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
</style>
