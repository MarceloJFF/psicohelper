<template>
  <v-container>
    <h2 class="text-h4 mb-4">Financeiro</h2>

    <!-- Filtros de ano e mês -->
    <v-row align="center" class="mb-4">
      <v-col cols="12" md="3">
        <v-select v-model="anoSelecionado" :items="anosDisponiveis" label="Ano" dense outlined></v-select>
      </v-col>
      <v-col cols="12" md="9">
        <v-btn-toggle v-model="mesSelecionado" class="d-flex flex-wrap" dense>
          <v-btn v-for="(mes, index) in nomesMeses" :key="index" :value="index" class="ma-1"
            :color="mesSelecionado === index ? 'primary' : undefined">
            {{ mes }}
          </v-btn>
        </v-btn-toggle>
      </v-col>
      <v-col cols="12">
        <v-btn color="info" @click="exibirTudo = !exibirTudo">
          {{ exibirTudo ? 'Filtrar por Data' : 'Mostrar Tudo' }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- Aba de sessões -->
    <v-tabs v-model="abaAtiva" class="mb-4">
      <v-tab value="sessoes">Sessões</v-tab>
    </v-tabs>

    <!-- Lista de sessões -->
    <v-window v-model="abaAtiva">
      <v-window-item value="sessoes">
        <!-- Mensagem se não houver sessões -->
        <v-alert v-if="!temSessoes && !estaCarregando" type="info">
          Nenhuma sessão encontrada.
        </v-alert>

        <!-- Sessões agrupadas por data -->
        <div v-for="(sessoesDoDia, data) in sessoesPorData" :key="data">
          <v-card class="mb-6 elevation-2 rounded-xl">
            <v-card-title class="text-h6 font-weight-bold text-primary">
              {{ formatarDataBrasileira(data) }}
            </v-card-title>
            <v-divider />
            <v-list>
              <v-list-item v-for="sessao in sessoesDoDia" :key="sessao.id" class="pa-4">
                <v-row align="center">
                  <v-col cols="12" sm="6" md="4">
                    <div class="font-weight-medium pa-2">
                      Horário: {{ sessao.horarioInicio }} - {{ sessao.horarioFim }}
                    </div>
                    <div class="font-weight-medium pa-2">
                      Aprendente: {{ sessao.nomeAprendente }}
                    </div>
                    <v-chip :color="sessao.estaPaga ? 'success' : 'warning'" variant="outlined" small>
                      {{ sessao.estaPaga ? 'Pago' : 'Pendente' }}
                    </v-chip>
                    <v-chip v-if="sessao.ehContrato" variant="outlined" class="ml-2" small>
                      Contrato
                    </v-chip>
                    <span v-else class="text-caption ml-2">Avulsa</span>
                  </v-col>
                  <v-spacer />
                  <v-col cols="12" sm="6" class="d-flex align-center">
                    <!-- Botão de pagamento para sessões avulsas pendentes -->

                    <v-btn icon @click="sessao.mostrarDetalhes = !sessao.mostrarDetalhes">
                      <v-icon>{{ sessao.mostrarDetalhes ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                    </v-btn>
                    <v-btn color="primary" variant="text" @click="sessao.mostrarDetalhes = !sessao.mostrarDetalhes">
                      {{ sessao.mostrarDetalhes ? 'Esconder' : 'Detalhes' }}
                    </v-btn>
                    <v-btn v-if="!sessao.ehContrato && !sessao.estaPaga" color="primary" small class="mr-2"
                      @click="abrirModalPagamento(sessao)">
                      Registrar Pagamento
                    </v-btn>
                  </v-col>
                </v-row>
                <v-expand-transition>
                  <div v-if="sessao.mostrarDetalhes" class="detalhes-sessao mt-4">
                    <div v-for="detalhe in detalhesSessao" :key="detalhe.chave" class="mb-4">
                      <h4 class="text-subtitle-1 font-weight-bold mb-1">{{ detalhe.titulo }}</h4>
                      <p class="text-body-2">
                        {{ sessao[detalhe.chave] || 'Não informado' }}
                      </p>
                    </div>
                  </div>
                </v-expand-transition>
              </v-list-item>
            </v-list>
          </v-card>
        </div>

        <!-- Carregando mais sessões -->
        <div v-if="estaCarregando" class="text-center my-4">
          <v-progress-circular indeterminate color="primary" size="32" />
        </div>

        <!-- Fim da lista -->
        <div v-if="!podeCarregarMais && temSessoes" class="text-center my-4 text-grey">
          Todas as sessões foram carregadas.
        </div>
      </v-window-item>
    </v-window>

    <!-- Modal de pagamento -->
    <v-dialog v-model="modalPagamentoAberto" max-width="600px">
      <v-card>
        <v-card-title>Registrar Pagamento</v-card-title>
        <v-card-text>
          <v-form ref="formPagamento" @submit.prevent="salvarPagamento">
            <v-text-field v-model="novoPagamento.valor" label="Valor" type="number" outlined dense prefix="R$"
              :rules="[v => !!v && v > 0 || 'Valor deve ser maior que zero']" />
            <v-text-field v-model="novoPagamento.data_pagamento" label="Data do Pagamento" type="date" outlined dense
              :rules="[v => !!v || 'Data é obrigatória']" />
            <v-select v-model="novoPagamento.forma_pagamento" :items="['Cartão', 'Boleto', 'Pix', 'Dinheiro']"
              label="Forma de Pagamento" outlined dense :rules="[v => !!v || 'Forma de pagamento é obrigatória']" />
            <v-text-field v-model="novoPagamento.comprovante_url" label="URL do Comprovante (opcional)" outlined
              dense />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" text @click="fecharModalPagamento">
            Cancelar
          </v-btn>
          <v-btn color="primary" @click="salvarPagamento">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para feedback -->
    <v-snackbar v-model="mostrarSnackbar" :color="corSnackbar" timeout="3000">
      {{ mensagemSnackbar }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { SessaoService } from '@/services/SessaoService';
import { ResponsavelService } from '@/services/responsavelService';
import { PagamentoService } from '@/services/PagamentoService';
import { AprendenteService } from '@/services/AprendenteService';

// Estrutura de uma sessão
interface Sessao {
  id: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  nomeAprendente: string;
  idAprendenteOuResponsavel: string;
  ehContrato: boolean;
  estaPaga: boolean;
  idPagamento: string | null;
  idMensalidade: string | null;
  valorPagamento: number | null;
  formaPagamento: string | null;
  comprovanteUrl: string | null;
  mostrarDetalhes: boolean;
  preSessao: string;
  queixas: string;
  evolucao: string;
  habilidadesTrabalhadas: string;
  futurasAcoes: string;
  resumo: string;
}

// Estrutura do formulário de pagamento
interface NovoPagamento {
  valor: number;
  data_pagamento: string;
  forma_pagamento: string;
  comprovante_url: string | null;
}

// --- Estado da interface ---
const anoSelecionado = ref(new Date().getFullYear()); // Ano atual
const mesSelecionado = ref(new Date().getMonth()); // Mês atual (0-11)
const anosDisponiveis = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i); // Últimos 5 anos
const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const abaAtiva = ref('sessoes'); // Sempre na aba de sessões
const exibirTudo = ref(false); // Mostra todas ou filtra por data
const estaCarregando = ref(false); // Controla o carregamento
const listaSessoes = ref<Sessao[]>([]); // Sessões carregadas
const cacheNomesAprendentes = new Map<string, string>(); // Cache para nomes
const sessoesPorPagina = 10; // Sessões por carga
const paginaAtual = ref(1); // Página atual
const podeCarregarMais = ref(true); // Indica se há mais sessões

// Estado do modal de pagamento
const modalPagamentoAberto = ref(false);
const sessaoSelecionada = ref<Sessao | null>(null);
const novoPagamento = ref<NovoPagamento>({
  valor: 0,
  data_pagamento: '',
  forma_pagamento: '',
  comprovante_url: null,
});
const formPagamento = ref<{ validate: () => Promise<boolean> } | null>(null);

// Estado do snackbar
const mostrarSnackbar = ref(false);
const mensagemSnackbar = ref('');
const corSnackbar = ref('success');

// Detalhes exibidos ao expandir uma sessão
const detalhesSessao = [
  { chave: 'preSessao', titulo: 'Pré-sessão' },
  { chave: 'queixas', titulo: 'Queixas' },
  { chave: 'evolucao', titulo: 'Evolução' },
  { chave: 'habilidadesTrabalhadas', titulo: 'Habilidades Trabalhadas' },
  { chave: 'futurasAcoes', titulo: 'Próximos Passos' },
  { chave: 'resumo', titulo: 'Resumo' },
];

// --- Serviços ---
const sessaoService = new SessaoService();
const responsavelService = new ResponsavelService();
const pagamentoService = new PagamentoService();
const aprendenteService = new AprendenteService();

// --- Funções auxiliares ---

// Formata data no padrão brasileiro (DD/MM/AAAA)
function formatarDataBrasileira(data: string): string {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Calcula o horário de término
function obterHorarioFim(inicio: string, duracaoMinutos: number): string {
  if (!inicio) return '';
  const [horas, minutos] = inicio.split(':').map(Number);
  const dataInicio = new Date(1970, 0, 1, horas, minutos);
  const dataFim = new Date(dataInicio.getTime() + (duracaoMinutos || 60) * 60000);
  return `${dataFim.getHours().toString().padStart(2, '0')}:${dataFim.getMinutes().toString().padStart(2, '0')}`;
}

// Busca o nome do aprendente ou responsável
async function buscarNomeAprendente(agendamento: any): Promise<string> {
  const idAprendente = agendamento?.id_aprendente;
  const idResponsavel = agendamento?.responsavel_id;

  if (idAprendente) {
    if (cacheNomesAprendentes.has(idAprendente)) {
      return cacheNomesAprendentes.get(idAprendente)!;
    }
    const aprendente = await aprendenteService.getAprendenteById(idAprendente);
    const nome = aprendente?.nome_aprendente || 'Sem nome';
    cacheNomesAprendentes.set(idAprendente, nome);
    return nome;
  }

  if (idResponsavel) {
    const responsavel = await responsavelService.buscarResponsavel(idResponsavel);
    return responsavel?.nome || 'Sem nome';
  }

  return 'Sem nome';
}

// Verifica se a sessão está paga
async function verificarPagamento(sessao: any): Promise<{
  estaPaga: boolean;
  idPagamento: string | null;
  idMensalidade: string | null;
  valorPagamento: number | null;
  formaPagamento: string | null;
  comprovanteUrl: string | null;
}> {
  const ehContrato = !!sessao.id_contrato;
  let estaPaga = false;
  let idPagamento: string | null = null;
  let idMensalidade: string | null = null;
  let valorPagamento: number | null = null;
  let formaPagamento: string | null = null;
  let comprovanteUrl: string | null = null;

  if (ehContrato) {
    const mesReferencia = new Date(sessao.tb_agendamento.data_agendamento)
      .toISOString()
      .slice(0, 7) + '-01';
    const mensalidade = await sessaoService.buscarMensalidade(
      sessao.id_contrato,
      mesReferencia
    );
    if (mensalidade?.status_pagamento === 'Pago') {
      estaPaga = true;
      idMensalidade = mensalidade.id_mensalidade;
      valorPagamento = mensalidade.valor;
      formaPagamento = mensalidade.forma_pagamento;
      comprovanteUrl = mensalidade.comprovante_url;
    }
  } else {
    const pagamento = await pagamentoService.getPagamentoBySessao(sessao.id);
    if (pagamento) {
      estaPaga = true;
      idPagamento = pagamento.tb_pagamento.id;
      valorPagamento = pagamento.tb_pagamento.valor;
      formaPagamento = pagamento.tb_pagamento.forma_pagamento;
      comprovanteUrl = pagamento.tb_pagamento.comprovante_url;
    }
  }

  return { estaPaga, idPagamento, idMensalidade, valorPagamento, formaPagamento, comprovanteUrl };
}

// --- Funções de pagamento ---

// Abre o modal para registrar pagamento
function abrirModalPagamento(sessao: Sessao) {
  sessaoSelecionada.value = sessao;
  novoPagamento.value = {
    valor: 0,
    data_pagamento: '',
    forma_pagamento: '',
    comprovante_url: null,
  };
  modalPagamentoAberto.value = true;
}

// Fecha o modal e limpa o formulário
function fecharModalPagamento() {
  modalPagamentoAberto.value = false;
  sessaoSelecionada.value = null;
  novoPagamento.value = {
    valor: 0,
    data_pagamento: '',
    forma_pagamento: '',
    comprovante_url: null,
  };
  if (formPagamento.value) {
    formPagamento.value.reset();
  }
}

// Salva o pagamento no banco
async function salvarPagamento() {
  if (!formPagamento.value || !sessaoSelecionada.value) return;

  const valido = await formPagamento.value.validate();
  if (!valido) return;

  try {
    const pagamentoData = {
      valor: novoPagamento.value.valor,
      data_pagamento: novoPagamento.value.data_pagamento || null,
      forma_pagamento: novoPagamento.value.forma_pagamento,
      comprovante_url: novoPagamento.value.comprovante_url || null,
      id_mensalidade: null, // Sessão avulsa, sem mensalidade
    };

    await pagamentoService.createPagamento(pagamentoData, [sessaoSelecionada.value.id]);

    // Atualiza o status da sessão localmente
    const sessao = listaSessoes.value.find(s => s.id === sessaoSelecionada.value!.id);
    if (sessao) {
      sessao.estaPaga = true;
      sessao.idPagamento = 'novo-id'; // ID real será retornado pelo serviço, se necessário
      sessao.valorPagamento = pagamentoData.valor;
      sessao.formaPagamento = pagamentoData.forma_pagamento;
      sessao.comprovanteUrl = pagamentoData.comprovante_url;
    }

    mensagemSnackbar.value = 'Pagamento registrado com sucesso!';
    corSnackbar.value = 'success';
    mostrarSnackbar.value = true;
    fecharModalPagamento();
  } catch (erro) {
    console.error('Erro ao registrar pagamento:', erro);
    mensagemSnackbar.value = 'Erro ao registrar pagamento';
    corSnackbar.value = 'error';
    mostrarSnackbar.value = true;
  }
}

// --- Carregamento de sessões ---

async function carregarSessoes(limpar = false) {
  if (limpar) {
    paginaAtual.value = 1;
    listaSessoes.value = [];
    podeCarregarMais.value = true;
  }

  if (!podeCarregarMais.value || estaCarregando.value) return;

  estaCarregando.value = true;
  try {
    const filtros = exibirTudo.value
      ? {}
      : { ano: anoSelecionado.value, mes: mesSelecionado.value + 1 };

    const novasSessoes = await sessaoService.getAllSessoes({
      pagina: paginaAtual.value,
      limite: sessoesPorPagina,
      ...filtros,
    });

    const sessoesFormatadas = await Promise.all(
      novasSessoes.map(async (sessao) => {
        const agendamento = sessao.tb_agendamento;
        const horarioInicio = agendamento?.horario_inicio || '';
        const horarioFim = obterHorarioFim(horarioInicio, parseInt(agendamento?.duracao));
        const nomeAprendente = await buscarNomeAprendente(agendamento);
        const idAprendenteOuResponsavel = agendamento?.id_aprendente || agendamento?.responsavel_id || '';
        const pagamento = await verificarPagamento(sessao);

        return {
          id: sessao.id,
          data: agendamento?.data_agendamento || '',
          horarioInicio,
          horarioFim,
          nomeAprendente,
          idAprendenteOuResponsavel,
          ehContrato: !!sessao.id_contrato,
          estaPaga: pagamento.estaPaga,
          idPagamento: pagamento.idPagamento,
          idMensalidade: pagamento.idMensalidade,
          valorPagamento: pagamento.valorPagamento,
          formaPagamento: pagamento.formaPagamento,
          comprovanteUrl: pagamento.comprovanteUrl,
          mostrarDetalhes: false,
          preSessao: sessao.pre_sessao || '',
          queixas: sessao.queixas || '',
          evolucao: sessao.evolucao || '',
          habilidadesTrabalhadas: sessao.habilidades_trabalhadas || '',
          futurasAcoes: sessao.futuras_acoes || '',
          resumo: sessao.resumo || '',
        };
      })
    );

    listaSessoes.value = limpar
      ? sessoesFormatadas
      : [...listaSessoes.value, ...sessoesFormatadas];

    paginaAtual.value++;
    podeCarregarMais.value = novasSessoes.length === sessoesPorPagina;
  } catch (erro) {
    console.error('Não foi possível carregar as sessões:', erro);
    mensagemSnackbar.value = 'Erro ao carregar sessões';
    corSnackbar.value = 'error';
    mostrarSnackbar.value = true;
  } finally {
    estaCarregando.value = false;
  }
}

// --- Propriedades computadas ---

// Agrupa sessões por data
const sessoesPorData = computed(() => {
  const agrupadas: Record<string, Sessao[]> = {};
  const sessoesFiltradas = exibirTudo.value
    ? listaSessoes.value
    : listaSessoes.value.filter((sessao) => {
      const [ano, mes] = sessao.data.split('-').map(Number);
      return ano === anoSelecionado.value && mes - 1 === mesSelecionado.value;
    });

  sessoesFiltradas.forEach((sessao) => {
    if (!agrupadas[sessao.data]) {
      agrupadas[sessao.data] = [];
    }
    agrupadas[sessao.data].push(sessao);
  });

  return agrupadas;
});

// Verifica se há sessões para exibir
const temSessoes = computed(() => Object.keys(sessoesPorData.value).length > 0);

// --- Inicialização ---
onMounted(() => {
  carregarSessoes(true);
});
</script>

<style scoped>
/* Seção expansível com detalhes da sessão */
.detalhes-sessao {
  padding: 24px;
  background-color: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

/* Separador entre itens da lista */
.v-list-item {
  border-bottom: 1px solid #f0f0f0;
}

/* Botões de seleção de mês */
.v-btn-toggle .v-btn {
  min-width: 48px;
}
</style>
