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
        v-for="pasta in pastasVisiveis"
        :key="pasta.id"
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

      <!-- Arquivos -->
      <v-col
        v-for="arquivo in arquivosVisiveis"
        :key="arquivo.id"
        cols="12" sm="6" md="4"
      >
        <v-card
          class="pa-4 d-flex flex-column align-center"
          elevation="1"
          draggable="true"
          @dragstart="iniciarDragArquivo(arquivo)"
        >
          <v-icon size="36">mdi-file-document-outline</v-icon>
          <div class="text-subtitle-2 mt-2">{{ arquivo.nome }}</div>
          <v-btn
            small
            class="mt-2"
            :href="arquivo.link"
            target="_blank"
            color="primary"
            variant="outlined"
          >Ver Arquivo</v-btn>
          <v-row class="d-flex justify-center w-100">
            <v-col class="d-flex justify-center" cols="auto">
              <v-btn icon @click="renomearPasta(pasta)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </v-col>
            <v-col class="d-flex justify-center" cols="auto">
              <v-btn icon @click="excluirPasta(pasta)">
                <v-icon color="red">mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>



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
          <v-text-field label="Nome do Arquivo" v-model="novoArquivoNome" />
          <v-file-input label="Selecionar Arquivo" v-model="novoArquivo" />
          <v-autocomplete
            v-model="aprendenteSelecionado"
            :items="aprendentesEncontrados"
            item-title="nome"
            item-value="id"
            label="Escolha o nome do aprendente"
            clearable
            return-object
            @update:search="onBuscaAprendente"
          />

        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="modalArquivo = false">Cancelar</v-btn>
          <v-btn color="primary" @click="anexarArquivo">Anexar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
import { onMounted } from 'vue'
import { PastaService, Pasta } from '@/services/PastaService'

const pastaService = new PastaService()
const pastas = ref<Pasta[]>([])

async function carregarPastas(): Promise<void> {
  const parentId = caminhoAtual.value.length
    ? caminhoAtual.value[caminhoAtual.value.length - 1].id
    : null
  pastas.value = await pastaService.listarPastas(parentId)
}

onMounted(() => {
  carregarPastas()
})

async function criarPasta(): Promise<void> {
  if (!novaPastaNome.value) return
  const parentId = caminhoAtual.value.length
    ? caminhoAtual.value[caminhoAtual.value.length - 1].id
    : null

  await pastaService.criarPasta(novaPastaNome.value, parentId)
  modalPasta.value = false
  await carregarPastas()
}

async function excluirPasta(pasta: Pasta): Promise<void> {
  await pastaService.excluirPasta(pasta.id)
  await carregarPastas()
}

async function renomearPasta(pasta: Pasta): Promise<void> {
  const novoNome = prompt('Novo nome da pasta:', pasta.nome)
  if (novoNome && novoNome !== pasta.nome) {
    await pastaService.atualizarPasta(pasta.id, novoNome)
    await carregarPastas()
  }
}

function abrirPasta(pasta: Pasta): void {
  caminhoAtual.value.push(pasta)
  carregarPastas()
}

function voltarParaRaiz(): void {
  caminhoAtual.value = []
  carregarPastas()
}

function navegarPara(index: number): void {
  caminhoAtual.value = caminhoAtual.value.slice(0, index + 1)
  carregarPastas()
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
