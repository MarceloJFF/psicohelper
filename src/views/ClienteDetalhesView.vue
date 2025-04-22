<template>
  <v-container class="py-6 w-100">
    <ResumoCliente></ResumoCliente>
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
                    Detalhes do Cliente
                  </v-card-title>

                  <v-divider class="my-4" />

                  <v-row>
                    <v-col cols="12" md="6" v-for="(label, key) in camposPrincipais" :key="key">
                      <v-text-field v-model="cliente[key]" :label="label" outlined dense></v-text-field>
                    </v-col>

                    <v-col cols="12">
                      <v-card-subtitle class="font-weight-bold">Dependentes:</v-card-subtitle>
                      <v-row v-for="(dep, index) in cliente.dependentes" :key="index">
                        <v-col cols="6">
                          <v-text-field v-model="dep.nome" label="Nome do Dependente" outlined dense></v-text-field>
                        </v-col>
                        <v-col cols="6">
                          <v-text-field v-model="dep.nascimento" label="Nascimento" outlined dense></v-text-field>
                        </v-col>
                      </v-row>
                    </v-col>

                    <v-col cols="12">
                      <v-card-subtitle class="font-weight-bold">Contrato:</v-card-subtitle>
                      <div v-if="cliente.contrato">
                        <v-text-field v-model="cliente.contrato.valorMensal" label="Valor Mensal" outlined dense></v-text-field>
                        <v-text-field v-model="cliente.contrato.duracao" label="Duração" outlined dense></v-text-field>
                        <v-text-field v-model="cliente.contrato.vencimento" label="Vencimento" outlined dense></v-text-field>
                        <v-textarea v-model="cliente.contrato.descricao" label="Descrição" outlined dense></v-textarea>
                        <v-card-subtitle class="font-weight-bold mt-2">Dias de Atendimento:</v-card-subtitle>
                        <v-row v-for="(dia, index) in cliente.contrato.diasAtendimento" :key="index">
                          <v-col cols="4">
                            <v-text-field v-model="dia.dia" label="Dia" outlined dense></v-text-field>
                          </v-col>
                          <v-col cols="4">
                            <v-text-field v-model="dia.inicio" label="Início" outlined dense></v-text-field>
                          </v-col>
                          <v-col cols="4">
                            <v-text-field v-model="dia.fim" label="Fim" outlined dense></v-text-field>
                          </v-col>
                        </v-row>
                      </div>
                      <div v-else>
                        Colocar aqui os dependentes ao clicar mostrar dados do responsável e sessões
                      </div>
                    </v-col>
                  </v-row>
                </div>
                <div v-else>
                  <p class="mt-4">Conteúdo da aba <strong>{{ tab }}</strong> em construção.</p>
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

const route = useRoute()
const router = useRouter()

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
  atendimentoPróprio: '',
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
  nome: 'Nome',
  cpf: 'CPF',
  telefone1: 'Telefone 1',
  telefone2: 'Telefone 2',
  cep: 'CEP',
  endereco: 'Endereço',
  cidade: 'Cidade',
  estado: 'Estado',
  sexo: 'Sexo',
  atendimentoPróprio: 'Atendimento Próprio',
  nascimento: 'Nascimento',
  email: 'Email',
  tipoAtendimento: 'Tipo de Atendimento',
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
</script>
