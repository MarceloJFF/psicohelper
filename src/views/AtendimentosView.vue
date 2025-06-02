<template>
  <v-container class="w-100">
    <v-container class="sessoes rounded pa-8">
      <h1 class="text-deep-purple-lighten-2 mb-4">
        Controle do Pagamento das Sessões Realizadas
      </h1>
      <v-row justify="space-between">
        <v-col cols="6">
          <AutoComplete @update:aprendenteSelecionado="onAprendenteSelecionado" />
        </v-col>
        <v-col cols="4">
          <v-select
            v-model="tipoSessao"
            :items="tiposSessao"
            label="Tipo de Sessão"
            @update:model-value="loadSessoes(true)"
          />
        </v-col>
      </v-row>
    </v-container>

    <v-divider class="my-6" />

    <v-alert
      v-if="Object.keys(atendimentosAgrupados).length === 0"
      type="info"
    >
      Nenhuma sessão encontrada para o filtro selecionado.
    </v-alert>

    <div v-for="(grupo, data) in atendimentosAgrupados" :key="data">
      <v-card class="mb-6 elevation-2 rounded-xl">
        <v-card-title class="text-h6 font-weight-bold text-primary">
          {{ formatarData(data) }}
        </v-card-title>

        <v-divider />

        <v-list>
          <Sessao
            v-for="atendimento in grupo"
            :key="atendimento.id"
            :atendimento="atendimento"
            :menus="menus"
            @remover-anexo="removerAnexoTemporario"
            @download-anexo="downloadAnexo"
            @validar-anexos="validarNovosAnexos"
            @iniciar-edicao="iniciarEdicao"
            @salvar-edicao="salvarEdicao"
            @cancelar-edicao="cancelarEdicao"
          />
        </v-list>
      </v-card>
    </div>

    <!-- Indicador de fim da lista -->
    <div
      v-if="!hasMoreData && Object.keys(atendimentosAgrupados).length > 0"
      class="text-center my-4 text-grey"
    >
      Não há mais sessões para carregar
    </div>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { UploadService } from '@/services/UploadService';
import supabase from '@/config/supabase';
import AutoComplete from '@/components/AutoComplete.vue';
import { SessaoService } from '@/services/SessaoService.ts';
import { AprendenteService } from '@/services/AprendenteService.ts';
import Sessao from '@/components/Sessao.vue';

// Types
interface PagamentoData {
  id_pagamento: string;
  valor: number;
  forma_pagamento: string;
  comprovante_url: string;
}

interface Atendimento {
  id: string;
  data: string;
  horario: string;
  horario_fim: string;
  paciente: string;
  clienteId: string;
  id_aprendente?: string;
  responsavel_id?: string;
  id_agendamento?: number;
  id_contrato?: string | null;
  avatar: string;
  status: string;
  id_pagamento?: string;
  valor_pagamento?: number;
  forma_pagamento?: string;
  comprovante_url?: string;
  anotacao: string | null;
  showDetails: boolean;
  isEditing: boolean;
  preSessao: string;
  queixas: string;
  evolucaoAtual: string;
  habilidadesTrabalhadas: string;
  futurasAcoes: string;
  anexos: string[];
  anexosTemporarios: { url: string; name: string }[];
  anexosParaExcluir: string[];
  novosAnexos: File[];
  uploadError: string;
  resumo: string;
  originalData?: Atendimento;
}

// Services
const sessaoService = new SessaoService();
const uploadService = new UploadService();
const atendimentos = ref<Atendimento[]>([]);
const pacientes = ref<any[]>([]);
const filtroPaciente = ref<string | null>(null);
const aprendenteCache = new Map();
const uploadError = ref<string | null>(null);
const contratos = ref<any[]>([]);
const aprendenteService = new AprendenteService();
// Pagination state
const pageSize = 10;
const currentPage = ref(1);
const hasMoreData = ref(true);
const isLoadingMore = ref(false);

const tipoSessao = ref('todos');
const tiposSessao = [
  { title: 'Todas as Sessões', value: 'todos' },
  { title: 'Sessões de Contrato', value: 'contrato' },
  { title: 'Sessões Avulsas', value: 'avulsa' }
];

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
];

// Intersection Observer for infinite scroll
const observerTarget = ref<HTMLElement | null>(null);


// Add date range state
const currentDateRange = ref({
  start: new Date(),
  end: new Date()
});

// Function to get date range for last 30 days
function getDateRangeForPeriod(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start, end };
}

function formatarData(dataStr: string): string {
  if (!dataStr) return '';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Event handlers
function onAprendenteSelecionado(aprendente: any) {
  filtroPaciente.value = aprendente?.id || null;
  pacientes.value = [aprendente];
  loadSessoes(true);
}

async function loadSessoes(reset = false) {
  if (reset) {
    currentPage.value = 1;
    atendimentos.value = [];
    hasMoreData.value = true;
    currentDateRange.value = getDateRangeForPeriod(30);
  }

  if (!hasMoreData.value || isLoadingMore.value) return;

  isLoadingMore.value = true;
  try {
    const newSessoes = await sessaoService.getAllSessoes({
      page: currentPage.value,
      pageSize: pageSize,
      clienteId: filtroPaciente.value,
      startDate: currentDateRange.value.start.toISOString(),
      endDate: currentDateRange.value.end.toISOString(),
      tipoSessao: tipoSessao.value === 'todos' ? undefined : (tipoSessao.value as 'contrato' | 'avulsa')
    });

    if (newSessoes.length < pageSize) {
      hasMoreData.value = false;
    }

    if (newSessoes.length > 0) {
      const novosAtendimentos = await Promise.all(
        newSessoes.map(async (sessao: any) => {
          const agendamento = sessao.tb_agendamento;
          const startTime = agendamento.horario_inicio;
          const duracao = String(agendamento.duracao);
          const startDateTime = startTime ? new Date(`1970-01-01T${startTime}`) : null;
          const endDateTime = startDateTime ? new Date(startDateTime.getTime() + parseInt(duracao) * 60000) : null;
          const horarioFim = endDateTime
            ? `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`
            : '';

          let paciente = 'N/A';
          const clienteId = agendamento.id_aprendente || agendamento.responsavel_id || '';
          if (agendamento.id_aprendente) {
            if (aprendenteCache.has(agendamento.id_aprendente)) {
              paciente = aprendenteCache.get(agendamento.id_aprendente).nomeAprendente;
            } else {
              const aprendente = await aprendenteService.getAprendenteById(agendamento.id_aprendente);
              paciente = aprendente?.nomeAprendente || 'N/A';
              aprendenteCache.set(agendamento.id_aprendente, aprendente);
            }
          } else if (agendamento.responsavel_id) {
            const responsavel = await supabase
              .from('tb_responsavel')
              .select('nome')
              .eq('id_responsavel', agendamento.responsavel_id)
              .single();
            paciente = responsavel.data?.nome || 'N/A';
          }

          const anexos = typeof sessao.fotos === 'string' ? sessao.fotos.split(',').filter((url: string) => url) : [];
          let status = 'Pendente';
          let pagamentoData = null;

          // Verifica se existe pagamento para esta sessão
          const { data: pagamentoSessao } = await supabase
            .from('tb_pagamento_sessao')
            .select('id_pagamento, valor, forma_pagamento, comprovante_url')
            .eq('id_sessao', sessao.id)
            .maybeSingle();

          if (pagamentoSessao) {
            status = 'Pago';
            pagamentoData = {
              id_pagamento: pagamentoSessao.id_pagamento,
              valor: pagamentoSessao.valor,
              forma_pagamento: pagamentoSessao.forma_pagamento,
              comprovante_url: pagamentoSessao.comprovante_url
            };
            console.log(`Sessão ${sessao.id} marcada como Pago:`, pagamentoSessao);
          } else {
            console.log(`Sessão ${sessao.id} sem pagamento registrado`);
          }

          const atendimento = {
            id: sessao.id,
            data: agendamento.data_agendamento,
            horario: startTime,
            horario_fim: horarioFim,
            paciente,
            clienteId,
            id_aprendente: agendamento.id_aprendente,
            responsavel_id: agendamento.responsavel_id,
            id_agendamento: agendamento.id_agendamento,
            id_contrato: agendamento.id_contrato || null,
            avatar: '',
            status,
            id_pagamento: pagamentoData?.id_pagamento,
            valor_pagamento: pagamentoData?.valor,
            forma_pagamento: pagamentoData?.forma_pagamento,
            comprovante_url: pagamentoData?.comprovante_url,
            anotacao: null,
            showDetails: false,
            isEditing: false,
            preSessao: sessao.pre_sessao || '',
            queixas: sessao.queixas || '',
            evolucaoAtual: sessao.evolucao || '',
            habilidadesTrabalhadas: sessao.habilidades_trabalhadas || '',
            futurasAcoes: sessao.futuras_acoes || '',
            anexos,
            anexosTemporarios: anexos.map((url: string) => ({ url, name: url.split('/').pop() || 'Arquivo' })),
            anexosParaExcluir: [] as string[],
            novosAnexos: [] as File[],
            uploadError: '',
            resumo: sessao.resumo || ''
          };

          return atendimento;
        })
      );

      if (reset) {
        atendimentos.value = novosAtendimentos;
      } else {
        atendimentos.value = [...atendimentos.value, ...novosAtendimentos];
      }

      currentPage.value++;
      
      // Update date range for next load
      if (!reset) {
        currentDateRange.value.start = new Date(currentDateRange.value.start);
        currentDateRange.value.start.setDate(currentDateRange.value.start.getDate() - 30);
        currentDateRange.value.end = new Date(currentDateRange.value.end);
        currentDateRange.value.end.setDate(currentDateRange.value.end.getDate() - 30);
      }
      
      hasMoreData.value = newSessoes.length === pageSize;
    }
  } catch (error: unknown) {
    console.error('Erro ao carregar sessões:', error);
    uploadError.value = 'Erro ao carregar sessões: ' + (error instanceof Error ? error.message : 'Erro desconhecido');
  } finally {
    isLoadingMore.value = false;
  }
}


function iniciarEdicao(atendimento: Atendimento) {
  atendimento.originalData = { ...atendimento };
  atendimento.isEditing = true;
}

function cancelarEdicao(atendimento: Atendimento) {
  if (atendimento.originalData) {
    Object.assign(atendimento, atendimento.originalData);
    atendimento.isEditing = false;
    delete atendimento.originalData;
  }
}

async function salvarEdicao(atendimento: Atendimento) {
  try {
    const novosUrls = await uploadNovosAnexos(atendimento);
    await atualizarAnexos(atendimento, novosUrls);
    await atualizarDadosSessao(atendimento);
    
    limparEstadoEdicao(atendimento);
    console.log('Sessão atualizada com sucesso');
    alert('Alterações salvas com sucesso!');
  } catch (err) {
    console.error('Erro ao salvar edição:', err);
    alert('Erro ao salvar alterações: ' + (err as Error).message);
  }
}

async function uploadNovosAnexos(atendimento: Atendimento): Promise<string[]> {
  const novosUrls: string[] = [];
  if (atendimento.novosAnexos?.length) {
    for (const file of atendimento.novosAnexos) {
      const url = await uploadService.uploadArquivo(
        'sessoes',
        `sessao/${atendimento.id_agendamento || 'temp'}`,
        file
      );
      novosUrls.push(url);
    }
  }
  return novosUrls;
}

async function atualizarAnexos(atendimento: Atendimento, novosUrls: string[]) {
  atendimento.anexos = [
    ...atendimento.anexosTemporarios
      .filter(anexo => anexo.url && !atendimento.anexosParaExcluir.includes(anexo.url))
      .map(anexo => anexo.url),
    ...novosUrls
  ];
}

async function atualizarDadosSessao(atendimento: Atendimento) {
  const sessaoData = {
    id: atendimento.id,
    pre_sessao: atendimento.preSessao,
    queixas: atendimento.queixas,
    evolucao: atendimento.evolucaoAtual,
    habilidades_trabalhadas: atendimento.habilidadesTrabalhadas,
    futuras_acoes: atendimento.futurasAcoes,
    resumo: atendimento.resumo,
    fotos: atendimento.anexos.length > 0 ? atendimento.anexos.join(',') : undefined,
    id_agendamento: atendimento.id_agendamento,
    id_contrato: atendimento.id_contrato
  };

  await sessaoService.updateSessao(atendimento.id, sessaoData);
}

function limparEstadoEdicao(atendimento: Atendimento) {
  atendimento.anexosTemporarios = atendimento.anexos.map(url => ({
    url,
    name: url.split('/').pop() || 'Arquivo'
  }));
  atendimento.anexosParaExcluir = [];
  atendimento.novosAnexos = [];
  atendimento.uploadError = '';
  atendimento.isEditing = false;
  delete atendimento.originalData;
}

// Attachment management functions
function removerAnexoTemporario(atendimento: Atendimento, index: number) {
  atendimento.anexosTemporarios.splice(index, 1);
}

async function downloadAnexo(url: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = url.split('/').pop() || 'arquivo';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Erro ao baixar anexo:', error);
    alert('Erro ao baixar anexo: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
}

function validarNovosAnexos(atendimento: Atendimento) {
  if (!atendimento.novosAnexos) return;

  const maxSize = 5 * 1024 * 1024; // 5MB
  const invalidFiles = atendimento.novosAnexos.filter(file => file.size > maxSize);

  if (invalidFiles.length > 0) {
    atendimento.uploadError = 'Alguns arquivos excedem o tamanho máximo de 5MB';
    atendimento.novosAnexos = atendimento.novosAnexos.filter(file => file.size <= maxSize);
  } else {
    atendimento.uploadError = '';
  }
}

// Computed properties
const atendimentosAgrupados = computed(() => {
  const agrupados: Record<string, Atendimento[]> = {};
  const filtroId = filtroPaciente.value;

  const lista = filtroId
    ? atendimentos.value.filter(a => {
      const match = String(a.clienteId) === String(filtroId) ||
        String(a.id_aprendente) === String(filtroId) ||
        String(a.responsavel_id) === String(filtroId);
      console.log(`Atendimento ${a.id}: clienteId=${a.clienteId}, id_aprendente=${a.id_aprendente}, responsavel_id=${a.responsavel_id}, filtro=${filtroId}, match=${match}`);
      return match;
    })
    : atendimentos.value;

  lista.forEach(atendimento => {
    if (!agrupados[atendimento.data]) {
      agrupados[atendimento.data] = [];
    }
    agrupados[atendimento.data].push(atendimento);
  });

  return agrupados;
});

// Lifecycle hooks
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMoreData.value && !isLoadingMore.value) {
        loadSessoes();
      }
    },
    {
      rootMargin: '100px',
      threshold: 0.1
    }
  );

  if (observerTarget.value) {
    observer.observe(observerTarget.value);
  }

  // Initial load
  loadSessoes(true);
});

// Watchers
watch(filtroPaciente, () => {
  loadSessoes(true);
});
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

.sessoes {
  background-color: #f9f9f9 !important;
}

.observer-target {
  height: 20px;
  width: 100%;
}
</style>
