<template>
  <v-container fluid class="auth-container auth-container d-flex align-center justify-center" style="min-height: 100vh;">
    <v-row class="fill-height d-flex align-center justify-center" align="center" justify="center">
      <v-col class="d-flex justify-center" cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card class="auth-card" elevation="0">
          <div class="logo-container">
            <v-img
              :src="logo"
              alt="Logo"
              contain
              max-width="250"
              class="mb-4"
            />
          </div>

          <v-card-title class="text-center auth-title">
            {{ isLogin ? 'Bem-vindo' : 'Crie sua conta' }}

          </v-card-title>

          <v-card-subtitle class="text-center auth-subtitle">
            {{ isLogin ? 'Entre com suas credenciais' : 'Preencha seus dados para começar' }}
          </v-card-subtitle>

          <v-form ref="form" v-model="isFormValid" @submit.prevent="handleAuth" class="px-4">
            <v-text-field
              v-model="credentials.email"
              label="Email"
              type="email"
              :rules="[rules.required, rules.email]"
              variant="outlined"
              prepend-inner-icon="mdi-email-outline"
              color="primary"
              class="mb-3"
              required
              density="comfortable"
            />

            <v-text-field
              v-model="credentials.password"
              label="Senha"
              type="password"
              :rules="[rules.required, rules.min(6)]"
              variant="outlined"
              prepend-inner-icon="mdi-lock-outline"
              color="primary"
              class="mb-4"
              required
              density="comfortable"
            />
            <template v-if="!isLogin">
              <v-text-field
                v-model="profissional.nome"
                label="Nome completo"
                :rules="[rules.required]"
                variant="outlined"
                class="mb-3"
                color="primary"
                density="comfortable"
                required
              />

              <v-text-field
                v-model="profissional.profissao"
                label="Profissão"
                :rules="[rules.required]"
                variant="outlined"
                class="mb-3"
                color="primary"
                density="comfortable"
                required
              />

              <v-text-field
                v-model="profissional.telefone"
                label="Telefone"
                :rules="[rules.required, rules.phone]"
                variant="outlined"
                class="mb-4"
                color="primary"
                density="comfortable"
                required
              />
            </template>

            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              class="mb-4 auth-button"
              rounded="lg"
              :loading="isLoading"
              :disabled="isLoading"
            >
              {{ isLogin ? 'Entrar' : 'Registrar' }}
            </v-btn>


            <div class="text-center my-4">
              <v-btn
                variant="text"
                color="secondary"
                @click="toggleMode"
                class="toggle-button"
              >
                {{ isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login' }}
                <v-icon right>{{ isLogin ? 'mdi-arrow-right' : 'mdi-arrow-left' }}</v-icon>
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
      class="custom-snackbar"
      min-width="400"
      max-width="600"
    >
      <div class="d-flex align-center">
        <v-icon
          :icon="snackbar.color === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle'"
          class="mr-3"
          size="large"
        />
        <span class="text-body-1">{{ snackbar.text }}</span>
      </div>
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.show = false"
          class="ml-4"
        >
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStoreAuth } from '@/stores/storeAuth.ts'
import logo from '@/assets/logo.jpeg'

const credentials = ref({
  email: '',
  password: ''
})

const profissional = ref({
  nome: '',
  profissao: '',
  telefone: ''
})

const snackbar = ref({
  show: false,
  text: '',
  color: 'error'
})


const isLogin = ref(true)
const isLoading = ref(false)

const rules = {
  required: v => !!v || 'Campo obrigatório',
  email: v => /.+@.+\..+/.test(v) || 'Email inválido',
  min: (min) => v => (v && v.length >= min) || `Mínimo de ${min} caracteres`,
  phone: v => /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(v) || 'Telefone inválido',
}

const isFormValid = ref(false)
const form = ref(null)

const showError = (message: string) => {
  snackbar.value = {
    show: true,
    text: message,
    color: 'error'
  }
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
}

const handleAuth = async () => {
  const isValid = await form.value?.validate()
  if (!isValid) {
    showError('Por favor, preencha todos os campos corretamente')
    return
  }

  const storeAuth = useStoreAuth()
  isLoading.value = true

  try {
    if (isLogin.value) {
      if (!credentials.value.email || !credentials.value.password) {
        showError('Por favor, preencha email e senha')
        return
      }

      await storeAuth.loginUser({
        email: credentials.value.email,
        password: credentials.value.password
      })
    } else {
      if (
        !credentials.value.email || !credentials.value.password ||
        !profissional.value.nome || !profissional.value.profissao ||
        !profissional.value.telefone
      ) {
        showError('Por favor, preencha todos os campos')
        return
      }

      const { error } = await storeAuth.registerUser(
        {
          email: credentials.value.email,
          password: credentials.value.password
        },
        profissional.value
      )

      if (error) {
        showError(error.message)
        return
      } else {
        snackbar.value = {
          show: true,
          text: 'Cadastro realizado com sucesso! Faça login para continuar.',
          color: 'success'
        }
      }
    }


  } catch (err) {
    showError(err.message || 'Erro inesperado')
  } finally {
    isLoading.value = false
    clearState()
  }
}



function clearState() {
  credentials.value.email = ''
  credentials.value.password = ''
  profissional.value.nome = ''
  profissional.value.profissao = ''
  profissional.value.telefone = ''
}
</script>

<style scoped>
.auth-container {
  width: 100vw;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  margin: 0;
  padding: 0;
}

.auth-card {
  padding: 2.5rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.18);
  width: 100%;
}

.logo-container {
  display: flex;
  justify-content: center;
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  font-size: 1rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.auth-button {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  height: 48px;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.1);
  transition: all 0.3s ease;
}

.auth-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1);
}

.toggle-button {
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* Animação suave para troca entre login/cadastro */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.custom-snackbar {
  padding: 16px 24px;
}

.custom-snackbar :deep(.v-snackbar__content) {
  padding: 8px 0;
}

.custom-snackbar :deep(.v-snackbar__wrapper) {
  min-height: 64px;
}
</style>
