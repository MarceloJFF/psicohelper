import { createRouter, createWebHistory } from 'vue-router'

// Importa o layout padrão
import DefaultLayout from '@/views/DefaultLayout.vue'
// Importa as views
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
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: Home
        },
        {
          path: 'calendario',
          name: 'calendario',
          component: CalendarioAgendamento
        },
        {
          path: 'finaceiro',
          name: 'financeiro',
          component: FinanceiroView
        },
        {
          path: 'relatorios',
          name: 'relatorios',
          component: RelatoriosView
        },
        {
          path: 'clientes',
          name: 'clientes',
          component: ClienteListagemView
        },
        {
          path: 'clientes/add',
          name: 'clientes-add',
          component: AddClienteView
        },
        {
          path: 'clientes/:id/detalhes',
          name: 'cliente-detalhes',
          component: ClienteDetalhesView
        },
        {
          path: 'atendimentos',
          name: 'atendimentos',
          component: AtendimentosView
        },
        {
          path: 'configuracoes',
          name: 'configuracoes',
          component: Configuracao
        },
        {
          path: 'about',
          name: 'about',
          component: AboutView
        }
      ]
    },
    // Exemplo de login sem layout (no futuro você coloca a tela de login aqui)
    // {
    //   path: '/login',
    //   name: 'login',
    //   component: () => import('@/views/LoginView.vue')
    // }
  ]
})

export default router
