<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'

const { show, message, color } = useShowErrorMessage()


</script>

<template>
  <RouterView />
  <v-snackbar
    v-model="show"
    :color="color"
    timeout="4000"
    location="bottom"
  >
    {{ message }}
  </v-snackbar>
</template>
