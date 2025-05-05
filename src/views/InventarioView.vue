<template>
  <v-container class="py-6">
    <v-card elevation="3" class="rounded-2xl">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6 font-weight-bold">Recursos Pedagógicos</span>
        <v-btn color="primary" @click="openDialog()">
          <v-icon start>mdi-plus</v-icon>
          Novo Recurso
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="recursos"
        item-value="nome"
        :search="search"
        class="elevation-1"
      >
        <template #top>
          <v-text-field
            v-model="search"
            label="Pesquisar"
            prepend-inner-icon="mdi-magnify"
            class="mx-4 mt-4"
            hide-details
            density="comfortable"
          />
        </template>

        <template #item.preco="{ item }">
          {{ formatarPreco(item.preco) }}
        </template>

        <template #item.ativo="{ item }">
          <v-chip :color="item.ativo ? 'green' : 'grey'" class="text-white">
            {{ item.ativo ? 'Ativo' : 'Inativo' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" @click="openDialog(item)" variant="text" />
          <v-btn
            :icon="item.ativo ? 'mdi-cancel' : 'mdi-check-circle-outline'"
            @click="alternarStatus(item)"
            :color="item.ativo ? 'orange' : 'green'"
            variant="text"
          />
        </template>

        <template #no-data>
          <v-alert type="info" class="ma-4">Nenhum recurso encontrado.</v-alert>
        </template>
      </v-data-table>
    </v-card>

    <!-- Diálogo para Adicionar/Editar -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card class="rounded-xl">
        <v-card-title>{{ recursoAtual.id ? 'Editar Recurso' : 'Novo Recurso' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="recursoAtual.nome" label="Nome do Recurso" required />
          <v-textarea v-model="recursoAtual.descricao" label="Descrição" rows="2" />
          <v-text-field v-model="recursoAtual.tipo" label="Tipo (Jogo, Livro, etc)" />
          <v-text-field v-model="recursoAtual.local" label="Local de Aquisição" />
          <v-text-field
            v-model.number="recursoAtual.preco"
            label="Preço de Compra"
            prefix="R$"
            type="number"
          />
          <v-switch v-model="recursoAtual.ativo" label="Ativo?" color="green" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="fecharDialog">Cancelar</v-btn>
          <v-btn color="primary" @click="salvarRecurso">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const headers = [
  { title: 'Nome', key: 'nome' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Descrição', key: 'descricao' },
  { title: 'Preço', key: 'preco' },
  { title: 'Local', key: 'local' },
  { title: 'Status', key: 'ativo' },
  { title: 'Ações', key: 'actions', sortable: false }
]

const recursos = ref([
  {
    id: 1,
    nome: 'Jogo da Memória',
    tipo: 'Jogo',
    descricao: 'Trabalha atenção e memória visual.',
    preco: 45.5,
    local: 'Papelaria Alegria',
    ativo: true
  },
  {
    id: 2,
    nome: 'Livro: O Pequeno Príncipe',
    tipo: 'Livro',
    descricao: 'Desenvolve interpretação textual.',
    preco: 32.0,
    local: 'Livraria Cultura',
    ativo: true
  }
])

const dialog = ref(false)
const recursoAtual = ref({})
const search = ref('')

function openDialog(recurso = null) {
  recursoAtual.value = recurso
    ? { ...recurso }
    : {
      nome: '',
      tipo: '',
      descricao: '',
      preco: null,
      local: '',
      ativo: true
    }
  dialog.value = true
}

function fecharDialog() {
  dialog.value = false
}

function salvarRecurso() {
  if (recursoAtual.value.id) {
    const index = recursos.value.findIndex(r => r.id === recursoAtual.value.id)
    if (index !== -1) recursos.value[index] = { ...recursoAtual.value }
  } else {
    recursoAtual.value.id = Date.now()
    recursos.value.push({ ...recursoAtual.value })
  }
  fecharDialog()
}

function alternarStatus(recurso) {
  const index = recursos.value.findIndex(r => r.id === recurso.id)
  if (index !== -1) recursos.value[index].ativo = !recursos.value[index].ativo
}

function formatarPreco(valor) {
  return valor != null
    ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'R$ 0,00'
}
</script>

<style scoped>
.v-card-title {
  border-bottom: 1px solid #eee;
}
</style>
