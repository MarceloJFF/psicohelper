<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>

  <v-app id="inspire">
  <v-navigation-drawer v-model="drawer" app  color="primary" permanent >
      <v-img
        :width="321"
        aspect-ratio="16/9"
        cover
        src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"
      ></v-img>

      <v-list>
        <RouterLink
          v-for="item in items"
          :key="item.title"
          :to="item.to"
          style="text-decoration: none; color: inherit"
        >
          <v-list-item
            :prepend-icon="item.icon"
            :title="item.title"
            link
          />
        </RouterLink>
      </v-list>

  </v-navigation-drawer>

    <!-- Barra superior -->
   <v-app-bar app color=" bg-deep-purple">
  <v-app-bar-nav-icon @click="drawer = !drawer" />
  <v-app-bar-title>Psicohelper Solutions</v-app-bar-title>
<!--
  <v-text-field
    prepend-inner-icon="mdi-magnify"
    label="Buscar"
    variant="solo"
    flat
    hide-details
    single-line
    class="mx-4"
    density="comfortable"
  /> -->


  <!-- Ícone de notificações -->
  <v-btn icon>
    <v-icon>mdi-bell</v-icon>
  </v-btn>

  <!-- Ícone de configurações -->
  <v-btn icon>
    <v-icon>mdi-cog</v-icon>
  </v-btn>

  <!-- Avatar do usuário + nome -->
  <v-menu>
    <template #activator="{ props }">
      <v-btn v-bind="props" class="d-flex align-center" variant="text">
        <v-avatar size="32">
          <v-img>
          </v-img>
        </v-avatar>
        <span class="ml-2 font-weight-medium">Marcelo</span>
      </v-btn>
    </template>
    <v-list>
      <v-list-item title="Perfil" />
      <v-list-item title="Sair" />
    </v-list>
  </v-menu>
</v-app-bar>

     <v-main>
      <RouterView />
    </v-main>
    </v-app>

</template>
<script lang="ts">
import { ref } from 'vue'
const drawer = ref(false)
const items = [
  { title: 'Home', icon: 'mdi-home', to: '/' },
  { title: 'Financeiro', icon: 'mdi-currency-usd', to: '/financeiro' },
  { title: 'Calendar', icon: 'mdi-calendar-month', to: '/calendario' },
  { title: 'Relatórios', icon: 'mdi-clock', to: '/relatorios' },
  { title: 'Contratos', icon: 'mdi-file-document', to: '/contratos' },
  { title: 'Atendimentos', icon: 'mdi-account-clock', to: '/atendimentos' },
  { title: 'Clientes', icon: 'mdi-account-multiple', to: '/clientes' },
  { title: 'Configurações', icon: 'mdi-cog', to: '/configuracoes' },
  { title: 'Sair', icon: 'mdi-logout', to: '/logout' }
]

</script>


