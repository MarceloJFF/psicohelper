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
            <v-select
              v-if="tipoSelecionado === 'receita'"
              v-model="novoLancamento.tipo_receita"
              :items="['Sessão Avulsa', 'Mensalidade']"
              label="Tipo de Receita"
              outlined
              dense
              :rules="[v => !!v || 'Campo obrigatório']"
            />
            <v-autocomplete
              v-if="!loading && tipoSelecionado === 'receita' && novoLancamento.tipo_receita === 'Sessão Avulsa'"
              v-model="novoLancamento.id_sessao"
              :items="sessoesDisponiveis"
              item-title="descricao"
              item-value="id_sessao"
              label="Sessão"
              outlined
              dense
              :rules="[v => !!v || 'Campo obrigatório']"
            />
            <v-progress-circular
              v-else-if="loading"
              indeterminate
              color="primary"
            ></v-progress-circular>
            <v-autocomplete
              v-if="tipoSelecionado === 'receita' && novoLancamento.tipo_receita === 'Mensalidade'"
              v-model="novoLancamento.id_mensalidade"
              :items="mensalidadesDisponiveis"
              item-title="descricao"
              item-value="id_mensalidade"
              label="Mensalidade"
              outlined
              dense
              :rules="[v => !!v || 'Campo obrigatório']"
            />
            <v-text-field
              v-if="tipoSelecionado === 'despesa'"
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
                  v-model="novoLancamento.qtd_meses"
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
              v-model="novoLancamento.valor"
              label="Valor"
              type="number"
              outlined
              dense
              :rules="[v => !!v || 'Campo obrigatório']"
              prefix="R$"
            />
            <v-checkbox
              v-model="novoLancamento.pago"
              label="Pago"
              dense
            />
            <v-select
              v-if="tipoSelecionado === 'receita'"
              v-model="novoLancamento.forma_pagamento"
              :items="['Pix', 'Cartão', 'Boleto', 'Dinheiro']"
              label="Forma de Pagamento"
              outlined
              dense
              :rules="[v => !!v || 'Campo obrigatório']"
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
import { ref, computed, watch, onMounted } from 'vue';
import supabase from '@/config/supabase';

interface Lancamento {
  id: string;
  tipo: string;
  categoria: string;
  observacoes: string;
  recorrente: boolean;
  qtd_meses: number;
  vencimento: string;
  cliente: string;
  valor: number;
  tipo_lancamento: 'receita' | 'despesa';
  pago: boolean;
  id_sessao?: string;
  id_mensalidade?: string;
  id_despesa?: string;
  id_pagamento?: string;
  tipo_receita?: 'Sessão Avulsa' | 'Mensalidade';
  forma_pagamento?: string;
}

const form = ref<{ validate: () => Promise<boolean> } | null>(null);
const tipoSelecionado = ref<'receita' | 'despesa'>('receita');
const mesSelecionado = ref(new Date().getMonth());
const anoSelecionado = ref(new Date().getFullYear());
const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const abrirModal = ref(false);
const dialogConfirmacao = ref(false);
const editando = ref(false);
const lancamentoParaExcluir = ref<Lancamento | null>(null);
const lancamentos = ref<Lancamento[]>([]);
const sessoesDisponiveis = ref<{ id_sessao: string; descricao: string }[]>([]);
const mensalidadesDisponiveis = ref<{ id_mensalidade: string; descricao: string }[]>([]);

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    carregarLancamentos(),
    carregarSessoesDisponiveis(),
    carregarMensalidadesDisponiveis()
  ]);
  loading.value = false;
});

const novoLancamento = ref<Partial<Lancamento>>({
  tipo: '',
  categoria: '',
  observacoes: '',
  recorrente: false,
  qtd_meses: 1,
  vencimento: '',
  cliente: '',
  valor: 0,
  tipo_lancamento: tipoSelecionado.value,
  pago: false,
  tipo_receita: '',
  id_sessao: '',
  id_mensalidade: '',
  id_despesa: '',
  id_pagamento: '',
  forma_pagamento: ''
});

const headers = [
  { text: 'Descrição', value: 'tipo' },
  { text: 'Categoria', value: 'categoria' },
  { text: 'Cliente', value: 'cliente' },
  { text: 'Valor', value: 'valor' },
  { text: 'Vencimento', value: 'vencimento' },
  { text: 'Status', value: 'pago' },
  { text: 'Ações', value: 'acoes', sortable: false }
];

const lancamentosFiltrados = computed(() => {
  console.log('Filter criteria:', {
    tipoSelecionado: tipoSelecionado.value,
    anoSelecionado: anoSelecionado.value,
    mesSelecionado: mesSelecionado.value
  });
  const filtered = lancamentos.value.filter(lancamento => {
    const [year, month, day] = lancamento.vencimento.split('-').map(Number);
    const data = new Date(year, month - 1, day);
    const isValid = !isNaN(data.getTime());
    console.log('Lancamento date:', {
      id: lancamento.id,
      vencimento: lancamento.vencimento,
      year: isValid ? data.getFullYear() : 'Invalid',
      month: isValid ? data.getMonth() : 'Invalid'
    });
    return (
      lancamento.tipo_lancamento === tipoSelecionado.value &&
      isValid &&
      data.getFullYear() === anoSelecionado.value &&
      data.getMonth() === mesSelecionado.value
    );
  });
  console.log('Filtered lancamentos:', filtered);
  return filtered;
});

const totalReceitas = computed(() => {
  const filtered = lancamentos.value.filter(l => {
    const [year, month, day] = l.vencimento.split('-').map(Number);
    const data = new Date(year, month - 1, day); // month is 0-based in JS
    const isValid = !isNaN(data.getTime());
    console.log('Receita filter:', {
      id: l.id,
      tipo_lancamento: l.tipo_lancamento,
      vencimento: l.vencimento,
      year: isValid ? data.getFullYear() : 'Invalid',
      month: isValid ? data.getMonth() : 'Invalid',
      anoSelecionado: anoSelecionado.value,
      mesSelecionado: mesSelecionado.value,
      valor: l.valor
    });
    return (
      l.tipo_lancamento === 'receita' &&
      isValid &&
      data.getFullYear() === anoSelecionado.value &&
      data.getMonth() === mesSelecionado.value
    );
  });
  const total = filtered.reduce((acc, curr) => acc + (curr.valor || 0), 0);
  console.log('Total Receitas:', total, 'Filtered entries:', filtered);
  return total;
});

const totalDespesas = computed(() => {
  const filtered = lancamentos.value.filter(l => {
    const [year, month, day] = l.vencimento.split('-').map(Number);
    const data = new Date(year, month - 1, day); // month is 0-based in JS
    const isValid = !isNaN(data.getTime());
    console.log('Despesa filter:', {
      id: l.id,
      tipo_lancamento: l.tipo_lancamento,
      vencimento: l.vencimento,
      year: isValid ? data.getFullYear() : 'Invalid',
      month: isValid ? data.getMonth() : 'Invalid',
      anoSelecionado: anoSelecionado.value,
      mesSelecionado: mesSelecionado.value,
      valor: l.valor
    });
    return (
      l.tipo_lancamento === 'despesa' &&
      isValid &&
      data.getFullYear() === anoSelecionado.value &&
      data.getMonth() === mesSelecionado.value
    );
  });
  const total = filtered.reduce((acc, curr) => acc + (curr.valor || 0), 0);
  console.log('Total Despesas:', total, 'Filtered entries:', filtered);
  return total;
});

const lucro = computed(() => {
  const result = totalReceitas.value - totalDespesas.value;
  console.log('Lucro:', result, { totalReceitas: totalReceitas.value, totalDespesas: totalDespesas.value });
  return result;
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
      .is('id_contrato', null) // Avulsa sessions
      .not('id', 'in', `(${lancamentos.value.filter(l => l.id_sessao).map(l => l.id_sessao).join(',') || '00000000-0000-0000-0000-000000000000'})`);
    if (error) {
      console.error('Erro ao carregar sessões disponíveis:', error);
      throw error;
    }
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

async function carregarMensalidadesDisponiveis() {
  try {
    const { data, error } = await supabase
      .from('tb_mensalidade')
      .select(`
        id_mensalidade,
        mes_referencia,
        id_contrato,
        tb_contrato (
          id_responsavel,
          tb_responsavel (nome)
        )
      `)
      .eq('status_pagamento', 'Pago')
      .not('id_mensalidade', 'in', `(${lancamentos.value.filter(l => l.id_mensalidade).map(l => l.id_mensalidade).join(',') || '00000000-0000-0000-0000-000000000000'})`);
    if (error) {
      console.error('Erro ao carregar mensalidades disponíveis:', error);
      throw error;
    }
    mensalidadesDisponiveis.value = data?.map(mensalidade => ({
      id_mensalidade: mensalidade.id_mensalidade,
      descricao: `${mensalidade.tb_contrato?.tb_responsavel?.nome || 'N/A'} - ${mensalidade.mes_referencia.slice(0, 7)}`
    })) || [];
    console.log('Mensalidades disponíveis carregadas:', mensalidadesDisponiveis.value);
  } catch (error) {
    console.error('Erro ao carregar mensalidades:', error);
    snackbarMessage.value = 'Erro ao carregar mensalidades disponíveis';
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}

async function carregarLancamentos() {
  try {
    // Fetch avulsa session payments
    const { data: pagamentos, error: pagamentosError } = await supabase
      .from('tb_pagamento_sessao')
      .select(`
        id,
        id_sessao,
        id_pagamento,
        tb_pagamento (
          id_pagamento,
          valor,
          data_pagamento,
          forma_pagamento,
          comprovante_url
        ),
        tb_sessao (
          id,
          id_agendamento,
          id_contrato,
          tb_agendamento (
            data_agendamento,
            id_aprendente,
            tb_aprendente (nome_aprendente)
          )
        )
      `)
      .is('tb_sessao.id_contrato', null);
    if (pagamentosError) {
      console.error('Erro ao carregar pagamentos:', pagamentosError);
      throw pagamentosError;
    }
    console.log('Raw pagamentos data:', pagamentos);

    const lancamentosPagamentos = pagamentos?.map(p => {
      const vencimentoDate = p.tb_sessao?.tb_agendamento?.data_agendamento
        ? new Date(p.tb_sessao.tb_agendamento.data_agendamento)
        : p.tb_pagamento.data_pagamento
          ? new Date(p.tb_pagamento.data_pagamento)
          : new Date();
      const vencimento = vencimentoDate.toISOString().split('T')[0];
      console.log('Pagamento vencimento:', { id: p.id, vencimento });
      return {
        id: p.id,
        tipo: 'Sessão Avulsa',
        categoria: 'Atendimento',
        observacoes: `Sessão para ${p.tb_sessao?.tb_agendamento?.tb_aprendente?.nome_aprendente || 'N/A'}`,
        recorrente: false,
        qtd_meses: 1,
        vencimento,
        cliente: p.tb_sessao?.tb_agendamento?.tb_aprendente?.nome_aprendente || 'N/A',
        valor: p.tb_pagamento.valor || 0,
        tipo_lancamento: 'receita' as const,
        pago: !!p.tb_pagamento.data_pagamento,
        id_sessao: p.id_sessao,
        id_pagamento: p.id_pagamento,
        tipo_receita: 'Sessão Avulsa' as const,
        forma_pagamento: p.tb_pagamento.forma_pagamento
      };
    }) || [];
    console.log('Mapped lancamentosPagamentos:', lancamentosPagamentos)

    // Fetch mensalidade payments
    const { data: mensalidades, error: mensalidadesError } = await supabase
      .from('tb_mensalidade')
      .select(`
        id_mensalidade,
        valor,
        mes_referencia,
        status_pagamento,
        forma_pagamento,
        comprovante_url,
        data_pagamento,
        id_contrato,
        tb_contrato (
          id_responsavel,
          tb_responsavel (nome)
        )
      `)
      .eq('status_pagamento', 'Pago');
    if (mensalidadesError) {
      console.error('Erro ao carregar mensalidades:', mensalidadesError);
      throw mensalidadesError;
    }
    console.log('Raw mensalidades data:', mensalidades);

    const lancamentosMensalidades = mensalidades?.map(m => {
      const vencimentoDate = new Date(m.mes_referencia);
      const vencimento = vencimentoDate.toISOString().split('T')[0];
      console.log('Mensalidade vencimento:', { id: m.id_mensalidade, vencimento });
      return {
        id: m.id_mensalidade,
        tipo: 'Mensalidade',
        categoria: 'Contrato',
        observacoes: `Mensalidade de ${m.mes_referencia.slice(0, 7)}`,
        recorrente: true,
        qtd_meses: 12,
        vencimento,
        cliente: m.tb_contrato?.tb_responsavel?.nome || 'N/A',
        valor: m.valor || 0,
        tipo_lancamento: 'receita' as const,
        pago: m.status_pagamento === 'Pago',
        id_mensalidade: m.id_mensalidade,
        tipo_receita: 'Mensalidade' as const,
        forma_pagamento: m.forma_pagamento
      };
    }) || [];
    console.log('Mapped lancamentosMensalidades:', lancamentosMensalidades);

    // Fetch expenses
    const { data: despesas, error: despesasError } = await supabase
      .from('tb_despesa')
      .select('*');
    if (despesasError) {
      console.error('Erro ao carregar despesas:', despesasError);
      throw despesasError;
    }
    console.log('Raw despesas data:', despesas);

    const lancamentosDespesas = despesas?.map(d => {
      const vencimentoDate = new Date(d.vencimento);
      const vencimento = vencimentoDate.toISOString().split('T')[0];
      console.log('Despesa vencimento:', { id: d.id_despesa, vencimento });
      return {
        id: d.id_despesa,
        tipo: d.tipo,
        categoria: d.categoria || 'Despesa',
        observacoes: d.observacoes || '',
        recorrente: d.recorrente,
        qtd_meses: d.qtd_meses,
        vencimento,
        cliente: '',
        valor: d.valor,
        tipo_lancamento: 'despesa' as const,
        pago: d.pago,
        id_despesa: d.id_despesa
      };
    }) || [];
    console.log('Mapped lancamentosDespesas:', lancamentosDespesas);

    // Combine and assign
    lancamentos.value = [...lancamentosPagamentos, ...lancamentosMensalidades, ...lancamentosDespesas];
    console.log('Final lancamentos.value:', lancamentos.value);
  } catch (error) {
    console.error('Erro ao carregar lançamentos:', error);
    snackbarMessage.value = 'Erro ao carregar lançamentos';
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
    tipo_lancamento: tipoSelecionado.value,
    pago: false,
    tipo_receita: '',
    id_sessao: '',
    id_mensalidade: '',
    id_despesa: '',
    id_pagamento: '',
    forma_pagamento: ''
  };
  editando.value = false;
}

async function salvarLancamento() {
  if (!form.value) return;
  const valid = await form.value.validate();
  if (!valid) return;

  try {
    if (tipoSelecionado.value === 'receita') {
      if (novoLancamento.value.tipo_receita === 'Sessão Avulsa') {
        if (editando.value && novoLancamento.value.id_pagamento) {
          // Update existing payment
          await supabase
            .from('tb_pagamento')
            .update({
              valor: novoLancamento.value.valor,
              data_pagamento: novoLancamento.value.pago ? new Date().toISOString() : null,
              forma_pagamento: novoLancamento.value.forma_pagamento
            })
            .eq('id_pagamento', novoLancamento.value.id_pagamento);
          snackbarMessage.value = 'Receita de sessão avulsa atualizada!';
        } else {
          // Create new payment
          const { data: pagamento } = await supabase
            .from('tb_pagamento')
            .insertインプット
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
          snackbarMessage.value = 'Receita de sessão avulsa salva!';
        }
      } else if (novoLancamento.value.tipo_receita === 'Mensalidade') {
        // Update tb_mensalidade
        await supabase
          .from('tb_mensalidade')
          .update({
            valor: novoLancamento.value.valor,
            status_pagamento: novoLancamento.value.pago ? 'Pago' : 'Pendente',
            data_pagamento: novoLancamento.value.pago ? new Date().toISOString() : null,
            forma_pagamento: novoLancamento.value.forma_pagamento
          })
          .eq('id_mensalidade', novoLancamento.value.id_mensalidade);
        snackbarMessage.value = 'Receita de mensalidade salva!';
      }
    } else {
      // Create or update tb_despesa
      if (editando.value && novoLancamento.value.id_despesa) {
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
          .eq('id_despesa', novoLancamento.value.id_despesa);
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
    await carregarMensalidadesDisponiveis();
    snackbarColor.value = 'success';
    abrirModal.value = false;
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
  novoLancamento.value = {
    ...lancamento,
    tipo_receita: lancamento.id_sessao ? 'Sessão Avulsa' : lancamento.id_mensalidade ? 'Mensalidade' : '',
    forma_pagamento: lancamento.forma_pagamento
  };
  editando.value = true;
  abrirModal.value = true;
}

function confirmarExclusao(lancamento: Lancamento) {
  lancamentoParaExcluir.value = lancamento;
  dialogConfirmacao.value = true;
}

async function excluirLancamento() {
  if (!lancamentoParaExcluir.value) return;

  try {
    if (lancamentoParaExcluir.value.id_sessao) {
      await supabase
        .from('tb_pagamento_sessao')
        .delete()
        .eq('id', lancamentoParaExcluir.value.id);
      await supabase
        .from('tb_pagamento')
        .delete()
        .eq('id_pagamento', lancamentoParaExcluir.value.id_pagamento);
    } else if (lancamentoParaExcluir.value.id_mensalidade) {
      await supabase
        .from('tb_mensalidade')
        .update({ status_pagamento: 'Pendente', data_pagamento: null, forma_pagamento: null })
        .eq('id_mensalidade', lancamentoParaExcluir.value.id_mensalidade);
    } else if (lancamentoParaExcluir.value.id_despesa) {
      await supabase
        .from('tb_despesa')
        .delete()
        .eq('id_despesa', lancamentoParaExcluir.value.id_despesa);
    }

    await carregarLancamentos();
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

function enviarMensagemWhatsApp(item: Lancamento) {
  const mensagem = item.pago
    ? `Olá! Confirmamos o recebimento do pagamento de R$ ${formatarValor(item.valor)} referente a ${item.tipo}.`
    : `Olá! Lembramos que o pagamento de R$ ${formatarValor(item.valor)} referente a ${item.tipo} está pendente. Vencimento: ${formatarData(item.vencimento)}.`;
  
  const numero = item.cliente ? '5511999999999' : ''; // TODO: Fetch real client number from tb_responsavel
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
}

watch(tipoSelecionado, (novoTipo) => {
  novoLancamento.value.tipo_lancamento = novoTipo;
  limparFormulario();
});


</script>

<style scoped>
.v-btn-toggle .v-btn {
  min-width: 48px;
}
</style>