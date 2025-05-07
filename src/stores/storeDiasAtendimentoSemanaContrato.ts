import { ref } from 'vue'
import { defineStore } from 'pinia'
import supabase from '/src/config/supabase'
import { useShowErrorMessage } from '/src/userCases/useShowErrorMessage'
import  DiasAtendimentoContrato from '@/models/DiasAtendimentoContrato'

export const useStoreDiasAtendimento = defineStore('diasAtendimento', () => {
  const dias = ref<DiasAtendimentoContrato[]>([])
  const isLoading = ref(false)

  const { showError } = useShowErrorMessage()

  const loadDias = async (contratoId: string) => {
    isLoading.value = true
    try {
      const { data, error } = await supabase
        .from('tb_dias_atendimento')
        .select('*')
        .eq('contrato_id', contratoId)

      if (error) throw error
      dias.value = data as DiasAtendimentoContrato[]
    } catch (err: any) {
      showError(err.message || 'Erro ao carregar dias de atendimento')
    } finally {
      isLoading.value = false
    }
  }

  const addDia = async (dia: DiasAtendimentoContrato) => {
    try {
      const { error } = await supabase
        .from('tb_dias_atendimento')
        .insert([{
          id: dia.id,
          dia: dia.dia,
          inicio: dia.inicio,
          fim: dia.fim,
          contrato_id: dia.contratoId
        }])

      if (error) throw error
      await loadDias(dia.contratoId)
    } catch (err: any) {
      showError(err.message || 'Erro ao adicionar dia de atendimento')
    }
  }

  const updateDia = async (dia: DiasAtendimentoContrato) => {
    try {
      const { error } = await supabase
        .from('tb_dias_atendimento')
        .update({
          dia: dia.dia,
          inicio: dia.inicio,
          fim: dia.fim
        })
        .eq('id', dia.id)

      if (error) throw error
      await loadDias(dia.contratoId)
    } catch (err: any) {
      showError(err.message || 'Erro ao atualizar dia de atendimento')
    }
  }

  const deleteDia = async (id: string, contratoId: string) => {
    try {
      const { error } = await supabase
        .from('tb_dias_atendimento')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadDias(contratoId)
    } catch (err: any) {
      showError(err.message || 'Erro ao remover dia de atendimento')
    }
  }

  const clearDias = () => {
    dias.value = []
  }

  return {
    dias,
    isLoading,
    loadDias,
    addDia,
    updateDia,
    deleteDia,
    clearDias
  }
})
