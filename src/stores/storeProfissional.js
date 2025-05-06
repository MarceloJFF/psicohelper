import { defineStore } from 'pinia'
import { ref } from 'vue'
import Profissional from '@/models/Profissional'
import supabase from '@/config/supabase'
import { useStoreAuth } from '@/stores/storeAuth.js'

let entriesChannel

export const useStoreProfissional = defineStore('profissional', () => {

  /*
    state
  */

  const profissional = ref<Profissional | null>(null);
  const profissionalLoaded = ref(false)




  /*
    getters
  */



  /*
    actions
  */

  const loadProfissional = async () => {

    const storeAuth = useStoreAuth()

    profissionalLoaded.value = false

    let { data, error } = await supabase
      .from('tb_profissional')
      .select('*')
      .eq('ide_user', storeAuth.userDetails.id)
      .order('order', { ascending: true })

    if (error) useShowErrorMessage(error.message)
    if (data) {
      profissional.value = data
      profissionalLoaded.value = true
      subscribeEntries()
    }

  }

  const subscribeEntries = () => {
    const storeAuth = useStoreAuth()

    entriesChannel = supabase.channel('profissional-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tb_profissional',
          filter: `id_user=eq.${ storeAuth.userDetails.id }`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            profissional.value = payload.new
          }
          if (payload.eventType === 'DELETE') {

          }
          if (payload.eventType === 'UPDATE') {

          }
        }
      )
      .subscribe()
  }

  const unsubscribeEntries = () => {
    supabase.removeChannel(entriesChannel)
  }

  const clearEntries = () => {
    profissional.value = null;
  }







  /*
    return
  */

  return {

    // state
    profissional,
    profissionalLoaded,

    // actions
    unsubscribeEntries,
    clearEntries,
    loadProfissional
  }

})
