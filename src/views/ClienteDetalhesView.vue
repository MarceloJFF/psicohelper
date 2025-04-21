<template>
  <v-container class="py-6 w-100">
    <v-card elevation="2">
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
              <!-- Conteúdo já existente da aba Cadastro -->
              <v-card-title class="text-h5 font-weight-bold mt-2">
                <v-icon class="mr-2" color="primary">mdi-account</v-icon>
                Detalhes do Cliente
              </v-card-title>

              <v-divider class="my-4" />

              <v-row>
                <v-col cols="12" md="6" v-for="(label, key) in camposPrincipais" :key="key">
                  <v-list-item>
                    <v-list-item-title class="font-weight-bold">{{ label }}:</v-list-item-title>
                    <v-list-item-subtitle>{{ cliente[key] }}</v-list-item-subtitle>
                  </v-list-item>
                </v-col>

                <v-col cols="12">
                  <v-list-item>
                    <v-list-item-title class="font-weight-bold">Dependentes:</v-list-item-title>
                    <v-list-item-subtitle>
                      <ul>
                        <li v-for="(dep, index) in cliente.dependentes" :key="index">
                          {{ dep.nome }} - {{ dep.nascimento }}
                        </li>
                      </ul>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-col>

                <v-col cols="12">
                  <v-list-item>
                    <v-list-item-title class="font-weight-bold">Contrato:</v-list-item-title>
                    <v-list-item-subtitle v-if="cliente.contrato">
                      <div><strong>Valor Mensal:</strong> {{ cliente.contrato.valorMensal }}</div>
                      <div><strong>Duração:</strong> {{ cliente.contrato.duracao }}</div>
                      <div><strong>Vencimento:</strong> {{ cliente.contrato.vencimento }}</div>
                      <div><strong>Descrição:</strong> {{ cliente.contrato.descricao }}</div>
                      <div><strong>Dias de Atendimento:</strong></div>
                      <ul>
                        <li v-for="(dia, index) in cliente.contrato.diasAtendimento" :key="index">
                          {{ dia.dia }}: {{ dia.inicio }} às {{ dia.fim }}
                        </li>
                      </ul>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle v-else>
                      Nenhum contrato vinculado.
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-col>
              </v-row>
            </div>
            <div v-else>
              <p class="mt-4">Conteúdo da aba <strong>{{ tab }}</strong> em construção.</p>
            </div>
          </v-card-text>
        </v-window-item>
      </v-window>

      <v-btn color="grey" class="ma-4" @click="voltar">
        <v-icon left>mdi-arrow-left</v-icon> Voltar
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const abas = ['Cadastro', 'Contratos', 'Sessões', 'Relatórios']
const abaSelecionada = ref('Cadastro')

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
  contrato: null as typeof contrato.value | null
})

const contrato = ref({
  cadastrado: false,
  diasAtendimento: [] as { dia: string; inicio: string; fim: string }[],
  valorMensal: '',
  duracao: '',
  vencimento: '',
  descricao: '',
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
</script>

