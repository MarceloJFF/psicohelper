import { defineStore } from 'pinia'
import { ref } from 'vue'
// @ts-ignore
import supabase from '@/config/supabase'
import { AgendamentoService } from '@/services/AgendamentoService'
import type Agendamento from '@/models/Agendamento'

const agendamentoService = new AgendamentoService()

export const useStoreCalendario = defineStore('calendario', () => {
  const loading = ref(false)
  const agendamentos = ref<any[]>([])

  const loadAgendamentos = async (): Promise<void> => {
    loading.value = true
    try {
      agendamentos.value = (await agendamentoService.getAllAgendamentos()) ?? []
    } catch (err) {
      console.log(err)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    agendamentos: agendamentos,
    loadAgendamentos,
  }
})
