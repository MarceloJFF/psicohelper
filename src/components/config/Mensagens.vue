<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useStoreConfig } from '@/stores/storeConfig'
import ConfigWhatsapp from '@/models/ConfigWhatsapp'

const storeConfig = useStoreConfig()
const formRef = ref(null)
const valid = ref(false)

const mensagens = ref<ConfigWhatsapp>(new ConfigWhatsapp())
const mensagensPadrao = ref<ConfigWhatsapp>(new ConfigWhatsapp())
const loading = ref(false)

async function carregarMensagens() {
  loading.value = true
  await storeConfig.loadMensagensWhatsapp()
  if (storeConfig.mensagensWhatsapp) {
    mensagens.value = { ...storeConfig.mensagensWhatsapp }
    mensagensPadrao.value = { ...storeConfig.mensagensWhatsapp }
  } else {
    mensagens.value = new ConfigWhatsapp()
    mensagensPadrao.value = new ConfigWhatsapp()
  }
  loading.value = false
}

function resetMensagens() {
  mensagens.value = { ...mensagensPadrao.value }
}

async function submit() {
  const isValid = await formRef.value?.validate()
  if (isValid) {
    loading.value = true
    const result = await storeConfig.updateMensagensWhatsapp(mensagens.value)
    loading.value = false
    if (result) {
      alert('Mensagens salvas com sucesso!')
      mensagensPadrao.value = { ...mensagens.value }
    }
  }
}

onMounted(() => {
  carregarMensagens()
})

watch(() => storeConfig.mensagensWhatsapp, (val) => {
  if (val) {
    mensagens.value = { ...val }
    mensagensPadrao.value = { ...val }
  }
})
</script>

<template>
  <v-card class="pa-6 max-w-4xl mx-auto mt-10 rounded-xl " color="">
    <v-card-title class="text-h5 font-weight-bold text-purple-darken-3 mb-2">
      ✉️ Configuração de Mensagens
    </v-card-title>
    <v-card-subtitle class="text-sm text-grey-darken-1 mb-6">
      Personalize as mensagens automáticas de cobrança, confirmação, cancelamento e lembrete.<br />
      Use variáveis como <code>&#123;&#123;nome&#125;&#125;</code>,
      <code>&#123;&#123;valor&#125;&#125;</code>,
      <code>&#123;&#123;data&#125;&#125;</code>.
    </v-card-subtitle>

    <v-form ref="formRef" v-model="valid">
      <v-textarea
        v-model="mensagens.mensagemCobranca"
        label="Mensagem de Cobrança"
        auto-grow
        :rules="[v => !!v || 'Obrigatório']"
        color="purple-darken-3"
        variant="outlined"
        rounded
        class="mb-6"
      />

      <v-textarea
        v-model="mensagens.mensagemConfirmacao"
        label="Mensagem de Confirmação de Pagamento"
        auto-grow
        :rules="[v => !!v || 'Obrigatório']"
        color="purple-darken-3"
        variant="outlined"
        rounded
        class="mb-6"
      />

      <v-textarea
        v-model="mensagens.mensagemCancelamento"
        label="Mensagem de Cancelamento"
        auto-grow
        color="purple-darken-3"
        variant="outlined"
        rounded
        class="mb-6"
      />

      <v-textarea
        v-model="mensagens.msgLembreteAtendimento"
        label="Mensagem de Lembrete de Atendimento"
        auto-grow
        color="purple-darken-3"
        variant="outlined"
        rounded
        class="mb-6"
      />

      <div class="d-flex justify-end gap-3">
        <v-btn variant="text" color="grey" @click="resetMensagens">Restaurar Padrão</v-btn>
        <v-btn :loading="loading" color="purple-darken-3" class="rounded-lg" @click="submit">Salvar Mensagens</v-btn>
      </div>
    </v-form>
  </v-card>
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
