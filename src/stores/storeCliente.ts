import { ref } from 'vue'
import { defineStore } from 'pinia'
import supabase from '/src/config/supabase'
import { useStoreProfissional } from '/src/stores/storeProfissional'
import { useShowErrorMessage } from '/src/userCases/useShowErrorMessage'
import Cliente from '@/models/Responsavel'
import { useStoreContrato } from '@/stores/storeContrato.ts'
import { useStoreDependente } from '@/stores/storeDependente.ts'


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
      const idProfissional = storeProfissional.profissionalDetails?.id
      if (!idProfissional) {
        showError('Profissional não está autenticado')
        return
      }
      const { data, error } = await supabase
        .from('tb_cliente')
        .select('*')
        .eq('id_profissional', idProfissional)

      if (error) throw error
      clientes.value = data as Cliente[]   // garante o cast correto
    } catch (err: any) {
      showError(err.message || 'Erro ao carregar clientes')
    } finally {
      isLoading.value = false
    }
  }

  const addCliente = async (cliente) => {
    const storeContrato = useStoreContrato()
    const storeDependente = useStoreDependente()
    console.log(cliente)
    try {
      cliente.idProfissional = storeProfissional.profissionalDetails?.id || ''
      cliente.status = true;
      const { error } = await supabase
        .from('tb_cliente')
        .insert([{
          nome_cliente: cliente.nome,
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
          status: cliente.status,
        }])
      if (error) throw error
      if(cliente.dependentes.length > 0) {
        for(const dependente of cliente.dependentes) {
          dependente.idCliente = storeProfissional.profissional?.id || ''
          await storeDependente.addDependente(dependente);
        }
      }
      if(cliente.contrato != null){
        await storeContrato.addContrato(cliente.contrato);
      }
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
