<template>
  <v-container class="d-flex justify-center">
    <v-card width="400">
      <v-card-title>{{ isLogin ? 'Login' : 'Registro' }}</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleAuth">
          <v-text-field v-model="email" label="Email" required />
          <v-text-field v-model="password" label="Senha" type="password" required />

          <v-btn type="submit" color="primary" class="mt-3" block>
            {{ isLogin ? 'Entrar' : 'Registrar' }}
          </v-btn>

          <v-btn text @click="toggleMode" class="mt-2" block>
            {{ isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login' }}
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import supabase from '@/config/supabase.js'

const email = ref('')
const password = ref('')
const isLogin = ref(true)

const toggleMode = () => {
  isLogin.value = !isLogin.value
}

const handleAuth = async () => {
  if (isLogin.value) {
    const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
    if (error) alert(error.message)
  } else {
    const { error } = await supabase.auth.signUp({ email: email.value, password: password.value })
    if (error) alert(error.message)
  }
}
</script>
