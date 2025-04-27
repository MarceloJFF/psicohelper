<template>
  <v-container class="w-100">
    <v-container class="sessoes rounded pa-8">
      <h1 class="text-deep-purple-lighten-2 mb-4">
        Controle do Pagamento das Sessões realizadas.
      </h1>
      <v-row align="center" justify="space-between" class="mb-6">
        <v-col cols="12" sm="6" md="4">
          <v-select
            :items="pacientes"
            v-model="filtroPaciente"
            label="Filtrar por paciente"
            clearable
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </v-row>

      <v-btn
        color="success"
        variant="outlined"
        @click="abrirModalPagamento(atendimento)"
      >
        Lançar Pagamento
      </v-btn>
      <v-span>
        Selecione os pagamentos pendentes para lançar os pagamentos
      </v-span>

    </v-container>

    <v-divider class="my-6" />

    <div v-for="(grupo, data) in atendimentosAgrupados" :key="data">
      <v-card class="mb-6 elevation-2 rounded-xl">
        <v-card-title class="text-h6 font-weight-bold text-primary">
          {{ formatarData(data) }}
        </v-card-title>

        <v-divider />

        <v-list>
          <v-list-item
            v-for="atendimento in grupo"
            :key="atendimento.id"
            class="pa-4 px-2"
          >
              <v-row class="pa-4  d-flex 	align-self-center">
                <v-col cols="12" sm="6" md="4">
                  <v-checkbox label="Selecione se deseja registrar pagamento" v-if="atendimento.status=='Pendente'" ></v-checkbox>
                  <div class="font-weight-medium pa-2">
                  Horário Agendado:  {{ atendimento.horario }} - {{atendimento.horario_fim }}
                  </div>

                  <div class="font-weight-medium pa-2">
                   Aprendente: {{atendimento.paciente }}

                  </div>

                  <v-chip
                    :color="atendimento.status === 'Pago' ? 'success' : 'error'"
                    variant="outlined"
                    class="text-capitalize pa-2"
                    small
                  >
                    {{ atendimento.status }}
                  </v-chip>
                </v-col>

                <v-spacer />
                <v-col cols="12" sm="6" md="4">
                  <v-btn
                    icon
                    @click="atendimento.showDetails = !atendimento.showDetails"
                  >
                    <v-icon>{{ atendimento.showDetails ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                  </v-btn>

                  <v-btn
                    color="primary"
                    variant="text"
                    @click="atendimento.showDetails = !atendimento.showDetails"
                  >
                    {{ atendimento.showDetails ? 'Ocultar Detalhes' : 'Mostrar Detalhes' }}
                  </v-btn>


                  <v-btn
                    v-if="atendimento.status === 'Pago'"
                    color="error"
                    variant="outlined"
                    @click="console.log('Outro componente acionado')"
                  >
                    Editar Pagamento
                  </v-btn>

                </v-col>



              </v-row>

            <v-expand-transition>
              <div v-if="atendimento.showDetails" class="details-section mt-4">
                <div class="mt-4">
                  <div
                    v-for="menu in menus"
                    :key="menu.field"
                    class="mb-4"
                  >
                    <h4 class="text-subtitle-1 font-weight-bold mb-1">{{ menu.label }}</h4>
                    <p class="text-body-2">
                      {{ atendimento[menu.field] || 'Sem informações' }}
                    </p>
                  </div>
                </div>
                <v-btn
                  color="success"
                  variant="outlined"
                >
                  Editar
                </v-btn>
              </div>

            </v-expand-transition>

          </v-list-item>

        </v-list>
      </v-card>
    </div>
  </v-container>
  <v-dialog v-model="modalPagamento" max-width="500">
    <v-card>
      <v-card-title class="text-h6">Lançar Pagamento</v-card-title>
      <v-card-text>
        <p><strong>Paciente:</strong> {{ atendimentoSelecionado?.paciente }}</p>
        <p><strong>Data:</strong> {{ formatarData(atendimentoSelecionado?.data) }}</p>
        <p><strong>Horário:</strong> {{ atendimentoSelecionado?.horario }} - {{ atendimentoSelecionado?.horario_fim }}</p>

        <!-- Aqui você pode adicionar inputs como valor, forma de pagamento etc -->
        <v-text-field label="Valor Pago" type="number" />
        <v-select
          label="Forma de Pagamento"
          :items="['Dinheiro', 'Pix', 'Cartão']"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="modalPagamento = false">Cancelar</v-btn>
        <v-btn color="primary" @click="modalPagamento = false">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'

// Lista de pacientes para o filtro
const pacientes = ['João Silva', 'Maria Oliveira', 'Carlos Santos', 'Ana Lima', 'Fernanda Costa']

const filtroPaciente = ref<string | null>(null)

// Lista de atendimentos
const atendimentos = ref([
  {
    id: 1,
    data: '2025-04-15',
    horario: '09:00',
    paciente: 'João Silva',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    status: 'Pago',
    anotacao: null,
    showDetails: false,
    preSessao: '',
    queixas: '',
    evolucaoAtual: '',
    habilidadesTrabalhadas: '',
    futurasAcoes: '',
    anexos: [],
    resumo: ''
  },{
    id: 1,
    data: '2025-04-15',
    horario: '09:00',
    horario_fim:'10:00',
    paciente: 'João Silva',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    status: 'Pago',
    anotacao: null,
    showDetails: false,
    preSessao: '',
    queixas: '',
    evolucaoAtual: '',
    habilidadesTrabalhadas: '',
    futurasAcoes: '',
    anexos: [],
    resumo: ''
  },
  {
    id: 2,
    data: '2025-04-15',
    horario: '10:30',
    paciente: 'Maria Oliveira',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    status: 'Pendente',
    anotacao: null,
    showDetails: false,
    preSessao: '',
    queixas: '',
    evolucaoAtual: '',
    habilidadesTrabalhadas: '',
    futurasAcoes: '',
    anexos: [],
    resumo: ''
  },
  {
    id: 3,
    data: '2025-04-14',
    horario: '14:00',
    paciente: 'Carlos Santos',
    avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
    status: 'Pago',
    anotacao: null,
    showDetails: false,
    preSessao: '',
    queixas: '',
    evolucaoAtual: '',
    habilidadesTrabalhadas: '',
    futurasAcoes: '',
    anexos: [],
    resumo: ''
  },
  {
    id: 4,
    data: '2025-04-14',
    horario: '15:30',
    paciente: 'Ana Lima',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    status: 'Pendente',
    anotacao: null,
    showDetails: false,
    preSessao: '',
    queixas: '',
    evolucaoAtual: '',
    habilidadesTrabalhadas: '',
    futurasAcoes: '',
    anexos: [],
    resumo: ''
  },
  {
    id: 5,
    data: '2025-04-13',
    horario: '11:15',
    paciente: 'Fernanda Costa',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    status: 'Pago',
    anotacao: 'Paciente apresentou evolução positiva na comunicação.',
    showDetails: false,
    preSessao: '',
    queixas: '',
    evolucaoAtual: '',
    habilidadesTrabalhadas: '',
    futurasAcoes: '',
    anexos: [],
    resumo: ''
  }
])

// Agrupando atendimentos por data, com filtro por paciente se necessário
const atendimentosAgrupados = computed(() => {
  const agrupados: Record<string, typeof atendimentos.value> = {}

  const lista = filtroPaciente.value
    ? atendimentos.value.filter(a => a.paciente === filtroPaciente.value)
    : atendimentos.value

  lista.forEach(atendimento => {
    if (!agrupados[atendimento.data]) {
      agrupados[atendimento.data] = []
    }
    agrupados[atendimento.data].push(atendimento)
  })

  return agrupados
})

// Exemplo de função para adicionar anotação
function adicionarAnotacao(atendimento: any) {
  atendimento.anotacao = 'Anotação criada.'
}

// Formatação da data
function formatarData(dataStr: string): string {
  const [ano, mes, dia] = dataStr.split('-')
  return `${dia}/${mes}/${ano}`
}

// Estrutura dos menus com seus componentes
const menus = [
  {
    field: 'preSessao',
    label: 'Pré-sessão',
    component: 'v-textarea',
    props: { label: 'Pré-sessão' }
  },
  {
    field: 'queixas',
    label: 'Queixas',
    component: 'v-textarea',
    props: { label: 'Queixas' }
  },
  {
    field: 'evolucaoAtual',
    label: 'Evolução Atual',
    component: 'v-textarea',
    props: { label: 'Evolução Atual' }
  },
  {
    field: 'habilidadesTrabalhadas',
    label: 'Habilidades Trabalhadas',
    component: 'v-textarea',
    props: { label: 'Habilidades Trabalhadas' }
  },
  {
    field: 'futurasAcoes',
    label: 'Futuras Ações',
    component: 'v-textarea',
    props: { label: 'Futuras Ações' }
  },
  {
    field: 'resumo',
    label: 'Resumo da Sessão',
    component: 'v-textarea',
    props: { label: 'Resumo da Sessão' }
  }
]
const modalPagamento = ref(false)
const atendimentoSelecionado = ref<any>(null)

function abrirModalPagamento(atendimento: any) {
  atendimentoSelecionado.value = atendimento
  modalPagamento.value = true
}
</script>


<style scoped>
.details-section {
  width: 100%;
  padding: 24px;
  background-color: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}
.v-list-item {
  border-bottom: 1px solid #f0f0f0;
}
.sessoes{
  background-color: #f9f9f9 !important;
}
</style>
