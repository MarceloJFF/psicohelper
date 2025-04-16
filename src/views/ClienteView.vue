<template>
  <v-container fluid class="pa-6 mt-10 mr-6" max-width="100%">
  <v-row>
    <v-col cols="10" md="9" >
      <!-- Cabeçalho -->
      <v-container max-width="90%">
        <v-card
          flat
          class="mb-6 pa-4 d-flex align-center justify-space-between bg-grey-lighten-3 elevation-1 rounded"
        >
          <div class="text-h6 font-weight-medium d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-account-group</v-icon>
            Listagem de Clientes
          </div>

          <v-text-field
            v-model="search"
            density="compact"
            label="Buscar clientes"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            hide-details
            class="bg-white rounded"
            style="max-width: 300px"
          />
        </v-card>

        <!-- Tabela -->
        <v-data-table
          :items="clientes"
          :search="search"
          :headers="headers"
          :items-per-page="5"
          density="small"
          class="elevation-2 rounded-lg bg-grey-lighten-4"
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
          <template v-slot:item.acoes="{ item }">
            <v-btn icon color="red" variant="text" title="Inativar">
              <v-icon>mdi-close-circle</v-icon>
            </v-btn>
            <v-btn icon color="blue" variant="text" title="Editar">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-container>

    </v-col>

    <v-col cols="2" md="3">
      <todo class="mb-16" />
      <calendario-diario></calendario-diario>
    </v-col>



  </v-row>

  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CalendarioDiario from '@/components/calendario-diario.vue'
import Todo from '@/components/todo.vue'

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
</script>
