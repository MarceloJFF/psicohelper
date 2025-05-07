<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'
import supabase from '/src/config/supabase'
import router from '@/router'

const { show, message, color } = useShowErrorMessage()

supabase.auth.onAuthStateChange((event, session) => {
  if (!session) {
    router.push('/login')
  }
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
