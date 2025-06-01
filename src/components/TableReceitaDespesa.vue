<template>
  <v-data-table
    v-model:items-per-page="itemsPerPage"
    :headers="headers"
    :items="dados"
    :search="search"
    item-value="tipo"
    class="elevation-2 rounded pa-4"
  >
    <!-- Coluna AÇÕES com ícones -->
    <template #item.acoes="{ item }">
      <v-icon
        size="small"
        class="me-2"
        color="primary"
        @click="editarItem(item)"
        style="cursor: pointer;"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        size="small"
        color="red"
        @click="excluirItem(item)"
        style="cursor: pointer;"
      >
        mdi-delete
      </v-icon>
    </template>

    <!-- Coluna SELECIONAR -->
    <template #item.selecionar="{ item }">
      <v-checkbox
        v-model="selecionados"
        :value="item.id"
        density="compact"
        hide-details
      />
    </template>

    <!-- Coluna PAGA personalizada -->
    <template #item.paga="{ item }">
      <span>{{ item.paga }}</span>
      <v-tooltip v-if="!item.paga" location="top">
        <template #activator="{ props }">
          <v-icon
            v-bind="props"
            icon="mdi-whatsapp"
            color="green"
            class="ms-2"
            style="cursor: pointer;"
          />
        </template>
        <span>Enviar mensagem de cobrança</span>
      </v-tooltip>
      <v-tooltip v-else location="top">
        <template #activator="{ props }">
          <v-icon
            v-bind="props"
            icon="mdi-whatsapp"
            color="green"
            class="ms-2"
            style="cursor: pointer;"
          />
        </template>
        <span>Enviar mensagem de confirmação de pagamento</span>
      </v-tooltip>
    </template>
  </v-data-table>
</template>

<script setup>
import { ref } from 'vue'

const dados = [
  {
    id: 1,
    tipo: 'Serviços de Psicopedagogia',
    categoria: 'Contrato 1',
    recorrente: 'Sim',
    paga: true,
    vencimento: '2025-03-06',
    tipoLancamento: 'receita',
    valor: 1500.0,
  },
  {
    id: 2,
    tipo: 'Material Didático',
    categoria: 'Material',
    recorrente: 'Não',
    paga: false,
    vencimento: '2025-03-10',
    tipoLancamento: 'despesa',
    valor: 420.04,
  },
  {
    id: 3,
    tipo: 'Consulta Avulsa',
    categoria: 'Serviços Avulsos',
    recorrente: 'Não',
    paga: true,
    vencimento: '2025-03-12',
    tipoLancamento: 'receita',
    valor: 350.0,
  },
]

const itemsPerPage = ref(5)
const search = ref('')
const selecionados = ref([])

const headers = ref([
  { title: 'Tipo', key: 'tipo', align: 'start' },
  { title: 'Categoria', key: 'categoria' },
  { title: 'Recorrente', key: 'recorrente' },
  { title: 'Paga', key: 'paga' },
  { title: 'Vencimento', key: 'vencimento' },
  { title: 'Ações', key: 'acoes', sortable: false },
  { title: 'Selecionar', key: 'selecionar', sortable: false },
])

function editarItem(item) {
  alert(`Editar item: ${item.tipo}`)
}

function excluirItem(item) {
  alert(`Excluir item: ${item.tipo}`)
}
</script>

<style scoped>
/* Header da tabela com fundo azul e texto branco */
::v-deep thead tr {
  background-color: #1976D2;
  color: white;
}

/* Garante que os th mantenham cor branca mesmo em hover */
::v-deep thead th {
  color: white;
}

::v-deep thead tr:hover th {
  color: white;
}
</style>
