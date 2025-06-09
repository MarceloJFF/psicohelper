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
                        v-if="key !== 'nascimento'"
                        v-model="responsavelDetalhes[key]"
                        :label="label"
                        outlined
                        dense
                      />
                      <v-text-field
                        v-else
                        v-model="dataNascimentoFormatada"
                        :label="label"
                        type="date"
                        outlined
                        dense
                      />
                    </v-col>
                  </v-row>
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
                </div>

                <!-- Anamnese -->
                <div v-else-if="tab === 'Anamnese'">
                  <v-card-title class="text-h5 font-weight-bold mt-2">
                    <v-icon class="mr-2" color="primary">mdi-clipboard-text</v-icon>
                    Anamnese do Aprendente
                  </v-card-title>

                  <v-divider class="my-4" />

                  <v-row>
                    <v-col cols="12">
                      <div class="mb-2" v-if="perguntasModelo">
                        <strong>Perguntas do Modelo:</strong>
                      </div>
                      <editor-text
                        v-model="perguntasModelo"
                        label="Perguntas (uma por linha)"
                        class="mb-6"
                        @blur="handleBlur">
                      </editor-text>

<!--                      <v-textarea-->
<!--                        v-model="perguntasModelo"-->
<!--                        label="Altere aqui o formulário de anamnese de acordo com as respostas do cliente"-->
<!--                        outlined-->
<!--                        rows="10"-->
<!--                        auto-grow-->
<!--                      />-->
                    </v-col>
                  </v-row>
                  <v-btn color="primary" class="ma-4" @click="salvarAnamnese">
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
                        <strong>Valor:</strong> R$ {{ contrato.valor_mensal }}<br />
                        <strong>Duração:</strong> {{ contrato.duracao }} meses<br />
                        <strong>Vencimento:</strong> {{ contrato.vencimento }}<br />
                        <strong>Descrição:</strong> {{ contrato.descricao_servico }}<br />
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

<!--                          <v-btn-->
<!--                            v-if="!contrato.cancelado"-->
<!--                            color="primary"-->
<!--                            size="small"-->
<!--                            @click="editarContrato(contrato)"-->
<!--                          >-->
<!--                            <v-icon left>mdi-pencil</v-icon>-->
<!--                            Editar-->
<!--                          </v-btn>-->
                        </div>
                      </v-card>
                    </v-timeline-item>
                  </v-timeline>
                </div>

                <!-- Documentos anexos -->
                <div v-else-if="tab === 'Documentos anexos'">
                  <v-card-title class="text-h5 font-weight-bold mt-2">
                    <v-icon class="mr-2" color="primary">mdi-file-document-outline</v-icon>
                    Documentos Anexos
                  </v-card-title>

                  <v-divider class="my-4" />

                  <v-row v-if="documentos.length === 0" class="d-flex justify-center align-center" style="min-height: 200px">
                    <v-col cols="12" class="text-center">
                      <v-icon size="64" color="grey-lighten-1">mdi-file-document-outline</v-icon>
                      <div class="text-h6 text-grey mt-4">Nenhum documento encontrado</div>
                    </v-col>
                  </v-row>

                  <v-row v-else>
                    <v-col
                      v-for="documento in documentos"
                      :key="documento.id_documento"
                      cols="12"
                      sm="6"
                      md="4"
                    >
                      <v-card class="pa-4 d-flex flex-column align-center" elevation="1">
                        <v-icon size="36">mdi-file-document-outline</v-icon>
                        <div class="text-subtitle-2 mt-2">{{ documento.nome }}</div>
                        <v-btn
                          small
                          class="mt-2"
                          @click="baixarDocumento(documento)"
                          color="primary"
                          variant="outlined"
                        >
                          <v-icon left>mdi-download</v-icon>
                          Baixar
                        </v-btn>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
              </v-card-text>
            </v-window-item>
          </v-window>


        </v-card>
      </v-col>

      <!-- Coluna lateral -->
      <v-col cols="5" md="4" class="d-flex flex-column">
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

    <v-dialog v-model="modalDocumento" max-width="500">
      <v-card>
        <v-card-title>Anexar Novo Documento</v-card-title>
        <v-card-text>
          <v-text-field
            label="Nome do Documento"
            v-model="novoDocumentoNome"
            :error-messages="errorMessage"
          />
          <v-file-input
            label="Selecionar Arquivo"
            v-model="novoDocumento"
            :error-messages="errorMessage"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="modalDocumento = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            @click="anexarDocumento"
            :loading="uploadLoading"
            :disabled="!novoDocumento || !novoDocumentoNome"
          >
            Anexar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CalendarioDiario from '@/components/CalendarioDiario.vue'
import ResumoCliente from '@/components/ResumoResponsavel.vue'
import ModalContrato from '@/components/ModalContrato.vue'
import { ResponsavelService } from '@/services/responsavelService.ts'
import { ContratoService } from '@/services/contratoService.ts'
import { DiasAtendimentosContratoService } from '@/services/DiasAtendimentosContratoService'
import Contrato from '@/models/Contrato'
import { useStoreConfig } from '@/stores/storeConfig'
import { DocumentoService } from '@/services/DocumentoService'
import supabase from '@/config/supabase'
import Documento from '@/models/Documento'
import { ModeloAnamneseService } from '@/services/ModeloAnamneseService'
import { AnamneseService } from '@/services/AnamneseService'
import EditorText from '@/components/EditorText.vue'


const route = useRoute()
const router = useRouter()
const idResponsavel = route.params.idResponsavel as string
const idAprendente = route.params.idAprendente as string | undefined
const responsavelService = new ResponsavelService()
const contratoService = new ContratoService()
const diasAtendimento = new DiasAtendimentosContratoService()
const documentoService = new DocumentoService()
const responsavelDetalhes = ref()
const contratos = ref<any[]>([])
const documentos = ref<Documento[]>([])
const modalContrato = ref(false)
const contratoSelecionado = ref<Contrato | null>(null)
const dialogCancelamento = ref(false)
const motivoCancelamento = ref('')
const formCancelamentoValido = ref(false)
const modoCancelamento = ref<'cancelar' | 'inativar'>('cancelar')
const abaSelecionada = ref('Cadastro')
const abas = ['Cadastro', 'Anamnese', 'Contratos', 'Documentos anexos']
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
  nascimento: 'Nascimento',
  email: 'Email',
}


const dataNascimentoFormatada = computed({
  get: () => {
    if (!responsavelDetalhes.value?.nascimento) return ''
    const data = new Date(responsavelDetalhes.value.nascimento)
    return data.toISOString().split('T')[0]
  },
  set: (value) => {
    if (responsavelDetalhes.value) {
      responsavelDetalhes.value.nascimento = value
    }
  }
})

const modalDocumento = ref(false)
const novoDocumento = ref(null)
const novoDocumentoNome = ref('')

const errorMessage = ref('')
const uploadLoading = ref(false)

const perguntasModelo = ref('')
const respostaAnamnese = ref('')

const anamneseService = new AnamneseService()
const respostaAnamneseExistente = ref<string | null>(null)

const loadDocuments = async () => {
  try {
    if (idAprendente) {
      documentos.value = await documentoService.carregarDocumentosAprendente(idAprendente)
    }
  } catch (error) {
    console.error('Erro ao carregar documentos:', error)
    snackbarMessage.value = 'Erro ao carregar documentos'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

onMounted(async () => {
  responsavelDetalhes.value = await responsavelService.getResponsavelById(idResponsavel)
  await buscarContratos()
  await loadDocuments()
  await carregarPerguntasAnamnese()
  await carregarRespostaAnamnese()
})

const carregarPerguntasAnamnese = async () => {
  try {
    const config = useStoreConfig().configuracao
    if (!config) return

    const modeloAnamneseService = new ModeloAnamneseService()
    const modelo = await modeloAnamneseService.obterModeloPorConfig(config.id)
    if (!modelo || !(modelo as any).perguntas) return

    perguntasModelo.value = (modelo as any).perguntas
    respostaAnamnese.value = ''
  } catch (error) {
    console.error('Erro ao carregar perguntas da anamnese:', error)
    snackbarMessage.value = 'Erro ao carregar perguntas da anamnese'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

const carregarRespostaAnamnese = async () => {
  try {
    if (!idAprendente && !idResponsavel) return
    // Busca resposta de anamnese existente (texto)
    const resposta = await anamneseService.obterRespostaAnamnese(idAprendente || idResponsavel)
    if (resposta) {
      respostaAnamneseExistente.value = resposta.texto // ajuste conforme retorno
      perguntasModelo.value = resposta.texto
    } else {
      respostaAnamneseExistente.value = null
      // perguntasModelo já será preenchido pelo modelo padrão
    }
  } catch (error) {
    console.error('Erro ao carregar resposta de anamnese:', error)
  }
}

const salvarAnamnese = async () => {
  try {
    if (!perguntasModelo.value) {
      snackbarMessage.value = 'O formulário de anamnese não pode estar vazio';
      snackbarColor.value = 'error';
      snackbar.value = true;
      return;
    }
    if (respostaAnamneseExistente.value) {
      // Atualizar resposta existente
      await anamneseService.atualizarRespostaAnamnese(idAprendente || idResponsavel, perguntasModelo.value)
    } else {
      // Criar nova resposta
      await anamneseService.criarRespostaAnamnese(idAprendente || idResponsavel, perguntasModelo.value)
    }
    snackbarMessage.value = 'Anamnese salva com sucesso'
    snackbarColor.value = 'success'
    snackbar.value = true
    await carregarRespostaAnamnese() // Atualiza estado após salvar
  } catch (error) {
    snackbarMessage.value = 'Erro ao salvar anamnese'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

const buscarContratos = async () => {
  contratos.value = await contratoService.loadContratoPorAprendente(idAprendente);
  console.log("carregando contratos")
  for (const contrato of contratos.value) {
    console.log(contrato)
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

const cancelarContrato = (contrato: Contrato) => {
  contratoSelecionado.value = contrato
  modoCancelamento.value = 'cancelar'
  dialogCancelamento.value = true
}



const confirmarAcao = async () => {
  try {
    if (!motivoCancelamento.value || !contratoSelecionado.value) {
      snackbarMessage.value = 'Preencha o motivo do cancelamento/inativação.'
      snackbarColor.value = 'error'
      snackbar.value = true
      return
    }
    console.log(contratoSelecionado.value)
    await contratoService.inativarContrato(contratoSelecionado.value.id_contrato, motivoCancelamento.value)


    snackbarMessage.value = 'Contrato atualizado com sucesso.'
    snackbarColor.value = 'success'
    snackbar.value = true
    dialogCancelamento.value = false
    await buscarContratos() // Atualiza a lista
  } catch (error) {
    console.error('Erro ao confirmar ação:', error)
    snackbarMessage.value = 'Erro ao realizar a operação.'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

const salvarContrato = async (contrato: Contrato) => {
  modalContrato.value = false
  try {
    await contratoService.addContrato(contrato,idResponsavel,idAprendente);
    await buscarContratos();
    modalContrato.value = false; // Fecha o modal

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
    await responsavelService.updateResponsavel(responsavelDetalhes.value)
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



const baixarDocumento = async (documento: Documento) => {
  try {
    const { data, error } = await supabase.storage
      .from('documentos')
      .download(documento.storage_path)

    if (error) throw error

    const url = window.URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = documento.nome
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erro ao baixar documento:', error)
    snackbarMessage.value = 'Erro ao baixar documento'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}


const anexarDocumento = async () => {
  try {
    if (!novoDocumento.value || !novoDocumentoNome.value) {
      errorMessage.value = 'Por favor, selecione um arquivo e forneça um nome'
      return
    }

    uploadLoading.value = true
    const response = await supabase.storage
      .from('documentos')
      .upload(novoDocumentoNome.value, novoDocumento.value)

    if (response.error) throw response.error

    await loadDocuments()
    snackbarMessage.value = 'Documento anexado com sucesso'
    snackbarColor.value = 'success'
    snackbar.value = true
    modalDocumento.value = false
  } catch (error) {
    console.error('Erro ao anexar documento:', error)
    snackbarMessage.value = 'Erro ao anexar documento'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    uploadLoading.value = false
  }
}
</script>
