<template>
  <v-container class="w-100">
    <v-container class="sessoes rounded pa-8">
      <h1 class="text-deep-purple-lighten-2 mb-4">
        Controle do Pagamento das Sessões realizadas.
      </h1>
      <v-row justify="space-between" class="mb-6">
        <v-col cols="12" sm="6" md="4">
          <v-autocomplete
            v-model="filtroPaciente"
            :items="pacientes"
            v-model:search="searchQuery"
            label="Filtrar por paciente"
            item-title="displayName"
            item-value="id"
            :loading="isLoading"
            clearable
            :filter="() => true"
            :menu-props="{ maxHeight: 400 }"
            :return-object="false"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :key="item.raw.id" :value="item.raw.id">
                <v-list-item-title>
                  {{ item.raw.displayName || 'N/A' }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>

      <v-btn color="success" variant="outlined" @click="abrirModalPagamento(atendimento)">
        Lançar Pagamento
      </v-btn>
      <div>
        <span class="mb-2">
          Clique para lançar os pagamentos pendentes de um aprendente.
        </span>
      </div>
    </v-container>

    <v-divider class="my-6" />

    <v-alert v-if="!Object.keys(atendimentosAgrupados).length" type="info">
      Nenhuma sessão encontrada para o filtro selecionado.
    </v-alert>

    <div v-for="(grupo, data) in atendimentosAgrupados" :key="data">
      <v-card class="mb-6 elevation-2 rounded-xl">
        <v-card-title class="text-h6 font-weight-bold text-primary">
          {{ formatarData(data) }}
        </v-card-title>

        <v-divider />

        <v-list>
          <v-list-item v-for="atendimento in grupo" :key="atendimento.id" class="pa-4 px-2">
            <v-row class="pa-4 d-flex align-self-center">
              <v-col cols="12" sm="6" md="4">
                <div class="font-weight-medium pa-2">
                  Horário Agendado: {{ atendimento.horario }} - {{ atendimento.horario_fim }}
                </div>
                <div class="font-weight-medium pa-2">
                  Aprendente: {{ atendimento.paciente }}
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
                <v-btn icon @click="atendimento.showDetails = !atendimento.showDetails">
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
                  <div v-for="menu in menus" :key="menu.field" class="mb-4">
                    <h4 class="text-subtitle-1 font-weight-bold mb-1">{{ menu.label }}</h4>
                    <p class="text-body-2">
                      {{ atendimento[menu.field] || 'Sem informações' }}
                    </p>
                  </div>
                </div>
                <v-btn color="success" variant="outlined" @click="abrirModalEdicao(atendimento)">
                  Editar
                </v-btn>
              </div>
            </v-expand-transition>
          </v-list-item>
        </v-list>
      </v-card>
    </div>

    <!-- Modal de Pagamento -->
    <v-dialog v-model="modalPagamento" max-width="500">
      <v-card>
        <v-card-title class="text-h6">Lançar Pagamento</v-card-title>
        <v-card-text>
          <p><strong>Paciente:</strong> {{ atendimentoSelecionado?.paciente }}</p>
          <p><strong>Data:</strong> {{ formatarData(atendimentoSelecionado?.data) }}</p>
          <p>
            <strong>Horário:</strong> {{ atendimentoSelecionado?.horario }} -
            {{ atendimentoSelecionado?.horario_fim }}
          </p>
          <v-text-field label="Valor Pago" type="number" v-model="valorPago" />
          <v-select
            label="Forma de Pagamento"
            :items="['Dinheiro', 'Pix', 'Cartão']"
            v-model="formaPagamento"
          />
          <v-file-input
            label="Anexar comprovante"
            accept="image/*"
            v-model="comprovanteImagem"
            :loading="uploading"
            @update:modelValue="handleFileChange"
          />
          <v-alert v-if="uploadError" type="error" class="mt-2">
            {{ uploadError }}
          </v-alert>
          <v-alert v-if="uploadSuccess" type="success" class="mt-2">
            Imagem enviada com sucesso!
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="modalPagamento = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            @click="salvarPagamento"
            :disabled="uploading || !comprovanteImagem"
            :loading="uploading"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Edição -->
    <v-dialog v-model="modalEdicao" max-width="800" persistent>
      <v-card>
        <v-card-title class="text-h6">
          Editar Sessão - {{ atendimentoSelecionado?.paciente }}
          <v-spacer />
          <v-btn icon @click="modalEdicao = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-tabs v-model="editTab" center-active grow>
            <v-tab v-for="(menu, index) in menus" :key="index" :value="index">
              {{ menu.label }}
            </v-tab>
            <v-tab value="anexos">Anexos</v-tab>
          </v-tabs>
          <v-window v-model="editTab" class="mt-4">
            <v-window-item v-for="(menu, index) in menus" :key="index" :value="index">
              <v-textarea
                v-model="formEdicao[menu.field]"
                v-bind="menu.props"
                :label="menu.label"
                rows="5"
              />
            </v-window-item>
            <v-window-item value="anexos">
              <v-file-input
                label="Anexar documento/foto"
                accept="image/*,.pdf"
                v-model="novosAnexos"
                @update:modelValue="handleNovosAnexos"
                chips
              />
              <v-row v-if="selectedFiles.length" class="mt-4">
                <v-col v-for="(file, index) in selectedFiles" :key="index" cols="12" sm="6" md="4">
                  <v-card class="pa-2" elevation="1">
                    <v-img
                      v-if="file && file.type.includes('image')"
                      :src="createObjectURL(file)"
                      max-height="100"
                      max-width="100"
                      class="rounded"
                    />
                    <v-icon v-else-if="file" size="40">mdi-file-document</v-icon>
                    <div v-if="file" class="text-caption mt-2">{{ file.name }}</div>
                    <v-btn
                      v-if="file"
                      icon
                      small
                      @click="removeFile(index)"
                      class="mt-2"
                    >
                      <v-icon color="red">mdi-delete</v-icon>
                    </v-btn>
                  </v-card>
                </v-col>
              </v-row>
              <v-row v-if="atendimentoSelecionado?.anexos?.length" class="mt-4">
                <v-col v-for="(anexo, index) in atendimentoSelecionado.anexos" :key="index" cols="12" sm="6" md="4">
                  <v-card class="pa-2" elevation="1">
                    <v-img
                      v-if="anexo.includes('image')"
                      :src="anexo"
                      max-height="100"
                      max-width="100"
                      class="rounded"
                    />
                    <v-icon v-else size="40">mdi-file-document</v-icon>
                    <div class="text-caption mt-2">{{ getFileName(anexo) }}</div>
                    <v-btn
                      icon
                      small
                      @click="downloadFile(anexo)"
                      class="mt-2"
                    >
                      <v-icon>mdi-download</v-icon>
                    </v-btn>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
          <v-alert v-if="editError" type="error" class="mt-4">
            {{ editError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="modalEdicao = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            @click="salvarEdicao"
            :loading="editLoading"
            :disabled="editLoading"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { SessaoService } from '@/services/SessaoService';
import { AprendenteService } from '@/services/AprendenteService';
import { UploadService } from '@/services/UploadService';
import supabase from '@/config/supabase';

const sessaoService = new SessaoService();
const aprendenteService = new AprendenteService();
const uploadService = new UploadService();
const atendimentos = ref<any[]>([]);
const pacientes = ref<any[]>([]);
const filtroPaciente = ref<string | null>(null);
const searchQuery = ref('');
const isLoading = ref(false);
const aprendenteCache = new Map();
const modalPagamento = ref(false);
const modalEdicao = ref(false);
const atendimentoSelecionado = ref<any>(null);
const valorPago = ref<number | null>(null);
const formaPagamento = ref<string | null>(null);
const comprovanteImagem = ref<File[] | null>(null);
const uploading = ref(false);
const uploadError = ref<string | null>(null);
const uploadSuccess = ref<boolean>(false);
const editTab = ref(0);
const formEdicao = ref({
  preSessao: '',
  queixas: '',
  evolucaoAtual: '',
  habilidadesTrabalhadas: '',
  futurasAcoes: '',
  resumo: ''
});
const novosAnexos = ref<File[] | null>(null);
const selectedFiles = ref<File[]>([]);
const editLoading = ref(false);
const editError = ref<string | null>(null);

async function handleFileChange(files: File[] | null) {
  if (files && files.length > 0) {
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      uploadError.value = 'Por favor, selecione uma imagem (JPEG, PNG, etc.).';
      comprovanteImagem.value = null;
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      uploadError.value = 'A imagem deve ter menos de 25MB.';
      comprovanteImagem.value = null;
      return;
    }
    uploadError.value = null;
  }
}

async function handleNovosAnexos(files: File[] | null) {
  if (files && files.length > 0) {
    const file = files[0];
    if (!file.type.match(/^image\/.+$|^application\/pdf$/)) {
      editError.value = 'Apenas imagens ou PDFs são permitidos';
      novosAnexos.value = null;
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      editError.value = 'O arquivo deve ter menos de 25MB';
      novosAnexos.value = null;
      return;
    }
    selectedFiles.value = [...selectedFiles.value, file];
    novosAnexos.value = null; // Clear the file input
    console.log('Arquivo adicionado:', file.name, 'Total:', selectedFiles.value.length);
  }
}

function removeFile(index: number) {
  selectedFiles.value.splice(index, 1);
  console.log('Arquivo removido, Total:', selectedFiles.value.length);
}

function createObjectURL(file: File): string {
  if (!window.URL || !window.URL.createObjectURL) {
    console.error('window.URL.createObjectURL não está disponível');
    return '';
  }
  const url = window.URL.createObjectURL(file);
  console.log('URL gerada para pré-visualização:', url);
  return url;
}

function getFileName(url: string): string {
  return url.split('/').pop() || 'Arquivo';
}

async function downloadFile(url: string) {
  try {
    const caminho = url.split('/storage/v1/object/public/sessoes/')[1];
    const data = await uploadService.downloadArquivo('sessoes', caminho);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = getFileName(url);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error('Erro ao baixar arquivo:', err);
    editError.value = 'Erro ao baixar arquivo: ' + (err as Error).message;
  }
}

async function salvarPagamento() {
  if (!atendimentoSelecionado.value || !comprovanteImagem.value) return;

  uploading.value = true;
  uploadError.value = null;

  try {
    const file = comprovanteImagem.value[0];
    const url = await uploadService.uploadArquivo(
      'sessoes',
      `pagamentos/${atendimentoSelecionado.value.id}`,
      file
    );
    // Aqui você pode salvar os dados do pagamento no Supabase, se necessário
    uploadSuccess.value = true;
    modalPagamento.value = false;
    comprovanteImagem.value = null;
  } catch (err) {
    console.error('Erro ao salvar pagamento:', err);
    uploadError.value = 'Erro ao salvar pagamento: ' + (err as Error).message;
  } finally {
    uploading.value = false;
  }
}

function abrirModalEdicao(atendimento: any) {
  atendimentoSelecionado.value = atendimento;
  formEdicao.value = {
    preSessao: atendimento.preSessao || '',
    queixas: atendimento.queixas || '',
    evolucaoAtual: atendimento.evolucaoAtual || '',
    habilidadesTrabalhadas: atendimento.habilidadesTrabalhadas || '',
    futurasAcoes: atendimento.futurasAcoes || '',
    resumo: atendimento.resumo || ''
  };
  selectedFiles.value = [];
  editError.value = null;
  modalEdicao.value = true;
}

async function salvarEdicao() {
  if (!atendimentoSelecionado.value) return;

  editLoading.value = true;
  editError.value = null;

  try {
    // Upload de novos anexos
    let novosUrls: string[] = [];
    if (selectedFiles.value.length > 0) {
      for (const file of selectedFiles.value) {
        const url = await uploadService.uploadArquivo(
          'sessoes',
          `sessao/${atendimentoSelecionado.value.id}`,
          file
        );
        novosUrls.push(url);
        console.log('Arquivo enviado:', url);
      }
    }

    // Combinar anexos existentes com novos
    const fotos = [
      ...(atendimentoSelecionado.value.anexos || []),
      ...novosUrls
    ].join(',');

    // Preparar dados para atualização
    const sessaoAtualizada = {
      pre_sessao: formEdicao.value.preSessao,
      queixas: formEdicao.value.queixas,
      evolucao: formEdicao.value.evolucaoAtual,
      habilidades_trabalhadas: formEdicao.value.habilidadesTrabalhadas,
      futuras_acoes: formEdicao.value.futurasAcoes,
      resumo: formEdicao.value.resumo,
      fotos: fotos || null
    };

    // Atualizar sessão no Supabase
    await sessaoService.updateSessao(atendimentoSelecionado.value.id, sessaoAtualizada);

    // Atualizar a lista de atendimentos localmente
    const atendimentoIndex = atendimentos.value.findIndex(a => a.id === atendimentoSelecionado.value.id);
    if (atendimentoIndex !== -1) {
      atendimentos.value[atendimentoIndex] = {
        ...atendimentos.value[atendimentoIndex],
        preSessao: formEdicao.value.preSessao,
        queixas: formEdicao.value.queixas,
        evolucaoAtual: formEdicao.value.evolucaoAtual,
        habilidadesTrabalhadas: formEdicao.value.habilidadesTrabalhadas,
        futurasAcoes: formEdicao.value.futurasAcoes,
        resumo: formEdicao.value.resumo,
        anexos: fotos ? fotos.split(',') : []
      };
    }

    console.log('Sessão atualizada:', sessaoAtualizada);
    modalEdicao.value = false;
  } catch (err) {
    console.error('Erro ao salvar edição:', err);
    editError.value = 'Erro ao salvar edição: ' + (err as Error).message;
  } finally {
    editLoading.value = false;
  }
}

async function loadSessoes() {
  try {
    const sessoes = await sessaoService.getAllSessoes();
    atendimentos.value = await Promise.all(
      sessoes.map(async (sessao) => {
        const agendamento = sessao.tb_agendamento;
        const startTime = agendamento?.horario_inicio;
        const duracao = agendamento?.duracao || 60;
        const startDateTime = startTime ? new Date(`1970-01-01T${startTime}`) : null;
        const endDateTime = startDateTime ? new Date(startDateTime.getTime() + duracao * 60000) : null;
        const horarioFim = endDateTime
          ? `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`
          : '';

        let paciente = 'N/A';
        let clienteId = agendamento?.id_aprendente || agendamento?.responsavel_id || '';
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
            .select('nome_responsavel')
            .eq('id_responsavel', agendamento.responsavel_id)
            .single();
          paciente = responsavel.data?.nome_responsavel || 'N/A';
        }

        return {
          id: sessao.id,
          data: agendamento?.data_agendamento || '',
          horario: startTime || '',
          horario_fim: horarioFim,
          paciente,
          clienteId,
          id_aprendente: agendamento?.id_aprendente,
          responsavel_id: agendamento?.responsavel_id,
          avatar: '',
          status: 'Pendente',
          anotacao: null,
          showDetails: false,
          preSessao: sessao.pre_sessao || '',
          queixas: sessao.queixas || '',
          evolucaoAtual: sessao.evolucao || '',
          habilidadesTrabalhadas: sessao.habilidades_trabalhadas || '',
          futurasAcoes: sessao.futuras_acoes || '',
          anexos: sessao.fotos ? sessao.fotos.split(',') : [],
          resumo: sessao.resumo || ''
        };
      })
    );
    console.log('Atendimentos carregados:', atendimentos.value.map(a => ({
      id: a.id,
      clienteId: a.clienteId,
      id_aprendente: a.id_aprendente,
      responsavel_id: a.responsavel_id,
      paciente: a.paciente
    })));
  } catch (err) {
    console.error('Erro ao carregar sessões:', err);
  }
}

async function loadPacientes() {
  try {
    const clientes = await aprendenteService.buscarClientesPorNome('');
    pacientes.value = clientes.map((cliente) => ({
      id: cliente.id,
      displayName: cliente.displayName || cliente.nome || cliente.responsavel || 'N/A',
      aprendente: cliente.nome,
      responsavel: cliente.responsavel
    }));
    console.log('Pacientes carregados:', pacientes.value);
  } catch (err) {
    console.error('Erro ao carregar pacientes:', err);
  }
}

watch(searchQuery, async (newValue) => {
  if (!newValue) {
    await loadPacientes();
    return;
  }

  isLoading.value = true;
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
    isLoading.value = false;
  }
}, { debounce: 300 });

watch(filtroPaciente, (newValue) => {
  console.log('filtroPaciente alterado:', newValue, typeof newValue);
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

  console.log('Filtro paciente:', filtroPaciente.value);
  console.log('Filtro ID usado:', filtroId);
  console.log('Lista filtrada:', lista);
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

onMounted(() => {
  loadSessoes();
  loadPacientes();
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
</style>