import { ref } from 'vue'
import { defineStore } from 'pinia'
import supabase from '/src/config/supabase'
import { useStoreProfissional } from '/src/stores/storeProfissional'
import { useShowErrorMessage } from '/src/userCases/useShowErrorMessage'
import  Contrato from '@/models/Contrato'

export const useStoreContrato = defineStore('contrato', () => {
  const contratos = ref<Contrato[]>([])
  const isLoading = ref(false)

  const { showError } = useShowErrorMessage()
  const storeProfissional = useStoreProfissional()

  const loadContratos = async (idCliente: string) => {
    isLoading.value = true
    try {
      const { data, error } = await supabase
        .from('tb_contrato')
        .select('*')
        .eq('id_cliente', idCliente)

      if (error) throw error
      contratos.value = data as Contrato[]
    } catch (err: any) {
      showError(err.message || 'Erro ao carregar contratos')
    } finally {
      isLoading.value = false
    }
  }

  const addContrato = async (contrato: Contrato) => {
    try {
      contrato.idProfissional = storeProfissional.profissional?.id || ''

      const { error } = await supabase
        .from('tb_contrato')
        .insert([contrato])

      if (error) throw error

      await loadContratos(contrato.idCliente)
    } catch (err: any) {
      showError(err.message || 'Erro ao adicionar contrato')
    }
  }

  const deleteContrato = async (idContrato: string, idCliente: string) => {
    try {
      const { error } = await supabase
        .from('tb_contrato')
        .delete()
        .eq('id_contrato', idContrato)

      if (error) throw error

      await loadContratos(idCliente)
    } catch (err: any) {
      showError(err.message || 'Erro ao remover contrato')
    }
  }

  return {
    contratos,
    isLoading,
    loadContratos,
    addContrato,
    deleteContrato
  }
})
