<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStoreConfig } from '@/stores/storeConfig'
import type { MensagensWhatsapp } from '@/stores/storeConfig'
import type { VForm } from 'vuetify/components'

const store = useStoreConfig()
const formRef = ref<VForm | null>(null)
const valid = ref(false)

// Add snackbar state
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const mensagens = ref<MensagensWhatsapp>({
  msgCobranca: '',
  msgConfirmacaoPagamento: '',
  msgLembreteAtendimento: '',
  idConfig: ''
})

async function loadMensagens() {
  await store.loadMensagensWhatsapp()
  if (store.mensagensWhatsapp) {
    mensagens.value = store.mensagensWhatsapp
  }
}

function resetMensagens() {
  if (store.configuracao) {
    mensagens.value = {
      msgCobranca: 'Olá {{nome}}, lembramos que o pagamento de {{valor}} vence em {{data}}. Qualquer dúvida, estamos à disposição.',
      msgConfirmacaoPagamento: 'Olá {{nome}}, confirmamos o recebimento de {{valor}} em {{data}}. Obrigado pelo pagamento!',
      msgLembreteAtendimento: 'Olá {{nome}}, lembramos que você tem um atendimento agendado para {{data}} às {{hora}}. Até lá!',
      idConfig: store.configuracao.id
    }
  }
}

async function submit() {
  formRef.value?.validate().then(async (isValid) => {
    if (isValid) {
      const result = await store.updateMensagensWhatsapp(mensagens.value)
      if (result) {
        snackbar.value = {
          show: true,
          text: 'Mensagens atualizadas com sucesso!',
          color: 'success'
        }
      }
    }
  })
}

onMounted(() => {
  loadMensagens()
})
</script>

<template>
  <v-card class="pa-6 max-w-4xl mx-auto mt-10 rounded-xl " color="">
    <v-card-title class="text-h5 font-weight-bold text-purple-darken-3 mb-2">
      ✉️ Configuração de Mensagens
    </v-card-title>
    <v-card-subtitle class="text-sm text-grey-darken-1 mb-6">
      Personalize as mensagens automáticas de cobrança e confirmação. <br />
      Use variáveis como <code>&#123;&#123;nome&#125;&#125;</code>,
      <code>&#123;&#123;valor&#125;&#125;</code>,
      <code>&#123;&#123;data&#125;&#125;</code>,
      <code>&#123;&#123;hora&#125;&#125;</code>.
    </v-card-subtitle>

    <v-form ref="formRef" v-model="valid">
      <v-textarea
        v-model="mensagens.msgCobranca"
        label="Mensagem de Cobrança"
        auto-grow
        :rules="[v => !!v || 'Obrigatório']"
        color="purple-darken-3"
        variant="outlined"
        rounded
        class="mb-6"
      />

      <v-textarea
        v-model="mensagens.msgConfirmacaoPagamento"
        label="Mensagem de Confirmação de Pagamento"
        auto-grow
        :rules="[v => !!v || 'Obrigatório']"
        color="purple-darken-3"
        variant="outlined"
        rounded
        class="mb-6"
      />

      <v-textarea
        v-model="mensagens.msgLembreteAtendimento"
        label="Mensagem de Lembrete de Atendimento"
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

  <!-- Add snackbar component -->
  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="3000"
    location="top"
  >
    {{ snackbar.text }}
    <template v-slot:actions>
      <v-btn
        color="white"
        variant="text"
        @click="snackbar.show = false"
      >
        Fechar
      </v-btn>
    </template>
  </v-snackbar>
</template>

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