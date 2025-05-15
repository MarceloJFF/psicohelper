<template>
  <v-card class="pa-6 rounded-xl shadow-lg max-w-2xl mx-auto mt-8">
    <v-card-title class="text-h5 font-weight-bold text-center mb-4">
      <v-icon size="x-large" color="primary">mdi-brain</v-icon>
      <h3 class=" text-h4 text-deep-purple-lighten-1">Criar Modelo de Anamnese</h3>
      
    </v-card-title>

    <v-card-text>
      <v-form @submit.prevent="submit">
        <v-text-field
          v-model="nomeModelo"
          label="Nome do Modelo"
          class="mb-6"
          outlined
        />
        <v-row dense v-for="(pergunta, index) in perguntas" :key="index" class="mb-4">
  <v-col cols="11">
    <v-textarea
      v-model="pergunta.texto"
      :label="`Pergunta ${index + 1}`"
      auto-grow
      outlined
      dense
      rows="1"
    />
  </v-col>
  <v-col cols="1" class="d-flex align-center">
    <v-btn
      icon
      color="error"
      @click="removerPergunta(index)"
      :disabled="loading"
      v-if="index >= perguntasDefault.length"
    >
      <v-icon>mdi-delete</v-icon>
    </v-btn>
  </v-col>
</v-row>
        <div class="d-flex justify-space-between mt-6">
          <v-btn color="primary" @click="adicionarPergunta" class="px-6">
            Adicionar Pergunta
          </v-btn>
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
          <v-list dense>
            <v-list-item v-for="(pergunta, index) in perguntas" :key="index">
              <v-list-item-title class="font-weight-bold">
                {{ pergunta.texto }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
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
const perguntas = ref<{ texto: string }[]>([])

const modeloService = new ModeloAnamneseService()
const perguntasDefault = ref<{ texto: string }[]>([

])// Em carregarModelo(), substitua:
perguntas.value = []
// Por:
perguntas.value = [...perguntasDefault.value]
function adicionarPergunta() {
  perguntas.value.push({ texto: 'Nova pergunta' })
}
function removerPergunta(index: number) {
  // Verifica se é uma pergunta adicional (não padrão)
  if (index >= perguntasDefault.value.length) {
    perguntas.value.splice(index, 1)
  }
}

async function carregarModelo() {
  try {
    console.log(storeConfig.configuracao?.id)
    const modelo = await modeloService.obterModeloPorConfig(storeConfig.configuracao?.id)
    if (modelo) {
      nomeModelo.value = modelo.nome
      console.log(modelo)
      const lista = await modeloService.carregarPerguntas(modelo.id)
      perguntas.value = lista.map(p => ({ texto: p.texto }))
    } else {
      // Se não existir modelo ainda, inicializa vazio
      perguntas.value = []
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
    await modeloService.salvarOuAtualizarModelo(
      storeConfig.configuracao?.id || '', 
      nomeModelo.value, 
      perguntas.value
    )
    alert("salvou")

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
