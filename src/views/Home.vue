<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12" md="8">
        <v-card class="pa-8 rounded-xl elevation-2">
          <div class="d-flex align-center justify-space-between mb-4">
            <h2 class="text-h5 font-weight-bold deep-purple-lighten-1">Lembretes do Dia</h2>
            <v-btn
              color="deep-purple"
              prepend-icon="mdi-plus"
              variant="tonal"
              @click="adicionarLembrete"
            >
              Novo Lembrete
            </v-btn>
          </div>
          <v-date-picker
  v-model="selectedDate"
  color="deep-purple-lighten-1"
  locale="pt-BR"
  show-adjacent-months
  hide-header
  size="small"
  elevation="0"
  class="mb-4 bg-grey-lighten-4 rounded-lg border"
  style="border: 1px solid #ccc;"
/>


          <v-list class="pa-4" lines="two">
            <v-list-item
              v-for="(item, index) in lembretes"
              :key="index"
              class="rounded-lg mb-2 transition-swing"
              :class="{
                'bg-deep-purple-lighten-5': item.done,
                'border-left-4 border-deep-purple': !item.done && isUrgente(item.dataExpiracao)
              }"
            >
              <template #prepend>
                <v-avatar color="deep-purple-lighten-3" size="40">
                  <v-icon>{{ item.icon }}</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-medium">{{ item.titulo }}</v-list-item-title>
              <v-list-item-subtitle>
                <div class="d-flex align-center">
                  <v-icon size="small" color="deep-purple" class="mr-1">mdi-calendar</v-icon>
                  {{ formatarData(item.dataExpiracao) }}
                  <v-chip
                    v-if="isUrgente(item.dataExpiracao)"
                    size="small"
                    color="error"
                    class="ml-2"
                  >
                    Urgente
                  </v-chip>
                </div>
                <div v-if="item.subtitulo" class="mt-1">{{ item.subtitulo }}</div>
              </v-list-item-subtitle>

              <template #append>
                <div class="d-flex align-center">
                  <v-btn
                    icon
                    variant="text"
                    color="deep-purple"
                    @click="toggleFeito(index)"
                    class="mr-2"
                  >
                    <v-icon>{{ item.done ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline' }}</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    @click="removerLembrete(index)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4 rounded-xl elevation-2 h-100 align-center justify-center">
          <div class="text-center">
            <div class="mascote-container">
              <v-img
                src="src/assets/mascote.png"
                max-width="400"
                class=" mascote"
                :class="{ 'mascote-happy': lembretesCompletos > 0 }"
              ></v-img>
            </div>
            <div class="mt-4 text-h6 font-weight-medium">
              {{ mensagemMascote }}
            </div>
            <div class="mt-2 text-subtitle-1 text-medium-emphasis">
              {{ lembretesCompletos }} de {{ lembretes.length }} tarefas concluídas
            </div>
            <v-progress-linear
              :model-value="(lembretesCompletos / lembretes.length) * 100"
              color="deep-purple"
              height="8"
              rounded
              class="mt-4"
            ></v-progress-linear>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo para adicionar novo lembrete -->
    <v-dialog v-model="dialogNovoLembrete" max-width="500px">
      <v-card>
        <v-card-title>Novo Lembrete</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="salvarLembrete">
            <v-text-field
              v-model="novoLembrete.titulo"
              label="Título"
              required
            ></v-text-field>
            <v-text-field
              v-model="novoLembrete.subtitulo"
              label="Subtítulo"
            ></v-text-field>
            <v-select
              v-model="novoLembrete.icon"
              :items="icones"
              label="Ícone"
            ></v-select>
            <v-text-field
              v-model="novoLembrete.dataExpiracao"
              type="date"
              label="Data de Expiração"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="dialogNovoLembrete = false">Cancelar</v-btn>
          <v-btn color="deep-purple" @click="salvarLembrete">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const selectedDate = ref(new Date().toISOString().substr(0, 10))
const dialogNovoLembrete = ref(false)

const icones = [
  { title: 'Paciente', value: 'mdi-account' },
  { title: 'Consulta', value: 'mdi-calendar-clock' },
  { title: 'Atividade', value: 'mdi-pencil' },
  { title: 'Documento', value: 'mdi-file-document' },
  { title: 'Lembrete', value: 'mdi-bell' },
]

const novoLembrete = ref({
  titulo: '',
  subtitulo: '',
  icon: 'mdi-bell',
  dataExpiracao: '',
  done: false
})

const lembretes = ref([
  {
    titulo: 'Revisar plano terapêutico do João',
    subtitulo: 'Revisar',
    icon: 'mdi-account',
    dataExpiracao: '2024-03-25',
    done: true,
  },
  {
    titulo: '16:00 Consulta com Mariana',
    icon: 'mdi-calendar-clock',
    dataExpiracao: '2024-03-24',
    done: false,
  },
  {
    titulo: 'Preparar atividade de leitura',
    icon: 'mdi-pencil',
    dataExpiracao: '2024-03-26',
    done: false,
  },
  {
    titulo: 'Enviar relatório de avaliação',
    icon: 'mdi-file-document',
    dataExpiracao: '2024-03-23',
    done: false,
  },
])

const lembretesCompletos = computed(() => {
  return lembretes.value.filter(item => item.done).length
})

const mensagemMascote = computed(() => {
  const progresso = lembretesCompletos.value / lembretes.value.length
  if (progresso === 1) return 'Parabéns! Todas as tarefas foram concluídas! 🎉'
  if (progresso > 0.5) return 'Continue assim! Você está indo muito bem! 💪'
  return 'Vamos organizar o dia com carinho? 🌟'
})

const toggleFeito = (index: number) => {
  lembretes.value[index].done = !lembretes.value[index].done
}

const removerLembrete = (index: number) => {
  lembretes.value.splice(index, 1)
}

const adicionarLembrete = () => {
  novoLembrete.value = {
    titulo: '',
    subtitulo: '',
    icon: 'mdi-bell',
    dataExpiracao: '',
    done: false
  }
  dialogNovoLembrete.value = true
}

const salvarLembrete = () => {
  if (novoLembrete.value.titulo && novoLembrete.value.dataExpiracao) {
    lembretes.value.push({ ...novoLembrete.value })
    dialogNovoLembrete.value = false
  }
}

const formatarData = (data: string) => {
  return new Date(data).toLocaleDateString('pt-BR')
}

const isUrgente = (data: string) => {
  const hoje = new Date()
  const dataExpiracao = new Date(data)
  const diffTime = dataExpiracao.getTime() - hoje.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 2 && diffDays >= 0
}
</script>

<style scoped>
.v-date-picker {
  border-radius: 12px;
  overflow: hidden;
}

.mascote-container {
  position: relative;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mascote {
  transition: transform 0.3s ease;
}

.mascote-happy {
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.border-left-4 {
  border-left: 4px solid;
}

.transition-swing {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
</style>
