<template>
  <v-layout class="fill-height">
    <v-main>
      <v-container fluid class="pa-6">
        <v-row class="fill-height">
          <v-col cols="7" md="8" class="d-flex flex-column">
            <v-card flat class="mb-4 pa-4 d-flex align-center bg-white elevation-1 rounded">
              <v-row class="d-flex justify-end align-center w-100">
                <v-col cols="6">
                  <div class="text-h6 font-weight-medium d-flex align-center">
                    <v-icon class="mr-2" color="primary">mdi-account-group</v-icon>
                    Listagem de Aprendentes
                  </div>
                </v-col>
                <v-col cols="5">
                  <v-text-field
                    v-model="search"
                    density="compact"
                    label="Buscar Aprendentes"
                    prepend-inner-icon="mdi-magnify"
                    append-inner-icon="mdi-close"
                    variant="solo-filled"
                    hide-details
                    class="bg-white rounded"
                    @click:append-inner="search = ''"
                    @update:model-value="handleSearch"
                  />
                </v-col>
              
              </v-row>
            </v-card>

            <v-card class="flex-grow-1 overflow-hidden elevation-2 rounded-lg bg-grey-lighten-4">
              <template v-if="loading">
                <v-skeleton-loader
                  type="table"
                  class="pa-6"
                  boilerplate
                  elevation="0"
                />
              </template>
              <template v-else>
                <v-data-table
                  :headers="headers"
                  :items="aprendentes"
                  :loading="loading"
                  class="elevation-1"
                  loading-text="Carregando aprendentes..."
                  density="compact"
                >
                  <!-- Telefone com ícone do WhatsApp -->
                  <template v-slot:item.telefone="{ item }">
                    <span class="text-caption">{{ formatarTelefone(item.telefone) }}</span>
                    <a
                      :href="`https://wa.me/55${item.telefone}`"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <v-icon size="small" color="green" class="ml-2">mdi-whatsapp</v-icon>
                    </a>
                  </template>

                  <!-- Status Matrícula -->
                  <template v-slot:item.statusMatricula="{ item }">
                    <v-chip
                      :color="item.statusMatricula ? 'success' : 'error'"
                      size="x-small"
                      class="text-caption"
                    >
                      {{ item.statusMatricula ? 'Ativo' : 'Inativo' }}
                    </v-chip>
                  </template>

                  <!-- Ações -->
                  <template v-slot:item.actions="{ item }" class="d-flex justify-end text-end pa-12">
                    <v-btn
                      :icon="item.statusMatricula ? 'mdi-cancel' : 'mdi-check-circle-outline'"
                      @click="alternarStatusMatricula(item)"
                      :color="item.statusMatricula ? 'orange' : 'green'"
                      variant="text"
                      size="small"
                      density="compact"
                      :title="item.statusMatricula ? 'Inativar Matrícula' : 'Ativar Matrícula'"
                    />
                    <v-btn 
                      icon 
                      @click="visualizarResponsavel(item)" 
                      class="ml-2" 
                      size="small"
                      density="compact"
                      title="Visualizar Detalhes"
                    >
                      <v-icon color="primary" size="small">mdi-eye</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>


              </template>
            </v-card>
          </v-col>

          <v-col cols="5" md="4" class="d-flex flex-column">
            <todo class="mb-3" />
            <calendario-diario class="flex-grow-1" />
          </v-col>
        </v-row>
      </v-container>

      <!-- Overlay com spinner -->
      <v-overlay :model-value="loading" class="align-center justify-center" persistent>
        <v-progress-circular indeterminate size="64" color="primary" />
      </v-overlay>

      <!-- Modal de cliente -->
      <ModalGenerico v-model="showModal" :title="modoEdicao ? 'Editar Responsavel' : 'Cadastrar Novo Responsavel'">
        <template #content>
          <v-form>
            <v-text-field v-model="responsavelAtual.nome" label="Nome" />
            <v-text-field v-model="responsavelAtual.telefone" label="Telefone" />
            <v-text-field v-model="responsavelAtual.email" label="Email" />
            <v-text-field v-model="responsavelAtual.tipoAtendimento" label="Tipo de Atendimento" />
          </v-form>
        </template>
        <template #actions>
          <v-btn color="green" @click="salvarResponsavel">Salvar</v-btn>
          <v-btn color="grey" @click="showModal = false">Cancelar</v-btn>
        </template>
      </ModalGenerico>

      <!-- Dialogo de confirmação de inativação -->
      <v-dialog v-model="dialogConfirmacao" max-width="400">
        <v-card>
          <v-card-title class="text-h6">Confirmar alteração de status</v-card-title>
          <v-card-text>
            <v-textarea
              v-model="motivoInativacao"
              label="Motivo da alteração do status da matrícula"
              rows="3"
              variant="outlined"
              :rules="[v => !!v || 'O motivo é obrigatório']"
            ></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="grey" variant="text" @click="dialogConfirmacao = false">Cancelar</v-btn>
            <v-btn color="red" variant="text" @click="confirmarInativacaoComMotivo">Confirmar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ResponsavelService } from '@/services/responsavelService'
import Responsavel from '@/models/Responsavel'
import CalendarioDiario from '@/components/calendario-diario.vue'
import Todo from '@/components/todo.vue'
import ModalGenerico from '@/components/ModalGenerico.vue'
import { AprendenteService } from '@/services/AprendenteService'
import ViewAprendenteLogadoProfissional from '@/models/ViewAprendenteLogadoProfissional'

const aprendenteService = new AprendenteService()
const responsavelService = new ResponsavelService()
const showModal = ref(false)
const modoEdicao = ref(false)
const indexEdicao = ref<number | null>(null)
const router = useRouter()
const search = ref('')
const loading = ref(true)

const responsavelAtual = ref<Responsavel>(new Responsavel())
const responsavelParaInativar = ref<Responsavel | null>(null)
const dialogConfirmacao = ref(false)
const motivoInativacao = ref('')
const aprendenteParaInativar = ref<ViewAprendenteLogadoProfissional | null>(null)

const handleSearch = async (value: string) => {
  if (value.length <= 3) {
    loadAprendentes()
    return
  }
  aprendentes.value = await aprendenteService.loadAprendentesPorProfissionalENome(value);
  
  // Implement search logic here
}

const aprendentes = ref<ViewAprendenteLogadoProfissional[]>([])

onMounted(async () => {
  await loadAprendentes()
})

const loadAprendentes = async () => {
  loading.value = true
  try {
    aprendentes.value = await aprendenteService.loadAprendentesPorProfissional()
  } catch (error) {
    console.error('Erro ao carregar aprendentes:', error)
  } finally {
    loading.value = false
  }
}

function inativarAprendente(item: ViewAprendenteLogadoProfissional) {
  console.log('Remover:', item)
  // Implement remove logic
}

const headers = [
  { title: 'Aprendente', key: 'nomeAprendente', align: 'center' as const, cellClass: 'text-right' },
  { title: 'Responsável', key: 'nomeResponsavel', align: 'center' as const, cellClass: 'text-right' },
  { title: 'Telefone', key: 'telefone', align: 'center' as const, cellClass: 'text-right' },
  { title: 'Status Matrícula', key: 'statusMatricula', align: 'center' as const, cellClass: 'text-right' },
  { title: 'Ações', key: 'actions', sortable: false, align: 'center' as const, cellClass: 'text-right' },
]

const responsaveis = ref([])

const abrirModalNovo = () => {
  router.push('/clientes/add')
}

const abrirModalEdicao = (item: Responsavel, index: number) => {
  responsavelAtual.value = { ...item }
  indexEdicao.value = index
  modoEdicao.value = true
  showModal.value = true
}

const salvarResponsavel = () => {
  if (modoEdicao.value && indexEdicao.value !== null) {
    responsaveis.value[indexEdicao.value] = { ...responsavelAtual.value }
  } else {
    responsaveis.value.push({ ...responsavelAtual.value })
  }
  showModal.value = false
  modoEdicao.value = false
  indexEdicao.value = null
}

const visualizarResponsavel = (aprendente: ViewAprendenteLogadoProfissional) => {
  console.log(aprendente)
  router.push({
    name: 'cliente-detalhes',
    params: {
      idResponsavel: aprendente.idResponsavel,
      idAprendente: aprendente.id,
    }
  })
}

function formatarTelefone(telefone: string): string {
  return telefone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3')
}

const confirmarInativacao = (responsavel: Responsavel) => {
  responsavelParaInativar.value = responsavel
  dialogConfirmacao.value = true
}

const inativarCliente = async () => {
  if (responsavelParaInativar.value) {
    try {
      // Implement inactivation logic here
      dialogConfirmacao.value = false
      await loadAprendentes()
    } catch (error) {
      console.error('Erro ao inativar cliente:', error)
    }
  }
}

const alternarStatusMatricula = async (aprendente: ViewAprendenteLogadoProfissional) => {
  aprendenteParaInativar.value = aprendente
  dialogConfirmacao.value = true
}

const confirmarInativacaoComMotivo = async () => {
  if (!motivoInativacao.value) {
    return
  }

  if (aprendenteParaInativar.value) {
    try {
      await aprendenteService.alternarStatusMatricula(aprendenteParaInativar.value.id, !aprendenteParaInativar.value.statusMatricula, motivoInativacao.value)

      aprendenteParaInativar.value.statusMatricula = !aprendenteParaInativar.value.statusMatricula
      dialogConfirmacao.value = false
      motivoInativacao.value = ''
      aprendenteParaInativar.value = null
    } catch (error) {
      console.error('Erro ao alternar status da matrícula:', error)
    }
  }
}
</script>

<style scoped>
/* Transições suaves de página */
.router-view {
  transition: opacity 0.5s ease-in-out;
  opacity: 0;
}

.router-view-enter-active, .router-view-leave-active {
  opacity: 1;
}
</style>
