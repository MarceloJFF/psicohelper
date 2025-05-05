<template>
  <v-container class="py-6 w-100 h-100">
    <v-card elevation="2" class="pa-6">
      <!-- Tabs -->
      <v-tabs v-model="abaAtiva" background-color="deep-purple-lighten-5" grow>
        <v-tab value="perfil">Perfil</v-tab>
        <v-tab value="anamnese">Anamnese</v-tab>
        <v-tab value="feriados">Feriados</v-tab>
        <v-tab value="whatsapp">Whatsapp</v-tab>
      </v-tabs>
      <v-divider class="my-4" />
      <v-window v-model="abaAtiva">
        <!-- Aba Perfil -->
        <v-window-item value="perfil">
          <Perfil></Perfil>
        </v-window-item>

        <!-- Outras Abas -->
        <v-window-item value="anamnese">
          <Anamnese></Anamnese>
        </v-window-item>

        <v-window-item value="feriados">
            <Feriados></Feriados>
        </v-window-item>

        <v-window-item value="whatsapp">
          <Mensagens></Mensagens>
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import Anamnese from '@/components/config/Anamnese.vue'
import Feriados from '@/components/config/Feriados.vue'
import Mensagens from '@/components/config/Mensagens.vue'
import Perfil from '@/components/config/Perfil.vue'
const abaAtiva = ref('perfil')  // Aba inicial ativa


</script>

<style scoped>

</style>
