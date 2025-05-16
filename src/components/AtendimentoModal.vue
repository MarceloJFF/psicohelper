<template>
  <v-dialog v-model="internalModel" max-width="1200px" min-width="900px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <span>Atendimento - {{ title }}</span>
        <v-spacer />
        <v-btn icon @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        

        <!-- Menu Superior -->
        <v-tabs v-model="tab" center-active grow>
          <v-tab v-for="(item, index) in menus" :key="index" :value="index">
            {{ item.label }}
          </v-tab>
        </v-tabs>

        <!-- Conteúdo Dinâmico -->
        <v-window v-model="tab" class="mt-4">
          <v-window-item v-for="(item, index) in menus" :key="index" :value="index">
            <h4>{{ item.label }}</h4>
            <v-textarea
              v-if="item.component === 'v-textarea'"
              v-model="item.value"
              v-bind="item.props"
            />
            <v-file-input
              v-if="item.component === 'v-file-input'"
              :model-value="item.value"
              @update:modelValue="addFile"
              v-bind="item.props"
              :error-messages="errorMessage"
              :loading="uploadLoading"
            />
            <!-- Arquivos selecionados (antes do upload) -->
            <v-row v-if="item.label === 'Anexos' && selectedFiles.length" class="mt-4">
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
            <!-- Arquivos enviados (após upload) -->
            <v-row v-if="item.label === 'Anexos' && uploadedFiles.length" class="mt-4">
              <v-col v-for="(file, index) in uploadedFiles" :key="index" cols="12" sm="6" md="4">
                <v-card class="pa-2" elevation="1">
                  <v-img
                    v-if="file.url && file.url.includes('image')"
                    :src="file.url"
                    max-height="100"
                    max-width="100"
                    class="rounded"
                  />
                  <v-icon v-else size="40">mdi-file-document</v-icon>
                  <div class="text-caption mt-2">{{ file.name }}</div>
                  <v-btn
                    icon
                    small
                    @click="downloadFile(file)"
                    class="mt-2"
                  >
                    <v-icon>mdi-download</v-icon>
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="primary" @click="salvar" :loading="uploadLoading">Salvar</v-btn>
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Fechar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { AprendenteService } from '@/services/AprendenteService';
import { SessaoService } from '@/services/SessaoService';
import { UploadService } from '@/services/UploadService';

const props = defineProps({
  modelValue: Boolean,
  title: String,
  idAgendamento: { type: [String, Number], default: null },
});

const emit = defineEmits(['update:modelValue']);

const internalModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const tab = ref(0);
const isLoading = ref(false);
const uploadLoading = ref(false);
const searchQuery = ref('');
const filteredClientes = ref<any[]>([]);
const selectedCliente = ref<any>(null);
const errorMessage = ref('');
const uploadedFiles = ref<{ name: string; url: string }[]>([]);
const selectedFiles = ref<File[]>([]);
const aprendenteService = new AprendenteService();
const sessaoService = new SessaoService();
const uploadService = new UploadService();

const menus = ref([
  {
    label: 'Pré-sessão',
    component: 'v-textarea',
    value: ref(''),
    props: {
      label: 'Anotações antes da sessão',
      rows: 3,
      placeholder: 'Registre preparativos e observações prévias...',
    },
  },
  {
    label: 'Queixas',
    component: 'v-textarea',
    value: ref(''),
    props: {
      label: 'Principais queixas relatadas',
    },
  },
  {
    label: 'Evolução Atual',
    component: 'v-textarea',
    value: ref(''),
    props: {
      label: 'Progresso do paciente',
      rows: 3,
      placeholder: 'Descreva a evolução atual...',
    },
  },
  {
    label: 'Habilidades Trabalhadas',
    component: 'v-textarea',
    value: ref(''),
    props: {
      label: 'Habilidades trabalhadas na sessão',
      rows: 3,
      placeholder: 'Registre as habilidades trabalhadas...',
    },
  },
  {
    label: 'Futuras Ações',
    component: 'v-textarea',
    value: ref(''),
    props: {
      label: 'Planejamento futuro',
      rows: 3,
      placeholder: 'Registre próximos passos...',
    },
  },
  {
    label: 'Anexos',
    component: 'v-file-input',
    value: ref(null as File | null),
    props: {
      label: 'Anexar documento/foto',
      chips: true,
      accept: 'image/*,.pdf',
    },
  },
  {
    label: 'Resumo',
    component: 'v-textarea',
    value: ref(''),
    props: {
      label: 'Resumo da sessão',
      rows: 5,
      placeholder: 'Detalhes sobre o desenvolvimento da sessão...',
    },
  },
]);

watch(searchQuery, async (newValue) => {
  if (!newValue) {
    filteredClientes.value = [];
    return;
  }

  isLoading.value = true;
  try {
    const resultados = await aprendenteService.buscarClientesPorNome(newValue);
    filteredClientes.value = resultados;
  } catch (err) {
    console.error('Erro na busca:', err);
    errorMessage.value = 'Erro ao buscar clientes';
  } finally {
    isLoading.value = false;
  }
}, { debounce: 300 });

watch(tab, (newTab) => {
  console.log('Aba alterada:', menus.value[newTab].label, 'Valor:', menus.value[newTab].value);
});

function addFile(newFile: File | null) {
  console.log('addFile chamado com:', newFile, 'Tipo:', newFile ? newFile.constructor.name : 'null');
  if (newFile instanceof File) {
    selectedFiles.value = [...selectedFiles.value, newFile];
    menus.value[5].value = null;
    console.log('Arquivo adicionado:', newFile.name, 'Tipo:', newFile.type, 'Total:', selectedFiles.value.length);
  } else {
    console.warn('Ignorando newFile inválido:', newFile);
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

async function salvar() {
  // if (!selectedCliente.value) {
  //   errorMessage.value = 'Selecione um cliente antes de salvar';
  //   return;
  // }

  uploadLoading.value = true;
  errorMessage.value = '';

  try {
    // Handle file uploads
    if (selectedFiles.value.length > 0) {
      let uploadedCount = 0;
      for (const file of selectedFiles.value) {
        console.log('Validando arquivo:', file.name, 'Tipo:', file.type);
        if (!file.type.match(/^image\/.+$|^application\/pdf$/)) {
          errorMessage.value = 'Apenas imagens ou PDFs são permitidos';
          return;
        }
        if (file.size > 25 * 1024 * 1024) {
          errorMessage.value = 'O arquivo deve ter menos de 25MB';
          return;
        }

        const url = await uploadService.uploadArquivo(
          'sessoes',
          `sessao/${props.idAgendamento || 'temp'}`,
          file
        );
        uploadedFiles.value.push({ name: file.name, url });
        uploadedCount++;
        console.log(`Upload ${uploadedCount}/${selectedFiles.value.length} concluído`);
      }
      selectedFiles.value = []; // Clear selected files after upload
    }

    // Prepare session data
    const sessao = {
      pre_sessao: menus.value[0].value,
      queixas: menus.value[1].value,
      evolucao: menus.value[2].value,
      habilidades_trabalhadas: menus.value[3].value,
      futuras_acoes: menus.value[4].value,
      resumo: menus.value[6].value,
      fotos: uploadedFiles.value.length > 0 ? uploadedFiles.value.map(f => f.url).join(',') : null,
      id_agendamento: props.idAgendamento,
    };

    await sessaoService.createSessao(sessao);
    console.log('Sessão salva com sucesso:', sessao);
    emit('update:modelValue', false);
    uploadedFiles.value = []; // Clear uploaded files after save
  } catch (err) {
    console.error('Erro ao salvar sessão:', err);
    errorMessage.value = 'Erro ao salvar sessão: ' + (err as Error).message;
  } finally {
    uploadLoading.value = false;
  }
}

async function downloadFile(file: { name: string; url: string }) {
  try {
    const caminho = file.url.split('/storage/v1/object/public/sessoes/')[1];
    const data = await uploadService.downloadArquivo('sessoes', caminho);

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error('Erro ao baixar arquivo:', err);
    errorMessage.value = 'Erro ao baixar arquivo: ' + (err as Error).message;
  }
}
</script>

<style scoped>
.v-card-title {
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  padding: 16px;
}

.v-tabs {
  border-bottom: 1px solid #eee;
}

.v-window {
  min-height: 300px;
}

.v-textarea,
.v-file-input,
.v-autocomplete {
  margin-top: 16px;
}

.v-card {
  border-radius: 12px;
  transition: box-shadow 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>