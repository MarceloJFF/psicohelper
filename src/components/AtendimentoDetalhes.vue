<script setup lang="ts">

defineProps({
  atendimento: {}
})
</script>

<template>
  <v-col cols="12" sm="6" md="4">
    <div class="font-weight-medium pa-2">
      Horário Agendado: {{ atendimento.horario }} - {{ atendimento.horario_fim }}
    </div>
    <div class="font-weight-medium pa-2">
      Aprendente: {{ atendimento.paciente }}
    </div>
    <div class="d-flex align-center gap-2 pa-2">
      <v-chip :color="atendimento.status === 'Pago' ? 'success' : 'error'" variant="outlined" class="text-capitalize" small>
        {{ atendimento.status }}
      </v-chip>
      <v-chip :color="atendimento.id_contrato ? 'primary' : 'secondary'" variant="outlined" class="text-capitalize" small>
        {{ atendimento.id_contrato ? 'Contrato' : 'Avulsa' }}
      </v-chip>
    </div>
    <div v-if="atendimento.id_contrato" class="text-caption mt-2">
      Contrato #{{ atendimento.id_contrato }}
    </div>
    <div v-if="atendimento.status === 'Pago'" class="mt-2">
      <div class="text-caption">
        <strong>Valor Pago:</strong> R$ {{ atendimento.valor_pagamento?.toFixed(2) }}
      </div>
      <div class="text-caption">
        <strong>Forma de Pagamento:</strong> {{ atendimento.forma_pagamento }}
      </div>
      <div v-if="atendimento.comprovante_url" class="mt-1">
        <v-btn size="small" color="info" variant="text" @click="visualizarComprovante(atendimento.comprovante_url)">
          Ver Comprovante
        </v-btn>
      </div>
    </div>
  </v-col>

  <v-spacer />
  <v-col cols="12" sm="6" class="d-flex align-center">
    <v-btn icon @click="atendimento.showDetails = !atendimento.showDetails">
      <v-icon>{{ atendimento.showDetails ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
    </v-btn>
    <v-btn color="primary" variant="text" @click="atendimento.showDetails = !atendimento.showDetails">
      {{ atendimento.showDetails ? 'Ocultar Detalhes' : 'Mostrar Detalhes' }}
    </v-btn>
    <v-btn
      v-if="atendimento.status === 'Pendente'"
      color="success" variant="outlined" class="ml-2" @click="abrirModalPagamento(atendimento)">
      Pagar
    </v-btn>
    <v-btn
      v-if="atendimento.status === 'Pago'"
      color="error" variant="outlined" class="ml-2" @click="abrirModalPagamento(atendimento)">
      Editar Pagamento
    </v-btn>
  </v-col>
</template>

<style scoped>

</style>
