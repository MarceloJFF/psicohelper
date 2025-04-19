<template>
  <v-layout class="fill-height mt-2">
    <v-main>
      <v-container class="pa-0 ma-a fill-height">
        <v-row class="fill-height" style="width: 100%;" justify="space-between">
          <v-col cols="7" md="8" class="d-flex flex-column">
            <v-card elevation="2" class="pa-6">
              <v-card-title class="text-h5 font-weight-bold mb-4">Cadastro de Cliente</v-card-title>
              <v-form ref="form" v-model="valid">
                <v-row dense>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="cliente.nome" label="Nome do Contratante" :rules="[v => !!v || 'Campo obrigatório']" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="cliente.cpf" label="CPF" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="cliente.telefone1" label="Telefone 1" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="cliente.telefone2" label="Telefone 2" />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="cliente.cep" label="CEP" />
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-text-field v-model="cliente.endereco" label="Endereço" />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="cliente.cidade" label="Cidade" />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="cliente.estado" label="Estado" />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="cliente.nascimento" label="Data de Nascimento" type="date" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="cliente.email" label="Email" />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="cliente.tipoAtendimento"
                      :items="['Avulso', 'Contrato']"
                      label="Tipo de Atendimento"
                    />
                  </v-col>
                </v-row>

                <!-- Dependentes -->
                <div class="mt-6">
                  <h3 class="text-subtitle-1 font-weight-medium mb-2">Dependentes</h3>
                  <v-row v-for="(dependente, index) in cliente.dependentes" :key="index" dense>
                    <v-col cols="6">
                      <v-text-field v-model="dependente.nome" label="Nome do Dependente" />
                    </v-col>
                    <v-col cols="4">
                      <v-text-field v-model="dependente.nascimento" label="Nascimento" type="date" />
                    </v-col>
                    <v-col cols="2" class="d-flex align-end">
                      <v-btn icon color="red" @click="removerDependente(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-btn class="mt-2" variant="text" color="primary" @click="adicionarDependente">
                    <v-icon start>mdi-plus</v-icon> Adicionar dependente
                  </v-btn>

                  <v-alert
                    v-if="cliente.tipoAtendimento === 'Contrato' && !contrato.cadastrado"
                    type="info"
                    class="mt-4"
                  >
                    Gere o modelo de contrato para o cliente.
                  </v-alert>

                  <v-btn
                    v-if="cliente.tipoAtendimento === 'Contrato' && !contrato.cadastrado"
                    class="mt-2"
                    variant="text"
                    color="green"
                    @click="modalContrato = true"
                  >
                    <v-icon start>mdi-plus</v-icon> Gerar Contrato
                  </v-btn>

                  <v-divider class="my-6" v-if="contrato.cadastrado" />
                  <div v-if="contrato.cadastrado" class="mt-4">
                    <h3 class="text-subtitle-1 font-weight-medium mb-2">Informações do Contrato</h3>
                    <v-list two-line>
                      <v-list-item v-for="(dia, index) in contrato.diasAtendimento" :key="index">
                        <v-list-item-content>
                          <v-list-item-title>{{ dia.dia }}</v-list-item-title>
                          <v-list-item-subtitle>{{ dia.horario }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>Valor Mensal</v-list-item-title>
                          <v-list-item-subtitle>R$ {{ contrato.valorMensal }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>Duração</v-list-item-title>
                          <v-list-item-subtitle>{{ contrato.duracao }} meses</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>Data de Vencimento</v-list-item-title>
                          <v-list-item-subtitle>{{ contrato.vencimento }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>Descrição do Serviço</v-list-item-title>
                          <v-list-item-subtitle>{{ contrato.descricao }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </div>
                </div>

                <v-row class="mt-8">
                  <v-btn text color="red" @click="cancelar">Cancelar</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" @click="salvar">Cadastrar Cliente</v-btn>
                </v-row>
              </v-form>
            </v-card>
          </v-col>

          <!-- Coluna lateral (to-do + calendário) -->
          <v-col cols="5" md="4" class="d-flex flex-column">
            <todo class="mb-3" />
            <calendario-diario class="flex-grow-1" />
          </v-col>
        </v-row>

        <!-- Modal contrato -->
        <v-dialog v-model="modalContrato" max-width="700">
          <v-card>
            <v-card-title class="headline">Gerar Contrato</v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12" v-for="(dia, index) in novoContrato.diasAtendimento" :key="index">
                  <v-row>
                    <v-col cols="5">
                      <v-text-field v-model="dia.dia" label="Dia da Semana" />
                    </v-col>
                    <v-col cols="5">
                      <v-text-field v-model="dia.horario" label="Horário (ex: 14h - 18h)" />
                    </v-col>
                    <v-col cols="2">
                      <v-btn icon @click="adicionarDiaAtendimento">
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </v-col>

                  </v-row>
                </v-col>

                <v-col cols="6">
                  <v-text-field v-model="novoContrato.valorMensal" label="Valor Mensal (R$)" type="number" />
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="novoContrato.duracao" label="Duração (meses)" type="number" />
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="novoContrato.vencimento" label="Data de Vencimento" :disabled="true" />
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="novoContrato.descricao" label="Descrição do Serviço" rows="3" />
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="red" @click="">Fechar</v-btn>
              <v-btn color="primary" @click="salvarContrato">Salvar Contrato</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Todo from '@/components/todo.vue'
import CalendarioDiario from '@/components/calendario-diario.vue'

const valid = ref(false)
const form = ref()
const modalContrato = ref(false)

const cliente = ref({
  nome: '',
  cpf: '',
  telefone1: '',
  telefone2: '',
  cep: '',
  endereco: '',
  cidade: '',
  estado: '',
  nascimento: '',
  email: '',
  tipoAtendimento: '',
  dependentes: [] as { nome: string; nascimento: string }[],
})

const contrato = ref({
  cadastrado: false,
  diasAtendimento: [] as { dia: string; horario: string }[],
  valorMensal: '',
  duracao: '',
  vencimento: '',
  descricao: '',
})

const novoContrato = ref({
  diasAtendimento: [{ dia: '', horario: '' }],
  valorMensal: '',
  duracao: '',
  vencimento: new Date().toISOString().substr(0, 10),
  descricao: '',
})

const adicionarDiaAtendimento = () => {
  novoContrato.value.diasAtendimento.push({ dia: '', horario: '' })
}

const salvarContrato = () => {
  contrato.value = { ...novoContrato.value, cadastrado: true }
  modalContrato.value = false
}

const adicionarDependente = () => {
  cliente.value.dependentes.push({ nome: '', nascimento: '' })
}

const removerDependente = (index: number) => {
  cliente.value.dependentes.splice(index, 1)
}

const cancelar = () => {
  // lógica de cancelamento se necessário
}

const salvar = () => {
  form.value?.validate().then((result: any) => {
    if (result.valid) {
      console.log('Cliente salvo:', cliente.value)
      console.log('Contrato:', contrato.value)
      // Aqui vai a lógica de salvar no backend
    }
  })
}
</script>
