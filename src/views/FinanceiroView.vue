<template>
  <v-container>
    <h2 class="text-h4 mb-4">Financeiro</h2>

    <!-- Indicadores -->
    <v-row class="mb-4 mt-4" justify="center">
      <v-col cols="12" md="4">
        <v-card color="blue" dark class="pa-8">
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
        <v-card :color="totalReceitas - totalDespesas > 0 ? 'green' : 'red'" dark class="pa-8">
          <v-card-text class="text-center">
            <div>Lucro</div>
            <div class="text-h5">R$ {{ formatarValor(totalReceitas - totalDespesas) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" md="3">
        <v-select v-model="anoSelecionado" :items="anos" label="Ano" dense outlined></v-select>
      </v-col>
      <v-col cols="12" md="9">
        <v-btn-toggle v-model="mesSelecionado" class="d-flex flex-wrap" dense mandatory>
          <v-btn v-for="(mes, index) in meses" :key="index" :value="index" class="ma-1"
            :color="mesSelecionado === index ? 'primary' : undefined">
            {{ mes }}
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <!-- Abas -->
    <v-tabs v-model="abaSelecionada" class="mb-4">
      <v-tab value="receitas">Receitas</v-tab>
      <v-tab value="despesas">Despesas</v-tab>
    </v-tabs>

    <!-- Ações -->
    <v-row class="mb-4">
      <v-col>
        <v-btn color="primary" @click="abrirModal = true">
          <v-icon left>mdi-plus</v-icon>
          {{ abaSelecionada === 'despesas' ? 'Nova Despesa' : 'Novo Pagamento' }}
        </v-btn>
        <v-btn color="info" @click="mostrarTudo = !mostrarTudo" class="ml-2">
          {{ mostrarTudo ? 'Aplicar Filtros' : 'Mostrar Tudo' }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- Conteúdo das Abas -->
    <v-window v-model="abaSelecionada">
      <!-- Tabela de Despesas -->
      <v-window-item value="despesas">
        <v-data-table :headers="headersDespesas" :items="despesasFiltradas" class="elevation-1" dense
          :hide-default-header="false">
          <template v-slot:item="{ item }">
            <tr>
              <td>{{ item.tipo }}</td>
              <td>{{ item.categoria || 'N/A' }}</td>
              <td>R$ {{ formatarValor(item.valor) }}</td>
              <td>{{ formatarData(item.vencimento) }}</td>
              <td>
                <v-chip :color="item.pago ? 'success' : 'warning'" small>
                  {{ item.pago ? 'Pago' : 'Pendente' }}
                </v-chip>
              </td>
              <td>
                <v-btn icon small class="mr-2" @click="editarDespesa(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon small color="error" @click="confirmarExclusao(item, 'despesa')">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-window-item>

      <!-- Tabela de Receitas -->
      <v-window-item value="receitas">
        <v-data-table :headers="headersReceitas" :items="pagamentosFiltrados" class="elevation-1" dense
          :hide-default-header="false">
          <template v-slot:item="{ item }">
            <tr>
              <td>
                <v-chip v-if="item.id_mensalidade" color="primary" small>Contrato</v-chip>
                <span v-else>Sessão Avulsa</span>
              </td>
              <td>R$ {{ formatarValor(item.valor) }}</td>
              <td>{{ item.data_pagamento ? formatarData(item.data_pagamento) : 'N/A' }}</td>
              <td>{{ item.forma_pagamento || 'N/A' }}</td>
              <td>
                <v-chip :color="item.data_pagamento ? 'success' : 'warning'" small>
                  {{ item.data_pagamento ? 'Pago' : 'Pendente' }}
                </v-chip>
              </td>
              <td>
                <v-btn icon small class="mr-2" @click="editarPagamento(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon small color="error" @click="confirmarExclusao(item, 'pagamento')">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-window-item>
    </v-window>

    <!-- Modal -->
    <v-dialog v-model="abrirModal" max-width="600px">
      <v-card>
        <v-card-title>
          {{ abaSelecionada === 'despesas' ? (editando ? 'Editar' : 'Nova') + ' Despesa' : (editando ? 'Editar' :
            'Novo') +
          ' Pagamento' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="salvarItem">
            <!-- Formulário de Despesa -->
            <template v-if="abaSelecionada === 'despesas'">
              <v-text-field v-model="novaDespesa.tipo" label="Descrição" outlined dense
                :rules="[v => !!v || 'Campo obrigatório']" />
              <v-text-field v-model="novaDespesa.categoria" label="Categoria" outlined dense />
              <v-text-field v-model="novaDespesa.valor" label="Valor" type="number" outlined dense
                :rules="[v => !!v || 'Campo obrigatório', v => v > 0 || 'Valor deve ser maior que zero']" prefix="R$" />
              <v-text-field v-model="novaDespesa.vencimento" label="Vencimento" type="date" outlined dense
                :rules="[v => !!v || 'Campo obrigatório']" />
              <v-checkbox v-model="novaDespesa.pago" label="Pago" dense />
              <v-textarea v-model="novaDespesa.observacoes" label="Observações" outlined dense />
              <v-row>
                <v-col cols="6">
                  <v-checkbox v-model="novaDespesa.recorrente" label="Recorrente" dense />
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="novaDespesa.qtd_meses" label="Quantidade de meses" type="number" outlined dense
                    :disabled="!novaDespesa.recorrente"
                    :rules="[v => !novaDespesa.recorrente || !!v || 'Campo obrigatório']" />
                </v-col>
              </v-row>
              <v-text-field v-model="novaDespesa.dia_vencimento" label="Dia de Vencimento" type="number" outlined dense
                :rules="[v => !novaDespesa.recorrente || (v >= 1 && v <= 31) || 'Dia deve ser entre 1 e 31']" />
            </template>

            <!-- Formulário de Pagamento -->
            <template v-if="abaSelecionada === 'receitas'">
              <v-select v-model="novoPagamento.tipo" :items="['Sessão Avulsa', 'Mensalidade']" label="Tipo de Pagamento"
                outlined dense :rules="[v => !!v || 'Campo obrigatório']" />
              <v-text-field v-model="novoPagamento.valor" label="Valor" type="number" outlined dense
                :rules="[v => !!v || 'Campo obrigatório', v => v > 0 || 'Valor deve ser maior que zero']" prefix="R$" />
              <v-text-field v-model="novoPagamento.data_pagamento" label="Data do Pagamento" type="date" outlined
                dense />
              <v-select v-model="novoPagamento.forma_pagamento" :items="['Cartão', 'Boleto', 'Pix', 'Dinheiro']"
                label="Forma de Pagamento" outlined dense :rules="[v => !!v || 'Campo obrigatório']" />
              <v-text-field v-model="novoPagamento.comprovante_url" label="URL do Comprovante" outlined dense />
            </template>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" text @click="abrirModal = false">
            Cancelar
          </v-btn>
          <v-btn color="primary" @click="salvarItem">
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
          Tem certeza que deseja excluir este {{ tipoExclusao === 'despesa' ? 'despesa' : 'pagamento' }}?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" text @click="dialogConfirmacao = false">
            Cancelar
          </v-btn>
          <v-btn color="error" @click="excluirItem">
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { DespesaService, type Despesa } from '@/services/DespesaService';
import { PagamentoService, type Pagamento } from '@/services/PagamentoService';

// Estado reativo
const form = ref<{ validate: () => Promise<boolean> } | null>(null);
const anoSelecionado = ref(new Date().getFullYear()); // Ano atual para filtro
const mesSelecionado = ref(new Date().getMonth()); // Mês atual para filtro
const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i); // Últimos 5 anos
const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const abaSelecionada = ref('receitas'); // Aba ativa: 'despesas' ou 'receitas'
const abrirModal = ref(false); // Controla o modal de criação/edição
const dialogConfirmacao = ref(false); // Controla o diálogo de exclusão
const editando = ref(false); // Indica se está editando
const itemSelecionadoParaExclusao = ref<Despesa | Pagamento | null>(null); // Item a ser excluído
const tipoExclusao = ref<'despesa' | 'pagamento'>('despesa'); // Tipo do item a excluir
const despesas = ref<Despesa[]>([]); // Lista de despesas
const pagamentos = ref<Pagamento[]>([]); // Lista de pagamentos
const snackbar = ref(false); // Controla a exibição do snackbar
const snackbarMessage = ref(''); // Mensagem do snackbar
const snackbarColor = ref('success'); // Cor do snackbar (success, error)
const mostrarTudo = ref(false); // Alterna entre mostrar todas ou filtrar por mês/ano
const pagamentoService = new PagamentoService();

const novaDespesa = ref<Partial<Despesa>>({
  tipo: '',
  categoria: '',
  valor: 0,
  vencimento: '',
  pago: false,
  observacoes: '',
  recorrente: false,
  qtd_meses: 1,
  dia_vencimento: 1,
});

const novoPagamento = ref<Partial<Pagamento> & { tipo?: string }>({
  tipo: '',
  valor: 0,
  data_pagamento: '',
  forma_pagamento: '',
  comprovante_url: '',
  id_mensalidade: null,
});

const headersDespesas = ref([
  { title: 'Descrição', key: 'tipo', sortable: true },
  { title: 'Categoria', key: 'categoria', sortable: true },
  { title: 'Valor', key: 'valor', sortable: true },
  { title: 'Vencimento', key: 'vencimento', sortable: true },
  { title: 'Status', key: 'pago', sortable: true },
  { title: 'Ações', key: 'acoes', sortable: false },
]);

const headersReceitas = ref([
  { title: 'Tipo', key: 'tipo', sortable: true },
  { title: 'Valor', key: 'valor', sortable: true },
  { title: 'Data Pagamento', key: 'data_pagamento', sortable: true },
  { title: 'Forma Pagamento', key: 'forma_pagamento', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Ações', key: 'acoes', sortable: false },
]);

onMounted(async () => {
  await Promise.all([carregarDespesas(), carregarPagamentos()]);
});

const despesasFiltradas = computed(() => {
  if (mostrarTudo.value) return despesas.value;
  return despesas.value.filter((despesa) => {
    const [year, month] = despesa.vencimento.split('-').map(Number);
    const data = new Date(year, month - 1, 1);
    return !isNaN(data.getTime()) && data.getFullYear() === anoSelecionado.value && data.getMonth() === mesSelecionado.value;
  });
});

const pagamentosFiltrados = computed(() => {
  if (mostrarTudo.value) return pagamentos.value;
  return pagamentos.value.filter((pagamento) => {
    if (!pagamento.data_pagamento) return false;
    const [year, month] = pagamento.data_pagamento.split('-').map(Number);
    const data = new Date(year, month - 1, 1);
    return !isNaN(data.getTime()) && data.getFullYear() === anoSelecionado.value && data.getMonth() === mesSelecionado.value;
  });
});

const totalDespesas = computed(() => {
  return despesasFiltradas.value.reduce((acc, curr) => acc + (curr.valor || 0), 0);
});

const totalReceitas = computed(() => {
  return pagamentosFiltrados.value.reduce((acc, curr) => acc + (curr.valor || 0), 0);
});

function formatarValor(valor: number) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatarData(data: string) {
  return new Date(data).toLocaleDateString('pt-BR');
}

async function carregarDespesas() {
  try {
    despesas.value = await DespesaService.getDespesas();
  } catch (error) {
    console.error('Erro ao carregar despesas:', error);
    snackbarMessage.value = 'Erro ao carregar despesas';
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}
async function carregarPagamentos() {
  try {
    pagamentos.value = await pagamentoService.getPagamentos();
  } catch (error) {
    console.error('Erro ao carregar pagamentos:', error);
    snackbarMessage.value = 'Erro ao carregar pagamentos';
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}

function limparFormulario() {
  if (abaSelecionada.value === 'despesas') {
    novaDespesa.value = {
      tipo: '',
      categoria: '',
      valor: 0,
      vencimento: '',
      pago: false,
      observacoes: '',
      recorrente: false,
      qtd_meses: 1,
      dia_vencimento: 1,
    };
  } else {
    novoPagamento.value = {
      tipo: '',
      valor: 0,
      data_pagamento: '',
      forma_pagamento: '',
      comprovante_url: '',
      id_mensalidade: null,
    };
  }
  editando.value = false;
}

async function salvarItem() {
  if (!form.value) return;
  const valid = await form.value.validate();
  if (!valid) return;

  try {
    if (abaSelecionada.value === 'despesas') {
      const despesaData = {
        tipo: novaDespesa.value.tipo,
        categoria: novaDespesa.value.categoria,
        valor: novaDespesa.value.valor,
        vencimento: novaDespesa.value.vencimento,
        pago: novaDespesa.value.pago,
        observacoes: novaDespesa.value.observacoes,
        recorrente: novaDespesa.value.recorrente,
        qtd_meses: novaDespesa.value.recorrente ? novaDespesa.value.qtd_meses : 1,
        dia_vencimento: novaDespesa.value.recorrente ? novaDespesa.value.dia_vencimento : null,
      };

      if (editando.value && novaDespesa.value.id_despesa) {
        await DespesaService.updateDespesa(novaDespesa.value.id_despesa, despesaData);
        snackbarMessage.value = 'Despesa atualizada com sucesso!';
      } else {
        await DespesaService.createDespesa(despesaData);
        snackbarMessage.value = 'Despesa salva com sucesso!';
      }
      await carregarDespesas();
    } else {
      const pagamentoData = {
        valor: novoPagamento.value.valor,
        data_pagamento: novoPagamento.value.data_pagamento || null,
        forma_pagamento: novoPagamento.value.forma_pagamento,
        comprovante_url: novoPagamento.value.comprovante_url || null,
        id_mensalidade: novoPagamento.value.tipo === 'Mensalidade' ? 'placeholder-uuid' : null, // Substituir por UUID real
      };

      if (editando.value && novoPagamento.value.id) {
        await PagamentoService.updatePagamento(novoPagamento.value.id, pagamentoData);
        snackbarMessage.value = 'Pagamento atualizado com sucesso!';
      } else {
        await PagamentoService.createPagamento(pagamentoData);
        snackbarMessage.value = 'Pagamento salvo com sucesso!';
      }
      await carregarPagamentos();
    }

    snackbarColor.value = 'success';
    abrirModal.value = false;
    limparFormulario();
  } catch (error) {
    console.error('Erro ao salvar:', error);
    snackbarMessage.value = 'Erro ao salvar';
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}

function editarDespesa(despesa: Despesa) {
  novaDespesa.value = { ...despesa };
  editando.value = true;
  abrirModal.value = true;
}

function editarPagamento(pagamento: Pagamento) {
  novoPagamento.value = {
    ...pagamento,
    tipo: pagamento.id_mensalidade ? 'Mensalidade' : 'Sessão Avulsa',
  };
  editando.value = true;
  abrirModal.value = true;
}

function confirmarExclusao(item: Despesa | Pagamento, tipo: 'despesa' | 'pagamento') {
  itemSelecionadoParaExclusao.value = item;
  tipoExclusao.value = tipo;
  dialogConfirmacao.value = true;
}

async function excluirItem() {
  if (!itemSelecionadoParaExclusao.value) return;

  try {
    if (tipoExclusao.value === 'despesa') {
      await DespesaService.deleteDespesa((itemSelecionadoParaExclusao.value as Despesa).id_despesa);
      await carregarDespesas();
      snackbarMessage.value = 'Despesa excluída com sucesso!';
    } else {
      await PagamentoService.deletePagamento((itemSelecionadoParaExclusao.value as Pagamento).id);
      await carregarPagamentos();
      snackbarMessage.value = 'Pagamento excluído com sucesso!';
    }
    snackbarColor.value = 'success';
  } catch (error) {
    console.error('Erro ao excluir:', error);
    snackbarMessage.value = 'Erro ao excluir';
    snackbarColor.value = 'error';
  } finally {
    dialogConfirmacao.value = false;
    itemSelecionadoParaExclusao.value = null;
    tipoExclusao.value = 'despesa';
    snackbar.value = true;
  }
}
</script>

<style scoped>
.v-btn-toggle .v-btn {
  min-width: 48px;
}

/* Estilização da tabela */
.v-data-table-header {
  display: table-header-group !important;
  background-color: #f5f5f5;
}

.v-data-table-header th {
  font-weight: bold !important;
  color: #333 !important;
  padding: 8px !important;
}
</style>
