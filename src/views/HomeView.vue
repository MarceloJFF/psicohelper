<template>
  <v-app id="inspire">
    <!-- Drawer lateral -->
    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          link
        />
      </v-list>
    </v-navigation-drawer>

    <!-- Barra superior -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>Psicohelper Solutions</v-app-bar-title>
      <v-text-field
        prepend-inner-icon="mdi-magnify"
        label="Buscar"
        variant="solo"
        flat
        hide-details
        single-line
        class="mx-4"
        density="comfortable"
      />

      <v-spacer />

      <v-avatar size="36">
        <v-img src="https://randomuser.me/api/portraits/men/85.jpg" />
      </v-avatar>
    </v-app-bar>

    <v-main app>
      <v-container class="pa-2" ><v-row justify="center" align="center">
          <v-col cols="12" md="6" class="text-center">
            <h1>Bem-vindo ao painel</h1>
            <h2>Esses são seus compromissos hoje usuario logado</h2>
          </v-col>
        </v-row>
      <Calendar></Calendar>

      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Calendar from "@/components/Calendar.vue";

const drawer = ref(true)

const items = [
  { title: 'Home', icon: 'mdi-home' },
  { title: 'Financeiro', icon: 'mdi-currency-usd' },
  { title: 'Calendar', icon: 'mdi-calendar-month' },
]
</script>

<style scoped>
.v-text-field {
  max-width: 300px;
}
</style>
