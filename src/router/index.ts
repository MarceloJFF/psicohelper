
import DefaultLayout from '@/views/DefaultLayout.vue'

import { createRouter, createWebHistory } from 'vue-router'
import { useStoreAuth } from '@/stores/storeAuth'
import AdminProfessionals from '@/views/AdminProfessionals.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/AuthForm.vue') // Lazy loading
    },
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '/admin/professionals',
          name: 'AdminProfessionals',
          component: AdminProfessionals,
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: '',
          name: 'home',
          component: () => import('@/views/Home.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'calendario',
          name: 'calendario',
          component: () => import('@/views/CalendarioAgendamento.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'financeiro',
          name: 'financeiro',
          component: () => import('@/views/FinanceiroView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'relatorios',
          name: 'relatorios',
          component: () => import('@/views/RelatoriosView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'clientes',
          name: 'clientes',
          component: () => import('@/views/ClienteListagemView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'clientes/add',
          name: 'clientes-add',
          component: () => import('@/views/AddClienteView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'clientes/gerenciar',
          name: 'gerenciar-clientes',
          component: () => import('@/views/GerenciarClientesView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/clientes/:idResponsavel/dependentes/:idAprendente?/detalhes',
          name: 'cliente-detalhes',
          component: () => import('@/views/ClienteDetalhesView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'inventario',
          name: 'inventario',
          component: () => import('@/views/InventarioView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'atendimentos',
          name: 'atendimentos',
          component: () => import('@/views/AtendimentosView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'configuracoes',
          name: 'configuracoes',
          component: () => import('@/views/Configuracao.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/AboutView.vue'),
          meta: { requiresAuth: true }
        }
      ]
    }
  ]
})


router.beforeEach(async (to, from, next) => {
  const storeAuth = useStoreAuth()
  // Aguarda a sessão carregar
  if (!storeAuth.sessionLoaded) {
    // Aguarda no máximo 2 segundos para sessionLoaded ficar true
    const waitForSession = async (timeout = 1000) => {
      const start = Date.now()
      while (!storeAuth.sessionLoaded && Date.now() - start < timeout) {
        await new Promise(r => setTimeout(r, 50))
      }
    }
    await waitForSession()
  }


  const isAuthenticated = !!storeAuth.userDetails.id

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login')
  }

  if (to.path === '/login' && isAuthenticated) {
    return next('/')
  }

  next()
})


export default router
