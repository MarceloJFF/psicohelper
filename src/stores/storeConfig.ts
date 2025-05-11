import { defineStore } from 'pinia'
import { ref } from 'vue'
import supabase from '@/config/supabase'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'

const { showError } = useShowErrorMessage()

export const useStoreConfig = defineStore('config', () => {
  // State
  const configuracao = ref(null)
  const feriados = ref([])
  const mensagensWhatsapp = ref(null)
  const loading = ref(false)

  // Actions
  const createConfiguracao = async (idProfissional) => {
    try {
      const { data, error } = await supabase
        .from('tb_config')
        .insert([{ id_profissional: idProfissional }])
        .select()
        .single()

      if (error) throw error
      configuracao.value = data
      return data
    } catch (err) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao criar configurações')
      }
      return null
    }
  }

  const loadConfiguracao = async (idProfissional) => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('tb_config')
        .select('*')
        .eq('id_profissional', idProfissional)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Se não encontrou configuração, cria uma nova
          return await createConfiguracao(idProfissional)
        }
        throw error
      }

      configuracao.value = data
      await loadFeriados()
     // await loadMensagensWhatsapp()
      return data
    } catch (err) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao carregar configurações')
      }
      return null
    } finally {
      loading.value = false
    }
  }

  const loadFeriados = async () => {
    if (!configuracao.value) return

    try {
      const { data, error } = await supabase
        .from('tb_config_feriados')
        .select('*')
        .eq('id_config', configuracao.value.id)

      if (error) throw error
      feriados.value = data
    } catch (err) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao carregar feriados')
      }
    }
  }

  const loadMensagensWhatsapp = async () => {
    if (!configuracao.value) return

    try {
      const { data, error } = await supabase
        .from('tb_config_whatsapp')
        .select('*')
        .eq('id_config', configuracao.value.id)
        .single()

      if (error) throw error
      mensagensWhatsapp.value = data
    } catch (err) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao carregar mensagens do WhatsApp')
      }
    }
  }

  const addFeriado = async (feriado) => {
    if (!configuracao.value) return null

    try {
      const { data, error } = await supabase
        .from('tb_config_feriado')
        .insert([{
          ...feriado,
          id_config: configuracao.value.id
        }])
        .select()
        .single()

      if (error) throw error
      feriados.value.push(data)
      return data
    } catch (err) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao adicionar feriado')
      }
      return null
    }
  }

  const updateFeriado = async (feriado) => {
    try {
      const { data, error } = await supabase
        .from('tb_config_feriado')
        .update({
          label: feriado.label,
          data: feriado.data
        })
        .eq('id', feriado.id)
        .select()
        .single()

      if (error) throw error
      const index = feriados.value.findIndex(f => f.id === feriado.id)
      if (index !== -1) {
        feriados.value[index] = data
      }
      return data
    } catch (err) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao atualizar feriado')
      }
      return null
    }
  }

  const deleteFeriado = async (id) => {
    try {
      const { error } = await supabase
        .from('tb_config_feriado')
        .delete()
        .eq('id', id)

      if (error) throw error
      feriados.value = feriados.value.filter(f => f.id !== id)
      return true
    } catch (err) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao remover feriado')
      }
      return false
    }
  }

  const updateMensagensWhatsapp = async (mensagens) => {
    if (!configuracao.value) return null

    try {
      const { data, error } = await supabase
        .from('tb_config_whatsapp')
        .upsert({
          id: mensagens.id,
          id_config: configuracao.value.id,
          mensagem_cobranca: mensagens.mensagemCobranca,
          mensagem_confirmacao: mensagens.mensagemConfirmacao
        })
        .select()
        .single()

      if (error) throw error
      mensagensWhatsapp.value = data
      return data
    } catch (err) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao atualizar mensagens do WhatsApp')
      }
      return null
    }
  }

  const clearConfig = () => {
    configuracao.value = null
    feriados.value = []
    mensagensWhatsapp.value = null
  }

  return {
    // State
    configuracao,
    feriados,
    mensagensWhatsapp,
    loading,

    // Actions
    createConfiguracao,
    loadConfiguracao,
    loadFeriados,
    loadMensagensWhatsapp,
    addFeriado,
    updateFeriado,
    deleteFeriado,
    updateMensagensWhatsapp,
    clearConfig
  }
}) 