import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { defineStore } from 'pinia'
import supabase from '@/config/supabase'
import { useStoreProfissional } from '@/stores/storeProfissional'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'
import { useStoreConfig } from '@/stores/storeConfig'
export const useStoreAuth = defineStore('auth', () => {

  const sessionLoaded = ref(false)
  const router = useRouter()
  const { showError } = useShowErrorMessage()
  const storesProfissional = useStoreProfissional()
  const storeConfig = useStoreConfig()
  const userDetailsDefault = {
    id: '',
    email: ''
  }

  const userDetails = reactive({
    ...userDetailsDefault
  })

  /*
    actions
  */
    const init = async () => {
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          if (session != null) {
            console.log("Sessao iniciada")
            console.log(session)
            userDetails.id = session.user.id
            userDetails.email = session?.user?.email?session?.user?.email:''
            storesProfissional.loadProfissional()
            storeConfig.loadConfiguracao(session.user.id)
            //router.push('/')
          }
        } else if (event === 'SIGNED_OUT') {
          Object.assign(userDetails, userDetailsDefault)
          sessionLoaded.value = false
          storesProfissional.clearEntries()
          storeConfig.clearConfig()
          router.replace('/login')
        }
      })
    }

  const registerUser = async ({ email, password }:{email:any; password:any}, profissional:any) => {
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (data?.user) {
      await storesProfissional.registerProfissional(profissional, data.user.id)
      await storeConfig.createConfiguracao(storesProfissional.profissionalDetails?.id)
    }

    if (error) showError("Houve um erro ao criar o usuário, tente novamente mais tarde"+error.message)
  }

  const loginUser = async ({ email, password }:{email:any; password:any}) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (data?.user) {
      userDetails.id = data.user.id
      userDetails.email = data.user.email?data.user.email:''
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
