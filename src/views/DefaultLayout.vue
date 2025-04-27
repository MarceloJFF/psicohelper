<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { ref } from 'vue'
import logo from '@/assets/logo.jpeg';


const drawer = ref(true)
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

<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app color="#9a20c1" permanent>
      <v-img
        :width="321"
        aspect-ratio="16/9"
        cover
        :src="logo"
        rounded-full
      />
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
            class="menu-item font-weight-bold text-uppercase"
          />
        </RouterLink>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>Psicohelper Solutions</v-app-bar-title>

      <v-btn icon>
        <v-icon>mdi-bell</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-cog</v-icon>
      </v-btn>

      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" class="d-flex align-center" variant="text">
            <v-avatar size="32">
              <v-img />
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

    <v-main class="w-100">
      <transition name="fade">
        <RouterView />
      </transition>
    </v-main>
  </v-app>
</template>

<style scoped>
/* Animação de fade para as mudanças de página */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter, .fade-leave-to /* .fade-leave-active em <2.1.8 */ {
  opacity: 0;
}

/* Efeito de hover nos itens do menu */
.menu-item {
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.menu-item:hover {
  background-color: #d3a3e4; /* cor de destaque no hover */
  transform: scale(1.05); /* animação de aumento de tamanho */
}
</style>
