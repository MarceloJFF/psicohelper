import { createRouter, createWebHistory } from 'vue-router'
import supabase from '@/config/supabase.js'
import {useStoreAuth} from '@/stores/storeAuth'
import DefaultLayout from '@/views/DefaultLayout.vue'
import InventarioView from '@/views/InventarioView.vue'
import CalendarioAgendamento from '@/views/CalendarioAgendamento.vue'
import FinanceiroView from '@/views/FinanceiroView.vue'
import RelatoriosView from '@/views/RelatoriosView.vue'
import ClienteListagemView from '@/views/ClienteListagemView.vue'
import AddClienteView from '@/views/AddClienteView.vue'
import ClienteDetalhesView from '@/views/ClienteDetalhesView.vue'
import AtendimentosView from '@/views/AtendimentosView.vue'
import Configuracao from '@/views/Configuracao.vue'
import AboutView from '@/views/AboutView.vue'
import Home from '@/views/Home.vue'
// Aqui você poderia importar a tela de Login também futuramente.

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/AuthForm.vue') // ou LoginView.vue
    },
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: Home,
          meta: { requiresAuth: true }
        },
        {
          path: 'calendario',
          name: 'calendario',
          component: CalendarioAgendamento,
          meta: { requiresAuth: true }

        },
        {
          path: 'financeiro',
          name: 'financeiro',
          component: FinanceiroView,
          meta: { requiresAuth: true }
        },
        {
          path: 'relatorios',
          name: 'relatorios',
          component: RelatoriosView,
          meta: { requiresAuth: true }

        },
        {
          path: 'clientes',
          name: 'clientes',
          component: ClienteListagemView,
          meta: { requiresAuth: true }

        },
        {
          path: 'clientes/add',
          name: 'clientes-add',
          component: AddClienteView,
          meta: { requiresAuth: true }

        },
        {
          path: 'clientes/:id/detalhes',
          name: 'cliente-detalhes',
          component: ClienteDetalhesView,
          meta: { requiresAuth: true }

        },
        {
          path: 'inventario',
          name: 'inventario',
          component: InventarioView,
          meta: { requiresAuth: true }

        },
        {
          path: 'atendimentos',
          name: 'atendimentos',
          component: AtendimentosView,
          meta: { requiresAuth: true }

        },
        {
          path: 'configuracoes',
          name: 'configuracoes',
          component: Configuracao,
          meta: { requiresAuth: true }

        },
        {
          path: 'about',
          name: 'about',
          component: AboutView,
          meta: { requiresAuth: true }

        }
      ]
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const storeAuth = useStoreAuth()
  const { data: session } = await supabase.auth.getSession()

  const isAuthenticated = !!session.session

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})


export default router
