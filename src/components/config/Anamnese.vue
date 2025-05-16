<template>
  <v-card class="pa-6 rounded-xl shadow-lg max-w-2xl mx-auto mt-8">
    <v-card-title class="text-h5 font-weight-bold text-center mb-4">
      Criar Modelo de Anamnese
    </v-card-title>

    <v-card-text>
      <v-form @submit.prevent="submit">
        <v-text-field
          v-model="nomeModelo"
          label="Nome do Modelo"
          class="mb-6"
          outlined
        />
        <v-textarea
          v-model="perguntasText"
          label="Perguntas (uma por linha)"
          auto-grow
          outlined
          rows="5"
          class="mb-6"
        />
        <div class="d-flex justify-space-between mt-6">
          <v-btn color="success" type="submit" class="px-6">
            Salvar Anamnese
          </v-btn>
        </div>
      </v-form>
    </v-card-text>

    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          Modelo Salvo com Sucesso
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="perguntasText"
            label="Perguntas Salvas"
            readonly
            auto-grow
            outlined
            rows="5"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="dialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ModeloAnamneseService } from '@/services/ModeloAnamneseService'
import { useStoreConfig } from '@/stores/storeConfig'

const storeConfig = useStoreConfig()
const nomeModelo = ref('Anamnese Padrão')
const dialog = ref(false)
const perguntasText = ref('')

const modeloService = new ModeloAnamneseService()

async function carregarModelo() {
  try {
    const idConfig = storeConfig.configuracao?.id || ''
    if (!idConfig) return
    const modelo = await modeloService.obterModeloPorConfig(idConfig)
    if (modelo) {
      nomeModelo.value = modelo.nome
      perguntasText.value = (modelo as any).perguntas || ''
    } else {
      perguntasText.value = ''
    }
  } catch (err: any) {
    console.error('Erro ao carregar modelo:', err)
  }
}
const loading = ref(false)
const error = ref<string | null>(null)

async function submit() {
  try {
    loading.value = true
    error.value = null
    await modeloService.salvarModeloTexto(
      storeConfig.configuracao?.id || '',
      nomeModelo.value,
      perguntasText.value
    )
    dialog.value = true
  } catch (err: any) {
    error.value = err.message || 'Erro ao salvar anamnese'
    console.error('Erro ao salvar anamnese:', err)
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  carregarModelo()
})
</script>
