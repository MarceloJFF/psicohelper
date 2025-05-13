import { defineStore } from 'pinia'
import { ref } from 'vue'
import Profissional from '@/models/Profissional'
import supabase from '@/config/supabase'
import { useStoreAuth } from '@/stores/storeAuth'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'
import { RealtimeChannel } from '@supabase/supabase-js'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

let entriesChannel: RealtimeChannel | null = null

export const useStoreProfissional = defineStore('profissional', () => {
  // State
  const { showError } = useShowErrorMessage()
  const profissionalDetails = ref<Profissional | null>(new Profissional())
  const profissionalLoaded = ref(false)

  // Actions
  const loadProfissional = async () => {
 
    
    const storeAuth = useStoreAuth()
    profissionalLoaded.value = false

    try {
      const { data, error } = await supabase
        .from('tb_profissional')
        .select('*')
        .eq('id', storeAuth.userDetails.id)

      if (error) throw error

      if (data && data.length > 0) {
        profissionalDetails.value = data[0] as Profissional
        profissionalLoaded.value = true
        subscribeEntries()
      } else {
        profissionalDetails.value = null
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao carregar profissional')
      }
    }
  }

  const registerProfissional = async (profissional: Partial<Profissional>, idUser: string) => {
    try {
      const { data, error } = await supabase
        .from('tb_profissional')
        .insert([{
          nome: profissional.nome,
          profissao: profissional.profissao,
          telefone: profissional.telefone,
          id: idUser
        }])
        .select()

      if (error) throw error
      if (data) {
        profissionalDetails.value = data[0] as Profissional
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao registrar profissional')
      }
    }
  }

  const updateProfissional = async (profissional: Profissional) => {
    try {
      const { data, error } = await supabase
        .from('tb_profissional')
        .update({
          nome: profissional.nome,
          profissao: profissional.profissao,
          telefone: profissional.telefone,
          cnpj: profissional.cnpj,
          n_conselho: profissional.nConselho,
          cep: profissional.cep,
          logradouro: profissional.logradouro,
          cidade: profissional.cidade,
          estado: profissional.estado,
          bairro: profissional.bairro,
          complemento: profissional.complemento
        })
        .eq('id', profissional.id)
        .select()

      if (error) throw error
      if (data) {
        profissionalDetails.value = data[0] as Profissional
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao atualizar profissional')
      }
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao atualizar senha')
      }
    }
  }

  const subscribeEntries = () => {
    if (entriesChannel) return
  
    const storeAuth = useStoreAuth()
    if (!storeAuth.userDetails.id) return
  
    entriesChannel = supabase.channel('profissional-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tb_profissional',
        filter: `id=eq.${storeAuth.userDetails.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          profissionalDetails.value = payload.new as Profissional
        } else if (payload.eventType === 'DELETE') {
          profissionalDetails.value = null
        }
      })
      .subscribe()
  }
  
  const unsubscribeEntries = () => {
    if (entriesChannel) {
      supabase.removeChannel(entriesChannel)
    }
  }

  const clearEntries = () => {
    profissionalDetails.value = null
    profissionalLoaded.value = false
    unsubscribeEntries()
  }
  

  // Return exposed state & actions
  return {
    profissionalDetails,
    profissionalLoaded,
    loadProfissional,
    registerProfissional,
    updateProfissional,
    updatePassword,
    unsubscribeEntries,
    clearEntries
  }
})
