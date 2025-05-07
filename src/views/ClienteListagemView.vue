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
                  :items="clientes"
                  :search="search"
                  :headers="headers"
                  :items-per-page="5"
                  density="compact"
                  class="h-100 v-data-table--bordered body-2 pa-6"
                >
                  <template #item.acoes="{ item, index }">
                    <v-btn icon color="blue" variant="text" title="Editar" @click="abrirModalEdicao(item, index)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon color="green" variant="text" title="Visualizar" @click="visualizarCliente(item)">
                      <v-icon>mdi-eye</v-icon>
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
    </v-main>

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
  </v-layout>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ClienteService } from '@/services/clienteService'
import   Cliente from '@/models/Cliente'
import CalendarioDiario from '@/components/calendario-diario.vue'
import Todo from '@/components/todo.vue'
import ModalGenerico from '@/components/ModalGenerico.vue'

const storeCliente = new ClienteService()
const showModal = ref(false)
const modoEdicao = ref(false)
const indexEdicao = ref<number | null>(null)
const router = useRouter()
const search = ref('')
const loading = ref(true)

const clienteAtual = ref<Cliente>(new Cliente())

const abrirModalNovo = () => {
  router.push('/clientes/add')
}

const clientes = ref<Cliente[]>([])

const headers = [
  { title: 'Nome', key: 'nome_cliente' },
  { title: 'Telefone', key: 'telefone' },
  { title: 'Email', key: 'email' },
  { title: 'Tipo Atendimento', key: 'tipo_atendimento' },
  { title: 'Ações', key: 'acoes', sortable: false },
]

const loadClientes = async () => {
  loading.value = true
  try {
    clientes.value = await storeCliente.loadClientes()
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadClientes()
})

const abrirModalEdicao = (item: Cliente, index: number) => {
  clienteAtual.value = { ...item }
  indexEdicao.value = index
  modoEdicao.value = true
  showModal.value = true
}

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

const visualizarCliente = (cliente: Cliente) => {
  console.log('ID do cliente:', cliente.id)
  router.push({
    name: 'cliente-detalhes',
    params: { id: cliente.id },
  })
}
</script>



