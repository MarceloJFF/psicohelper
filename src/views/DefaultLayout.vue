<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { ref } from 'vue'
import logo from '@/assets/logo.jpeg';
import { useStoreAuth } from '@/stores/storeAuth.ts'
import {useStoreProfissional} from'@/stores/storeProfissional.ts'

const drawer = ref(true)
const items = [
  { title: 'Home', icon: 'mdi-home', to: '/' },
  { title: 'Financeiro', icon: 'mdi-currency-usd', to: '/financeiro' },
  { title: 'Calendar', icon: 'mdi-calendar-month', to: '/calendario' },
  { title: 'Anexos', icon: 'mdi-clock', to: '/relatorios' },
  { title: 'Inventario', icon: 'mdi-file-document', to: '/Inventario' },
  { title: 'Atendimentos', icon: 'mdi-account-clock', to: '/atendimentos' },
  { title: 'Aprendentes', icon: 'mdi-account-multiple', to: '/clientes' },
  { title: 'Gerenciar Clientes', icon: 'mdi-account-cog', to: '/clientes/gerenciar' },
  { title: 'Configurações', icon: 'mdi-cog', to: '/configuracoes' },
  { title: 'Sair', icon: 'mdi-logout', action: () => storeAuth.logoutUser() }
]
const storeAuth = useStoreAuth()
const storeProfissional = useStoreProfissional()
</script>

<template>
  <v-app id="inspire" v-if="storeProfissional.profissionalDetails">
    <v-navigation-drawer v-model="drawer" app color="#9a20c1" permanent>
      <v-img
        :max-width="320"
        aspect-ratio="16/9"
        cover
        :src="logo"
        rounded-full
      />
      <v-list>
        <template v-for="item in items" :key="item.title">
          <v-list-item
            v-if="item.to"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            link
            class="menu-item font-weight-bold text-uppercase"
          />
          <v-list-item
            v-else
            @click="item.action"
            :prepend-icon="item.icon"
            :title="item.title"
            link
            class="menu-item font-weight-bold text-uppercase"
          />
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"  color="#9C27B0" />
      <v-app-bar-title class="text-h5 font-weight-bold" style="color:purple;">Psicopedag Pro</v-app-bar-title>

      <v-btn icon>
        <v-icon color="#9C27B0">mdi-bell</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon color="#9C27B0">mdi-cog</v-icon>
      </v-btn>

      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" class="d-flex align-center" style="color:purple;" variant="text">
            <v-avatar size="32">
              <v-img />
            </v-avatar>
            <span class="ml-2 font-weight-medium"  style="color:purple;">{{storeProfissional.profissionalDetails.nome
              }}</span>

          </v-btn>
        </template>
        <v-list color="#9C27B0">
          <v-list-item title="Perfil" />
          <v-list-item @click="storeAuth.logoutUser()" title="Sair" />
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="w-100">
      <router-view v-slot="{ Component }">
    <transition name="fade">
      <component :is="Component" />
    </transition>
  </router-view>

    </v-main>
  </v-app>
</template>
<style scoped>
/* Efeito geral nos itens do menu */
.menu-item {
  transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 12px; /* Espaçamento entre os itens */
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Sombra leve */
}

/* Quando o mouse passa por cima */
.menu-item:hover {
  background-color: #d3a3e4; /* Cor de destaque no hover */
  transform: scale(1.05); /* Pequeno aumento */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Sombra mais forte no hover */
}

/* Estilo para o item ativo */
.router-link-exact-active .menu-item {
  background-color: #ba68c8; /* Cor de fundo do ativo */
  color: white;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3); /* Sombra mais intensa no ativo */
}

</style>
