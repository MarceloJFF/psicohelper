<template>
    <v-dialog v-model="modelShow" max-width="600px">
      <v-card>
        <v-card-title>{{ isEdit ? 'Editar' : 'Novo' }} Pagamento</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.valor" label="Valor" type="number" />
          <v-select
            v-model="form.forma_pagamento_tipo"
            :items="['Dinheiro', 'PIX', 'Cartão']"
            label="Forma de Pagamento"
          />
          <v-textarea v-model="form.observacao" label="Observações" />
          <v-file-input v-model="arquivo" label="Comprovante (PDF)" accept="application/pdf" />
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="fechar">Cancelar</v-btn>
          <v-spacer />
          <v-btn color="primary" @click="salvar">Salvar</v-btn>
        </v-card-actions>
      </v-card>
      <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
        {{ snackbar.message }}
      </v-snackbar>
    </v-dialog>
  </template>
  
  <script setup lang="ts">
  import { ref, defineEmits, defineProps, watch, computed } from 'vue'
  import { PagamentoService } from '@/services/PagamentoService'
  
  const props = defineProps<{
    show: boolean
    isEdit?: boolean
    pagamento?: any
    sessaoId: string
  }>()
  
  const emit = defineEmits(['update:show', 'salvo'])
  
  // v-model proxy para a prop `show`
  const modelShow = computed({
    get: () => props.show,
    set: (val: boolean) => emit('update:show', val)
  })
  
  const form = ref({
    valor: 0,
    forma_pagamento_tipo: '',
    observacao: '',
  })
  
  const arquivo = ref<File | null>(null)
  
  const snackbar = ref({
    show: false,
    message: '',
    color: 'success'
  })
  
  function showSnackbar(message: string, color: string = 'success') {
    snackbar.value = {
      show: true,
      message,
      color
    }
  }
  
  watch(() => props.show, (val) => {
    if (val && props.pagamento) {
      form.value = {
        valor: props.pagamento.valor || 0,
        forma_pagamento_tipo: props.pagamento.forma_pagamento_tipo || '',
        observacao: props.pagamento.observacao || '',
      }
    } else {
      form.value = {
        valor: 0,
        forma_pagamento_tipo: '',
        observacao: '',
      }
      arquivo.value = null
    }
  })
  
  function fechar() {
    emit('update:show', false)
  }
  
  async function salvar() {
    try {
      let pagamento;
      if (props.isEdit && props.pagamento?.id) {
        pagamento = await PagamentoService.atualizarPagamento(
          props.pagamento.id,
          {
            valor: form.value.valor,
            forma_pagamento_tipo: form.value.forma_pagamento_tipo,
            observacao: form.value.observacao,
            pago: true
          },
          arquivo.value || undefined
        )
      } else {
        pagamento = await PagamentoService.criarPagamento(
          {
            id_sessao: props.sessaoId,
            valor: form.value.valor,
            forma_pagamento_tipo: form.value.forma_pagamento_tipo,
            observacao: form.value.observacao,
            pago: true,
            created_at: new Date().toISOString(),
          },
          arquivo.value
        )
      }
  
      emit('salvo', pagamento)
      showSnackbar('Pagamento salvo com sucesso.', 'success')
      fechar()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      showSnackbar('Erro ao salvar pagamento: ' + errorMessage, 'error')
    }
  }
  </script>
  