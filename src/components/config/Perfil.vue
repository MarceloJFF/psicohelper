<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStoreProfissional } from '@/stores/storeProfissional'
import { useStoreAuth } from '@/stores/storeAuth'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'

const storeProfissional = useStoreProfissional()
const storeAuth = useStoreAuth()
const { showError } = useShowErrorMessage()

const formRef = ref(null)
const perfil = ref({
  nome: '',
  email: '',
  telefone: '',
  whatsapp: '',
  profissao: '',
  cnpj: '',
  nConselho: '',
  endereco: {
    cep: '',
    rua: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  }
})
const novaSenha = ref('')
const confirmarSenha = ref('')
const modalSenha = ref(false)
const foto = ref(null)
const fotoUrl = ref("/assets/logo.jpeg")  
const exibirEndereco = ref(false)
const exibirDadosUsuario = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

onMounted(async () => {
  storeProfissional.loadProfissional()
  if (storeProfissional.profissionalDetails) {
    perfil.value = {
      ...storeProfissional.profissionalDetails,
      email: storeAuth.userDetails.email || '',
      endereco: {
        cep: storeProfissional.profissionalDetails.cep || '',
        rua: storeProfissional.profissionalDetails.logradouro || '',
        complemento: storeProfissional.profissionalDetails.complemento || '',
        bairro: storeProfissional.profissionalDetails.bairro || '',
        cidade: storeProfissional.profissionalDetails.cidade || '',
        estado: storeProfissional.profissionalDetails.estado || '',
      }
    }
  }
})

function atualizarFoto(file) {
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      fotoUrl.value = reader.result
    }
    reader.readAsDataURL(file)
  }
}

async function salvarPerfil() {
  if (formRef.value?.validate()) {
    try {
      const profissionalData = {
        ...storeProfissional.profissionalDetails,
        nome: perfil.value.nome,
        profissao: perfil.value.profissao,
        cnpj: perfil.value.cnpj,
        nConselho: perfil.value.nConselho,
        cep: perfil.value.endereco.cep,
        logradouro: perfil.value.endereco.rua,
        cidade: perfil.value.endereco.cidade,
        estado: perfil.value.endereco.estado,
        bairro: perfil.value.endereco.bairro,
        complemento: perfil.value.endereco.complemento
      }

      await storeProfissional.updateProfissional(profissionalData)
      snackbarMessage.value = 'Perfil atualizado com sucesso!'
      snackbarColor.value = 'success'
    } catch (error) {
      console.error(error)
      snackbarMessage.value = 'Erro ao atualizar perfil.'
      snackbarColor.value = 'error'
    } finally {
      snackbar.value = true
      storeProfissional.loadProfissional()
    }
  }
}

async function salvarSenha() {
  if (novaSenha.value.length < 6 || novaSenha.value !== confirmarSenha.value) {
    snackbarMessage.value = 'Erro: Senhas inválidas.'
    snackbarColor.value = 'error'
    snackbar.value = true
    return
  }

  try {
    await storeProfissional.updatePassword(novaSenha.value)
    snackbarMessage.value = 'Senha alterada com sucesso!'
    snackbarColor.value = 'success'
    novaSenha.value = ''
    confirmarSenha.value = ''
    modalSenha.value = false
  } catch (error) {
    console.error(error)
    snackbarMessage.value = 'Erro ao alterar senha.'
    snackbarColor.value = 'error'
  } finally {
    snackbar.value = true
  }
}
</script>

<template>
  <!-- --- SEU CONTEÚDO DE PERFIL --- -->
  <v-card elevation="2" class="pa-6">
    <!-- Header com botão de voltar -->
    <v-row class="mb-4 d-flex align-center justify-space-between">
      <v-col cols="auto">
        <v-btn icon to="/" color="text-deep-purple-lighten-2">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col class="text-center">
        <h2 class="text-h3 mb-8 font-weight-bold text-deep-purple-lighten-2">
          Configurações do Perfil
        </h2>
      </v-col>
    </v-row>

    <v-form @submit.prevent="salvarPerfil" ref="formRef">
      <!-- Avatar com Upload -->
      <v-row class="mb-6" align="center">
        <v-col cols="auto">
          <v-avatar size="100">
            <v-img :src="fotoUrl || 'https://via.placeholder.com/100'" />
          </v-avatar>
        </v-col>
        <v-col cols="4">
          <v-file-input
            label="Alterar foto de perfil"
            prepend-icon="mdi-camera"
            accept="image/*"
            v-model="foto"
            @change="atualizarFoto"
            hide-details
          />
        </v-col>
      </v-row>

      <v-divider class="mb-4" />

      <!-- Dados do Usuário -->
      <v-row dense>
        <v-col cols="12">
          <v-row class="d-flex align-center">
            <v-col class="pa-2">
              <h4 class="mb-2 text-h4 text-deep-purple-lighten-1">
                Dados do usuário
              </h4>
            </v-col>
            <v-col cols="auto" class="pa-2">
              <v-btn icon @click="exibirDadosUsuario = !exibirDadosUsuario" color="primary">
                <v-icon :class="{ rotate: exibirDadosUsuario }">mdi-chevron-down</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row v-if="exibirDadosUsuario" dense>
        <v-col cols="12" sm="6">
          <v-text-field label="Nome Completo" v-model="perfil.nome" required />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field label="Email" v-model="perfil.email" required type="email" disabled />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field label="Telefone" v-model="perfil.telefone" type="tel" />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field label="WhatsApp" v-model="perfil.whatsapp" type="tel" />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field label="Profissão" v-model="perfil.profissao" />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field label="CNPJ/MEI" v-model="perfil.cnpj" />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field label="Nº do Conselho" v-model="perfil.numeroConselho" />
        </v-col>
      </v-row>

      <v-divider class="my-6" />

      <!-- Endereço -->
      <v-row dense>
        <v-col cols="12">
          <v-row class="d-flex align-center">
            <v-col class="pa-2">
              <h4 class="mb-2 text-h4 text-deep-purple-lighten-1">
                Endereço
              </h4>
            </v-col>
            <v-col cols="auto" class="pa-2">
              <v-btn icon @click="exibirEndereco = !exibirEndereco" color="primary">
                <v-icon :class="{ rotate: exibirEndereco }">mdi-chevron-down</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row v-if="exibirEndereco" dense>
        <v-col cols="4" sm="2">
          <v-text-field label="CEP" v-model="perfil.endereco.cep" />
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field label="Cidade" v-model="perfil.endereco.cidade" />
        </v-col>
        <v-col cols="12" sm="2">
          <v-text-field label="Estado" v-model="perfil.endereco.estado" />
        </v-col>
        <v-col cols="12" sm="8">
          <v-text-field label="Logradouro" v-model="perfil.endereco.rua" />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field label="Bairro" v-model="perfil.endereco.bairro" />
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field label="Complemento" v-model="perfil.endereco.complemento" />
        </v-col>
      </v-row>

      <v-divider class="my-6" />

      <!-- Botões -->
      <v-row justify="space-between">
        <v-btn color="secondary" variant="outlined" @click="modalSenha = true">
          <v-icon left>mdi-lock-reset</v-icon> Alterar Senha
        </v-btn>
        <v-btn color="primary" type="submit">
          <v-icon left>mdi-content-save</v-icon> Salvar Alterações
        </v-btn>
      </v-row>
    </v-form>
  </v-card>

  <!-- Modal Alterar Senha -->
  <v-dialog v-model="modalSenha" max-width="500">
    <v-card>
      <v-card-title>Redefinir Senha</v-card-title>
      <v-card-text>
        <v-text-field
          label="Nova Senha"
          v-model="novaSenha"
          type="password"
          :rules="[val => val.length >= 6 || 'Mínimo 6 caracteres']"
        />
        <v-text-field
          label="Confirmar Nova Senha"
          v-model="confirmarSenha"
          type="password"
          :rules="[val => val === novaSenha || 'Senhas não conferem']"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="modalSenha = false">Cancelar</v-btn>
        <v-btn color="primary" @click="salvarSenha">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Snackbar para mensagens -->
  <v-snackbar
    v-model="snackbar"
    :color="snackbarColor"
    timeout="3000"
  >
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<style scoped>
.v-avatar {
  border: 2px solid #ccc;
}
.v-btn:hover {
  background-color: #e8e8e8;
}
.rotate {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}
.v-icon {
  transition: transform 0.3s ease;
}
</style>
