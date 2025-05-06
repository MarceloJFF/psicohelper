<template>
  <v-container fluid class="auth-container d-flex align-center justify-center " style="min-height: 100vh;">
    <v-row class="fill-height d-flex align-center justify-center" align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4" class="d-flex justify-center w-100" >
        <v-card class="auth-card" elevation="0">
          <div class="logo-container">
            <v-img
              src="../assets/logo.jpeg"
              alt="Logo"
              contain
              max-height="120"
              class="mb-4"
            />
          </div>

          <v-card-title class="text-center auth-title">
            {{ isLogin ? 'Bem-vindo de volta' : 'Crie sua conta' }}
            <v-icon class="ml-2" color="primary">
              {{ isLogin ? 'mdi-hand-wave' : 'mdi-account-plus' }}
            </v-icon>
          </v-card-title>

          <v-card-subtitle class="text-center auth-subtitle">
            {{ isLogin ? 'Entre com suas credenciais' : 'Preencha seus dados para começar' }}
          </v-card-subtitle>

          <v-form @submit.prevent="handleAuth" class="pa-12  w-100 h-100">
            <v-text-field
              v-model="credentials.email"
              label="Email"
              type="email"
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
                variant="outlined"
                class="mb-3"
                color="primary"
                density="comfortable"
                required
              />

              <v-text-field
                v-model="profissional.profissao"
                label="Profissão"
                variant="outlined"
                class="mb-3"
                color="primary"
                density="comfortable"
                required
              />

              <v-text-field
                v-model="profissional.telefone"
                label="Telefone"
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
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useStoreAuth } from '@/stores/storeAuth.js'

const credentials = ref({
  email: '',
  password: ''
})

const profissional = ref({
  nome: '',
  profissao: '',
  telefone: ''
})

const isLogin = ref(true)

const toggleMode = () => {
  isLogin.value = !isLogin.value
}

const handleAuth = async () => {
  const storeAuth = useStoreAuth()

  if (isLogin.value) {
    try {
      await storeAuth.loginUser({ email: credentials.value, password: credentials.value })
      clearState()
    } catch (err) {
      alert(err.message)
    }
  } else {
    try {
      await storeAuth.registerUser({ email: credentials.value, password: credentials.value })
      clearState()
    } catch (err) {
      alert(err.message)
    }
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
</style>
