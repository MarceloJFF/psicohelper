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
          <v-list-item
            v-for="atendimento in grupo"
            :key="atendimento.id"
            class="pa-4 px-2"
          >
            <v-row class="pa-4 d-flex align-self-center">
              <AtendimentoDetalhes :atendimento="atendimento" />
            </v-row>

            <v-expand-transition>
              <div
                v-if="atendimento.showDetails"
                class="details-section mt-4"
              >
                <div class="mt-4">
                  <div v-for="menu in menus" :key="menu.field" class="mb-4">
                    <h4 class="text-subtitle-1 font-weight-bold mb-1">
                      {{ menu.label }}
                    </h4>
                    <v-textarea
                      v-if="atendimento.isEditing"
                      v-model="atendimento[menu.field]"
                      v-bind="menu.props"
                      class="mt-2"
                    />
                    <p v-else class="text-body-2">
                      {{ atendimento[menu.field] || 'Sem informações' }}
                    </p>
                  </div>

                  <h4 class="text-subtitle-1 font-weight-bold mb-2">
                    Anexos
                  </h4>
                  <v-row
                    v-if="
                      atendimento.anexosTemporarios &&
                      atendimento.anexosTemporarios.length
                    "
                    class="mt-2"
                  >
                    <v-col
                      v-for="(anexo, index) in atendimento.anexosTemporarios"
                      :key="index"
                      cols="12"
                      sm="6"
                      md="4"
                    >
                      <v-card class="pa-2" elevation="1">
                        <v-img
                          v-if="anexo.url && anexo.url.includes('image')"
                          :src="anexo.url"
                          max-height="100"
                          max-width="100"
                          class="rounded"
                        />
                        <v-icon v-else-if="anexo.url" size="40">
                          mdi-file-document
                        </v-icon>
                        <v-icon v-else size="40">mdi-file</v-icon>
                        <div class="text-caption mt-2">
                          {{ anexo.name || anexo.url.split('/').pop() || 'Arquivo' }}
                        </div>
                        <v-btn
                          v-if="atendimento.isEditing"
                          icon
                          small
                          @click="removerAnexoTemporario(atendimento, index)"
                          class="mt-2"
                        >
                          <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                        <v-btn
                          v-if="anexo.url"
                          icon
                          small
                          @click="downloadAnexo(anexo.url)"
                          class="mt-2"
                        >
                          <v-icon>mdi-download</v-icon>
                        </v-btn>
                      </v-card>
                    </v-col>
                  </v-row>
                  <p v-else class="text-body-2">Nenhum anexo disponível.</p>

                  <v-file-input
                    v-if="atendimento.isEditing"
                    label="Adicionar anexos"
                    accept="image/*,application/pdf"
                    multiple
                    v-model="atendimento.novosAnexos"
                    class="mt-4"
                    :error-messages="atendimento.uploadError"
                    @change="validarNovosAnexos(atendimento)"
                  />
                </div>

                <v-btn
                  v-if="!atendimento.isEditing"
                  color="primary"
                  variant="outlined"
                  class="mt-4"
                  @click="iniciarEdicao(atendimento)"
                >
                  Editar
                </v-btn>
                <v-btn
                  v-if="atendimento.isEditing"
                  color="success"
                  variant="outlined"
                  class="mt-4"
                  @click="salvarEdicao(atendimento)"
                >
                  Salvar
                </v-btn>
                <v-btn
                  v-if="atendimento.isEditing"
                  color="error"
                  variant="outlined"
                  class="mt-4 ml-2"
                  @click="cancelarEdicao(atendimento)"
                >
                  Cancelar
                </v-btn>
              </div>
            </v-expand-transition>
          </v-list-item>
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
import { ContratoService } from '@/services/contratoService';
import supabase from '@/config/supabase';
import AtendimentoDetalhes from '@/components/AtendimentoDetalhes.vue'
import AutoComplete from '@/components/AutoComplete.vue'
import { SessaoService } from '@/services/SessaoService.ts'

const sessaoService = new SessaoService();
const uploadService = new UploadService();
const contratoService = new ContratoService();
const atendimentos = ref<any[]>([]);
const pacientes = ref<any[]>([]);
const filtroPaciente = ref<string | null>(null);
const searchQuery = ref('');
const aprendenteCache = new Map();
const uploadError = ref<string | null>(null);
const contratos = ref<any[]>([]);

// Pagination state
const pageSize = 10;
const currentPage = ref(1);
const hasMoreData = ref(true);
const isLoadingMore = ref(false);

interface Sessao {
  id: string;
  pre_sessao?: string;
  queixas?: string;
  evolucao?: string;
  habilidades_trabalhadas?: string;
  futuras_acoes?: string;
  resumo?: string;
  fotos?: string[];
  id_agendamento?: number;
  id_contrato?: string;
  tb_agendamento?: {
    id_agendamento: number;
    data_agendamento: string;
    horario_inicio: string;
    duracao: number;
    id_aprendente: string;
    responsavel_id: string;
    id_profissional: string;
  };
}



function onAprendenteSelecionado(aprendente: any) {

  console.log(aprendente)
}

async function loadSessoes(reset = false) {
  if (reset) {
    currentPage.value = 1;
    atendimentos.value = [];
    hasMoreData.value = true;
  }

  if (!hasMoreData.value || isLoadingMore.value) return;

  isLoadingMore.value = true;
  try {
    const newSessoes: Sessao[] = await sessaoService.getAllSessoes({
      page: currentPage.value,
      pageSize: pageSize,
      clienteId: filtroPaciente.value
    });

    if (newSessoes.length < pageSize) {
      hasMoreData.value = false;
    }

    if (newSessoes.length > 0) {
      const novosAtendimentos = await Promise.all(
        newSessoes.map(async (sessao) => {
          const agendamento = sessao.tb_agendamento;
          const startTime = agendamento?.horario_inicio;
          const duracao = parseInt(agendamento?.duracao) || 60;
          const startDateTime = startTime ? new Date(`1970-01-01T${startTime}`) : null;
          const endDateTime = startDateTime ? new Date(startDateTime.getTime() + duracao * 60000) : null;
          const horarioFim = endDateTime
            ? `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`
            : '';

          let paciente = 'N/A';
          const clienteId = agendamento?.id_aprendente || agendamento?.responsavel_id || '';
          if (agendamento?.id_aprendente) {
            if (aprendenteCache.has(agendamento.id_aprendente)) {
              paciente = aprendenteCache.get(agendamento.id_aprendente).nome_aprendente;
            } else {
              const aprendente = await aprendenteService.getAprendenteById(agendamento.id_aprendente);
              paciente = aprendente?.nome_aprendente || 'N/A';
              aprendenteCache.set(agendamento.id_aprendente, aprendente);
            }
          } else if (agendamento?.responsavel_id) {
            const responsavel = await supabase
              .from('tb_responsavel')
              .select('nome')
              .eq('id_responsavel', agendamento.responsavel_id)
              .single();
            paciente = responsavel.data?.nome || 'N/A';
          }

          const anexos = sessao.fotos ? sessao.fotos.split(',').filter((url: string) => url) : [];
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
            data: agendamento?.data_agendamento || '',
            horario: startTime || '',
            horario_fim: horarioFim,
            paciente,
            clienteId,
            id_aprendente: agendamento?.id_aprendente,
            responsavel_id: agendamento?.responsavel_id,
            id_agendamento: agendamento?.id_agendamento,
            id_contrato: agendamento?.id_contrato || null,
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
            anexosTemporarios: anexos.map(url => ({ url, name: url.split('/').pop() })),
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
      hasMoreData.value = newSessoes.length === pageSize;
    }
  } catch (error: unknown) {
    console.error('Erro ao carregar sessões:', error);
    uploadError.value = 'Erro ao carregar sessões: ' + (error instanceof Error ? error.message : 'Erro desconhecido');
  } finally {
    isLoadingMore.value = false;
  }
}



async function loadContratos() {
  try {
    const clienteId = filtroPaciente.value;
    console.log(filtroPaciente)
    if (clienteId) {
      contratos.value = await contratoService.loadContratos(clienteId);
    } else {
      contratos.value = [];
    }
  } catch (err) {
    console.error('Erro ao carregar contratos:', err);
  }
}

function iniciarEdicao(atendimento: any) {
  atendimento.originalData = { ...atendimento };
  atendimento.isEditing = true;
}

function cancelarEdicao(atendimento: any) {
  Object.assign(atendimento, atendimento.originalData);
  atendimento.isEditing = false;
  delete atendimento.originalData;
}




async function salvarEdicao(atendimento: any) {
  try {
    const novosUrls: string[] = [];
    if (atendimento.novosAnexos && atendimento.novosAnexos.length > 0) {
      for (const file of atendimento.novosAnexos) {
        const url = await uploadService.uploadArquivo(
          'sessoes',
          `sessao/${atendimento.id_agendamento || 'temp'}`,
          file
        );
        novosUrls.push(url);
      }
    }

    atendimento.anexos = [
      ...atendimento.anexosTemporarios
        .filter((anexo: any) => anexo.url && !atendimento.anexosParaExcluir.includes(anexo.url))
        .map((anexo: any) => anexo.url),
      ...novosUrls
    ];

    const sessaoData = {
      id: atendimento.id,
      pre_sessao: atendimento.preSessao,
      queixas: atendimento.queixas,
      evolucao: atendimento.evolucaoAtual,
      habilidades_trabalhadas: atendimento.habilidadesTrabalhadas,
      futuras_acoes: atendimento.futurasAcoes,
      resumo: atendimento.resumo,
      fotos: atendimento.anexos.length > 0 ? atendimento.anexos.join(',') : null,
      id_agendamento: atendimento.id_agendamento,
      id_contrato: atendimento.id_contrato
    };

    await sessaoService.updateSessao(atendimento.id, sessaoData);

    atendimento.anexosTemporarios = atendimento.anexos.map((url: string) => ({
      url,
      name: url.split('/').pop()
    }));
    atendimento.anexosParaExcluir = [];
    atendimento.novosAnexos = [];
    atendimento.uploadError = '';
    atendimento.isEditing = false;
    delete atendimento.originalData;

    console.log('Sessão atualizada com sucesso:', sessaoData);
    alert('Alterações salvas com sucesso!');
  } catch (err) {
    console.error('Erro ao salvar edição:', err);
    alert('Erro ao salvar alterações: ' + (err as Error).message);
  }
}


watch(searchQuery, async (newValue) => {
  if (!newValue) {
    await loadPacientes();
    return;
  }

  // isLoading.value = true;
  try {
    const resultados = await aprendenteService.buscarClientesPorNome(newValue);
    pacientes.value = resultados.map((cliente) => ({
      id: cliente.id,
      displayName: cliente.displayName || cliente.nome || cliente.responsavel || 'N/A',
      aprendente: cliente.nome,
      responsavel: cliente.responsavel
    }));
    console.log('Resultados da busca:', pacientes.value);
  } catch (err) {
    console.error('Erro na busca:', err);
  } finally {
    // isLoading.value = false;
  }
}, { debounce: 300 });

watch(filtroPaciente, async (newValue) => {
  console.log('filtroPaciente alterado:', newValue, typeof newValue);
  // await loadPacientes();
  console.log('filtroPaciente alterado:', newValue, typeof newValue);
  await loadContratos();
});

const atendimentosAgrupados = computed(() => {
  const agrupados: Record<string, typeof atendimentos.value> = {};
  const filtroId = typeof filtroPaciente.value === 'object' && filtroPaciente.value
    ? filtroPaciente.value.id
    : filtroPaciente.value;

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

function formatarData(dataStr: string): string {
  if (!dataStr) return '';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

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

// // Reset pagination when filter changes
// watch(filtroPaciente, () => {
//   loadSessoes(true);
// });
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
