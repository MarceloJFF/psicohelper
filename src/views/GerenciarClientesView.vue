<template>
  <v-container class="py-6">
    <v-row>
      <!-- Coluna Esquerda -->
      <v-col cols="12" md="4">
        <v-card class="elevation-2 rounded-lg">
          <v-card-title class="d-flex justify-space-between align-center pa-4 bg-primary">
            <span class="text-h6 text-white">Responsáveis</span>
            <v-btn color="white" variant="text" @click="abrirModalNovoResponsavel" prepend-icon="mdi-plus">Novo</v-btn>
          </v-card-title>

          <v-card-text class="pa-0">
            <v-list lines="two" class="pa-0">
              <v-list-item
                v-for="responsavel in responsaveis"
                :key="responsavel.id"
                :active="responsavelSelecionado?.id === responsavel.id"
                @click="selecionarResponsavel(responsavel)"
                class="cursor-pointer"
                :class="{ 'bg-primary-lighten-5': responsavelSelecionado?.id === responsavel.id }"
              >
                <template v-slot:prepend>
                  <v-avatar color="primary" size="40">
                    <span class="text-h6 text-white">{{ responsavel?.nome?.charAt(0)?.toUpperCase() || '?' }}</span>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium">{{ responsavel?.nome || 'Sem nome' }}</v-list-item-title>
                <v-list-item-subtitle>{{ responsavel?.cpf || 'CPF não informado' }}</v-list-item-subtitle>

                <template v-slot:append>
                  <v-btn icon="mdi-pencil" variant="text" size="small" @click.stop="editarResponsavel(responsavel)" />
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Coluna Direita -->
      <v-col cols="12" md="8">
        <v-card class="elevation-2 rounded-lg">
          <v-card-title class="d-flex justify-space-between align-center pa-4 bg-primary">
            <span class="text-h6 text-white">
              {{ responsavelSelecionado ? `Aprendentes de ${responsavelSelecionado.nome}` : 'Selecione um Responsável' }}
            </span>
            <v-btn
              v-if="responsavelSelecionado"
              color="white"
              variant="text"
              @click="abrirModalNovoAprendente"
              prepend-icon="mdi-plus"
            >
              Novo Aprendente
            </v-btn>
          </v-card-title>

          <v-card-text class="pa-4">
            <template v-if="responsavelSelecionado">
              <v-list v-if="aprendentes.length > 0" class="bg-transparent">
                <v-list-item
                  v-for="aprendente in aprendentes"
                  :key="aprendente.id"
                  class="mb-2 rounded-lg bg-white elevation-1"
                >
                  <template v-slot:prepend>

                    <v-avatar color="secondary" size="40">
                      <span class="text-h6 text-white">{{ aprendente?.nomeAprendente?.charAt(0)?.toUpperCase() || '?' }}</span>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-medium">{{ aprendente?.nomeAprendente || 'Sem nome' }}</v-list-item-title>
                  <v-list-item-subtitle>Nascimento: {{ formatarData(aprendente?.nascimento) || 'Não informado' }}</v-list-item-subtitle>

                  <template v-slot:append>
                    <v-btn icon="mdi-pencil" variant="text" size="small" @click="editarAprendente(aprendente)" class="mr-2" />
                    <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="confirmarExclusaoAprendente(aprendente)" />
                  </template>
                </v-list-item>
              </v-list>
              <v-alert v-else type="info" variant="tonal" class="mt-4" icon="mdi-information">
                Nenhum aprendente cadastrado para este responsável.
              </v-alert>
            </template>
            <v-alert v-else type="info" variant="tonal" class="mt-4" icon="mdi-information">
              Selecione um responsável para ver seus aprendentes.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal de Responsável -->
    <v-dialog v-model="modalResponsavel" max-width="600">
      <v-card>
        <v-card-title class="text-h6 pa-4 bg-primary text-white">
          {{ modoEdicao ? 'Editar Responsável' : 'Novo Responsável' }}
        </v-card-title>

        <v-card-text class="pa-4">
          <v-form ref="formResponsavel" v-model="formValido">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="responsavelAtual.nome"
                  label="Nome"
                  :rules="[v => !!v || 'Nome é obrigatório']"
                  required
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="responsavelAtual.cpf"
                  label="CPF"
                  :rules="[
                    v => !!v || 'CPF é obrigatório',
                    v => /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(v) || 'CPF inválido'
                  ]"
                  required
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="responsavelAtual.telefone"
                  label="Telefone"
                  :rules="[
                    v => !!v || 'Telefone é obrigatório',
                    v => /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(v) || 'Telefone inválido'
                  ]"
                  required
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="responsavelAtual.email"
                  label="Email"
                  :rules="[
                    v => !!v || 'Email é obrigatório',
                    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email inválido'
                  ]"
                  required
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="responsavelAtual.nascimento"
                  label="Data de Nascimento"
                  type="date"
                  :rules="[v => !!v || 'Data de nascimento é obrigatória']"
                  required
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="responsavelAtual.sexo"
                  :items="['Masculino', 'Feminino']"
                  label="Sexo"
                  :rules="[v => !!v || 'Sexo é obrigatório']"
                  required
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="modalResponsavel = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="salvarResponsavel"
            :loading="salvando"
            :disabled="!formValido"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Aprendente -->
    <v-dialog v-model="modalAprendente" max-width="500">
      <v-card>
        <v-card-title class="text-h6 pa-4 bg-primary text-white">
          {{ modoEdicao ? 'Editar Aprendente' : 'Novo Aprendente' }}
        </v-card-title>

        <v-card-text class="pa-4">
          <v-form ref="formAprendente" v-model="formAprendenteValido">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="aprendenteAtual.nomeAprendente"
                  label="Nome do Aprendente"
                  :rules="[v => !!v || 'Nome é obrigatório']"
                  required
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="aprendenteAtual.nascimento"
                  label="Data de Nascimento"
                  type="date"
                  :rules="[v => !!v || 'Data de nascimento é obrigatória']"
                  required
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="aprendenteAtual.sexo"
                  :items="['Masculino', 'Feminino']"
                  label="Sexo"
                  :rules="[v => !!v || 'Sexo é obrigatório']"
                  required
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-color-picker
                  v-model="aprendenteAtual.corAgendamento"
                  label="Cor do Agendamento"
                  hide-inputs
                  mode="hex"
                  :rules="[(v: string) => !!v || 'Cor do agendamento é obrigatória']"
                  required
                  variant="outlined"
                  density="comfortable"
                  class="rounded-lg"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="modalAprendente = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="salvarAprendente"
            :loading="salvando"
            :disabled="!formAprendenteValido"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Confirmação -->
    <v-dialog v-model="dialogConfirmacao" max-width="400">
      <v-card>
        <v-card-title class="text-h6 bg-error text-white">
          Confirmar Exclusão
        </v-card-title>
        <v-card-text class="pa-4">
          Tem certeza que deseja excluir este aprendente?
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="dialogConfirmacao = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="excluirAprendente"
            :loading="excluindo"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para mensagens -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
      class="mt-4"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.show = false"
        >
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ResponsavelService } from '@/services/responsavelService'
import { AprendenteService } from '@/services/AprendenteService'
import Responsavel from '@/models/Responsavel'
import Aprendente from '@/models/Aprendente'

const responsavelService = new ResponsavelService()
const aprendenteService = new AprendenteService()

// Estado
const responsaveis = ref<Responsavel[]>([])
const responsavelSelecionado = ref<Responsavel | null>(null)
const aprendentes = ref<Aprendente[]>([])
const formValido = ref(false)
const formAprendenteValido = ref(false)
const salvando = ref(false)
const excluindo = ref(false)

// Modais
const modalResponsavel = ref(false)
const modalAprendente = ref(false)
const dialogConfirmacao = ref(false)
const modoEdicao = ref(false)

// Formulários
const formResponsavel = ref()
const formAprendente = ref()

// Dados atuais
const responsavelAtual = ref<Partial<Responsavel>>({})
const aprendenteAtual = ref<Partial<Aprendente>>({})
const aprendenteParaExcluir = ref<Aprendente | null>(null)

// Snackbar
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Carregar dados iniciais
onMounted(async () => {
  await carregarResponsaveis()
})

// Funções
async function carregarResponsaveis() {
  try {
    responsaveis.value = await responsavelService.loadResponsaveis()
  } catch (error) {
    mostrarMensagem('Erro ao carregar responsáveis', 'error')
  }
}

async function carregarAprendentes(idResponsavel: string) {
  try {
    aprendentes.value = await aprendenteService.loadAprendentes(idResponsavel)
  } catch (error) {
    mostrarMensagem('Erro ao carregar aprendentes', 'error')
  }
}

function selecionarResponsavel(responsavel: Responsavel) {
  responsavelSelecionado.value = responsavel
  carregarAprendentes(responsavel.id)
}

function abrirModalNovoResponsavel() {
  modoEdicao.value = false
  responsavelAtual.value = {}
  modalResponsavel.value = true
}

function abrirModalNovoAprendente() {
  if (!responsavelSelecionado.value) return
  modoEdicao.value = false
  aprendenteAtual.value = {
    idResponsavel: responsavelSelecionado.value.id,
    corAgendamento: '#9C27B0' // Default color (purple)
  }
  modalAprendente.value = true
}

function editarResponsavel(responsavel: Responsavel) {
  modoEdicao.value = true
  responsavelAtual.value = { ...responsavel }
  modalResponsavel.value = true
}

function editarAprendente(aprendente: Aprendente) {
  modoEdicao.value = true
  aprendenteAtual.value = { ...aprendente }
  modalAprendente.value = true
}

async function salvarResponsavel() {
  if (!formValido.value) return

  salvando.value = true
  try {
    if (modoEdicao.value) {
      await responsavelService.updateResponsavel(responsavelAtual.value as Responsavel)
      mostrarMensagem('Responsável atualizado com sucesso')
    } else {
      await responsavelService.addResponsavel(responsavelAtual.value)
      mostrarMensagem('Responsável cadastrado com sucesso')
    }
    modalResponsavel.value = false
    await carregarResponsaveis()
  } catch (error) {
    mostrarMensagem('Erro ao salvar responsável', 'error')
  } finally {
    salvando.value = false
  }
}

async function salvarAprendente() {
  if (!formAprendenteValido.value || !responsavelSelecionado.value) return

  salvando.value = true
  console.log(aprendenteAtual.value)
  try {
    if (modoEdicao.value) {
      await aprendenteService.updateAprendenteComCorAgendamento(aprendenteAtual.value as Aprendente)
      mostrarMensagem('Aprendente atualizado com sucesso')
    } else {
      await aprendenteService.addAprendenteComCorAgendamento(aprendenteAtual.value as Aprendente)
      mostrarMensagem('Aprendente cadastrado com sucesso')
    }
    modalAprendente.value = false
    await carregarAprendentes(responsavelSelecionado.value.id)
  } catch (error) {
    mostrarMensagem('Erro ao salvar aprendente', 'error')
  } finally {
    salvando.value = false
  }
}

function confirmarExclusaoAprendente(aprendente: Aprendente) {
  aprendenteParaExcluir.value = aprendente
  dialogConfirmacao.value = true
}

async function excluirAprendente() {
  if (!aprendenteParaExcluir.value) return

  excluindo.value = true
  try {
    await aprendenteService.deleteAprendente(aprendenteParaExcluir.value.id)
    mostrarMensagem('Aprendente excluído com sucesso')
    dialogConfirmacao.value = false
    if (responsavelSelecionado.value) {
      await carregarAprendentes(responsavelSelecionado.value.id)
    }
  } catch (error) {
    mostrarMensagem('Erro ao excluir aprendente', 'error')
  } finally {
    excluindo.value = false
  }
}

function mostrarMensagem(texto: string, cor: 'success' | 'error' = 'success') {
  snackbar.value = {
    show: true,
    text: texto,
    color: cor
  }
}

function formatarData(data: string | undefined | null): string {
  if (!data) return 'Não informado'
  try {
    const [ano, mes, dia] = data.split('-')
    if (!ano || !mes || !dia) return 'Data inválida'
    return `${dia}/${mes}/${ano}`
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return 'Data inválida'
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.v-list-item {
  transition: all 0.2s ease;
}

.v-list-item:hover {
  background-color: rgb(var(--v-theme-surface-variant));
  transform: translateX(4px);
}

.bg-primary {
  background-color: rgb(var(--v-theme-primary)) !important;
}

.bg-error {
  background-color: rgb(var(--v-theme-error)) !important;
}

.v-card {
  border-radius: 12px;
  overflow: hidden;
}

.v-btn {
  text-transform: none;
  letter-spacing: 0.5px;
}
</style>
