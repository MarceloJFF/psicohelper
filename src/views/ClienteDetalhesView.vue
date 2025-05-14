<template>
  <v-container class="py-6 w-100">
    <ResumoCliente
      :idAprendente="idAprendente || idResponsavel"
      :isAprendente="!!idAprendente"
      :idResponsavel="idResponsavel"
    />

    <v-row class="w-100">
      <v-col cols="7" md="8" class="w-100">
        <v-card elevation="2" class="w-100">
          <v-tabs
            v-model="abaSelecionada"
            background-color="white"
            grow
            class="elevation-1"
            height="48"
          >
            <v-tab
              v-for="tab in abas"
              :key="tab"
              class="text-uppercase font-weight-medium"
            >
              {{ tab }}
            </v-tab>
          </v-tabs>

          <v-divider />

          <v-window v-model="abaSelecionada">
            <v-window-item v-for="tab in abas" :key="tab" :value="tab">
              <v-card-text>
                <!-- Cadastro -->
                <div v-if="tab === 'Cadastro'">
                  <v-card-title class="text-h5 font-weight-bold mt-2">
                    <v-icon class="mr-2" color="primary">mdi-account</v-icon>
                    Dados do Responsável
                  </v-card-title>

                  <v-divider class="my-4" />

                  <v-row v-if="responsavelDetalhes">
                    <v-col
                      cols="12"
                      md="6"
                      v-for="(label, key) in camposPrincipais"
                      :key="key"
                    >
                      <v-text-field
                        v-model="responsavelDetalhes[key]"
                        :label="label"
                        outlined
                        dense
                      />
                    </v-col>
                  </v-row>
                </div>

                <!-- Contratos -->
                <div v-else-if="tab === 'Contratos'">
                  <v-card-title class="text-h5 font-weight-bold mt-2 d-flex justify-space-between align-center">
                    <div>
                      <v-icon class="mr-2" color="primary">mdi-file-document-outline</v-icon>
                      Contratos do Aprendente
                    </div>
                    <v-btn color="primary" @click="abrirModalContrato">
                      <v-icon left>mdi-plus</v-icon>
                      Novo Contrato
                    </v-btn>
                  </v-card-title>

                  <v-divider class="my-4" />

                  <v-alert
                    v-if="contratos.length === 0"
                    type="info"
                    border="start"
                    color="blue lighten-3"
                  >
                    Nenhum contrato encontrado para este aprendente.
                  </v-alert>

                  <v-timeline align="start" dense>
                    <v-timeline-item
                      v-for="(contrato, index) in contratos"
                      :key="index"
                      :color="contrato.cancelado ? 'red' : (contrato.cadastrado ? 'green' : 'grey')"
                      icon="mdi-file-document"
                    >
                      <v-card class="pa-3" elevation="1">
                        <div class="d-flex justify-space-between align-center mb-2">
                          <strong>Status:</strong>
                          <v-chip
                            :color="contrato.cancelado ? 'red' : (contrato.cadastrado ? 'green' : 'grey')"
                            size="small"
                          >
                            {{ contrato.cancelado || contrato.vencido ? 'Cancelado/inativo' : (contrato.cadastrado ? 'Ativo' : 'Inativo') }}
                          </v-chip>
                        </div>
                        <strong>Valor:</strong> R$ {{ contrato.valorMensal }}<br />
                        <strong>Duração:</strong> {{ contrato.duracao }} meses<br />
                        <strong>Vencimento:</strong> {{ contrato.vencimento }}<br />
                        <strong>Descrição:</strong> {{ contrato.descricaoServico }}<br />
                        <strong>Dias: </strong>
                        <v-chip v-for="dia in contrato.diasAtendimento" :key="dia.dia" class="ma-1">
                          {{ dia.dia }} ({{ dia.inicio }} - {{ dia.fim }})
                        </v-chip>

                        <div class="d-flex justify-end mt-3">
                          <v-btn
                            v-if="contrato.cadastrado && !contrato.cancelado"
                            color="error"
                            size="small"
                            class="mr-2"
                            @click="cancelarContrato(contrato)"
                          >
                            <v-icon left>mdi-cancel</v-icon>
                            Cancelar
                          </v-btn>
                          <v-btn
                            v-if="contrato.cadastrado && !contrato.cancelado"
                            color="warning"
                            size="small"
                            class="mr-2"
                            @click="inativarContrato(contrato)"
                          >
                            <v-icon left>mdi-close-circle</v-icon>
                            Inativar
                          </v-btn>
                          <v-btn
                            v-if="!contrato.cancelado"
                            color="primary"
                            size="small"
                            @click="editarContrato(contrato)"
                          >
                            <v-icon left>mdi-pencil</v-icon>
                            Editar
                          </v-btn>
                        </div>
                      </v-card>
                    </v-timeline-item>
                  </v-timeline>
                </div>
              </v-card-text>
            </v-window-item>
          </v-window>

          <v-btn color="primary" class="ma-4" @click="salvarCliente">
            <v-icon left>mdi-content-save</v-icon>
            Salvar
          </v-btn>

          <v-btn color="grey" class="ma-4" @click="voltar">
            <v-icon left>mdi-arrow-left</v-icon>
            Voltar
          </v-btn>

          <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
            {{ snackbarMessage }}
          </v-snackbar>
        </v-card>
      </v-col>

      <!-- Coluna lateral -->
      <v-col cols="5" md="4" class="d-flex flex-column">
        <todo class="mb-3" />
        <calendario-diario class="flex-grow-1" />
      </v-col>
    </v-row>

    <ModalContrato
      v-model="modalContrato"
      :contrato-inicial="contratoSelecionado || new Contrato()"
      @salvar="salvarContrato"
    />

    <v-dialog v-model="dialogCancelamento" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">
          {{ modoCancelamento === 'cancelar' ? 'Cancelar' : 'Inativar' }} Contrato
        </v-card-title>
        <v-card-text>
          <v-form ref="formCancelamento" v-model="formCancelamentoValido">
            <v-textarea
              v-model="motivoCancelamento"
              :label="modoCancelamento === 'cancelar' ? 'Motivo do Cancelamento' : 'Motivo da Inativação'"
              :rules="[v => !!v || 'O motivo é obrigatório']"
              rows="3"
              required
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" text @click="dialogCancelamento = false">
            Voltar
          </v-btn>
          <v-btn
            color="error"
            @click="confirmarAcao"
            :disabled="!formCancelamentoValido"
          >
            Confirmar {{ modoCancelamento === 'cancelar' ? 'Cancelamento' : 'Inativação' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CalendarioDiario from '@/components/calendario-diario.vue'
import Todo from '@/components/todo.vue'
import ResumoCliente from '@/components/ResumoResponsavel.vue'
import ModalContrato from '@/components/ModalContrato.vue'
import { ResponsavelService } from '@/services/responsavelService.ts'
import { ContratoService } from '@/services/contratoService.ts'
import { DiasAtendimentosContratoService } from '@/services/DiasAtendimentosContratoService'
import Contrato from '@/models/Contrato'
import { id } from 'vuetify/locale'

const route = useRoute()
const router = useRouter()

const idResponsavel = route.params.idResponsavel as string
const idAprendente = route.params.idAprendente as string | undefined

const responsavelService = new ResponsavelService()
const contratoService = new ContratoService()
const diasAtendimento = new DiasAtendimentosContratoService()

const responsavelDetalhes = ref()
const contratos = ref<Contrato[]>([])

const modalContrato = ref(false)
const contratoSelecionado = ref<Contrato | null>(null)

const dialogCancelamento = ref(false)
const motivoCancelamento = ref('')
const formCancelamentoValido = ref(false)
const modoCancelamento = ref<'cancelar' | 'inativar'>('cancelar')

const abaSelecionada = ref('Cadastro')
const abas = ['Cadastro', 'Anamnese', 'Contratos', 'Sessões', 'Documentos anexos']

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const camposPrincipais = {
  nome: 'Nome',
  cpf: 'CPF',
  telefone: 'Telefone 1',
  telefone2: 'Telefone 2',
  cep: 'CEP',
  logradouro: 'Endereço',
  cidade: 'Cidade',
  estado: 'Estado',
  sexo: 'Sexo',
  atendimento_proprio: 'Atendimento Próprio',
  nascimento: 'Nascimento',
  email: 'Email',
  tipo_atendimento: 'Tipo de Atendimento',
}

onMounted(async () => {
  responsavelDetalhes.value = await responsavelService.getResponsavelById(idResponsavel)
  await buscarContratos()
})

const buscarContratos = async () => {
  //O valor caso idAprendente seja  null é idResponsavel
  if(idAprendente == idResponsavel){
    contratos.value = await contratoService.loadContratos(idResponsavel);
  }else{
    contratos.value = await contratoService.loadContratoPorAprendente(idAprendente);
  }

  for (const contrato of contratos.value) {
    contrato.diasAtendimento = await diasAtendimento.loadDiasAtendimento(contrato.id_contrato)
  }
  console.log(contratos.value)
}

const abrirModalContrato = () => {
  contratoSelecionado.value = null
  modalContrato.value = true
}

const editarContrato = (contrato: Contrato) => {
  contratoSelecionado.value = contrato
  modalContrato.value = true
}

const cancelarContrato = async (contrato: Contrato) => {
  modoCancelamento.value = 'cancelar'
  contratoSelecionado.value = contrato
  dialogCancelamento.value = true
}

const inativarContrato = async (contrato: Contrato) => {
  modoCancelamento.value = 'inativar'
  contratoSelecionado.value = contrato
  dialogCancelamento.value = true
}

const confirmarAcao = async () => {
  try {
    if (modoCancelamento.value === 'cancelar') {
      await contratoService.cancelarContrato(contratoSelecionado.value!.idContrato)
    } else {
      await contratoService.inativarContrato(contratoSelecionado.value!.idContrato)
    }
    dialogCancelamento.value = false
    snackbarMessage.value = `${modoCancelamento.value === 'cancelar' ? 'Cancelado' : 'Inativado'} com sucesso`
    snackbarColor.value = 'success'
    snackbar.value = true
    await buscarContratos()
  } catch (error) {
    snackbarMessage.value = 'Erro ao processar a ação'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

const salvarContrato = async (contrato: Contrato) => {
    modalContrato.value = false
    try {
      console.log(contrato)
      // Salva os dados no backend através do ContratoService
      await contratoService.addContrato(contrato,idResponsavel,idAprendente);
      // Após salvar, atualiza a lista de contratos
      await buscarContratos();
      modalContrato.value = false; // Fecha o modal
      snackbarMessage.value = 'Contrato salvo com sucesso';
      snackbarColor.value = 'success';
      snackbar.value = true;
    } catch (error) {
      snackbarMessage.value = 'Erro ao salvar contrato';
      snackbarColor.value = 'error';
      snackbar.value = true;
    }
  };



async function salvarCliente() {
  try {
    if (!responsavelDetalhes.value) return

    // Validação básica (adicione mais conforme necessário)
    if (!responsavelDetalhes.value.nome || !responsavelDetalhes.value.cpf) {
      snackbarMessage.value = 'Nome e CPF são obrigatórios'
      snackbarColor.value = 'error'
      snackbar.value = true
      return
    }

    // Atualiza o responsável existente
    await responsavelService.updateResponsavel(responsavelDetalhes)
    snackbarMessage.value = 'Responsável atualizado com sucesso!'
    snackbarColor.value = 'success'
    snackbar.value = true
  } catch (error) {
    snackbarMessage.value = 'Erro ao salvar o responsável.'
    snackbarColor.value = 'error'
    snackbar.value = true
    console.error(error)
  }
}


const voltar = () => {
  router.back()
}
</script>
