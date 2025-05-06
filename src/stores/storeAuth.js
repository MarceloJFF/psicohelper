import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { defineStore } from 'pinia'
import supabase from '/src/config/supabase'
import { useStoreProfissional } from '/src/stores/storeProfissional'
import { useShowErrorMessage } from '/src/userCases/useShowErrorMessage'
export const useStoreAuth = defineStore('auth', () => {

  /*
    state
  */
  const router = useRouter()
  const { showError } = useShowErrorMessage()


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
  const init = async (router) => {
    const storeEntries = useStoreProfissional()

    // Obtém a sessão atual ao iniciar
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      userDetails.id = session.user.id
      userDetails.email = session.user.email
      storeEntries.loadEntries()
    } else {
      // Não há sessão -> redireciona para login
      router.replace('/login')
    }

    // Escuta mudanças futuras de login/logout
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        if (session) {
          userDetails.id = session.user.id
          userDetails.email = session.user.email
          router.push('/')
          storeEntries.loadEntries()
        }
      } else if (event === 'SIGNED_OUT') {
        Object.assign(userDetails, userDetailsDefault)
        router.replace('/login')
        storeEntries.unsubscribeEntries()
        storeEntries.clearEntries()
      }
    })
  }

  const registerUser = async ({ email, password }) => {
    let { data, error } = await supabase.auth.signUp({
      email,
      password
    })
  if(data){

  }
    if (error)showError(error.message)
  }

  const loginUser = async ({ email, password }) => {
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) showError(error.message)
  }

  const logoutUser = async () => {
    let { error } = await supabase.auth.signOut()
    if (error) showError(error.message)
    else router.push('/login')
  }


  /*
    return
  */

  return {
    // state
    userDetails,

    // actions
    init,
    registerUser,
    loginUser,
    logoutUser
  }

})
