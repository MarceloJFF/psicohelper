<template>
  <v-card class="pa-6 max-w-5xl mx-auto mt-10 rounded-xl shadow-lg" color="#f5f3ff">
    <v-card-title class="text-h5 font-weight-bold text-purple-darken-3 mb-4">
      🎉 Gerenciador de Feriados
    </v-card-title>

    <div class="d-flex justify-end mb-4">
      <v-btn color="purple-darken-3" @click="openDialog()" prepend-icon="mdi-plus" class="rounded-lg">
        Novo Feriado
      </v-btn>
    </div>

    <v-data-table
      :headers="headers"
      :items="feriados"
      item-value="id"
      class="rounded-lg elevation-2"
      hide-default-footer
    >
      <template #item.actions="{ item }">
        <v-btn icon color="purple" @click="openDialog(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon color="red-darken-2" @click="deleteFeriado(item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Diálogo -->
    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card class="pa-4 rounded-lg">
        <v-card-title class="text-h6 font-weight-bold text-purple-darken-3">
          {{ editedItem.id ? 'Editar Feriado' : 'Novo Feriado' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="formRef" @submit.prevent="saveFeriado" v-model="valid">
            <v-text-field
              v-model="editedItem.nome"
              label="Nome do Feriado"
              :rules="[v => !!v || 'Campo obrigatório']"
              variant="outlined"
              color="purple-darken-3"
              class="mb-3"
              rounded
            />
            <v-text-field
              v-model="editedItem.data"
              label="Data"
              type="date"
              :rules="[v => !!v || 'Campo obrigatório']"
              variant="outlined"
              color="purple-darken-3"
              rounded
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="closeDialog">Cancelar</v-btn>
          <v-btn color="purple-darken-3" @click="submit" class="rounded-lg">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

const feriados = ref([
  { id: 1, nome: 'Ano Novo', data: '2025-01-01' },
  { id: 2, nome: 'Carnaval', data: '2025-02-25' },
])

const headers = [
  { title: 'Nome do Feriado', value: 'nome' },
  { title: 'Data', value: 'data' },
  { title: 'Ações', value: 'actions', sortable: false },
]

const dialog = ref(false)
const valid = ref(false)
const formRef = ref(null)

const editedItem = ref({ id: null, nome: '', data: '' })

function openDialog(item = null) {
  if (item) {
    editedItem.value = { ...item }
  } else {
    editedItem.value = { id: null, nome: '', data: '' }
  }
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
}

function submit() {
  formRef.value?.validate().then((isValid) => {
    if (isValid) saveFeriado()
  })
}

function saveFeriado() {
  const item = editedItem.value
  if (item.id) {
    const index = feriados.value.findIndex(f => f.id === item.id)
    if (index !== -1) feriados.value[index] = { ...item }
  } else {
    item.id = Date.now()
    feriados.value.push({ ...item })
  }
  closeDialog()
}

function deleteFeriado(id) {
  feriados.value = feriados.value.filter(f => f.id !== id)
}
</script>

<style scoped>
.v-data-table {
  background-color: #fefefe;
}
</style>
