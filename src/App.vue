<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage.js'
import supabase from '/src/config/supabase'
import router from '@/router'

const { show, message, color } = useShowErrorMessage()

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    router.push('/login')
  }

  // if (event === 'SIGNED_IN' && router.currentRoute.value.path === '/login') {
  //   router.push('/')
  // }
})

</script>

<template>
  <RouterView />
  <v-snackbar
    v-model="show"
    :color="color"
    timeout="4000"
    location="top"
  >
    {{ message }}
  </v-snackbar>
</template>
