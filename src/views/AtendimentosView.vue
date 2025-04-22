<template>
  <v-container>
    <v-row align="center" justify="space-between">
      <v-switch
        v-model="keepNotesOpen"
        label="Manter anotações abertas"
        class="mr-4"
      />
      <v-select
        :items="profissionais"
        v-model="filtroProfissional"
        label="Profissional"
        clearable
      />
    </v-row>

    <v-divider class="my-4" />

    <div v-for="(grupo, data) in atendimentosAgrupados" :key="data">
      <v-card class="mb-4">
        <v-card-title>{{ formatarData(data) }}</v-card-title>
        <v-divider />

        <v-list>
          <v-list-item
            v-for="atendimento in grupo"
            :key="atendimento.id"
            class="d-flex flex-column"
          >
            <v-row align="center" justify="space-between" class="w-100">
              <v-avatar size="32">
                <img :src="atendimento.avatar" alt="Profissional" />
              </v-avatar>

              <div>{{ atendimento.horario }}</div>

              <div>
                <span
                  :class="{
                    'text-success': atendimento.status === 'Pago',
                    'text-error': atendimento.status === 'Pendente'
                  }"
                >
                  {{ atendimento.status }}
                </span>
              </div>

              <v-btn icon>
                <v-icon>mdi-thumb-up</v-icon>
              </v-btn>
              <v-btn icon>
                <v-icon>mdi-chat</v-icon>
              </v-btn>
            </v-row>

            <v-expand-transition>
              <div v-if="keepNotesOpen || atendimento.anotacao">
                <v-alert
                  v-if="atendimento.anotacao"
                  type="info"
                  class="mt-2"
                >
                  {{ atendimento.anotacao }}
                </v-alert>
                <v-btn v-else class="mt-2" size="small" @click="adicionarAnotacao(atendimento)">
                  Adicionar anotação da sessão
                </v-btn>
              </div>
            </v-expand-transition>
          </v-list-item>
        </v-list>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';

const keepNotesOpen = ref(false);
const filtroProfissional = ref(null);

const profissionais = ['Dra. Fernanda', 'Dr. João', 'Todos'];

const atendimentos = ref([
  {
    id: 1,
    data: '2023-08-30',
    horario: '11:00',
    profissional: 'Dra. Fernanda',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    status: 'Pago',
    anotacao: null
  },
  {
    id: 2,
    data: '2023-08-23',
    horario: '11:00',
    profissional: 'Dra. Fernanda',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    status: 'Pago',
    anotacao: 'Na sessão de hoje, focamos em compreender melhor a ansiedade...'
  },
  {
    id: 3,
    data: '2023-08-16',
    horario: '11:00',
    profissional: 'Dra. Fernanda',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    status: 'Pagar',
    anotacao: null
  }
]);

const atendimentosAgrupados = computed(() => {
  const filtrados = filtroProfissional.value && filtroProfissional.value !== 'Todos'
    ? atendimentos.value.filter(a => a.profissional === filtroProfissional.value)
    : atendimentos.value;

  return filtrados.reduce((acc, cur) => {
    if (!acc[cur.data]) acc[cur.data] = [];
    acc[cur.data].push(cur);
    return acc;
  }, {});
});

function formatarData(dataISO) {
  const data = new Date(dataISO);
  return data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function adicionarAnotacao(atendimento) {
  atendimento.anotacao = 'Nova anotação da sessão...';
}
</script>

<style scoped>
.v-list-item {
  border-bottom: 1px solid #e0e0e0;
}
</style>
