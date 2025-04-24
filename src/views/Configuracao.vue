<template>
  <v-container class="py-6" max-width="800">
    <!-- Header com botão de voltar -->
    <v-row class="mb-4" align="center" justify="space-between">
      <v-btn icon to="/">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <h2 class="text-h5 font-weight-bold">Configurações do Perfil</h2>
      <div style="width: 36px" /> <!-- Espaço reservado para alinhar o botão -->
    </v-row>

    <v-card elevation="2" class="pa-6">
      <v-form @submit.prevent="salvarPerfil" ref="formRef">
        <!-- Avatar com Upload -->
        <v-row class="mb-6" align="center">
          <v-col cols="auto">
            <v-avatar size="100">
              <v-img :src="fotoUrl || 'https://via.placeholder.com/100'" />
            </v-avatar>
          </v-col>
          <v-col>
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

        <!-- Informações Pessoais -->
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-text-field label="Nome Completo" v-model="perfil.nome" required />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field label="Email" v-model="perfil.email" required type="email" />
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

        <!-- Endereço Detalhado -->
        <h4 class="text-subtitle-1 mb-2">Endereço</h4>
        <v-row dense>
          <v-col cols="12" sm="8">
            <v-text-field label="Rua" v-model="perfil.endereco.rua" />
          </v-col>

          <v-col cols="12" sm="4">
            <v-text-field label="Complemento" v-model="perfil.endereco.complemento" />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field label="Bairro" v-model="perfil.endereco.bairro" />
          </v-col>

          <v-col cols="12" sm="4">
            <v-text-field label="Cidade" v-model="perfil.endereco.cidade" />
          </v-col>

          <v-col cols="12" sm="2">
            <v-text-field label="Estado" v-model="perfil.endereco.estado" />
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
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const formRef = ref(null)

const perfil = ref({
  nome: '',
  email: '',
  telefone: '',
  whatsapp: '',
  profissao: '',
  cnpj: '',
  numeroConselho: '',
  endereco: {
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
const fotoUrl = ref(null)

function atualizarFoto(file) {
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      fotoUrl.value = reader.result
    }
    reader.readAsDataURL(file)
  }
}

function salvarPerfil() {
  if (formRef.value?.validate()) {
    alert('Perfil salvo com sucesso!')
  }
}

function salvarSenha() {
  if (novaSenha.value.length < 6 || novaSenha.value !== confirmarSenha.value) {
    alert('Erro: Senhas inválidas.')
    return
  }

  alert('Senha alterada com sucesso!')
  novaSenha.value = ''
  confirmarSenha.value = ''
  modalSenha.value = false
}
</script>

<style scoped>
.v-avatar {
  border: 2px solid #ccc;
}
</style>
