<template>
  <v-container class="pa-8 border rounded h-100 w-75  bg-white">
    <!-- Breadcrumbs -->
    <v-breadcrumbs v-if="caminhoAtual.length" class="mb-4">
      <v-breadcrumbs-item
        v-for="(pasta, index) in caminhoAtual"
        :key="index"
        :disabled="index === caminhoAtual.length - 1"
        @click="navegarPara(index)"
      >
        {{ pasta.nome }}
      </v-breadcrumbs-item>
    </v-breadcrumbs>

    <!-- Cabeçalho e Botões -->
    <v-row class="mb-4" justify="space-between">
      <h2 class="text-h5 font-weight-bold text-deep-purple-lighten-2">
        {{ caminhoAtual.length ? caminhoAtual[caminhoAtual.length - 1].nome : 'Meus Relatórios' }}
      </h2>
      <div>
        <v-btn
          v-if="caminhoAtual.length"
          variant="text"
          @click="voltarParaRaiz"
          class="mr-2"
        >
          <v-icon left>mdi-arrow-left</v-icon>
          Voltar
        </v-btn>
        <v-btn color="primary" @click="abrirModalPasta">Nova Subpasta</v-btn>
        <v-btn
          v-if="caminhoAtual.length"
          color="primary"
          class="ml-2"
          @click="abrirModalArquivo"
        >
          Anexar Novo Arquivo
        </v-btn>
      </div>
    </v-row>

    <!-- Pastas -->
    <v-row>
      <v-col
        v-for="pasta in pastas"
        :key="pasta.id_pasta || pasta.id"
        cols="12" sm="6" md="4"
      >
        <v-card
          class="pa-4 d-flex flex-column align-center border"
          elevation="2"
          @dragover.prevent
          @drop="soltarArquivoNaPasta(pasta)"
        >
          <v-icon size="40" color="primary">mdi-folder</v-icon>
          <div class="text-subtitle-1 font-weight-medium my-2">{{ pasta.nome }}</div>
          <v-btn color="primary" variant="text" @click="abrirPasta(pasta)">Abrir</v-btn>
          <v-btn icon @click="renomearPasta(pasta)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="excluirPasta(pasta)">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
        </v-card>
      </v-col>

      <!-- Documentos -->
      <v-col
        v-for="documento in documentos"
        :key="documento.id_documento"
        cols="12" sm="6" md="4"
      >
        <v-card class="pa-4 d-flex flex-column align-center" elevation="1">
          <v-icon size="36">mdi-file-document-outline</v-icon>
          <div class="text-subtitle-2 mt-2">{{ documento.nome }}</div>
          <v-btn
            small
            class="mt-2"
            @click="baixarArquivo(documento)"
            color="primary"
            variant="outlined"
          >
            <v-icon left>mdi-download</v-icon>
            Baixar Arquivo
          </v-btn>
          <v-row class="d-flex justify-center w-100 ma-4">
          <v-btn icon @click="renomearDocumento(documento)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="excluirDocumento(documento)">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>

          </v-row>
        </v-card>
      </v-col>

      <!-- Mensagem quando não há documentos -->
      <v-col v-if="documentos.length === 0" cols="12" class="text-center">
        <v-card class="pa-6 d-flex flex-column align-center" elevation="0">
          <v-icon size="64" color="grey-lighten-1">mdi-file-document-outline</v-icon>
          <div class="text-h6 text-grey mt-4">Nenhum documento encontrado</div>
          <div class="text-subtitle-1 text-grey-lighten-1 mt-2">
            Clique em "Anexar Novo Arquivo" para adicionar documentos a esta pasta
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal Nova Pasta -->
    <v-dialog v-model="modalPasta" max-width="400">
      <v-card>
        <v-card-title>Criar Nova Subpasta</v-card-title>
        <v-card-text>
          <v-text-field label="Nome da Pasta" v-model="novaPastaNome" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="modalPasta = false">Cancelar</v-btn>
          <v-btn color="primary" @click="criarPasta">Criar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Anexar Arquivo -->
    <v-dialog v-model="modalArquivo" max-width="500">
      <v-card>
        <v-card-title>Anexar Novo Arquivo</v-card-title>
        <v-card-text>
          <v-text-field
            label="Nome do Arquivo"
            v-model="novoArquivoNome"
            :error-messages="errorMessage"
          />
          <v-file-input
            label="Selecionar Arquivo"
            v-model="novoArquivo"
            :error-messages="errorMessage"
          />
          <v-autocomplete
            v-model="aprendenteSelecionado"
            :items="aprendentesEncontrados"
            item-title="nome_aprendente"
            item-value="id"
            label="Buscar aprendente por nome"
            clearable
            return-object
            @update:search="onBuscaAprendente"
            :loading="loading"
            :error-messages="errorMessage"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="modalArquivo = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            @click="anexarArquivo"
            :loading="uploadLoading"
            :disabled="!novoArquivo || !novoArquivoNome || !aprendenteSelecionado"
          >
            Anexar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Aprendente -->
    <v-dialog v-model="modalAprendente" max-width="500">
      <v-card>
        <v-card-title>Escolher Aprendente</v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="aprendenteSelecionado"
            :items="aprendentesEncontrados"
            item-title="nome_aprendente"
            item-value="id"
            label="Buscar aprendente por nome"
            clearable
            return-object
            @update:search="onBuscaAprendente"
            :loading="loading"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="modalAprendente = false">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmarAprendente">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { PastaService } from '@/services/PastaService'
import { DocumentoService } from '@/services/DocumentoService'
import { useStoreProfissional } from '@/stores/storeProfissional'
import { AprendenteService } from '@/services/AprendenteService'
import supabase from '@/config/supabase'
const pastaService = new PastaService()
const documentoService = new DocumentoService()
const storeProfissional = useStoreProfissional()
const aprendenteService = new AprendenteService()
const pastas = ref([])
const documentos = ref([])
const caminhoAtual = ref([])
const novaPastaNome = ref('')
const modalPasta = ref(false)
const modalArquivo = ref(false)
const novoArquivo = ref(null)
const novoArquivoNome = ref('')
const modalAprendente = ref(false)
const aprendentesEncontrados = ref([])
const aprendenteSelecionado = ref(null)
const loading = ref(false)
const uploadLoading = ref(false)
const errorMessage = ref('')

async function carregarPastas() {
  const idPai = caminhoAtual.value.length
    ? caminhoAtual.value[caminhoAtual.value.length - 1].id_pasta || caminhoAtual.value[caminhoAtual.value.length - 1].id
    : null

  pastas.value = await pastaService.listarPastas(idPai)
}

async function carregarDocumentos() {
  const idPai = caminhoAtual.value.length
    ? caminhoAtual.value[caminhoAtual.value.length - 1].id_pasta || caminhoAtual.value[caminhoAtual.value.length - 1].id
    : null
  documentos.value = await documentoService.listarDocumentos(idPai)
}

watch(
  () => storeProfissional.profissionalDetails,
  (prof) => {
    if (prof && prof.id) {
      carregarPastas()
      carregarDocumentos()
    }
  },
  { immediate: true }
)

async function criarPasta() {
  if (!novaPastaNome.value) return
  const idPai = caminhoAtual.value.length
    ? caminhoAtual.value[caminhoAtual.value.length - 1].id_pasta || caminhoAtual.value[caminhoAtual.value.length - 1].id
    : null
  await pastaService.criarPasta(novaPastaNome.value, idPai)
  modalPasta.value = false
  await carregarPastas()
}

async function excluirPasta(pasta) {
  await pastaService.excluirPasta(pasta.id_pasta)
  await carregarPastas()
}

async function renomearPasta(pasta) {
  const novoNome = prompt('Novo nome da pasta:', pasta.nome)
  if (novoNome && novoNome !== pasta.nome) {
    await pastaService.atualizarPasta(pasta.id_pasta, novoNome)
    await carregarPastas()
  }
}

function abrirPasta(pasta) {
  caminhoAtual.value.push(pasta)
  carregarPastas()
  carregarDocumentos()
}

function voltarParaRaiz() {
  caminhoAtual.value = []
  carregarPastas()
  carregarDocumentos()
}

function navegarPara(index) {
  caminhoAtual.value = caminhoAtual.value.slice(0, index + 1)
  carregarPastas()
  carregarDocumentos()
}

async function anexarArquivo() {
  if (!novoArquivo.value || !novoArquivoNome.value || !aprendenteSelecionado.value) {
    errorMessage.value = 'Por favor, preencha todos os campos'
    return
  }

  uploadLoading.value = true
  errorMessage.value = ''

  const idPai = caminhoAtual.value.length
    ? caminhoAtual.value[caminhoAtual.value.length - 1].id_pasta || caminhoAtual.value[caminhoAtual.value.length - 1].id
    : null

  try {
    await documentoService.criarDocumento(
      novoArquivoNome.value,
      idPai,
      novoArquivo.value,
      aprendenteSelecionado.value.id
    )
    modalArquivo.value = false
    await carregarDocumentos()
  } catch (e) {
    console.error('Erro ao anexar arquivo:', e)
    errorMessage.value = 'Erro ao anexar arquivo: ' + e.message
  } finally {
    uploadLoading.value = false
  }
}

function abrirModalArquivo() {
  modalArquivo.value = true
  novoArquivo.value = null
  novoArquivoNome.value = ''
  aprendenteSelecionado.value = null
  errorMessage.value = ''
}

function abrirModalPasta() {
  modalPasta.value = true
  novaPastaNome.value = ''
}
async function renomearDocumento(documento) {
  const novoNome = prompt('Novo nome do arquivo:', documento.nome)
  if (novoNome && novoNome !== documento.nome) {
    await documentoService.atualizarDocumento(documento.id_documento, novoNome)
    await carregarDocumentos()
  }
}

async function excluirDocumento(documento) {
  if (confirm(`Deseja excluir o documento "${documento.nome}"?`)) {
    await documentoService.excluirDocumento(documento.id_documento)
    await carregarDocumentos()
  }
}

function abrirModalAprendente() {
  modalAprendente.value = true
  aprendenteSelecionado.value = null
  aprendentesEncontrados.value = []
}

async function onBuscaAprendente(query) {
  if (!query) {
    aprendentesEncontrados.value = []
    return
  }
  loading.value = true
  try {
    const result = await aprendenteService.buscarAprendentesPorNome(query)
    console.log('Resultado da busca:', result)
    aprendentesEncontrados.value = result
  } catch (error) {
    console.error('Erro na busca:', error)
  } finally {
    loading.value = false
  }
}

function confirmarAprendente() {
  modalAprendente.value = false
}

async function baixarArquivo(documento) {
  try {
    const { data, error } = await supabase.storage
      .from('documentos')
      .download(documento.storage_path)

    if (error) throw error

    // Criar um link para download
    const url = window.URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = documento.nome // Usa o nome original do arquivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error)
    alert('Erro ao baixar arquivo: ' + error.message)
  }
}

</script>
<style scoped>
.v-card {
  border-radius: 12px;
  transition: box-shadow 0.3s ease;
}
.v-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
</style>
