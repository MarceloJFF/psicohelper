<script setup lang="ts">
defineProps({
  atendimento: Object
})

function visualizarComprovante(url: string) {
  window.open(url, '_blank')
}
</script>

<template>
  <v-row>
    <!-- Coluna com os dados principais -->
    <v-col cols="12" sm="6" md="4">
      <v-sheet class="pa-4" color="blue-grey-lighten-5" rounded="lg">
        <div class="mb-2">
          <strong>Horário Agendado:</strong><br />
          <span>{{ atendimento.horario }} - {{ atendimento.horario_fim }}</span>
        </div>
        <div class="mb-2">
          <strong >Aprendente:</strong><br />
          <span class="font-weight-bold	text-h6">{{ atendimento.paciente }}</span>
        </div>
        <div class="d-flex flex-wrap align-center gap-2 mb-2">
          <v-chip
            :color="atendimento.status === 'Pago' ? 'success' : 'error'"
            variant="elevated"
            class="text-capitalize"
            size="small"
          >
            {{ atendimento.status }}
          </v-chip>
          <v-chip
            :color="atendimento.id_contrato ? 'primary' : 'secondary'"
            variant="elevated"
            class="text-capitalize"
            size="small"
          >
            {{ atendimento.id_contrato ? 'Contrato' : 'Avulsa' }}
          </v-chip>
        </div>
        <div v-if="atendimento.id_contrato" class="text-caption mb-2">
          <strong>Contrato - {{ atendimento.id_contrato }}</strong>
        </div>
        <div v-if="atendimento.status === 'Pago'" class="mt-2">
          <div class="text-caption mb-1">
            <strong>Valor Pago:</strong> R$ {{ atendimento.valor_pagamento?.toFixed(2) }}
          </div>
          <div class="text-caption mb-1">
            <strong>Forma de Pagamento:</strong> {{ atendimento.forma_pagamento }}
          </div>
          <div v-if="atendimento.comprovante_url">
            <v-btn
              size="small"
              color="info"
              variant="text"
              @click="visualizarComprovante(atendimento.comprovante_url)"
            >
              Ver Comprovante
            </v-btn>
          </div>
        </div>
      </v-sheet>
    </v-col>

    <!-- Coluna com ações -->
    <v-col cols="12" sm="6" class="d-flex align-center flex-wrap gap-2">
      <v-btn icon @click="atendimento.showDetails = !atendimento.showDetails">
        <v-icon>{{ atendimento.showDetails ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
      </v-btn>

      <v-btn
        color="primary"
        variant="text"
        @click="atendimento.showDetails = !atendimento.showDetails"
      >
        {{ atendimento.showDetails ? 'Ocultar Detalhes' : 'Mostrar Detalhes' }}
      </v-btn>

      <v-btn
        v-if="atendimento.status === 'Pendente'"
        color="success"
        variant="outlined"
        @click="abrirModalPagamento(atendimento)"
      >
        Pagar
      </v-btn>

      <v-btn
        v-if="atendimento.status === 'Pago'"
        color="error"
        variant="outlined"
        @click="abrirModalPagamento(atendimento)"
      >
        Editar Pagamento
      </v-btn>
    </v-col>
  </v-row>
</template>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
