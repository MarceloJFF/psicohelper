<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="rounded-xl pa-4">
          <v-row align="center" justify="space-between">
            <h2 class="text-h5 font-weight-bold">📅 Sessões Futuras</h2>
            <v-switch
              v-model="manterAnotacoesAbertas"
              label="Manter anotações abertas"
              inset
            />
          </v-row>

          <v-divider class="my-4" />

          <v-timeline side="start" density="comfortable">
            <v-timeline-item
              v-for="(sessao, index) in sessoes"
              :key="index"
              dot-color="primary"
              fill-dot
            >
              <template #opposite>
                <div class="text-center">
                  <div class="text-h6 font-weight-bold">{{ formatarData(sessao.data) }}</div>
                </div>
              </template>

              <v-card elevation="1" class="rounded-xl pa-4">
                <v-row>
                  <v-col cols="12" sm="3" class="d-flex align-center">
                    <v-avatar color="blue lighten-3" size="36" class="mr-2">
                      <span class="white--text">{{ getIniciais(sessao.nome) }}</span>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ sessao.nome }}</div>
                      <div class="text-caption grey--text">{{ sessao.horario }}</div>
                    </div>
                  </v-col>

                  <v-col cols="12" sm="3">
                    <v-chip :color="sessao.pago ? 'green' : 'grey'" dark>{{ sessao.pago ? 'Pago' : 'A pagar' }}</v-chip>
                  </v-col>

                  <v-col cols="12" sm="3">
                    <v-btn variant="outlined" prepend-icon="mdi-note-text-outline" size="small" color="primary">
                      Adicionar anotação
                    </v-btn>
                  </v-col>

                  <v-col cols="12" sm="3" class="d-flex justify-end align-center">
                    <v-icon v-if="sessao.concluida" color="green">mdi-check-circle</v-icon>
                    <v-icon v-else color="grey">mdi-progress-clock</v-icon>
                    <span class="ml-2">{{ sessao.concluida ? 'Concluída' : 'Pendente' }}</span>
                  </v-col>
                </v-row>

                <v-divider class="my-2" />

                <div v-if="sessao.anotacao" class="text-body-2">
                  <strong>{{ sessao.anotacao.titulo }}:</strong>
                  <p class="mb-0">{{ sessao.anotacao.texto }}</p>
                </div>
                <div v-else class="text-caption grey--text">Sem anotações compartilhadas</div>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const manterAnotacoesAbertas = ref(false)

const sessoes = ref([
  {
    data: '2023-08-30',
    nome: 'Daniel Fernandes',
    horario: '11:00',
    pago: false,
    concluida: false,
    anotacao: null,
  },
  {
    data: '2023-08-23',
    nome: 'Daniel Fernandes',
    horario: '11:00',
    pago: true,
    concluida: true,
    anotacao: {
      titulo: 'Anotação antes da sessão',
      texto: 'Na sessão de hoje, focamos em compreender melhor a natureza da ansiedade...',
    },
  },
  {
    data: '2023-08-14',
    nome: 'Ana Costa',
    horario: '14:00',
    pago: true,
    concluida: true,
    anotacao: {
      titulo: 'Campo compartilhado',
      texto: 'Introduzimos a técnica da respiração profunda como estratégia inicial...',
    },
  },
  {
    data: '2023-08-09',
    nome: 'Daniel Fernandes',
    horario: '11:00',
    pago: false,
    concluida: false,
    anotacao: {
      titulo: 'Motivo da ausência',
      texto: 'Paciente informou que tinha uma consulta médica no horário.',
    },
  },
  {
    data: '2023-08-02',
    nome: 'Carla Mendes',
    horario: '14:00',
    pago: true,
    concluida: true,
    anotacao: null,
  },
])

function formatarData(dataStr) {
  const d = new Date(dataStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

function getIniciais(nome) {
  return nome
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
}
</script>

<style scoped>
.v-timeline {
  --v-timeline-line-color: #90caf9;
}
</style>
