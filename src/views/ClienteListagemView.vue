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
                    variant="solo-filled"
                    hide-details
                    class="bg-white rounded"
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
                    {{item}}
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
                    <v-btn icon @click="visualizarCliente(item)">
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
      <ModalGenerico v-model="showModal" :title="modoEdicao ? 'Editar Cliente' : 'Cadastrar Novo Cliente'">
        <template #content>
          <v-form>
            <v-text-field v-model="clienteAtual.nomeCliente" label="Nome" />
            <v-text-field v-model="clienteAtual.telefone" label="Telefone" />
            <v-text-field v-model="clienteAtual.email" label="Email" />
            <v-text-field v-model="clienteAtual.tipoAtendimento" label="Tipo de Atendimento" />
          </v-form>
        </template>
        <template #actions>
          <v-btn color="green" @click="salvarCliente">Salvar</v-btn>
          <v-btn color="grey" @click="showModal = false">Cancelar</v-btn>
        </template>
      </ModalGenerico>

      <!-- Dialogo de confirmação de inativação -->
      <v-dialog v-model="dialogConfirmacao" max-width="400">
        <v-card>
          <v-card-title class="text-h6">Confirmar inativação</v-card-title>
          <v-card-text>
            Tem certeza que deseja inativar o cliente <strong>{{ clienteParaInativar?.nomeCliente }}</strong>?
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
import { ClienteService } from '@/services/clienteService'
import Cliente from '@/models/Cliente'
import CalendarioDiario from '@/components/calendario-diario.vue'
import Todo from '@/components/todo.vue'
import ModalGenerico from '@/components/ModalGenerico.vue'

const clienteService = new ClienteService()
const showModal = ref(false)
const modoEdicao = ref(false)
const indexEdicao = ref<number | null>(null)
const router = useRouter()
const search = ref('')
const loading = ref(true)

const clienteAtual = ref<Cliente>(new Cliente())
const clienteParaInativar = ref<Cliente | null>(null)
const dialogConfirmacao = ref(false)

const abrirModalNovo = () => {
  router.push('/clientes/add')
}



const aprendentes = ref([])

onMounted(async () => {
  loading.value = true
  aprendentes.value = await clienteService.loadAprendentes()
  loading.value = false
})

const clientes = ref([])


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

const loadClientes = async () => {
  loading.value = true
  try {
    clientes.value = await clienteService.loadClientes()
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
  } finally {
    loading.value = false
  }
}



const abrirModalEdicao = (item: Cliente, index: number) => {
  clienteAtual.value = { ...item }
  indexEdicao.value = index
  modoEdicao.value = true
  showModal.value = true
}
// const visualizarCliente = (cliente: Cliente) => {
//   router.push({
//     name: 'cliente-detalhes',
//     params: { id: cliente.id },
//   })
// }

const salvarCliente = () => {
  if (modoEdicao.value && indexEdicao.value !== null) {
    clientes.value[indexEdicao.value] = { ...clienteAtual.value }
  } else {
    clientes.value.push({ ...clienteAtual.value })
  }
  showModal.value = false
  modoEdicao.value = false
  indexEdicao.value = null
}

const visualizarCliente = (cliente) => {
  router.push({
    name: 'cliente-detalhes',
    params: {
      idResponsavel: cliente.idResponsavel,
      idAprendente: cliente.idAprendente || undefined, // se for falsy, não envia
    },
  })
}

function formatarTelefone(telefone: string): string {
  return telefone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3')
}

const confirmarInativacao = (cliente: Cliente) => {
  clienteParaInativar.value = cliente
  dialogConfirmacao.value = true
}
</script>
