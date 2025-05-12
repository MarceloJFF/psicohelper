<template>
  <v-layout class="fill-height">
    <v-main>
      <v-container fluid class="pa-6">
        <v-row class="fill-height">
          <v-col cols="7" md="8" class="d-flex flex-column">
            <v-card flat class="mb-4 pa-4 d-flex align-center bg-white elevation-1 rounded">
              <v-row class="d-flex justify-end align-center w-100">
                <v-col cols="6">
                  <div class="text-h6 font-weight-medium d-flex align-center">
                    <v-icon class="mr-2" color="primary">mdi-account-group</v-icon>
                    Listagem de Clientes
                  </div>
                </v-col>
                <v-col cols="5">
                  <v-text-field
                    v-model="search"
                    density="compact"
                    label="Buscar clientes"
                    prepend-inner-icon="mdi-magnify"
                    append-inner-icon="mdi-close"
                    variant="solo-filled"
                    hide-details
                    class="bg-white rounded"
                    @click:append-inner="search = ''"
                    @update:model-value="handleSearch"
                  />
                </v-col>
                <v-col cols="1">
                  <v-btn
                    color="purple"
                    fab
                    dark
                    @click="abrirModalNovo"
                    aria-label="Adicionar Cliente"
                    size="small"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>

            <v-card class="flex-grow-1 overflow-hidden elevation-2 rounded-lg bg-grey-lighten-4">
              <template v-if="loading">
                <v-skeleton-loader
                  type="table"
                  class="pa-6"
                  boilerplate
                  elevation="0"
                />
              </template>
              <template v-else>
                <v-data-table
                  :headers="headers"
                  :items="aprendentes"
                  :loading="loading"
                  class="elevation-1"
                  loading-text="Carregando aprendentes..."
                >
                  <!-- Telefone com ícone do WhatsApp -->
                  <template v-slot:item.telefoneResponsavel="{ item }">

                    <span>{{ formatarTelefone(item.telefoneResponsavel) }}</span>
                    <a
                      :href="`https://wa.me/55${item.telefoneResponsavel}`"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <v-icon small color="green" class="ml-2">mdi-whatsapp</v-icon>
                    </a>
                  </template>
                  <!-- Ações -->
                  <template v-slot:item.actions="{ item }">
                    <v-btn icon @click="editarAprendente(item)">
                      <v-icon color="blue">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon @click="removerAprendente(item)">
                      <v-icon color="red">mdi-delete</v-icon>
                    </v-btn>
                    <v-btn icon @click="visualizarResponsavel(item)">
                      <v-icon color="primary">mdi-eye</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>


              </template>
            </v-card>
          </v-col>

          <v-col cols="5" md="4" class="d-flex flex-column">
            <todo class="mb-3" />
            <calendario-diario class="flex-grow-1" />
          </v-col>
        </v-row>
      </v-container>

      <!-- Overlay com spinner -->
      <v-overlay :model-value="loading" class="align-center justify-center" persistent>
        <v-progress-circular indeterminate size="64" color="primary" />
      </v-overlay>

      <!-- Modal de cliente -->
      <ModalGenerico v-model="showModal" :title="modoEdicao ? 'Editar Responsavel' : 'Cadastrar Novo Responsavel'">
        <template #content>
          <v-form>
            <v-text-field v-model="responsavelAtual.nome" label="Nome" />
            <v-text-field v-model="responsavelAtual.telefone" label="Telefone" />
            <v-text-field v-model="responsavelAtual.email" label="Email" />
            <v-text-field v-model="responsavelAtual.tipoAtendimento" label="Tipo de Atendimento" />
          </v-form>
        </template>
        <template #actions>
          <v-btn color="green" @click="salvarResponsavel">Salvar</v-btn>
          <v-btn color="grey" @click="showModal = false">Cancelar</v-btn>
        </template>
      </ModalGenerico>

      <!-- Dialogo de confirmação de inativação -->
      <v-dialog v-model="dialogConfirmacao" max-width="400">
        <v-card>
          <v-card-title class="text-h6">Confirmar inativação</v-card-title>
          <v-card-text>
            Tem certeza que deseja inativar o cliente <strong>{{ responsavelParaInativar?.nome }}</strong>?
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="grey" variant="text" @click="dialogConfirmacao = false">Cancelar</v-btn>
            <v-btn color="red" variant="text" @click="inativarCliente">Inativar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ResponsavelService } from '@/services/responsavelService'
import Responsavel from '@/models/Responsavel'
import CalendarioDiario from '@/components/calendario-diario.vue'
import Todo from '@/components/todo.vue'
import ModalGenerico from '@/components/ModalGenerico.vue'

const responsavelService = new ResponsavelService()
const showModal = ref(false)
const modoEdicao = ref(false)
const indexEdicao = ref<number | null>(null)
const router = useRouter()
const search = ref('')
const loading = ref(true)

const responsavelAtual = ref<Responsavel>(new Responsavel())
const responsavelParaInativar = ref<Responsavel | null>(null)
const dialogConfirmacao = ref(false)

const handleSearch = (value: string) => {
  if (value.length <= 3) {
    // Reset the search results or show all items
    loadResponsaveis()
    return
  }
  // Perform the search with the value
  // You can implement your search logic here
}

const aprendentes = ref([])

onMounted(async () => {
  loading.value = true
  aprendentes.value = await responsavelService.loadAprendentes()
  loading.value = false
})

const responsaveis = ref([])


function editarAprendente(item: any) {
  console.log('Editar:', item)
  // Ação para abrir modal ou redirecionar
}

function removerAprendente(item: any) {
  console.log('Remover:', item)
  // Confirmar e chamar exclusão
}
const headers = [
  { title: 'Aprendente', key: 'nomeAprendente' },
  { title: 'Responsável', key: 'nomeResponsavel' },
  { title: 'Telefone Responsável', key: 'telefoneResponsavel' },
  { title: 'Ações', key: 'actions', sortable: false },
]

const loadResponsaveis = async () => {
  loading.value = true
  try {
    responsaveis.value = await responsavelService.loadResponsaveis()
  } catch (error) {
    console.error('Erro ao carregar responsaveis:', error)
  } finally {
    loading.value = false
  }
}



const abrirModalEdicao = (item: Responsavel, index: number) => {
  responsavelAtual.value = { ...item }
  indexEdicao.value = index
  modoEdicao.value = true
  showModal.value = true
}

const salvarResponsavel = () => {
  if (modoEdicao.value && indexEdicao.value !== null) {
    responsaveis.value[indexEdicao.value] = { ...responsavelAtual.value }
  } else {
    responsaveis.value.push({ ...responsavelAtual.value })
  }
  showModal.value = false
  modoEdicao.value = false
  indexEdicao.value = null
}

const visualizarResponsavel = (responsavel) => {
  router.push({
    name: 'cliente-detalhes',
    params: {
      idResponsavel: responsavel.idResponsavel,
      idAprendente: responsavel.idAprendente || undefined, // se for falsy, não envia
    },
  })
}

function formatarTelefone(telefone: string): string {
  return telefone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3')
}

const confirmarInativacao = (responsavel: Responsavel) => {
  responsavelParaInativar.value = cliente
  dialogConfirmacao.value = true
}
</script>
