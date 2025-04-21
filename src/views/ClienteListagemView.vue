<template>
  <v-layout class="fill-height">
    <!-- Conteúdo principal -->
    <v-main>
      <v-container fluid class="pa-6">
        <v-row class="fill-height">
          <!-- Coluna principal (clientes) -->
          <v-col cols="8" md="9" class="d-flex flex-column">
            <!-- Cabeçalho -->
            <v-card
              flat
              class="mb-4 pa-4 d-flex align-center  bg-grey-lighten-3 elevation-1 rounded"
            >
              <v-row class="d-flex justify-end align-center w-100" >
            <v-col cols="6">
                <div class="text-h6 font-weight-medium d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-account-group</v-icon>
                Listagem de Clientes
              </div>
            </v-col>
              <!-- Área de busca e botão -->
                <v-col cols="5">
                  <v-text-field
                    v-model="search"
                    density="compact"
                    label="Buscar clientes"
                    prepend-inner-icon="mdi-magnify"
                    variant="solo-filled"
                    hide-details
                    class="bg-white rounded"
                    style="max-width: 600px;"
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

            <!-- Tabela preenchendo o restante da altura -->
            <v-card class="flex-grow-1 overflow-hidden elevation-2 rounded-lg bg-grey-lighten-4">
              <v-data-table
                :items="clientes"
                :search="search"
                :headers="headers"
                :items-per-page="5"
                density="compact"
                class="h-100 v-data-table--bordered body-2 pa-6"
              >
                <!-- Status como chip -->
                <template v-slot:item.status="{ item }">
                  <v-chip
                    :color="item.status === 'Ativo' ? 'green' : 'grey'"
                    text-color="white"
                    size="small"
                    class="text-uppercase"
                  >
                    {{ item.status }}
                  </v-chip>
                </template>

                <!-- Ações -->
                <template v-slot:item.acoes="{ item ,index}">
                  <v-btn icon color="red" variant="text" title="Inativar">
                    <v-icon>mdi-close-circle</v-icon>
                  </v-btn>
                  <v-btn icon color="blue" variant="text" title="Editar" @click="abrirModalEdicao(item, index)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon color="green" variant="text" title="Visualizar" @click="visualizarCliente(item)">
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card>
          </v-col>

          <!-- Coluna lateral (to-do + calendário) -->
          <v-col cols="4" md="3" class="d-flex flex-column">
            <todo class="mb-3" />
            <calendario-diario class="flex-grow-1" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <ModalGenerico v-model="showModal" :title="modoEdicao ? 'Editar Cliente' : 'Cadastrar Novo Cliente'">
      <template #content>
        <v-form>
          <v-text-field v-model="clienteAtual.nome" label="Nome" />
          <v-text-field v-model="clienteAtual.grupo" label="Grupo" />
          <v-text-field v-model="clienteAtual.contatos" label="Contatos" />
          <v-select
            v-model="clienteAtual.status"
            :items="['Ativo', 'Inativo']"
            label="Status"
          />
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
import { ref } from 'vue'
import { useRouter } from 'vue-router';

import CalendarioDiario from '@/components/calendario-diario.vue'
import Todo from '@/components/todo.vue'
import ModalGenerico from '@/components/ModalGenerico.vue'
const showModal = ref(false)
const modoEdicao = ref(false)
const indexEdicao = ref<number | null>(null)
const router = useRouter();
const newCliente = ref({
  nome: '',
  grupo: '',
  contatos: '',
  status: 'Ativo'
})

const clienteAtual = ref({
  nome: '',
  grupo: '',
  contatos: '',
  status: 'Ativo'
})

const abrirModalNovo = () => {
  router.push("/clientes/add")
}

const abrirModalEdicao = (item: any, index: number) => {
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


const saveCliente = () => {
  clientes.value.push({ ...newCliente.value })
  showModal.value = false
  newCliente.value = { nome: '', grupo: '', contatos: '', status: 'Ativo' }
}

const search = ref('')

const headers = [
  { title: 'Nome', key: 'nome' },
  { title: 'Grupo', key: 'grupo' },
  { title: 'Status', key: 'status' },
  { title: 'Contatos', key: 'contatos' },
  { title: 'Ações', key: 'acoes', sortable: false },
]

const clientes = ref([
  { nome: 'Ana Souza', grupo: 'Premium', status: 'Ativo', contatos: 'ana@email.com / (11) 99999-0001' },
  { nome: 'Carlos Lima', grupo: 'Padrão', status: 'Inativo', contatos: 'carlos@email.com / (11) 98888-0002' },
  { nome: 'Beatriz Silva', grupo: 'VIP', status: 'Ativo', contatos: 'bia@email.com / (11) 97777-0003' },
])
const visualizarCliente = (cliente: any) => {
  router.push({
    name: 'cliente-detalhes',
    params: { id: cliente.nome }, // ou outro ID real
    query: {
      nome: cliente.nome,
      grupo: cliente.grupo,
      contatos: cliente.contatos,
      status: cliente.status
    }
  })
}

</script>
