import { defineStore } from 'pinia'
import { ref } from 'vue'
// @ts-ignore
import supabase from '@/config/supabase'
import { AgendamentoService } from '@/services/AgendamentoService'
import type Agendamento from '@/models/Agendamento'
import { ResponsavelService } from '@/services/responsavelService'

const agendamentoService = new AgendamentoService()
export const useStoreCalendario = defineStore('calendario', () => {
  const responsavelService = new ResponsavelService()
  const loading = ref(false)
  const agendamentos = ref<any[]>([])

  const loadAgendamentos = async (): Promise<void> => {
    loading.value = true
    try {
      agendamentos.value = (await agendamentoService.getAllAgendamentos()) ?? []
      const responsaveis = await responsavelService.loadResponsaveis()
      agendamentos.value.forEach((agendamento: any) => {
        agendamento.responsavel_id = responsaveis.find(
          (responsavel) => responsavel.id === agendamento.responsavel_id,
        )
      })
    } catch (err) {
      console.log(err)
    } finally {
      loading.value = false
    }
  }

  const loadAgendamentosPorMes = async (mes: number, ano: number): Promise<void> => {
    loading.value = true
    try {
      agendamentos.value = (await agendamentoService.getAgendamentosPorMes(mes, ano)) ?? []
      const responsaveis = await responsavelService.loadResponsaveis()
      agendamentos.value.forEach((agendamento: any) => {
        agendamento.responsavel_id = responsaveis.find(
          (responsavel) => responsavel.id === agendamento.responsavel_id,
        )
      })
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
    loadAgendamentosPorMes
  }
})
