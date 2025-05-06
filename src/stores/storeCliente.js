import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import supabase from '/src/config/supabase'
import { useStoreProfissional } from '/src/stores/storeProfissional'
import { useShowErrorMessage } from '/src/userCases/useShowErrorMessage'
import Cliente from '@/models/Cliente.ts'

export const useStoreCliente = defineStore('cliente', () => {
  /*
    state
  */
  const clientes = ref<Cliente[]>([])
  const isLoading = ref(false)

  const { showError } = useShowErrorMessage()
  const storeProfissional = useStoreProfissional()

  /*
    actions
  */

  const loadClientes = async () => {
    isLoading.value = true
    try {
      const idProfissional = storeProfissional.profissional?.id
      if (!idProfissional) {
        showError('Profissional não está autenticado')
        return
      }

      const { data, error } = await supabase
        .from('tb_cliente')
        .select('*')
        .eq('id_profissional', idProfissional)
        .eq('status', true)

      if (error) throw error

      clientes.value = data as Cliente[];
    } catch (err: any) {
      showError(err.message || 'Erro ao carregar clientes')
    } finally {
      isLoading.value = false
    }
  }

  const addCliente = async (cliente: Cliente) => {
    try {
      cliente.idProfissional = storeProfissional.profissional?.id || ''
      const { error } = await supabase
        .from('tb_cliente')
        .insert([{
          id: cliente.id,
          nome_cliente: cliente.nomeCliente,
          cpf: cliente.cpf,
          telefone: cliente.telefone1,
          telefone2: cliente.telefone2,
          cep: cliente.cep,
          logradouro: cliente.logradouro,
          cidade: cliente.cidade,
          estado: cliente.estado,
          nascimento: cliente.nascimento,
          atendimento_proprio: cliente.atendimentoProprio,
          sexo: cliente.sexo,
          tipo_atendimento: cliente.tipoAtendimento,
          id_profissional: cliente.idProfissional,
          status: cliente.status
        }])

      if (error) throw error

      await loadClientes()
    } catch (err: any) {
      showError(err.message || 'Erro ao adicionar cliente')
    }
  }

  const updateCliente = async (cliente: Cliente) => {
    try {
      const { error } = await supabase
        .from('tb_cliente')
        .update({
          nome_cliente: cliente.nomeCliente,
          cpf: cliente.cpf,
          telefone: cliente.telefone1,
          telefone2: cliente.telefone2,
          cep: cliente.cep,
          logradouro: cliente.logradouro,
          cidade: cliente.cidade,
          estado: cliente.estado,
          nascimento: cliente.nascimento,
          atendimento_proprio: cliente.atendimentoProprio,
          sexo: cliente.sexo,
          tipo_atendimento: cliente.tipoAtendimento,
          status: cliente.status
        })
        .eq('id', cliente.id)

      if (error) throw error

      await loadClientes()
    } catch (err: any) {
      showError(err.message || 'Erro ao atualizar cliente')
    }
  }

  const deleteCliente = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tb_cliente')
        .update({ status: false })
        .eq('id', id)

      if (error) throw error

      await loadClientes()
    } catch (err: any) {
      showError(err.message || 'Erro ao remover cliente')
    }
  }

  const clearClientes = () => {
    clientes.value = []
  }

  /*
    return
  */
  return {
    clientes,
    isLoading,
    loadClientes,
    addCliente,
    updateCliente,
    deleteCliente,
    clearClientes
  }
})
