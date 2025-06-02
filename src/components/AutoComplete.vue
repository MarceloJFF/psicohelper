<script setup lang="ts">
import { ref, watch } from 'vue'
import { AprendenteService } from '@/services/AprendenteService.ts'

interface Aprendente {
  id: string
  nomeAprendente: string
  responsavel: string
}

// Define o evento com objeto completo
const emit = defineEmits<{
  (e: 'update:aprendenteSelecionado', valor: Aprendente): void
}>()

const isLoading = ref(false)
const filtroPaciente = ref<Aprendente | null>(null)
const searchQuery = ref('')
const pacientes = ref<Aprendente[]>([])
const aprendenteService = new AprendenteService()

async function loadPacientes(nome: string) {
  isLoading.value = true
  try {
    const aprendentesModel = await aprendenteService.loadAprendentesPorProfissionalENome(nome)
    pacientes.value = aprendentesModel.map((aprendente) => ({
      id: aprendente.id,
      nomeAprendente: aprendente.nomeAprendente,
      responsavel: aprendente.nomeResponsavel
    }))
  } catch (err) {
    console.error('Erro ao carregar pacientes:', err)
  } finally {
    isLoading.value = false
  }
}

// Só busca se tiver pelo menos 3 caracteres
watch(searchQuery, (val) => {
  if (val.length < 3) {
    pacientes.value = []
    return
  }
  loadPacientes(val)
})

// Emite somente quando um aprendente for realmente selecionado
watch(filtroPaciente, (val) => {
  if (val) {
    emit('update:aprendenteSelecionado', val)
  }
})
</script>

<template>
  <v-autocomplete
    v-model="filtroPaciente"
    v-model:search="searchQuery"
    :items="pacientes"
    item-title="nomeAprendente"
    item-value="id"
    :loading="isLoading"
    clearable
    :filter="() => true"
    :menu-props="{ maxHeight: 400 }"
    :return-object="true"
    :custom-item="true"
    label="Digite aqui o nome do aprendente" />


</template>
