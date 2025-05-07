<template>
  <v-layout class="fill-height mt-2">
    <v-main>
      <v-container class="pa-0 ma-a fill-height">
        <v-row class="fill-height w-100"  justify="space-between">
          <!-- Coluna principal do formulário -->
          <v-col cols="7" md="8" class="d-flex flex-column w-100">
            <v-card elevation="2" class="pa-6">
              <v-card-title class="text-h5 font-weight-bold mb-4">Cadastro de Cliente</v-card-title>
              <v-form ref="form" v-model="valid">
                <v-row dense>
                  <!-- Campos do cliente -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="cliente.nome"
                      label="Nome do Contratante"
                      :rules="[v => !!v || 'Campo obrigatório']"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="cliente.cpf" label="CPF" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="cliente.telefone" label="Telefone 1" />
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
                    <v-text-field
                      v-model="cliente.nascimento"
                      label="Data de Nascimento"
                      type="date"
                    />
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-text-field v-model="cliente.email" label="Email" />
                  </v-col>
                  <v-col cols="12" md="8">
                    <h4 class="text-h5">O atendimento será para o próprio cliente?</h4>
                    <div class="d-flex ">
                      <v-checkbox  label="Sim" v-model="cliente.atendimentoProprio" value="true"></v-checkbox>
                      <v-checkbox label="Não" v-model="cliente.atendimentoProprio" value="false"></v-checkbox>
                    </div>
                  </v-col>

                  <v-col cols="12" md="4">
                    <h4 class="text-h5">Sexo</h4>
                    <div class="d-flex ">
                      <v-checkbox  label="Masculino" v-model="cliente.sexo" value="M"></v-checkbox>
                      <v-checkbox label="Feminino" v-model="cliente.sexo" value="F"></v-checkbox>
                    </div>
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
                  <v-row v-for="(dep, i) in cliente.dependentes" :key="i" dense>
                    <v-col cols="6">
                      <v-text-field v-model="dep.nome" label="Nome do Dependente" />
                    </v-col>
                    <v-col cols="4">
                      <v-text-field
                        v-model="dep.nascimento"
                        label="Nascimento"
                        type="date"
                      />
                    </v-col>
                    <v-col cols="2" class="d-flex align-end">
                      <v-btn icon color="red" @click="removerDependente(i)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-btn class="mt-2" variant="text" color="primary" @click="adicionarDependente">
                    <v-icon start>mdi-plus</v-icon> Adicionar dependente
                  </v-btn>

                  <!-- Botão para gerar contrato -->
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

                  <!-- Exibição do contrato gerado -->
                  <v-divider class="my-6" v-if="contrato.cadastrado" />
                  <div v-if="contrato.cadastrado" class="mt-4">
                    <h3 class="text-subtitle-1 font-weight-medium mb-2">Informações do Contrato</h3>
                    <v-list two-line>
                      <v-list-item
                        v-for="(dia, idx) in contrato.diasAtendimento"
                        :key="idx"
                      >
                        <v-list-item-content>
                          <v-list-item-title>{{ dia.dia }}</v-list-item-title>
                          <v-list-item-subtitle>{{ dia.inicio }} - {{ dia.fim }}</v-list-item-subtitle>
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

                <!-- Ações finais do formulário -->
                <v-row class="mt-8">
                  <v-btn text color="red" @click="cancelar">Cancelar</v-btn>
                  <v-spacer />
                  <v-btn color="primary" @click="salvar">Cadastrar Cliente</v-btn>
                </v-row>
              </v-form>
            </v-card>
          </v-col>

          <!-- Coluna lateral (to-do + calendário) -->
          <v-col cols="5" md="4" class="d-flex flex-column w-100">
            <todo class="mb-3" />
            <calendario-diario class="flex-grow-1" />
          </v-col>
        </v-row>

        <!-- Modal para gerar contrato -->
        <v-dialog v-model="modalContrato" max-width="700">
          <v-card>
            <v-card-title class="headline">Gerar Contrato</v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col
                  cols="12"
                  v-for="(dia, index) in novoContrato.diasAtendimento"
                  :key="index"
                >
                  <v-row>
                    <v-col cols="4">
                      <v-select
                        v-model="dia.dia"
                        label="Dia da semana"
                        :items="['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']"
                      />
                    </v-col>
                    <v-col cols="8">
                      <v-row>
                        <v-col cols="4">
                          <v-text-field
                            v-model="dia.inicio"
                            type="time"
                            label="Início"
                            variant="outlined"
                            density="compact"
                            class="grey lighten-3"
                            hide-details
                            @change="atualizarHorario(dia)"
                          />
                        </v-col>
                        <v-col cols="4">
                          <v-text-field
                            v-model="dia.fim"
                            type="time"
                            label="Término"
                            variant="outlined"
                            density="compact"
                            class="grey lighten-3"
                            hide-details
                            @change="atualizarHorario(dia)"
                          />
                        </v-col>
                        <v-col cols="2" class="d-flex align-end">
                          <v-btn icon color="red" @click="removerDiaAtendimento(index)">
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </v-col>
                        <v-col cols="2" class="d-flex align-end">
                          <v-btn icon color="primary" @click="adicionarDiaAtendimento">
                            <v-icon>mdi-plus</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>

                <v-col cols="6">
                  <v-text-field
                    v-model="novoContrato.valorMensal"
                    label="Valor Mensal (R$)"
                    type="number"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="novoContrato.duracao"
                    label="Duração (meses)"
                    type="number"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="novoContrato.vencimento"
                    label="Data de Vencimento"
                    :disabled="true"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="novoContrato.descricao"
                    label="Descrição do Serviço"
                    rows="3"
                  />
                </v-col>
              </v-row>
            </v-card-text>
            {{novoContrato}}
            <v-card-actions>
              <v-spacer />
              <v-btn color="red" @click="modalContrato = false">Fechar</v-btn>
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
import {useRouter} from 'vue-router'
import Todo from '@/components/todo.vue'
import CalendarioDiario from '@/components/calendario-diario.vue'
import { ContratoService } from '@/services/contratoService.ts'
import { ClienteService } from '@/services/clienteService'
import { DependenteService } from '@/services/DependenteService'

import Contrato from '@/models/Contrato.ts'
import type DiasAtendimentoContrato from '@/models/DiasAtendimentoContrato.ts'
const valid = ref(false)
const form = ref()
const modalContrato = ref(false)
const router = useRouter()
const contratoService = new ContratoService();
const clienteService = new ClienteService()
const dependenteService = new DependenteService()

const cliente = ref({
  nome: '',
  cpf: '',
  telefone: '',
  telefone2: '',
  cep: '',
  endereco: '',
  cidade: '',
  estado: '',
  sexo: '',
  atendimentoProprio:'',
  nascimento: '',
  email: '',
  tipoAtendimento: '',
  dependentes: [] as { nome: string; nascimento: string }[],
  contrato: null as typeof contrato.value | null
})
const contrato = ref(new Contrato());
contrato.value.cadastrado =false;
contrato.value.diasAtendimento = [] as DiasAtendimentoContrato[];

const novoContrato = ref(new Contrato());
novoContrato.value = {
  diasAtendimento: [{ dia: '', inicio: '', fim: '' }],
  valorMensal: '',
  duracao: '',
  vencimento: new Date().toISOString().substr(0, 10),
  descricao: '',
}

const adicionarDependente = () => {
  cliente.value.dependentes.push({ nome: '', nascimento: '' })
}

const removerDependente = (index: number) => {
  cliente.value.dependentes.splice(index, 1)
}

const adicionarDiaAtendimento = () => {
// After:
  novoContrato?.value.diasAtendimento.push({
    id: '',
    dia: '',
    inicio: '',
    fim: '',
    contratoId: '',
  })}

const removerDiaAtendimento = (index: number) => {
  novoContrato?.value.diasAtendimento.splice(index, 1)
}

const salvarContrato = () => {

  contrato.value = {
    ...novoContrato.value,
    cadastrado: true,
    diasAtendimento: [...novoContrato.value.diasAtendimento], // copiar corretamente
  }

  modalContrato.value = false
}

const cancelar = () => {
  router.push({ name: 'home' }) // ou use o path: router.push('/')
}
const limparClienteState = () => {
  cliente.value = {
    nome: '',
    cpf: '',
    telefone: '',
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
    contrato: null,
  };
  contrato.value = new Contrato();
  contrato.value.cadastrado = false;
  contrato.value.diasAtendimento = [];
};

const salvar = () => {
  form.value?.validate().then(async (result: any) => {
    if (result.valid) {
      console.log(cliente.value);
      if (cliente.value.tipoAtendimento == 'Contrato' && contrato.value.cadastrado) {
        cliente.value.contrato = contrato.value;
        await clienteService.addCliente(cliente.value);
        alert("Cliente salvo com sucesso!");
      } else {
        await clienteService.addCliente(cliente.value);
        alert("Cliente salvo com sucesso com contrato!");
      }
      limparClienteState();
    }
  });
};

const atualizarHorario = (dia: { inicio: string, fim: string }) => {
  // Força a atualização do objeto e pode disparar qualquer lógica adicional
  dia.inicio = dia.inicio.trim()
  dia.fim = dia.fim.trim()
  // Se tiver alguma lógica de validação, invoque aqui
}
</script>
