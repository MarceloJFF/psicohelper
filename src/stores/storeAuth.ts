import {ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { defineStore } from 'pinia'

import supabase from '/src/config/supabase'
import { useStoreProfissional } from '/src/stores/storeProfissional'
import { useShowErrorMessage } from '/src/userCases/useShowErrorMessage'
export const useStoreAuth = defineStore('auth', () => {

  /*
    state
  */
  const sessionLoaded = ref(false)

  const router = useRouter()
  const { showError } = useShowErrorMessage()
  const storesProfissional = useStoreProfissional()


  const userDetailsDefault = {
    id: null,
    email: null
  }

  const userDetails = reactive({
    ...userDetailsDefault
  })


  /*
    actions
  */const init = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      userDetails.id = session.user.id
      userDetails.email = session.user.email
      await storesProfissional.loadProfissional()
    }

    sessionLoaded.value = true

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        userDetails.id = session.user.id
        userDetails.email = session.user.email
        storesProfissional.loadProfissional()
        // REMOVA O REDIRECIONAMENTO AUTOMÁTICO
      } else if (event === 'SIGNED_OUT') {
        Object.assign(userDetails, userDetailsDefault)
        storesProfissional.clearEntries()
        router.replace('/login')
      }
    })
  }
  const registerUser = async ({ email, password }, profissional) => {
    let { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    if(data.user){
      await storesProfissional.registerProfissional(profissional, data.user.id)
    }

    if (error)showError(error.message)
  }

  const loginUser = async ({ email, password }) => {
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (data) {
      console.log(data)
      userDetails.id = data.user.id;
      userDetails.email = data.user.email;
      await storesProfissional.loadProfissional();

      router.push('/')
    }

    if (error) showError(error.message)
  }

  const logoutUser = async () => {
    let { error } = await supabase.auth.signOut()

    storesProfissional.clearEntries()
    if (error) showError(error.message)
    else router.push('/login')
  }



  /*
    return
  */

  return {
    // state
    userDetails,
    useStoreProfissional,
    // actions
    init,
    registerUser,
    loginUser,
    logoutUser
  }

})
