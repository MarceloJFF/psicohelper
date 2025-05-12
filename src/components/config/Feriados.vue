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
      :loading="loading"
    >
      <template #[`item.data_feriado`]="{ item }">
        {{ formatDate(item.data_feriado) }}
      </template>
      <template #[`item.actions`]="{ item }">
        <v-btn icon color="purple" @click="openDialog(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon color="red-darken-2" @click="confirmDelete(item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Diálogo de Edição -->
    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card class="pa-4 rounded-lg">
        <v-card-title class="text-h6 font-weight-bold text-purple-darken-3">
          {{ editedItem.id ? 'Editar Feriado' : 'Novo Feriado' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="formRef" @submit.prevent="submit" v-model="valid">
            <v-text-field
              v-model="editedItem.descricao"
              label="Nome do Feriado"
              :rules="[v => !!v || 'Campo obrigatório']"
              variant="outlined"
              color="purple-darken-3"
              class="mb-3"
              rounded
            />
            <v-text-field
              v-model="editedItem.data_feriado"
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
          <v-btn color="purple-darken-3" @click="submit" class="rounded-lg" :loading="loading">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de Confirmação -->
    <v-dialog v-model="dialogDelete" max-width="400">
      <v-card class="pa-4 rounded-lg">
        <v-card-title class="text-h6 font-weight-bold text-purple-darken-3">
          Confirmar Exclusão
        </v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir este feriado?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="dialogDelete = false">Cancelar</v-btn>
          <v-btn color="red-darken-2" @click="deleteFeriado" :loading="loading">
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStoreConfig } from '@/stores/storeConfig'
import { useStoreAuth } from '@/stores/storeAuth'
import type { VForm } from 'vuetify/components'

interface Feriado {
  id: string
  descricao: string
  data_feriado: string
  id_config: string
}

const storeConfig = useStoreConfig()
const storeAuth = useStoreAuth()

const headers = [
  { title: 'Nome do Feriado', key: 'descricao' },
  { title: 'Data', key: 'data_feriado' },
  { title: 'Ações', key: 'actions', sortable: false },
]

const dialog = ref(false)
const dialogDelete = ref(false)
const valid = ref(false)
const formRef = ref<VForm | null>(null)
const loading = ref(false)
const feriadoToDelete = ref('')
const feriados = ref<Feriado[]>([])

const editedItem = ref<Feriado>({
  id: '',
  descricao: '',
  data_feriado: '',
  id_config: ''
})

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

async function loadFeriados() {
  loading.value = true
  try {
    if (!storeConfig.configuracao?.id) {
      showMessage('Configuração não encontrada. Por favor, configure seu perfil primeiro.', 'error')
      return
    }

    await storeConfig.loadFeriados()
    feriados.value = storeConfig.feriados
  } catch (error) {
    console.error('Erro ao carregar feriados:', error)
    showMessage('Erro ao carregar feriados', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    if (!storeAuth.userDetails.id) {
      showMessage('Usuário não autenticado', 'error')
      return
    }

    await storeConfig.loadConfiguracao(storeAuth.userDetails.id)
    if (!storeConfig.configuracao?.id) {
      showMessage('Configuração não encontrada. Por favor, configure seu perfil primeiro.', 'error')
      return
    }

    await loadFeriados()
  } catch (error) {
    console.error('Erro ao inicializar:', error)
    showMessage('Erro ao inicializar o componente', 'error')
  }
})

function formatDate(date: string) {
  if (!date) return ''
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

function openDialog(item: Feriado | null = null) {
  if (item) {
    editedItem.value = { ...item }
  } else {
    editedItem.value = {
      id: '',
      descricao: '',
      data_feriado: '',
      id_config: storeConfig.configuracao?.id || ''
    }
  }
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
  editedItem.value = {
    id: '',
    descricao: '',
    data_feriado: '',
    id_config: ''
  }
}

function confirmDelete(id: string) {
  feriadoToDelete.value = id
  dialogDelete.value = true
}

async function submit() {
  if (!formRef.value) return
  
  const { valid } = await formRef.value.validate()
  if (!valid) return

  if (!storeConfig.configuracao?.id) {
    showMessage('Configuração não encontrada. Por favor, configure seu perfil primeiro.', 'error')
    return
  }

  loading.value = true
  try {
    const feriadoToSave = {
      ...editedItem.value,
      id_config: storeConfig.configuracao.id
    }

    if (feriadoToSave.id) {
      await storeConfig.updateFeriado(feriadoToSave)
      showMessage('Feriado atualizado com sucesso!', 'success')
    } else {
      await storeConfig.addFeriado(feriadoToSave)
      showMessage('Feriado adicionado com sucesso!', 'success')
    }
    await loadFeriados()
    closeDialog()
  } catch (error) {
    console.error('Erro ao salvar feriado:', error)
    showMessage('Erro ao salvar feriado', 'error')
  } finally {
    loading.value = false
  }
}

async function deleteFeriado() {
  if (!feriadoToDelete.value) return

  loading.value = true
  try {
    await storeConfig.deleteFeriado(feriadoToDelete.value)
    showMessage('Feriado excluído com sucesso!', 'success')
    dialogDelete.value = false
    await loadFeriados()
  } catch (error) {
    console.error('Erro ao excluir feriado:', error)
    showMessage('Erro ao excluir feriado', 'error')
  } finally {
    loading.value = false
  }
}

function showMessage(message: string, color: 'success' | 'error') {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true
}
</script>

<style scoped>
.v-data-table {
  background-color: #fefefe;
}
</style>
