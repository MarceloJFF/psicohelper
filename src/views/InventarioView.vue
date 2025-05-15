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

        <template #[`item.preco`]="{ item }">
          {{ formatarPreco(item.preco) }}
        </template>

        <template #[`item.status`]="{ item }">
          <v-chip :color="item.status ? 'green' : 'grey'" class="text-white">
            {{ item.status ? 'Ativo' : 'Inativo' }}
          </v-chip>
        </template>

        <template #[`item.actions`]="{ item }">
          <v-btn icon="mdi-pencil" @click="openDialog(item)" variant="text" />
          <v-btn
            :icon="item.status ? 'mdi-cancel' : 'mdi-check-circle-outline'"
            @click="alternarStatus(item)"
            :color="item.status ? 'orange' : 'green'"
            variant="text"
          />
          <v-btn icon="mdi-delete" color="red" variant="text" @click="excluirRecurso(item)" />
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
          <v-textarea v-model="recursoAtual.observacao" label="Observação" rows="2" />
          <v-text-field v-model="recursoAtual.tipo" label="Tipo (Jogo, Livro, etc)" />
          <v-text-field v-model.number="recursoAtual.preco" label="Preço de Compra" prefix="R$" type="number" />
          <v-text-field v-model.number="recursoAtual.quantidade" label="Quantidade" type="number" />
          <v-text-field v-model="recursoAtual.dataCompra" label="Data da Compra" type="date" />
          <v-switch v-model="recursoAtual.habilitarDespesa" label="Habilitar como Despesa?" color="purple" />
          <v-switch v-model="recursoAtual.status" label="Ativo?" color="green" />
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

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RecursoService } from '@/services/RecursoService'
import type Recurso from '@/models/Recurso'
import { useStoreProfissional } from '@/stores/storeProfissional'

const headers = [
  { title: 'Nome', key: 'nome' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Descrição', key: 'observacao' },
  { title: 'Preço', key: 'preco' },
  { title: 'Quantidade', key: 'quantidade' },
  { title: 'Status', key: 'status' },
  { title: 'Ações', key: 'actions', sortable: false }
]

const recursoService = new RecursoService()
const storeProfissional = useStoreProfissional()
const recursos = ref<Recurso[]>([])
const dialog = ref(false)
const recursoAtual = ref<Partial<Recurso>>({})
const search = ref('')

async function carregarRecursos() {
  recursos.value = await recursoService.listarRecursos()
}

onMounted(() => {
  if (storeProfissional.profissionalDetails?.id) {
    carregarRecursos()
  } else {
    // Aguarda o profissional ser carregado
    const stop = storeProfissional.$subscribe((mutation, state) => {
      if (state.profissionalDetails?.id) {
        carregarRecursos()
        stop()
      }
    })
  }
})

function openDialog(recurso: Partial<Recurso> | null = null) {
  recursoAtual.value = recurso
    ? { ...recurso }
    : {
        nome: '',
        tipo: '',
        observacao: '',
        preco: 0,
        quantidade: 1,
        status: true,
        dataCompra: '',
        habilitarDespesa: false
      }
  dialog.value = true
}

function fecharDialog() {
  dialog.value = false
}

async function salvarRecurso() {
  if (recursoAtual.value.id) {
    const atualizado = await recursoService.atualizarRecurso(recursoAtual.value as Recurso)
    if (atualizado) {
      const idx = recursos.value.findIndex(r => r.id === atualizado.id)
      if (idx !== -1) recursos.value[idx] = atualizado
    }
  } else {
    const criado = await recursoService.criarRecurso(recursoAtual.value)
    if (criado) recursos.value.push(criado)
  }
  fecharDialog()
}

async function alternarStatus(recurso: Recurso) {
  await recursoService.alternarStatus(recurso.id, !recurso.status)
  recurso.status = !recurso.status
}

async function excluirRecurso(recurso: Recurso) {
  if (confirm(`Deseja excluir o recurso "${recurso.nome}"?`)) {
    await recursoService.excluirRecurso(recurso.id)
    recursos.value = recursos.value.filter(r => r.id !== recurso.id)
  }
}

function formatarPreco(valor: number) {
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
