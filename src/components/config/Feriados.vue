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
      <template #item.data="{ item }">
        {{ formatDate(item.data) }}
      </template>
      <template #item.actions="{ item }">
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
          <v-form ref="formRef" @submit.prevent="saveFeriado" v-model="valid">
            <v-text-field
              v-model="editedItem.label"
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
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import supabase from '@/config/supabase'

const storeConfig = useStoreConfig()
const storeAuth = useStoreAuth()

const headers = [
  { title: 'Nome do Feriado', key: 'label' },
  { title: 'Data', key: 'data' },
  { title: 'Ações', key: 'actions', sortable: false },
]

const dialog = ref(false)
const dialogDelete = ref(false)
const valid = ref(false)
const formRef = ref(null)
const loading = ref(false)
const feriadoToDelete = ref('')
const feriados = ref([])

const editedItem = ref({
  id: '',
  label: '',
  data: '',
  id_config: ''
})

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

async function loadFeriados() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('config_feriados')
      .select('*')
      .eq('id_config', storeConfig.configuracao?.id)

    if (error) throw error
    feriados.value = data || []
  } catch (error) {
    showMessage('Erro ao carregar feriados', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await storeConfig.loadConfiguracao(storeAuth.userDetails.id)
  await loadFeriados()
})

function formatDate(date: string) {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
}

function openDialog(item = null) {
  if (item) {
    editedItem.value = { ...item }
  } else {
    editedItem.value = {
      id: '',
      label: '',
      data: '',
      id_config: storeConfig.configuracao?.id || ''
    }
  }
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
  editedItem.value = {
    id: '',
    label: '',
    data: '',
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

  loading.value = true
  try {
    if (editedItem.value.id) {
      const { error } = await supabase
        .from('config_feriados')
        .update({
          label: editedItem.value.label,
          data: editedItem.value.data
        })
        .eq('id', editedItem.value.id)

      if (error) throw error
      showMessage('Feriado atualizado com sucesso!', 'success')
    } else {
      const { error } = await supabase
        .from('config_feriados')
        .insert([{
          label: editedItem.value.label,
          data: editedItem.value.data,
          id_config: storeConfig.configuracao?.id
        }])

      if (error) throw error
      showMessage('Feriado adicionado com sucesso!', 'success')
    }
    await loadFeriados()
    closeDialog()
  } catch (error) {
    showMessage('Erro ao salvar feriado', 'error')
  } finally {
    loading.value = false
  }
}

async function deleteFeriado() {
  loading.value = true
  try {
    const { error } = await supabase
      .from('config_feriados')
      .delete()
      .eq('id', feriadoToDelete.value)

    if (error) throw error
    showMessage('Feriado excluído com sucesso!', 'success')
    dialogDelete.value = false
    await loadFeriados()
  } catch (error) {
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
