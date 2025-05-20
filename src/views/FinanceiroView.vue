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

    <!-- Tabs -->
    <v-tabs v-model="activeTab" background-color="transparent" color="primary" grow class="mb-4">
      <v-tab value="receitas">Receitas</v-tab>
      <v-tab value="despesas">Despesas</v-tab>
    </v-tabs>

    <!-- Tab Content -->
    <v-window v-model="activeTab">
      <!-- Receitas Tab (Avulsa Sessions) -->
      <v-window-item value="receitas">
        <v-data-table :headers="receitasHeaders" :items="lancamentosReceitas" class="elevation-1" dense>
          <template v-slot:item="{ item }">
            <tr>
              <td>{{ item.tipo }}</td>
              <td>{{ item.cliente }}</td>
              <td>R$ {{ formatarValor(item.valor) }}</td>
              <td>{{ formatarData(item.vencimento) }}</td>
              <td>
                <v-chip :color="item.pago ? 'success' : 'warning'" small>
                  {{ item.pago ? 'Pago' : 'Pendente' }}
                </v-chip>
              </td>
              <td>
                <v-btn icon small class="mr-2" @click="editarLancamento(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon small color="error" @click="confirmarExclusao(item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-window-item>

      <!-- Despesas Tab -->
      <v-window-item value="despesas">
        <v-row class="mb-4">
          <v-col>
            <v-btn color="primary" @click="abrirModal = true">
              <v-icon left>mdi-plus</v-icon>
              Novo Lançamento
            </v-btn>
          </v-col>
        </v-row>
        <v-data-table :headers="despesasHeaders" :items="lancamentosDespesas" class="elevation-1" dense>
          <template v-slot:item="{ item }">
            <tr>
              <td>{{ item.tipo }}</td>
              <td>{{ item.categoria }}</td>
              <td>R$ {{ formatarValor(item.valor) }}</td>
              <td>{{ formatarData(item.vencimento) }}</td>
              <td>
                <v-chip :color="item.pago ? 'success' : 'warning'" small>
                  {{ item.pago ? 'Pago' : 'Pendente' }}
                </v-chip>
              </td>
              <td>
                <v-btn icon small class="mr-2" @click="editarLancamento(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon small color="error" @click="confirmarExclusao(item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-window-item>
    </v-window>

    <!-- Modal Lançamento (Despesas Only) -->
    <v-dialog v-model="abrirModal" max-width="600px">
      <v-card>
        <v-card-title>
          {{ editando ? 'Editar' : 'Nova' }} Despesa
        </v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="salvarLancamento">
            <v-text-field v-model="novoLancamento.tipo" label="Descrição" outlined dense
              :rules="[v => !!v || 'Campo obrigatório']" />
            <v-text-field v-model="novoLancamento.categoria" label="Categoria" outlined dense />
            <v-text-field v-model="novoLancamento.observacoes" label="Observações" outlined dense />
            <v-row>
              <v-col cols="6">
                <v-checkbox v-model="novoLancamento.recorrente" label="Recorrente" dense />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="novoLancamento.qtd_meses" label="Quantidade de meses" type="number" outlined
                  dense :disabled="!novoLancamento.recorrente" />
              </v-col>
            </v-row>
            <v-text-field v-model="novoLancamento.vencimento" label="Vencimento" type="date" outlined dense
              :rules="[v => !!v || 'Campo obrigatório']" />
            <v-text-field v-model="novoLancamento.valor" label="Valor" type="number" outlined dense
              :rules="[v => !!v || 'Campo obrigatório']" prefix="R$" />
            <v-checkbox v-model="novoLancamento.pago" label="Pago" dense />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" text @click="abrirModal = false">
            Cancelar
          </v-btn>
          <v-btn color="primary" @click="salvarLancamento">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Editar Receita (Avulsa Session) -->
    <v-dialog v-model="abrirModalReceita" max-width="600px">
      <v-card>
        <v-card-title>
          {{ editando ? 'Editar' : 'Nova' }} Receita
        </v-card-title>
        <v-card-text>
          <v-form ref="formReceita" @submit.prevent="salvarLancamento">
            <v-autocomplete v-model="novoLancamento.id_sessao" :items="sessoesDisponiveis" item-title="descricao"
              item-value="id_sessao" label="Sessão" outlined dense :rules="[v => !!v || 'Campo obrigatório']" />
            <v-text-field v-model="novoLancamento.valor" label="Valor" type="number" outlined dense
              :rules="[v => !!v || 'Campo obrigatório']" prefix="R$" />
            <v-select v-model="novoLancamento.forma_pagamento" :items="['Pix', 'Cartão', 'Boleto', 'Dinheiro']"
              label="Forma de Pagamento" outlined dense :rules="[v => !!v || 'Campo obrigatório']" />
            <v-checkbox v-model="novoLancamento.pago" label="Pago" dense />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" text @click="abrirModalReceita = false">
            Cancelar
          </v-btn>
          <v-btn color="primary" @click="salvarLancamento">
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
          <v-btn color="grey" text @click="dialogConfirmacao = false">
            Cancelar
          </v-btn>
          <v-btn color="error" @click="excluirLancamento">
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
import supabase from '@/config/supabase';
import { SessaoService } from '@/services/SessaoService';
import { PagamentoService } from '@/services/PagamentoService';

interface Lancamento {
  id: string;
  tipo: string;
  categoria?: string;
  observacoes?: string;
  recorrente?: boolean;
  qtd_meses?: number;
  vencimento: string;
  cliente?: string;
  valor: number;
  tipo_lancamento: 'receita' | 'despesa';
  pago: boolean;
  id_sessao?: string;
  id_pagamento?: string;
  forma_pagamento?: string;
}

const form = ref<{ validate: () => Promise<boolean> } | null>(null);
const formReceita = ref<{ validate: () => Promise<boolean> } | null>(null);
const activeTab = ref('receitas');
const abrirModal = ref(false);
const abrirModalReceita = ref(false);
const dialogConfirmacao = ref(false);
const editando = ref(false);
const lancamentoParaExcluir = ref<Lancamento | null>(null);
const lancamentosReceitas = ref<Lancamento[]>([]);
const lancamentosDespesas = ref<Lancamento[]>([]);
const sessoesDisponiveis = ref<{ id_sessao: string; descricao: string }[]>([]);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const loading = ref(true);

const novoLancamento = ref<Partial<Lancamento>>({
  tipo: '',
  categoria: '',
  observacoes: '',
  recorrente: false,
  qtd_meses: 1,
  vencimento: '',
  cliente: '',
  valor: 0,
  tipo_lancamento: 'despesa',
  pago: false,
  id_sessao: '',
  id_pagamento: '',
  forma_pagamento: ''
});

const receitasHeaders = [
  { title: 'Descrição', key: 'tipo' },
  { title: 'Cliente', key: 'cliente' },
  { title: 'Valor', key: 'valor' },
  { title: 'Vencimento', key: 'vencimento' },
  { title: 'Status', key: 'pago' },
  { title: 'Ações', key: 'acoes', sortable: false }
];

const despesasHeaders = [
  { title: 'Descrição', key: 'tipo' },
  { title: 'Categoria', key: 'categoria' },
  { title: 'Valor', key: 'valor' },
  { title: 'Vencimento', key: 'vencimento' },
  { title: 'Status', key: 'pago' },
  { title: 'Ações', key: 'acoes', sortable: false }
];

const totalReceitas = computed(() => {
  return lancamentosReceitas.value
    .reduce((acc, curr) => acc + (curr.valor || 0), 0);
});

const totalDespesas = computed(() => {
  return lancamentosDespesas.value
    .reduce((acc, curr) => acc + (curr.valor || 0), 0);
});

const lucro = computed(() => {
  return totalReceitas.value - totalDespesas.value;
});

function formatarValor(valor: number) {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatarData(data: string) {
  return new Date(data).toLocaleDateString('pt-BR');
}
const sessaoService = new SessaoService()
const pagamentoService = new PagamentoService()
async function carregarLancamentos() {
  try {
    // Fetch avulsa sessions (id_contrato is null)
    const sessoes = await sessaoService.getAllSessoes();
    const pagamentos = await pagamentoService.getAllPagamentos();

    
    lancamentosReceitas.value = sessoes?.map(s => {
      const pagamento = pagamentos.find(p => p.id_pagamento === s);
      const vencimentoDate = s.tb_agendamento?.data_agendamento
        ? new Date(s.tb_agendamento.data_agendamento)
        : new Date();
      const vencimento = vencimentoDate.toISOString().split('T')[0];
      return {
        id: s.tb_pagamento_sessao?.id || `sessao-${s.id}`,
        tipo: 'Sessão Avulsa',
        cliente: s.tb_agendamento?.tb_aprendente?.nome_aprendente || 'N/A',
        valor: pagamento?.valor || 0,
        vencimento,
        tipo_lancamento: 'receita' as const,
        pago: !!pagamento?.data_pagamento,
        id_sessao: s.id,
        id_pagamento: pagamento?.id_pagamento,
        forma_pagamento: pagamento?.forma_pagamento || null
      };
    }) || [];
    console.log('Receitas (avulsa sessions) carregadas:', lancamentosReceitas.value);

    // Fetch all expenses
    const { data: despesas, error: despesasError } = await supabase
      .from('tb_despesa')
      .select('*');
    if (despesasError) throw despesasError;

    lancamentosDespesas.value = despesas?.map(d => {
      const vencimentoDate = new Date(d.vencimento);
      const vencimento = vencimentoDate.toISOString().split('T')[0];
      return {
        id: d.id_despesa,
        tipo: d.tipo,
        categoria: d.categoria || 'Despesa',
        observacoes: d.observacoes || '',
        recorrente: d.recorrente,
        qtd_meses: d.qtd_meses,
        vencimento,
        valor: d.valor,
        tipo_lancamento: 'despesa' as const,
        pago: d.pago,
        id_despesa: d.id_despesa
      };
    }) || [];
    console.log('Despesas carregadas:', lancamentosDespesas.value);
  } catch (error) {
    console.error('Erro ao carregar lançamentos:', error);
    snackbarMessage.value = 'Erro ao carregar lançamentos';
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}

async function carregarSessoesDisponiveis() {
  try {
    const { data, error } = await supabase
      .from('tb_sessao')
      .select(`
        id,
        id_agendamento,
        id_contrato,
        tb_agendamento (
          id_agendamento,
          data_agendamento,
          id_aprendente,
          tb_aprendente (nome_aprendente)
        )
      `)
      .is('id_contrato', null)
      .not('id', 'in', `(${lancamentosReceitas.value.filter(l => l.id_sessao).map(l => l.id_sessao).join(',') || '00000000-0000-0000-0000-000000000000'})`);
    if (error) throw error;
    sessoesDisponiveis.value = data?.map(sessao => ({
      id_sessao: sessao.id,
      descricao: `${sessao.tb_agendamento?.tb_aprendente?.nome_aprendente || 'N/A'} - ${formatarData(sessao.tb_agendamento?.data_agendamento || new Date().toISOString())}`
    })) || [];
    console.log('Sessões disponíveis carregadas:', sessoesDisponiveis.value);
  } catch (error) {
    console.error('Erro ao carregar sessões:', error);
    snackbarMessage.value = 'Erro ao carregar sessões disponíveis';
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}

function limparFormulario() {
  novoLancamento.value = {
    tipo: '',
    categoria: '',
    observacoes: '',
    recorrente: false,
    qtd_meses: 1,
    vencimento: '',
    cliente: '',
    valor: 0,
    tipo_lancamento: activeTab.value === 'receitas' ? 'receita' : 'despesa',
    pago: false,
    id_sessao: '',
    id_pagamento: '',
    forma_pagamento: ''
  };
  editando.value = false;
}

async function salvarLancamento() {
  const formToValidate = activeTab.value === 'receitas' ? formReceita.value : form.value;
  if (!formToValidate) return;
  const valid = await formToValidate.validate();
  if (!valid) return;

  try {
    if (activeTab.value === 'receitas') {
      // Handle receita (avulsa session)
      if (editando.value && novoLancamento.value.id_pagamento) {
        await supabase
          .from('tb_pagamento')
          .update({
            valor: novoLancamento.value.valor,
            data_pagamento: novoLancamento.value.pago ? new Date().toISOString() : null,
            forma_pagamento: novoLancamento.value.forma_pagamento
          })
          .eq('id_pagamento', novoLancamento.value.id_pagamento);
        snackbarMessage.value = 'Receita atualizada!';
      } else {
        const { data: pagamento } = await supabase
          .from('tb_pagamento')
          .insert({
            valor: novoLancamento.value.valor,
            data_pagamento: novoLancamento.value.pago ? new Date().toISOString() : null,
            forma_pagamento: novoLancamento.value.forma_pagamento
          })
          .select('id_pagamento')
          .single();

        await supabase
          .from('tb_pagamento_sessao')
          .insert({
            id_sessao: novoLancamento.value.id_sessao,
            id_pagamento: pagamento.id_pagamento
          });
        snackbarMessage.value = 'Receita salva!';
      }
    } else {
      // Handle despesa
      if (editando.value && novoLancamento.value.id) {
        await supabase
          .from('tb_despesa')
          .update({
            tipo: novoLancamento.value.tipo,
            categoria: novoLancamento.value.categoria,
            observacoes: novoLancamento.value.observacoes,
            recorrente: novoLancamento.value.recorrente,
            qtd_meses: novoLancamento.value.qtd_meses,
            vencimento: novoLancamento.value.vencimento,
            valor: novoLancamento.value.valor,
            pago: novoLancamento.value.pago
          })
          .eq('id_despesa', novoLancamento.value.id);
        snackbarMessage.value = 'Despesa atualizada!';
      } else {
        await supabase
          .from('tb_despesa')
          .insert({
            tipo: novoLancamento.value.tipo,
            categoria: novoLancamento.value.categoria,
            observacoes: novoLancamento.value.observacoes,
            recorrente: novoLancamento.value.recorrente,
            qtd_meses: novoLancamento.value.qtd_meses,
            vencimento: novoLancamento.value.vencimento,
            valor: novoLancamento.value.valor,
            pago: novoLancamento.value.pago
          });
        snackbarMessage.value = 'Despesa salva!';
      }
    }

    await carregarLancamentos();
    await carregarSessoesDisponiveis();
    snackbarColor.value = 'success';
    abrirModal.value = false;
    abrirModalReceita.value = false;
    limparFormulario();
  } catch (error) {
    console.error('Erro ao salvar lançamento:', error);
    snackbarMessage.value = 'Erro ao salvar lançamento';
    snackbarColor.value = 'error';
  } finally {
    snackbar.value = true;
  }
}

function editarLancamento(lancamento: Lancamento) {
  novoLancamento.value = { ...lancamento };
  editando.value = true;
  if (lancamento.tipo_lancamento === 'receita') {
    abrirModalReceita.value = true;
  } else {
    abrirModal.value = true;
  }
}

function confirmarExclusao(lancamento: Lancamento) {
  lancamentoParaExcluir.value = lancamento;
  dialogConfirmacao.value = true;
}

async function excluirLancamento() {
  if (!lancamentoParaExcluir.value) return;

  try {
    if (lancamentoParaExcluir.value.tipo_lancamento === 'receita') {
      await supabase
        .from('tb_pagamento_sessao')
        .delete()
        .eq('id', lancamentoParaExcluir.value.id);
      if (lancamentoParaExcluir.value.id_pagamento) {
        await supabase
          .from('tb_pagamento')
          .delete()
          .eq('id_pagamento', lancamentoParaExcluir.value.id_pagamento);
      }
    } else {
      await supabase
        .from('tb_despesa')
        .delete()
        .eq('id_despesa', lancamentoParaExcluir.value.id);
    }

    await carregarLancamentos();
    await carregarSessoesDisponiveis();
    snackbarMessage.value = 'Lançamento excluído com sucesso!';
    snackbarColor.value = 'success';
  } catch (error) {
    console.error('Erro ao excluir lançamento:', error);
    snackbarMessage.value = 'Erro ao excluir lançamento';
    snackbarColor.value = 'error';
  } finally {
    dialogConfirmacao.value = false;
    lancamentoParaExcluir.value = null;
    snackbar.value = true;
  }
}

onMounted(async () => {
  loading.value = true;
  await carregarLancamentos();
  await carregarSessoesDisponiveis();
  loading.value = false;
});
</script>

<style scoped>
.v-btn-toggle .v-btn {
  min-width: 48px;
}
</style>