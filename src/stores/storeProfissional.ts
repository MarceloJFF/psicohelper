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
        profissionalDetails.value = mapBdToProfissional(data[0])
        profissionalLoaded.value = true
        subscribeEntries()
        console.log(profissionalDetails.value)
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
   const mapBdToProfissional = (data: any): Profissional => {
    const profissional = new Profissional();
    profissional.id = data.id;
    profissional.nome = data.nome;
    profissional.profissao = data.profissao;
    profissional.nConselho = data.n_conselho;
    profissional.telefone = data.telefone;
    profissional.cnpj = data.cnpj;
    profissional.cep = data.cep;
    profissional.logradouro = data.logradouro;
    profissional.cidade = data.cidade;
    profissional.estado = data.estado;
    profissional.bairro = data.bairro;
    profissional.complemento = data.complemento;
    profissional.avatarStorage = data.avatar_storage_path;
  
    return profissional;
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
        profissionalDetails.value = mapBdToProfissional(data[0])
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
   console.log("updateProfissional")
    console.log(profissional)
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
          complemento: profissional.complemento,
          avatar_storage_path:`${profissional.id}/avatar_${profissional.id}.webp`
        })
        .eq('id', profissional.id)
        .select()

      if (error) throw error
      if (data) {
        profissionalDetails.value = mapBdToProfissional(data[0])
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message)
      } else {

        console.log(err)
        showError('Erro ao atualizar profissional' +err)
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
  const updateAvatar = async (avatar: string | null) => {
    try {
      const { data, error } = await supabase
        .from('tb_profissional')
        .update({ avatar_storage_path: avatar })
        .eq('id', profissionalDetails.value?.id)
        .select()
      console.log(data)
      if (error) throw error
      if (data) {
        profissionalDetails.value = data[0] as Profissional
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao atualizar avatar')
      }
    }
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
    clearEntries,
    updateAvatar  
  }
})
