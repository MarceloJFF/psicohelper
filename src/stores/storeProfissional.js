import { defineStore } from 'pinia'
import { ref } from 'vue'
import Profissional from '@/models/Profissional'
import supabase from '@/config/supabase'
import { useStoreAuth } from '@/stores/storeAuth'
import { useShowErrorMessage } from '/src/userCases/useShowErrorMessage'

let entriesChannel

export const useStoreProfissional = defineStore('profissional', () => {
  // State
  const { showError } = useShowErrorMessage()
  const profissionalDetails = ref(new Profissional())
  const profissionalLoaded = ref(false)

  // Actions
  const loadProfissional = async () => {
    const storeAuth = useStoreAuth()
    profissionalLoaded.value = false

    try {
      const { data, error } = await supabase
        .from('tb_profissional')
        .select('*')
        .eq('id_user', storeAuth.userDetails.id)

      if (error) throw error

      if (data && data.length > 0) {
        profissionalDetails.value = data[0]
        profissionalLoaded.value = true
        subscribeEntries()
      } else {
        profissionalDetails.value = null
      }
    } catch (err) {
      showError(err.message)
    }
  }

  const registerProfissional = async (profissional, idUser) => {
    try {
      const { data, error } = await supabase
        .from('tb_profissional')
        .insert([{
          nome: profissional.nome,
          profissao: profissional.profissao,
          telefone: profissional.telefone,
          id_user: idUser
        }])
        .select()

      if (error) throw error
      if (data) {
        profissionalDetails.value = data[0]
      }
    } catch (err) {
      showError(err.message)
    }
  }

  const subscribeEntries = () => {
    const storeAuth = useStoreAuth()

    entriesChannel = supabase.channel('profissional-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tb_profissional',
        filter: `id_user=eq.${storeAuth.userDetails.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          profissionalDetails.value = payload.new
        }
        if (payload.eventType === 'DELETE') {
          profissionalDetails.value = new Profissional()
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
    profissionalDetails.value = new Profissional()
    profissionalLoaded.value = false
  }

  // Return exposed state & actions
  return {
    profissionalDetails,
    profissionalLoaded,
    loadProfissional,
    registerProfissional,
    unsubscribeEntries,
    clearEntries
  }
})
