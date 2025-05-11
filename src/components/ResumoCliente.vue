<template>
  <v-card v-if="aprendente" elevation="1" class="pa-4 rounded-lg mb-8">
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
            {{ aprendente.nome_cliente || aprendente.nome_dependente }}
          </span>
          <v-chip class="me-2" color="green-lighten-3" text-color="green-darken-2" size="small">
            sem débitos
          </v-chip>
          <v-chip
            v-if="responsavel"
            color="green-lighten-2"
            text-color="green-darken-4"
            size="small"
          >
            {{ responsavel.status ? 'Ativo' : 'Inativo' }}
          </v-chip>
        </div>

        <div v-if="responsavel" class="d-flex flex-wrap align-center mb-2">
          <v-icon size="20" class="me-1">mdi-phone</v-icon>
          <span class="me-4">{{ responsavel.telefone }}</span>
          <v-icon size="20" class="me-1">mdi-email</v-icon>
          <span class="me-4">{{ responsavel.email }}</span>
          <v-icon size="20" class="me-1">mdi-calendar</v-icon>
          <span>{{ aprendente.nascimento }}</span>
        </div>

        <div class="text-caption">
          <strong>CIDADE:</strong> -- |
          <strong>PRÓXIMA SESSÃO:</strong> -- |
          <strong>SESSÕES:</strong> 1
        </div>
      </v-col>

      <v-col cols="12" md="4" class="text-md-end text-start mt-4 mt-md-0">
        <v-btn color="deep-purple-accent-4" class="mb-2" prepend-icon="mdi-download">
          Exportar prontuário
        </v-btn>
        <div>
          <span class="text-success me-2"><strong>ATENDIDAS:</strong> 0</span>
          <span class="text-warning me-2"><strong>FALTAS:</strong> 0</span>
          <span class="text-error"><strong>CANCELADAS:</strong> 0</span>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { AprendenteService } from '@/services/AprendenteService'
import { ClienteService } from '@/services/clienteService'

const props = defineProps<{
  idAprendente: string
  isAprendente: boolean
  idResponsavel: string
}>()

const aprendente = ref<any>(null)
const responsavel = ref<any>(null)

const clienteService = new ClienteService()

onMounted(async () => {
  await fetchAprendente()
  await fetchResponsavel()
})

watch(() => props.idAprendente, fetchAprendente)
watch(() => props.idResponsavel, fetchResponsavel)

async function fetchAprendente() {
  if (!props.idAprendente) return
  const service = props.isAprendente ? new AprendenteService() : clienteService
  aprendente.value = props.isAprendente
    ? await service.getAprendenteById(props.idAprendente)
    : await service.getClienteById(props.idAprendente)
}

async function fetchResponsavel() {
  if (!props.idResponsavel) return
  responsavel.value = await clienteService.getClienteById(props.idResponsavel)
}
</script>
