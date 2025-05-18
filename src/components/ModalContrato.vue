<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="700">
    <v-card>
      <v-card-title class="headline">Gerar Contrato</v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col
            cols="12"
            v-for="(dia, index) in contrato.diasAtendimento"
            :key="index"
          >
            <v-row>
              <v-col cols="4">
                <v-select
                  v-model="dia.dia"
                  label="Dia da semana"
                  :items="['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']"
                />
              </v-col>
              <v-col cols="8">
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      v-model="dia.inicio"
                      type="time"
                      label="Início"
                      variant="outlined"
                      density="compact"
                      class="grey lighten-3"
                      hide-details
                      @change="atualizarHorario(dia)"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="dia.fim"
                      type="time"
                      label="Término"
                      variant="outlined"
                      density="compact"
                      class="grey lighten-3"
                      hide-details
                      @change="atualizarHorario(dia)"
                    />
                  </v-col>
                  <v-col cols="2" class="d-flex align-end">
                    <v-btn icon color="red" @click="removerDiaAtendimento(index)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                  <v-col cols="2" class="d-flex align-end">
                    <v-btn icon color="primary" @click="adicionarDiaAtendimento">
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="6">
            <v-text-field
              v-model="contrato.valorMensal"
              label="Valor Mensal (R$)"
              type="number"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="contrato.duracao"
              label="Duração (meses)"
              type="number"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="contrato.vencimento"
              label="Data de Vencimento"
              type="date"
              :rules="[v => !!v || 'Campo obrigatório']"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="contrato.descricao"
              label="Descrição do Serviço"
              rows="3"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="red" @click="fechar">Fechar</v-btn>
        <v-btn color="primary" @click="salvarContrato">Salvar Contrato</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Contrato from '@/models/Contrato'
import  DiasAtendimentoContrato from '@/models/DiasAtendimentoContrato'

const props = defineProps<{
  modelValue: boolean
  contratoInicial: Contrato
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'salvar', contrato: Contrato): void
}>()

const contrato = ref<Contrato>(new Contrato())

watch(() => props.contratoInicial, (newVal) => {
  // Create a new contract instance with all fields
  contrato.value = new Contrato()

  // Map all fields from the initial contract
  contrato.value.idContrato = newVal.id_contrato || newVal.idContrato
  contrato.value.valorMensal = newVal.valor_mensal || newVal.valorMensal
  contrato.value.duracao = newVal.duracao
  contrato.value.descricao = newVal.descricao_servico || newVal.descricao
  contrato.value.descricaoServico = newVal.descricao_servico || newVal.descricaoServico
  contrato.value.cadastrado = newVal.cadastrado
  contrato.value.idResponsavel = newVal.id_responsavel || newVal.idResponsavel
  contrato.value.idProfissional = newVal.id_profissional || newVal.idProfissional

  // Handle the vencimento date
  if (newVal.vencimento instanceof Date) {
    contrato.value.vencimento = newVal.vencimento.toISOString().split('T')[0]
  } else if (typeof newVal.vencimento === 'string') {
    contrato.value.vencimento = newVal.vencimento
  } else {
    // Set default to next month if no date is provided
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    contrato.value.vencimento = nextMonth.toISOString().split('T')[0]
  }

  // Handle diasAtendimento
  if (newVal.diasAtendimento && newVal.diasAtendimento.length > 0) {
    contrato.value.diasAtendimento = newVal.diasAtendimento.map(dia => ({
      id: dia.id || '',
      dia: dia.dia || '',
      inicio: dia.inicio || '',
      fim: dia.fim || '',
      contratoId: dia.contratoId || dia.id_contrato || ''
    }))
  } else {
    // Initialize with one empty day if no days are provided
    contrato.value.diasAtendimento = [{
      id: '',
      dia: '',
      inicio: '',
      fim: '',
      contratoId: ''
    }]
  }
}, { immediate: true })

const adicionarDiaAtendimento = () => {
  console.log("Add dias atendimento")
  contrato.value.diasAtendimento.push({
    id: '',
    dia: '',
    inicio: '',
    fim: '',
    contratoId: '',
  })
}

const removerDiaAtendimento = (index: number) => {
  contrato.value.diasAtendimento.splice(index, 1)
}

const atualizarHorario = (dia: { inicio: string, fim: string }) => {
  dia.inicio = dia.inicio.trim()
  dia.fim = dia.fim.trim()
}

const fechar = () => {
  emit('update:modelValue', false)
}

const salvarContrato = () => {
  console.log("Emitindo")
  console.log(contrato.value)
  emit('salvar', { ...contrato.value })
  emit('update:modelValue', false)
}
</script>
