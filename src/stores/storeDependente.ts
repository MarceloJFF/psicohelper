import { ref } from 'vue'
import { defineStore } from 'pinia'
import supabase from '/src/config/supabase'
import { useShowErrorMessage } from '/src/userCases/useShowErrorMessage'
import Dependente from '@/models/Aprendente'

export const useStoreDependente = defineStore('dependente', () => {
  // state
  const dependentes = ref<Dependente[]>([])
  const isLoading = ref(false)

  const { showError } = useShowErrorMessage()

  // actions
  const loadDependentes = async (idCliente: string) => {
    isLoading.value = true
    try {
      const { data, error } = await supabase
        .from('tb_dependente')
        .select('*')
        .eq('id_cliente', idCliente)

      if (error) throw error
      dependentes.value = data as Dependente[]
    } catch (err: any) {
      showError(err.message || 'Erro ao carregar dependentes')
    } finally {
      isLoading.value = false
    }
  }

  const addDependente = async (dependente: Dependente) => {
    try {
      const { error } = await supabase
        .from('tb_dependente')
        .insert([{
          id: dependente.id,
          nome_dependente: dependente.nomeDependente,
          id_cliente: dependente.idCliente,
          nascimento: dependente.nascimento,
          sexo: dependente.sexo
        }])

      if (error) throw error
      await loadDependentes(dependente.idCliente)
    } catch (err: any) {
      showError(err.message || 'Erro ao adicionar dependente')
    }
  }

  const updateDependente = async (dependente: Dependente) => {
    try {
      const { error } = await supabase
        .from('tb_dependente')
        .update({
          nome_dependente: dependente.nomeDependente,
          nascimento: dependente.nascimento,
          sexo: dependente.sexo
        })
        .eq('id', dependente.id)

      if (error) throw error
      await loadDependentes(dependente.idCliente)
    } catch (err: any) {
      showError(err.message || 'Erro ao atualizar dependente')
    }
  }

  const deleteDependente = async (id: string, idCliente: string) => {
    try {
      const { error } = await supabase
        .from('tb_dependente')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadDependentes(idCliente)
    } catch (err: any) {
      showError(err.message || 'Erro ao remover dependente')
    }
  }

  const clearDependentes = () => {
    dependentes.value = []
  }

  return {
    dependentes,
    isLoading,
    loadDependentes,
    addDependente,
    updateDependente,
    deleteDependente,
    clearDependentes
  }
})
