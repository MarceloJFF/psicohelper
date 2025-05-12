<template>
  <v-container>
    <h2 class="text-h4 mb-4">Financeiro</h2>

    <!-- Indicadores -->
    <v-row class="mb-4 mt-4" justify="center">
      <v-col cols="12" md="4">
        <v-card color="blue" class="pa-8" dark>
          <v-card-text class="text-center">
            <div>Receitas</div>
            <div class="text-h5">R$ {{ formatarValor(totalReceitas) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card color="red" dark class="pa-8">
          <v-card-text class="text-center">
            <div>Despesas</div>
            <div class="text-h5">R$ {{ formatarValor(totalDespesas) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card :color="lucro >= 0 ? 'green' : 'red'" dark class="pa-8">
          <v-card-text class="text-center">
            <div>Lucro</div>
            <div class="text-h5">R$ {{ formatarValor(lucro) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" md="3">
        <v-select
          v-model="anoSelecionado"
          :items="anos"
          label="Ano"
          dense
          outlined
        ></v-select>
      </v-col>
      <v-col cols="12" md="9">
        <v-btn-toggle
          v-model="mesSelecionado"
          class="d-flex flex-wrap"
          dense
          mandatory
        >
          <v-btn
            v-for="(mes, index) in meses"
            :key="index"
            :value="index"
            class="ma-1"
            :color="mesSelecionado === index ? 'primary' : undefined"
          >
            {{ mes }}
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <!-- Botões Receitas / Despesas -->
    <v-row class="mb-4">
      <v-col cols="6">
        <v-btn
          block
          :color="tipoSelecionado === 'receita' ? 'green' : 'grey'"
          dark
          @click="tipoSelecionado = 'receita'"
        >
          Receitas
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn
          block
          :color="tipoSelecionado === 'despesa' ? 'red' : 'grey'"
          dark
          @click="tipoSelecionado = 'despesa'"
        >
          Despesas
        </v-btn>
      </v-col>
    </v-row>

    <!-- Ações -->
    <v-row class="mb-4">
      <v-col>
        <v-btn
          color="primary"
          @click="abrirModal = true"
        >
          <v-icon left>mdi-plus</v-icon>
          Novo Lançamento
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabela -->
    <v-data-table
      :headers="headers"
      :items="lancamentosFiltrados"
      class="elevation-1"
      dense
    >
      <template v-slot:item="{ item }">
        <tr class="py-4">
          <td>{{ item.tipo }}</td>
          <td>{{ item.categoria }}</td>
          <td>{{ item.cliente }}</td>
          <td>R$ {{ formatarValor(item.valor) }}</td>
          <td>{{ formatarData(item.vencimento) }}</td>
          <td>
            <div class="d-flex flex-column align-center" style="min-width: 120px">
              <v-chip
                :color="item.pago ? 'success' : 'warning'"
                small
                class="mb-2"
              >
                {{ item.pago ? 'Pago' : 'Pendente' }}
              </v-chip>
              <v-btn
                icon
                x-small
                color="green"
                :title="item.pago ? 'Enviar mensagem de confirmação de pagamento' : 'Enviar mensagem de cobrança'"
                @click="enviarMensagemWhatsApp(item)"
              >
                <v-icon>mdi-whatsapp</v-icon>
              </v-btn>
            </div>
          </td>
          <td>
            <v-btn
              icon
              small
              class="mr-2"
              @click="editarLancamento(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              small
              color="error"
              @click="confirmarExclusao(item)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>

    <!-- Modal Lançamento -->
    <v-dialog v-model="abrirModal" max-width="600px">
      <v-card>
        <v-card-title>
          {{ editando ? 'Editar' : 'Novo' }} {{ tipoSelecionado === 'receita' ? 'Receita' : 'Despesa' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="salvarLancamento">
            <v-text-field
              v-model="novoLancamento.tipo"
              label="Descrição"
              :rules="[v => !!v || 'Campo obrigatório']"
              outlined
              dense
            />
            <v-text-field
              v-model="novoLancamento.categoria"
              label="Categoria"
              outlined
              dense
            />
            <v-row>
              <v-col cols="8">
                <v-text-field
                  v-model="novoLancamento.observacoes"
                  label="Observações"
                  outlined
                  dense
                />
              </v-col>
              <v-col cols="4">
                <v-checkbox
                  v-model="novoLancamento.recorrente"
                  label="Recorrente"
                  dense
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="novoLancamento.qtdMeses"
                  label="Quantidade de meses"
                  type="number"
                  outlined
                  dense
                  :disabled="!novoLancamento.recorrente"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="novoLancamento.vencimento"
                  label="Vencimento"
                  type="date"
                  outlined
                  dense
                  :rules="[v => !!v || 'Campo obrigatório']"
                />
              </v-col>
            </v-row>
            <v-text-field
              v-if="tipoSelecionado === 'receita'"
              v-model="novoLancamento.cliente"
              label="Cliente"
              outlined
              dense
            />
            <v-text-field
              v-model="novoLancamento.valor"
              label="Valor"
              type="number"
              outlined
              dense
              :rules="[v => !!v || 'Campo obrigatório']"
              prefix="R$"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            text
            @click="abrirModal = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="salvarLancamento"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Confirmação -->
    <v-dialog v-model="dialogConfirmacao" max-width="400">
      <v-card>
        <v-card-title>Confirmar Exclusão</v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir este lançamento?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            text
            @click="dialogConfirmacao = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            @click="excluirLancamento"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Lancamento {
  id: number
  tipo: string
  categoria: string
  observacoes: string
  recorrente: boolean
  qtdMeses: number
  vencimento: string
  cliente: string
  valor: number
  tipoLancamento: 'receita' | 'despesa'
  pago: boolean
}

const form = ref<{ validate: () => boolean } | null>(null)
const tipoSelecionado = ref<'receita' | 'despesa'>('receita')
const mesSelecionado = ref(4)
const anoSelecionado = ref(2024)
const anos = [2023, 2024, 2025]
const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const abrirModal = ref(false)
const dialogConfirmacao = ref(false)
const editando = ref(false)
const lancamentoParaExcluir = ref<Lancamento | null>(null)
const lancamentos = ref<Lancamento[]>([
  // Receitas - Atendimentos
  {
    id: 1,
    tipo: 'Atendimento Psicopedagógico',
    categoria: 'Atendimento',
    observacoes: 'Primeira sessão',
    recorrente: false,
    qtdMeses: 1,
    vencimento: '2024-05-02',
    cliente: 'Maria Silva',
    valor: 250.00,
    tipoLancamento: 'receita',
    pago: true
  },
  {
    id: 2,
    tipo: 'Atendimento Psicopedagógico',
    categoria: 'Atendimento',
    observacoes: 'Sessão de acompanhamento',
    recorrente: false,
    qtdMeses: 1,
    vencimento: '2024-05-05',
    cliente: 'João Santos',
    valor: 250.00,
    tipoLancamento: 'receita',
    pago: true
  },
  {
    id: 3,
    tipo: 'Atendimento Psicopedagógico',
    categoria: 'Atendimento',
    observacoes: 'Avaliação inicial',
    recorrente: false,
    qtdMeses: 1,
    vencimento: '2024-05-10',
    cliente: 'Ana Oliveira',
    valor: 350.00,
    tipoLancamento: 'receita',
    pago: true
  },
  {
    id: 4,
    tipo: 'Atendimento Psicopedagógico',
    categoria: 'Atendimento',
    observacoes: 'Sessão de acompanhamento',
    recorrente: false,
    qtdMeses: 1,
    vencimento: '2024-05-15',
    cliente: 'Pedro Costa',
    valor: 250.00,
    tipoLancamento: 'receita',
    pago: false
  },
  {
    id: 5,
    tipo: 'Atendimento Psicopedagógico',
    categoria: 'Atendimento',
    observacoes: 'Primeira sessão',
    recorrente: false,
    qtdMeses: 1,
    vencimento: '2024-05-20',
    cliente: 'Carla Mendes',
    valor: 250.00,
    tipoLancamento: 'receita',
    pago: false
  },
  // Despesas

  {
    id: 7,
    tipo: 'Material de Trabalho',
    categoria: 'Materiais',
    observacoes: 'Compra de jogos e materiais',
    recorrente: false,
    qtdMeses: 1,
    vencimento: '2024-05-08',
    cliente: '',
    valor: 350.00,
    tipoLancamento: 'despesa',
    pago: true
  },
  {
    id: 8,
    tipo: 'Internet',
    categoria: 'Serviços',
    observacoes: 'Pacote mensal',
    recorrente: true,
    qtdMeses: 12,
    vencimento: '2024-05-10',
    cliente: '',
    valor: 150.00,
    tipoLancamento: 'despesa',
    pago: true
  },
  {
    id: 9,
    tipo: 'Energia Elétrica',
    categoria: 'Serviços',
    observacoes: 'Conta mensal',
    recorrente: true,
    qtdMeses: 12,
    vencimento: '2024-05-15',
    cliente: '',
    valor: 200.00,
    tipoLancamento: 'despesa',
    pago: false
  },
  {
    id: 10,
    tipo: 'Assinatura de Software',
    categoria: 'Serviços',
    observacoes: 'Plano anual',
    recorrente: true,
    qtdMeses: 12,
    vencimento: '2024-05-20',
    cliente: '',
    valor: 120.00,
    tipoLancamento: 'despesa',
    pago: false
  }
])

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const novoLancamento = ref<Partial<Lancamento>>({
  tipo: '',
  categoria: '',
  observacoes: '',
  recorrente: false,
  qtdMeses: 1,
  vencimento: '',
  cliente: '',
  valor: 0,
  tipoLancamento: tipoSelecionado.value,
  pago: false
})

const headers = [
  { text: 'Descrição', value: 'tipo' },
  { text: 'Categoria', value: 'categoria' },
  { text: 'Cliente', value: 'cliente' },
  { text: 'Valor', value: 'valor' },
  { text: 'Vencimento', value: 'vencimento' },
  { text: 'Status', value: 'pago' },
  { text: 'Ações', value: 'acoes', sortable: false }
]

const lancamentosFiltrados = computed(() => {
  return lancamentos.value.filter(lancamento => {
    const data = new Date(lancamento.vencimento)
    return (
      lancamento.tipoLancamento === tipoSelecionado.value &&
      data.getFullYear() === anoSelecionado.value &&
      data.getMonth() === mesSelecionado.value
    )
  })
})

const totalReceitas = computed(() => {
  return lancamentos.value
    .filter(l => l.tipoLancamento === 'receita' && 
      new Date(l.vencimento).getFullYear() === anoSelecionado.value &&
      new Date(l.vencimento).getMonth() === mesSelecionado.value)
    .reduce((acc, curr) => acc + curr.valor, 0)
})

const totalDespesas = computed(() => {
  return lancamentos.value
    .filter(l => l.tipoLancamento === 'despesa' && 
      new Date(l.vencimento).getFullYear() === anoSelecionado.value &&
      new Date(l.vencimento).getMonth() === mesSelecionado.value)
    .reduce((acc, curr) => acc + curr.valor, 0)
})

const lucro = computed(() => {
  return totalReceitas.value - totalDespesas.value
})

function formatarValor(valor: number) {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function formatarData(data: string) {
  return new Date(data).toLocaleDateString('pt-BR')
}

function limparFormulario() {
  novoLancamento.value = {
    tipo: '',
    categoria: '',
    observacoes: '',
    recorrente: false,
    qtdMeses: 1,
    vencimento: '',
    cliente: '',
    valor: 0,
    tipoLancamento: tipoSelecionado.value,
    pago: false
  }
  editando.value = false
}

function salvarLancamento() {
  if (!form.value?.validate()) return

  try {
    if (editando.value && novoLancamento.value.id) {
      const index = lancamentos.value.findIndex(l => l.id === novoLancamento.value.id)
      if (index !== -1) {
        lancamentos.value[index] = { ...novoLancamento.value as Lancamento }
      }
      snackbarMessage.value = 'Lançamento atualizado com sucesso!'
    } else {
      const novoId = lancamentos.value.length > 0 
        ? Math.max(...lancamentos.value.map(l => l.id)) + 1 
        : 1
      
      lancamentos.value.push({
        ...novoLancamento.value,
        id: novoId,
        valor: novoLancamento.value.valor || 0
      } as Lancamento)
      snackbarMessage.value = 'Lançamento adicionado com sucesso!'
    }
    snackbarColor.value = 'success'
    abrirModal.value = false
    limparFormulario()
  } catch {
    snackbarMessage.value = 'Erro ao salvar lançamento'
    snackbarColor.value = 'error'
  } finally {
    snackbar.value = true
  }
}

function editarLancamento(lancamento: Lancamento) {
  novoLancamento.value = { ...lancamento }
  editando.value = true
  abrirModal.value = true
}

function confirmarExclusao(lancamento: Lancamento) {
  lancamentoParaExcluir.value = lancamento
  dialogConfirmacao.value = true
}

function excluirLancamento() {
  if (!lancamentoParaExcluir.value) return

  try {
    lancamentos.value = lancamentos.value.filter(
      l => l.id !== lancamentoParaExcluir.value?.id
    )
    snackbarMessage.value = 'Lançamento excluído com sucesso!'
    snackbarColor.value = 'success'
  } catch {
    snackbarMessage.value = 'Erro ao excluir lançamento'
    snackbarColor.value = 'error'
  } finally {
    dialogConfirmacao.value = false
    lancamentoParaExcluir.value = null
    snackbar.value = true
  }
}

function enviarMensagemWhatsApp(item: Lancamento) {
  const mensagem = item.pago
    ? `Olá! Confirmamos o recebimento do pagamento de R$ ${formatarValor(item.valor)} referente a ${item.tipo}.`
    : `Olá! Lembramos que o pagamento de R$ ${formatarValor(item.valor)} referente a ${item.tipo} está pendente. Vencimento: ${formatarData(item.vencimento)}.`
  
  const numero = item.cliente ? '5511999999999' : '' // Substitua pelo número real do cliente
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
  window.open(url, '_blank')
}

// Atualizar o tipo de lançamento quando mudar o tipo selecionado
watch(tipoSelecionado, (novoTipo) => {
  if (novoLancamento.value) {
    novoLancamento.value.tipoLancamento = novoTipo
  }
})
</script>

<style scoped>
.v-btn-toggle .v-btn {
  min-width: 48px;
}
</style>
