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
          <!-- Abas do topo -->
          <v-tabs
            v-model="abaSelecionada"
            background-color="white"
            grow
            class="elevation-1"
            height="48"
          >
            <v-tab v-for="tab in abas" :key="tab" class="text-uppercase font-weight-medium">
              {{ tab }}
            </v-tab>
          </v-tabs>

          <v-divider />

          <!-- Conteúdo da aba "Cadastro" -->
          <v-window v-model="abaSelecionada">
            <v-window-item v-for="tab in abas" :key="tab" :value="tab">
              <v-card-text>
                <div v-if="tab === 'Cadastro'">
                  <v-card-title class="text-h5 font-weight-bold mt-2">
                    <v-icon class="mr-2" color="primary">mdi-account</v-icon>
                    Dados do Responsável
                  </v-card-title>

                  <v-divider class="my-4" />

                  <v-row v-if="responsavelDetalhes">
                    <v-col cols="12" md="6" v-for="(label, key) in camposPrincipais" :key="key">
                      <v-text-field v-model="responsavelDetalhes[key]" :label="label" outlined dense></v-text-field>
                    </v-col>
                  </v-row>

                </div>
                <div v-else-if="tab === 'Contratos'">
                  <v-card-title class="text-h5 font-weight-bold mt-2">
                    <v-icon class="mr-2" color="primary">mdi-file-document-outline</v-icon>
                    Contratos do Aprendente
                  </v-card-title>

                  <v-divider class="my-4" />

                  <v-alert v-if="contratos.length === 0" type="info" border="start" color="blue lighten-3">
                    Nenhum contrato encontrado para este aprendente.
                  </v-alert>

                  <v-timeline align="start" dense>
                    <v-timeline-item
                      v-for="(contrato, index) in contratos"
                      :key="index"
                      color="green"
                      icon="mdi-file-document"
                    >
                      <v-card class="pa-3" elevation="1">
                        <strong>Valor:</strong> R$ {{ contrato.valor_mensal }}<br />
                        <strong>Duração:</strong> {{ contrato.duracao }} meses<br />
                        <strong>Vencimento:</strong> {{ contrato.vencimento }}<br />
                        <strong>Descrição:</strong> {{ contrato.descricao_servico }}<br />
                        <strong>Dias:</strong>
                        <ul style="list-style-type: none; padding-left: 0;">
                          <li v-for="dia in contrato.diasAtendimento" :key="dia.dia">
                            {{ dia.dia }} ({{ dia.inicio }} - {{ dia.fim }})
                          </li>
                        </ul>

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

      <!-- Coluna lateral (to-do + calendário) -->
      <v-col cols="5" md="4" class="d-flex flex-column">
        <todo class="mb-3" />
        <calendario-diario class="flex-grow-1" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CalendarioDiario from '@/components/calendario-diario.vue'
import Todo from '@/components/todo.vue'
import ResumoCliente from '@/components/ResumoCliente.vue'
import { onMounted } from 'vue'
import {ClienteService} from '@/services/clienteService.ts'
import {ContratoService} from '@/services/contratoService.ts'
import {DiasAtendimentoService} from '@/services/DiasAtendimentosContratoService.ts'

const route = useRoute()
const router = useRouter()


const idResponsavel = route.params.idResponsavel as string
const idAprendente = route.params.idAprendente as string | undefined
const clienteService =  new ClienteService();
const responsavelDetalhes = ref();
const diasAtendimento = new DiasAtendimentoService()
const contratoService = new ContratoService()
onMounted(async()=>{
  responsavelDetalhes.value = await clienteService.getClienteById(idResponsavel)
  await buscarContratos()

})

const buscarContratos = async () => {
  if (idAprendente) {
    contratos.value = await contratoService.loadContratoPorAprendente(idAprendente)
    console.log(contratos.value)
    for (const contrato of contratos.value) {
      const dias = await diasAtendimento.loadDiasAtendimento(contrato.id_contrato)
      contrato.diasAtendimento = dias
    }
  }
}


const abas = ['Cadastro','Anamnese', 'Contratos', 'Sessões', 'Documentos anexos']
const abaSelecionada = ref('Cadastro')

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const contrato = ref({
  cadastrado: false,
  diasAtendimento: [] as { dia: string; inicio: string; fim: string }[],
  valorMensal: '',
  duracao: '',
  vencimento: '',
  descricao: '',
})

const cliente = ref({
  nome: '',
  cpf: '',
  telefone1: '',
  telefone2: '',
  cep: '',
  endereco: '',
  cidade: '',
  estado: '',
  sexo: '',
  atendimentoProprio: '',
  nascimento: '',
  email: '',
  tipoAtendimento: '',
  dependentes: [] as { nome: string; nascimento: string }[],
  contrato: contrato.value
})

cliente.value = {
  ...cliente.value,
  nome: route.query.nome as string || '',
  cpf: route.query.cpf as string || '',
  telefone1: route.query.telefone1 as string || '',
  telefone2: route.query.telefone2 as string || '',
  cep: route.query.cep as string || '',
  endereco: route.query.endereco as string || '',
  cidade: route.query.cidade as string || '',
  estado: route.query.estado as string || '',
  sexo: route.query.sexo as string || '',
  atendimentoPróprio: route.query.atendimentoProprio as string || '',
  nascimento: route.query.nascimento as string || '',
  email: route.query.email as string || '',
  tipoAtendimento: route.query.tipoAtendimento as string || '',
  dependentes: JSON.parse(route.query.dependentes as string || '[]'),
  contrato: JSON.parse(route.query.contrato as string || 'null')
}

const camposPrincipais = {
  nome_cliente: 'Nome',
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

const voltar = () => {
  router.back()
}

const salvarCliente = async () => {
  try {
    // Aqui você pode usar uma chamada de API real (axios ou fetch)
    console.log('Cliente salvo:', cliente.value)
    snackbarMessage.value = 'Dados salvos com sucesso!'
    snackbarColor.value = 'success'
  } catch (error) {
    console.error(error)
    snackbarMessage.value = 'Erro ao salvar os dados.'
    snackbarColor.value = 'error'
  } finally {
    snackbar.value = true
  }
}

const contratos = ref<any[]>([])


</script>
