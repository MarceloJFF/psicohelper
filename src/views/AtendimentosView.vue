<template>
  <v-container class="w-100">
    <v-container class="sessoes rounded pa-8">
      <h1 class="text-deep-purple-lighten-2 mb-4">
        Controle do Pagamento das Sessões realizadas.
      </h1>
      <v-row justify="space-between" class="mb-6">
        <v-col cols="12" sm="6" md="4">
          <v-autocomplete v-model="filtroPaciente" :items="pacientes" v-model:search="searchQuery"
            label="Filtrar por paciente" item-title="displayName" item-value="id" :loading="isLoading" clearable
            :filter="() => true" :menu-props="{ maxHeight: 400 }" :return-object="false">
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
                <v-chip :color="atendimento.status === 'Pago' ? 'success' : 'error'" variant="outlined"
                  class="text-capitalize pa-2" small>
                  {{ atendimento.status }}
                </v-chip>
              </v-col>

              <v-spacer />
              <v-col cols="12" sm="6" md="4">
                <v-btn icon @click="atendimento.showDetails = !atendimento.showDetails">
                  <v-icon>{{ atendimento.showDetails ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                </v-btn>
                <v-btn color="primary" variant="text" @click="atendimento.showDetails = !atendimento.showDetails">
                  {{ atendimento.showDetails ? 'Ocultar Detalhes' : 'Mostrar Detalhes' }}
                </v-btn>
                <v-btn v-if="atendimento.status === 'Pago'" color="error" variant="outlined"
                  @click="console.log('Outro componente acionado')">
                  Editar Pagamento
                </v-btn>
              </v-col>
            </v-row>

            <v-expand-transition>
              <div v-if="atendimento.showDetails" class="details-section mt-4">
                <div class="mt-4">
                  <div v-for="menu in menus" :key="menu.field" class="mb-4">
                    <h4 class="text-subtitle-1 font-weight-bold mb-1">{{ menu.label }}</h4>
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
                  <h4 class="text-subtitle-1 font-weight-bold mb-2">Anexos</h4>
                  <v-row v-if="atendimento.anexosTemporarios && atendimento.anexosTemporarios.length" class="mt-2">
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
                        <v-icon v-else-if="anexo.url" size="40">mdi-file-document</v-icon>
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

    <v-dialog v-model="modalPagamento" max-width="500">
      <v-card>
        <v-card-title class="text-h6">Lançar Pagamento</v-card-title>
        <v-card-text>
          <p><strong>Paciente:</strong> {{ atendimentoSelecionado?.paciente }}</p>
          <p><strong>Data:</strong> {{ formatarData(atendimentoSelecionado?.data) }}</p>
          <p><strong>Horário:</strong> {{ atendimentoSelecionado?.horario }} - {{ atendimentoSelecionado?.horario_fim }}
          </p>
          <v-text-field label="Valor Pago" type="number" />
          <v-select label="Forma de Pagamento" :items="['Dinheiro', 'Pix', 'Cartão']" />
          <v-file-input label="Anexar comprovante" accept="image/*" v-model="comprovanteImagem" :loading="uploading"
            @change="handleFileChange" />
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
          <v-btn color="primary" @click="modalPagamento = false"
            :disabled="uploading || !comprovanteImagem">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { SessaoService } from '@/services/SessaoService';
import { AprendenteService } from '@/services/AprendenteService';
import { UploadService } from '@/services/UploadService'; // Assumindo que existe um serviço para upload
import supabase from '@/config/supabase';

const sessaoService = new SessaoService();
const aprendenteService = new AprendenteService();
const uploadService = new UploadService(); // Serviço para upload de arquivos
const atendimentos = ref<any[]>([]);
const pacientes = ref<any[]>([]);
const filtroPaciente = ref<string | null>(null);
const searchQuery = ref('');
const isLoading = ref(false);
const aprendenteCache = new Map();
const modalPagamento = ref(false);
const atendimentoSelecionado = ref<any>(null);
const valorPago = ref<number | null>(null);
const formaPagamento = ref<string | null>(null);
const comprovanteImagem = ref<File[] | null>(null);
const uploading = ref(false);
const uploadError = ref<string | null>(null);
const uploadSuccess = ref<boolean>(false);

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

        const anexos = sessao.fotos ? sessao.fotos.split(',').filter((url: string) => url) : [];
        return {
          id: sessao.id,
          data: agendamento?.data_agendamento || '',
          horario: startTime || '',
          horario_fim: horarioFim,
          paciente,
          clienteId,
          id_aprendente: agendamento?.id_aprendente,
          responsavel_id: agendamento?.responsavel_id,
          id_agendamento: agendamento?.id_agendamento,
          avatar: '',
          status: 'Pendente',
          anotacao: null,
          showDetails: false,
          isEditing: false,
          preSessao: sessao.pre_sessao || '',
          queixas: sessao.queixas || '',
          evolucaoAtual: sessao.evolucao || '',
          habilidadesTrabalhadas: sessao.habilidades_trabalhadas || '',
          futurasAcoes: sessao.futuras_acoes || '',
          anexos,
          anexosTemporarios: anexos.map(url => ({ url, name: url.split('/').pop() })), // Inicializa com anexos existentes
          anexosParaExcluir: [] as string[], // Anexos a serem excluídos
          novosAnexos: [] as File[], // Novos arquivos selecionados
          uploadError: '',
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

function iniciarEdicao(atendimento: any) {
  atendimento.originalData = { ...atendimento }; // Armazenar cópia dos dados
  atendimento.isEditing = true;
}

function cancelarEdicao(atendimento: any) {
  Object.assign(atendimento, atendimento.originalData); // Restaurar dados originais
  atendimento.isEditing = false;
  delete atendimento.originalData;
}

function validarNovosAnexos(atendimento: any) {
  atendimento.uploadError = '';
  if (atendimento.novosAnexos && atendimento.novosAnexos.length > 0) {
    for (const file of atendimento.novosAnexos) {
      if (!file.type.match(/^image\/.+$|^application\/pdf$/)) {
        atendimento.uploadError = 'Apenas imagens ou PDFs são permitidos';
        atendimento.novosAnexos = [];
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        atendimento.uploadError = 'O arquivo deve ter menos de 25MB';
        atendimento.novosAnexos = [];
        return;
      }
    }
    // Adicionar novos anexos à lista temporária para visualização
    atendimento.anexosTemporarios.push(
      ...atendimento.novosAnexos.map((file: File) => ({ url: '', name: file.name }))
    );
  }
}

function removerAnexoTemporario(atendimento: any, index: number) {
  const anexo = atendimento.anexosTemporarios[index];
  if (anexo.url) {
    // Anexo existente, marcar para exclusão
    atendimento.anexosParaExcluir.push(anexo.url);
  }
  // Remover da lista temporária
  atendimento.anexosTemporarios.splice(index, 1);
  // Remover do novosAnexos se for um novo arquivo
  atendimento.novosAnexos = atendimento.novosAnexos.filter(
    (file: File) => file.name !== anexo.name
  );
}

async function downloadAnexo(anexo: string) {
  try {
    const caminho = anexo.split('/storage/v1/object/public/sessoes/')[1];
    const data = await supabase.storage
      .from('sessoes')
      .download(caminho);
    const url = window.URL.createObjectURL(data.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = anexo.split('/').pop() || 'Arquivo';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Erro ao baixar anexo:', err);
    alert('Erro ao baixar anexo: ' + (err as Error).message);
  }
}

async function salvarEdicao(atendimento: any) {
  try {
    // Processar novos anexos
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

    // Atualizar lista de anexos
    atendimento.anexos = [
      ...atendimento.anexosTemporarios
        .filter((anexo: any) => anexo.url && !atendimento.anexosParaExcluir.includes(anexo.url))
        .map((anexo: any) => anexo.url),
      ...novosUrls
    ];

    // Montar dados da sessão
    const sessaoData = {
      id: atendimento.id,
      pre_sessao: atendimento.preSessao,
      queixas: atendimento.queixas,
      evolucao: atendimento.evolucaoAtual,
      habilidades_trabalhadas: atendimento.habilidadesTrabalhadas,
      futuras_acoes: atendimento.futurasAcoes,
      resumo: atendimento.resumo,
      fotos: atendimento.anexos.length > 0 ? atendimento.anexos.join(',') : null,
      id_agendamento: atendimento.id_agendamento
    };

    // Atualizar no banco
    await sessaoService.updateSessao(atendimento.id, sessaoData);

    // Limpar estados temporários
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

function abrirModalPagamento(atendimento: any) {
  atendimentoSelecionado.value = atendimento;
  modalPagamento.value = true;
}

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