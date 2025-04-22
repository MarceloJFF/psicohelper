<template>
    <v-container class="pa-2 w-100">
      <v-row justify="center" align="center">
        <v-col cols="12" md="6" class="text-center">
          <h1>Bem-vindo ao painel</h1>
          <h2>Esses são seus compromissos hoje, usuário logado</h2>
        </v-col>
      </v-row>
      <Calendar />
    </v-container>
</template>

<script setup lang="ts">
import Calendar from "@/components/Calendar.vue";
</script>

<style scoped>
.v-text-field {
  max-width: 300px;
}
</style>
