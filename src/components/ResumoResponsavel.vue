<template>
  <v-card v-if="aprendente || responsavel" elevation="1" class="pa-4 rounded-lg mb-8">
    <v-row align="center">
      <v-col cols="12" md="2" class="text-center">
        <v-avatar size="90" color="grey-lighten-3">
          <span class="text-h4 font-weight-medium">M</span>
        </v-avatar>
        <v-btn icon class="mt-2" size="small" color="primary" variant="tonal">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </v-col>

      <v-col cols="12" md="6">
        <div class="d-flex align-center mb-2">
          <span class="text-h6 font-weight-bold me-3">
            {{ aprendente?.nome_aprendente || aprendente?.nome }}
          </span>

          <v-chip
            v-if="responsavel"
            :color="responsavel.status_matricula ? 'green-lighten-2' : 'red-lighten-2'"
            :text-color="responsavel.status_matricula ? 'green-darken-4' : 'red-darken-4'"
            size="small"
          >
            {{ responsavel.status_matricula ? 'Ativo' : 'Inativo' }}
          </v-chip>

        </div>

        <div v-if="responsavel" class="d-flex flex-wrap align-center mb-2">
          <v-icon size="20" class="me-1">mdi-phone</v-icon>
          <span class="me-4">{{ responsavel.telefone }}</span>
          <v-icon size="20" class="me-1">mdi-email</v-icon>
          <span class="me-4">{{ responsavel.email }}</span>
          <v-icon size="20" class="me-1">mdi-calendar</v-icon>
          <span>Nascimento: {{ aprendente?.nascimento }}</span>
        </div>

        <div class="text-caption">
          <strong>CIDADE:</strong> {{ responsavel?.cidade || 'Não informado' }} |
          <strong>PRÓXIMA SESSÃO:</strong> -- |
          <strong>SESSÕES:</strong> 1
        </div>
      </v-col>

      <v-col cols="12" md="4" class="text-md-end text-start mt-4 mt-md-0">

        <div>
          <span class="text-success me-2"><strong> SESSÕES ATENDIDAS:</strong> 0</span>

        </div>
      </v-col>
    </v-row>
  </v-card>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { AprendenteService } from '@/services/AprendenteService'
import { ResponsavelService } from '@/services/responsavelService'
import Aprendente from '@/models/Aprendente'
import Responsavel from '@/models/Responsavel'

const props = defineProps<{
  idAprendente: string
  isAprendente: boolean
  idResponsavel: string
}>()

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

async function fetchAprendente() {
  if (!props.idAprendente) return
  aprendente.value = await aprendenteService.getAprendenteById(props.idAprendente)

}

async function fetchResponsavel() {
  if (!props.idResponsavel) return
  responsavel.value = await responsavelService.getResponsavelById(props.idResponsavel)
}
</script>
