<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage.js'
import supabase from '/src/config/supabase'
import router from '@/router'
import { useStoreAuth } from '@/stores/storeAuth'

const { show, message, color } = useShowErrorMessage()

const storeAuth = useStoreAuth()

onMounted(async () => {
  await storeAuth.init()
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
