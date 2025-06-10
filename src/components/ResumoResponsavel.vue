<template>
  <v-card elevation="3" class="pa-6 rounded-lg mb-8">
    <v-row align="center">
      <!-- Avatar -->
      <v-col cols="12" md="2" class="text-center position-relative">
        <v-avatar size="90" color="grey-lighten-3" class="mx-auto">
          <span class="text-h4 font-weight-medium">
            {{ aprendente?.nome_aprendente?.[0] || aprendente?.nome?.[0] || '?' }}
          </span>
        </v-avatar>
      </v-col>

      <!-- Informações do Aprendente -->
      <v-col cols="12" md="6">
        <!-- Nome + Status -->
        <div class="d-flex align-center mb-3">
          <v-text class="text-h6 font-weight-bold me-3">
            {{ aprendente?.nome_aprendente || aprendente?.nome }}
          </v-text>
          <v-chip
            v-if="responsavel"
            :color="responsavel.status_matricula ? 'success lighten-4' : 'error lighten-4'"
            :text-color="responsavel.status_matricula ? 'success darken-4' : 'error darken-4'"
            size="small"
          >
            {{ responsavel.status_matricula ? 'Ativo' : 'Inativo' }}
          </v-chip>
        </div>

        <!-- Nascimento -->
        <div class="d-flex align-center mb-2">
          <v-icon size="20" class="me-2 text-secondary">mdi-cake-variant</v-icon>
          <v-text class="text-body-2 text-secondary">
            Nasceu em {{ aniversario}} ({{ ageInYears }} anos)
          </v-text>
        </div>

        <!-- Gênero -->
        <div class="d-flex align-center mb-2" v-if="aprendente?.genero">
          <v-icon size="20" class="me-2 text-secondary">mdi-gender-male-female</v-icon>
          <v-text class="text-body-2 text-secondary">Gênero: {{ aprendente.genero }}</v-text>
        </div>

        <!-- Contato -->
        <div class="d-flex align-center mb-2" v-if="aprendente?.telefone || aprendente?.email">
          <template v-if="aprendente.telefone">
            <v-icon size="20" class="me-2 text-secondary">mdi-phone</v-icon>
            <v-text class="text-body-2 text-secondary me-4">{{ aprendente.telefone }}</v-text>
          </template>

          <template v-if="aprendente.email">
            <v-icon size="20" class="me-2 text-secondary">mdi-email</v-icon>
            <v-text class="text-body-2 text-secondary">{{ aprendente.email }}</v-text>
          </template>
        </div>

        <v-divider class="my-3" />

        <!-- Sessões -->
        <div class="d-flex align-center mb-2">
          <v-icon size="20" class="me-2 text-secondary">mdi-calendar-clock</v-icon>
          <v-text class="text-body-2">
            <strong>Próxima sessão:</strong> {{ proximoAtendimentoAprendenteComputed }}
          </v-text>
        </div>

        <div class="d-flex align-center">
          <v-icon size="20" class="me-2 text-success">mdi-check-circle-outline</v-icon>
          <v-text class="text-body-2">
            <strong>Total sessões atendidas: {{sessoesAprendentesCount}} </strong>  <!-- substituir pela variável real -->
          </v-text>
        </div>
      </v-col>

      <!-- Bloco do Responsável -->
      <v-col cols="12" md="4">
        <v-card flat class="pa-4">
          <div v-if="responsavel">
            <div class="d-flex align-center mb-2">
              <v-icon size="20" class="me-2 text-primary">mdi-account-tie</v-icon>
              <v-text class="text-body-1 font-weight-medium">Responsável: {{ responsavel.nome }}</v-text>
            </div>
            <v-divider class="my-2" />

            <div class="d-flex align-center mb-2">
              <v-icon size="20" class="me-2 text-secondary">mdi-phone</v-icon>
              <v-text class="text-body-2 text-secondary">{{ responsavel.telefone }}</v-text>
            </div>

            <div class="d-flex align-center mb-2">
              <v-icon size="20" class="me-2 text-secondary">mdi-email</v-icon>
              <v-text class="text-body-2 text-secondary">{{ responsavel.email }}</v-text>
            </div>

            <div class="d-flex align-center">
              <v-icon size="20" class="me-2 text-secondary">mdi-map-marker</v-icon>
              <v-text class="text-body-2 text-secondary">
                {{ responsavel.cidade }}, {{ responsavel.estado }}
              </v-text>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { AprendenteService } from '@/services/AprendenteService'
import { ResponsavelService } from '@/services/responsavelService'
import Aprendente from '@/models/Aprendente'
import Responsavel from '@/models/Responsavel'
import { buscarAgendamentoProximoDoAprendente, contarSessoesDoAprendente, formatarData } from '@/utils/utils.ts'

const props = defineProps<{
  idAprendente: string
  isAprendente: boolean
  idResponsavel: string
}>()


const ageInYears = computed(() => {
  if (!aprendente.value?.nascimento) return 0

  const birthDate = new Date(aprendente.value.nascimento)
  const currentDate = new Date()

  const diffTime = Math.abs(currentDate - birthDate)
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25)
  return Math.floor(diffYears)
})

const aprendente = ref<Aprendente | null>(null)
const responsavel = ref<Responsavel | null>(null)

const responsavelService = new ResponsavelService()
const aprendenteService = new AprendenteService()

onMounted(async () => {
  await fetchAprendente()
  await fetchResponsavel()
})

watch(() => props.idAprendente, fetchAprendente)
watch(() => props.idResponsavel, fetchResponsavel)


const proximoAtendimentoAprendente = ref<string | null>(null)
const sessoesAprendentesCount = ref<number>(0);

const proximoAtendimentoAprendenteComputed = computed(() => {
  if(!proximoAtendimentoAprendente.value) return 'Carregando...'
  if(proximoAtendimentoAprendente.value === 'Sem agendamentos próximos') return proximoAtendimentoAprendente.value
  return formatarData(proximoAtendimentoAprendente?.value)
})

const aniversario = computed(() => {
  if (!aprendente.value?.nascimento) return 'Data de nascimento não informada'
  return formatarData(aprendente.value.nascimento)
})

watch(aprendente, async (novoAprendente) => {
  if (!novoAprendente) {
    proximoAtendimentoAprendente.value = null
    return
  }
  const resultado = await buscarAgendamentoProximoDoAprendente(aprendente.value.id)
  sessoesAprendentesCount.value= await contarSessoesDoAprendente(aprendente.value.id)
  proximoAtendimentoAprendente.value = resultado?.data_agendamento ?? 'Sem agendamentos próximos'
}, { immediate: true })



async function fetchAprendente() {
  if (!props.idAprendente) return
  aprendente.value = await aprendenteService.getAprendenteById(props.idAprendente)
}

async function fetchResponsavel() {
  if (!props.idResponsavel) return
  responsavel.value = await responsavelService.getResponsavelById(props.idResponsavel)
}
</script>
