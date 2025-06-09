<template>
  <v-card class="pa-6" elevation="2" width="100%">
    <v-card-title class="text-h6 font-weight-bold pb-4">Lembretes do Dia</v-card-title>

    <div class="mb-2 font-weight-medium">
      {{ currentDate }}
    </div>

    <!-- Container com scroll -->
    <div class="task-list-container" style="max-height: 300px; overflow-y: auto;">
      <div v-for="(lembrete, index) in lembretes" :key="lembrete.id" class="d-flex align-center mb-2">
        <v-checkbox
          v-model="lembrete.feito"
          :label="lembrete.descricao"
          hide-details
          density="compact"
          class="flex-grow-1"
          @change="updateLembrete(lembrete)"
        />
        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
            <v-icon
              v-bind="props"
              size="small"
              class="mr-1"
              :color="getTimeColor(lembrete.data_expiracao)"
            >
              mdi-clock-outline
            </v-icon>
          </template>
          <span>{{ formatTime(lembrete.data_expiracao) }}</span>
        </v-tooltip>
        <v-btn icon color="grey-darken-1" variant="text" @click="confirmDelete(lembrete)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Adicionar lembrete -->
    <div class="d-flex align-center mb-4">
      <v-text-field
        v-model="novoLembrete.descricao"
        label="Novo lembrete"
        hide-details
        density="compact"
        variant="underlined"
        class="mr-2"
        style="flex: 1"
      />
      <v-menu
        v-model="timePickerMenu"
        :close-on-content-click="false"
        transition="scale-transition"
      >
        <template v-slot:activator="{ props }">
          <v-text-field
            v-bind="props"
            v-model="novoLembrete.data_expiracao"
            label="Horário"
            prepend-icon="mdi-clock-outline"
            readonly
            density="compact"
            style="max-width: 120px"
            class="mr-2"
          />
        </template>
        <v-time-picker
          v-model="novoLembrete.data_expiracao"
          format="24hr"
          @click:save="timePickerMenu = false"
        />
      </v-menu>
      <v-btn icon color="primary" @click="addLembrete" :disabled="!isNovoLembreteValid">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </div>

    <!-- Barra de progresso -->
    <div class="text-caption mb-1">Progresso</div>
    <v-progress-linear :model-value="progress" height="6" color="primary" rounded></v-progress-linear>
    <div class="text-caption text-right mt-1">{{ Math.round(progress) }}%</div>

    <!-- Dialog de confirmação -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirmar exclusão</v-card-title>
        <v-card-text>Tem certeza que deseja remover este lembrete?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="red" text @click="deleteLembrete">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { LembreteService } from '@/services/LembreteService'
import { useStoreProfissional } from '@/stores/storeProfissional'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'

const lembreteService = new LembreteService()
const storeProfissional = useStoreProfissional()
const showError = useShowErrorMessage().showError

interface Lembrete {
  id?: string
  descricao: string
  data_expiracao: string
  feito: boolean
  cancelado?: boolean
  idProfissional: string
  data_conclusao?: string | null
}

// Estado
const lembretes = ref<Lembrete[]>([])
const novoLembrete = ref<Omit<Lembrete, 'id' | 'feito' | 'cancelado'>>({
  descricao: '',
  data_expiracao: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  idProfissional: storeProfissional.profissionalDetails.id
})
const timePickerMenu = ref(false)
const deleteDialog = ref(false)
const lembreteToDelete = ref<string | null>(null)

// Computed
const currentDate = computed(() => {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).replace(/^\w/, c => c.toUpperCase())
})

const progress = computed(() => {
  const total = lembretes.value.length
  const done = lembretes.value.filter(l => l.feito).length
  return total ? (done / total) * 100 : 0
})

const isNovoLembreteValid = computed(() => {
  return novoLembrete.value.descricao.trim() && novoLembrete.value.data_expiracao
})

// Métodos
const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getTimeColor = (isoString: string) => {
  const now = new Date()
  const lembreteTime = new Date(isoString)
  const diffHours = (lembreteTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (diffHours < 0) return 'red'
  if (diffHours < 1) return 'orange'
  return 'green'
}

const loadLembretes = async () => {
  try {
    const hoje = new Date();
    const result = await lembreteService.buscarLembretesPorData(
      storeProfissional.profissionalDetails.id,
      hoje
    )

    if (result) {
      lembretes.value = result
    }
  } catch (error) {
    showError('Erro ao carregar lembretes')
  }
}

const addLembrete = async () => {
  try {
    // Criar data completa com a data de hoje e o horário selecionado
    const hoje = new Date();
    const dataCompleta = `${hoje}T${novoLembrete.value.data_expiracao}:00`

    const lembrete: Lembrete = {
      descricao: novoLembrete.value.descricao,
      data_expiracao: hoje,
      feito: false,
      idProfissional: storeProfissional.profissionalDetails.id
    }

    const id = await lembreteService.criarLembrete(lembrete)
    if (id) {
      lembrete.id = id
      lembretes.value.push(lembrete)
      novoLembrete.value.descricao = ''
    }
  } catch (error) {
    showError('Erro ao criar lembrete')
  }
}

const updateLembrete = async (lembrete: Lembrete) => {
  try {
    lembrete.data_conclusao = lembrete.feito ? new Date().toISOString() : null
    await lembreteService.atualizarLembrete(lembrete)
  } catch (error) {
    // Reverte a mudança se houver erro
    lembrete.feito = !lembrete.feito
    showError('Erro ao atualizar lembrete')
  }
}

const confirmDelete = (lembrete: Lembrete) => {
  lembreteToDelete.value = lembrete.id!
  deleteDialog.value = true
}

const deleteLembrete = async () => {
  try {
    if (lembreteToDelete.value) {
      await lembreteService.deletarLembrete(
        lembreteToDelete.value,
        storeProfissional.profissionalDetails.id
      )
      lembretes.value = lembretes.value.filter(l => l.id !== lembreteToDelete.value)
    }
  } catch (error) {
    showError('Erro ao remover lembrete')
  } finally {
    deleteDialog.value = false
    lembreteToDelete.value = null
  }
}

// Lifecycle
onMounted(() => {
  loadLembretes()
})
</script>

<style scoped>
.task-list-container {
  max-height: 150px;
  overflow-y: auto;
}
</style>
