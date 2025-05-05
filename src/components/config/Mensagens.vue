<template>
  <v-card class="pa-6 max-w-4xl mx-auto mt-10 rounded-xl " color="">
    <v-card-title class="text-h5 font-weight-bold text-purple-darken-3 mb-2">
      ✉️ Configuração de Mensagens
    </v-card-title>
    <v-card-subtitle class="text-sm text-grey-darken-1 mb-6">
      Personalize as mensagens automáticas de cobrança e confirmação. <br />
      Use variáveis como <code>&#123;&#123;nome&#125;&#125;</code>,
      <code>&#123;&#123;valor&#125;&#125;</code>,
      <code>&#123;&#123;data&#125;&#125;</code>.
    </v-card-subtitle>

    <v-form ref="formRef" v-model="valid">
      <v-textarea
        v-model="mensagens.cobranca"
        label="Mensagem de Cobrança"
        auto-grow
        :rules="[v => !!v || 'Obrigatório']"
        color="purple-darken-3"
        variant="outlined"
        rounded
        class="mb-6"
      />

      <v-textarea
        v-model="mensagens.confirmacao"
        label="Mensagem de Confirmação de Pagamento"
        auto-grow
        :rules="[v => !!v || 'Obrigatório']"
        color="purple-darken-3"
        variant="outlined"
        rounded
        class="mb-6"
      />

      <div class="d-flex justify-end gap-3">
        <v-btn variant="text" color="grey" @click="resetMensagens">Restaurar Padrão</v-btn>
        <v-btn color="purple-darken-3" class="rounded-lg" @click="submit">Salvar Mensagens</v-btn>
      </div>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

const formRef = ref(null)
const valid = ref(false)

const mensagens = ref({
  cobranca: 'Olá {{nome}}, lembramos que o pagamento de {{valor}} vence em {{data}}. Qualquer dúvida, estamos à disposição.',
  confirmacao: 'Olá {{nome}}, confirmamos o recebimento de {{valor}} em {{data}}. Obrigado pelo pagamento!'
})

const mensagensPadrao = { ...mensagens.value }

function resetMensagens() {
  mensagens.value = { ...mensagensPadrao }
}

function submit() {
  formRef.value?.validate().then((isValid) => {
    if (isValid) {
      // Simula salvar no backend ou localStorage
      console.log('Mensagens salvas:', mensagens.value)
      alert('Mensagens salvas com sucesso!')
    }
  })
}
</script>

<style scoped>
code {
  background-color: #ede7f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}
.gap-3 {
  gap: 12px;
}
</style>
