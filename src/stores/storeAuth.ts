import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { defineStore } from 'pinia'
import supabase from '/src/config/supabase'
import { useStoreProfissional } from '/src/stores/storeProfissional'
import { useShowErrorMessage } from '/src/userCases/useShowErrorMessage'
import { useStoreConfig } from '/src/stores/storeConfig'
export const useStoreAuth = defineStore('auth', () => {

  const sessionLoaded = ref(false)
  const router = useRouter()
  const { showError } = useShowErrorMessage()
  const storesProfissional = useStoreProfissional()
  const storeConfig = useStoreConfig()
  const userDetailsDefault = {
    id: null,
    email: null
  }

  const userDetails = reactive({
    ...userDetailsDefault
  })

  /*
    actions
  */
  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      userDetails.id = session.user.id
      userDetails.email = session.user.email
      await storesProfissional.loadProfissional()
      await storeConfig.loadConfiguracao(session.user.id)
    }

    sessionLoaded.value = true

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        userDetails.id = session.user.id
        userDetails.email = session.user.email
        storesProfissional.loadProfissional()
        storeConfig.loadConfiguracao(session.user.id)
        // REMOVA O REDIRECIONAMENTO AUTOMÁTICO
      } else if (event === 'SIGNED_OUT') {
        Object.assign(userDetails, userDetailsDefault)
        sessionLoaded.value = false
        storesProfissional.clearEntries()
        storeConfig.clearConfig()
        // router.replace('/login')
      }
    })
  }

  const registerUser = async ({ email, password }, profissional) => {
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (data?.user) {
      await storesProfissional.registerProfissional(profissional, data.user.id)
      await storeConfig.createConfiguracao(storesProfissional.profissionalDetails.value.id)
    }

    if (error) showError("Houve um erro ao criar o usuário, tente novamente mais tarde")
  }

  const loginUser = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (data?.user) {
      userDetails.id = data.user.id
      userDetails.email = data.user.email
      await storesProfissional.loadProfissional()
      await storeConfig.loadConfiguracao(data.user.id)
      router.push('/')
    }

    if (error) showError("Login ou senha inválidos")
  }

  const logoutUser = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      showError(error.message)
    } else {
     
      router.push('/login')
    }
  }

  /*
    return
  */
  return {
    // state
    userDetails,
    sessionLoaded,
    storesProfissional,

    // actions
    init,
    registerUser,
    loginUser,
    logoutUser
  }
})
