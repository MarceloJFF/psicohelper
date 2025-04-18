import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FinanceiroView from '@/views/FinanceiroView.vue'
import RelatoriosView from '@/views/RelatoriosView.vue'
import ClienteView from '@/views/ClienteView.vue'
import  AddClienteView from '@/views/AddClienteView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
     {
      path: '/finaceiro',
      name: 'Financeiro',
      component: FinanceiroView,
    },
     {
      path: '/relatorios',
      name: 'relatorios',
      component: RelatoriosView,
    },
     {
      path: '/Clientes',
      name: 'clientes',
      component: ClienteView,
    },

    {
      path: '/clientes/add',
      name: 'clientes-add',
      component: AddClienteView,

    },

    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
