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
            @update:model-value="carregarLembretes"
          />

          <v-list class="pa-4" lines="two">
            <v-list-item
              v-for="lembrete in lembretesFiltrados"
              :key="lembrete.id"
              class="rounded-lg mb-2 transition-swing"
              :class="{
                'bg-deep-purple-lighten-5': lembrete.feito,
                  'border-left-4 border-deep-purple': !lembrete.feito && isUrgente(lembrete.data_expiracao)
              }"
            >
              <template #prepend>
                <v-avatar color="deep-purple-lighten-3" size="40">
                  <v-icon>mdi-bell</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-medium">{{ lembrete.descricao }}</v-list-item-title>
              <v-list-item-subtitle>
                <div class="d-flex align-center">
                  <v-icon size="small" color="deep-purple" class="mr-1">mdi-calendar</v-icon>
                  {{ formatarData(lembrete.data_expiracao) }}
                  <v-chip
                    v-if="isUrgente(lembrete.data_expiracao)"
                    size="small"
                    color="error"
                    class="ml-2"
                  >
                    Urgente
                  </v-chip>
                </div>
              </v-list-item-subtitle>

              <template #append>
                <div class="d-flex align-center">
                  <v-btn
                    icon
                    variant="text"
                    color="deep-purple"
                    @click="toggleFeito(lembrete)"
                    class="mr-2"
                  >
                    <v-icon>{{ lembrete.feito ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline' }}</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    @click="removerLembrete(lembrete.id!)"
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
                class="mascote"
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
              v-model="novoLembrete.descricao"
              label="Descrição"
              required
            ></v-text-field>
            <v-text-field
              v-model="novoLembrete.data_expiracao"
              type="datetime-local"
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
import { ref, computed, onMounted } from 'vue'
import { LembreteService, type Lembrete } from '@/services/LembreteService'
import { useStoreProfissional } from '@/stores/storeProfissional'

const storeProfissional = useStoreProfissional()
const lembreteService = new LembreteService()

const selectedDate = ref(new Date().toISOString().substr(0, 10))
const dialogNovoLembrete = ref(false)
const lembretes = ref<Lembrete[]>([])

const novoLembrete = ref<Lembrete>({
  descricao: '',
  data_expiracao: '',
  feito: false,
  idProfissional: storeProfissional.profissionalDetails?.id || '',
})

const lembretesFiltrados = computed(() => {
  return lembretes.value.filter(lembrete => {
    const dataLembrete = new Date(lembrete.data_expiracao).toISOString().split('T')[0]
    return dataLembrete === selectedDate.value
  })
})  

const lembretesCompletos = computed(() => {
  return lembretes.value.filter(item => item.feito).length
})

const mensagemMascote = computed(() => {
  const progresso = lembretesCompletos.value / lembretes.value.length
  if (progresso === 1) return 'Parabéns! Todas as tarefas foram concluídas! 🎉'
  if (progresso > 0.5) return 'Continue assim! Você está indo muito bem! 💪'
  return 'Vamos organizar o dia com carinho? 🌟'
})

const carregarLembretes = async () => {
  if (storeProfissional.profissionalDetails?.id) {
    const lembretesCarregados = await lembreteService.buscarLembretesDoProfissional(storeProfissional.profissionalDetails.id)
    if (lembretesCarregados) {
      lembretes.value = lembretesCarregados
    }
  }
}

const toggleFeito = async (lembrete: Lembrete) => {
  lembrete.feito = !lembrete.feito
  lembrete.data_conclusao = lembrete.feito ? new Date().toISOString() : undefined
  await lembreteService.atualizarLembrete(lembrete)
  await carregarLembretes()
}

const removerLembrete = async (id: string) => {
  if (storeProfissional.profissionalDetails?.id) {
    await lembreteService.deletarLembrete(id, storeProfissional.profissionalDetails.id)
    await carregarLembretes()
  }
}

const adicionarLembrete = () => {
  novoLembrete.value = {
    descricao: '',
    data_expiracao: '',
    feito: false,
    idProfissional: storeProfissional.profissionalDetails?.id || '',
  }
  dialogNovoLembrete.value = true
}

const salvarLembrete = async () => {
  if (novoLembrete.value.descricao && novoLembrete.value.data_expiracao ) {
    await lembreteService.criarLembrete(novoLembrete.value)
    dialogNovoLembrete.value = false
    await carregarLembretes()
  }
}

const formatarData = (data: string) => {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isUrgente = (data: string) => {
  const hoje = new Date()
  const dataExpiracao = new Date(data)
  const diffTime = dataExpiracao.getTime() - hoje.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 2 && diffDays >= 0
}

onMounted(() => {
  carregarLembretes()
})
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
