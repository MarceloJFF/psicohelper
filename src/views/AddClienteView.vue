<template>
  <v-layout class="fill-height mt-2">
    <v-main>
      <v-container class="pa-0 ma-a fill-height">
        <v-row class="fill-height w-100"  justify="space-between">
          <!-- Coluna principal do formulário -->
          <v-col cols="7" md="8" class="d-flex flex-column w-100">
            <v-card elevation="2" class="pa-6">
              <v-card-title class="text-h5 font-weight-bold mb-4 text-center">Cadastro de Aprendente</v-card-title>
              <v-form ref="form" v-model="valid">
                <h3 class="m-6">Dados do Responsável</h3>
                <v-row dense>
                  <!-- Campos do responsavel -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="responsavel.nome"
                      label="Nome do Contratante"
                      :rules="[v => !!v || 'Campo obrigatório']"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="responsavel.cpf" label="CPF"
                                  :rules="[
                            v => !!v || 'Campo obrigatório',
                            v => /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(v) || 'CPF inválido'
                          ]"/>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="responsavel.telefone" label="Telefone 1" :rules="[
            v => !!v || 'Campo obrigatório',
            v => /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(v) || 'Telefone inválido'
          ]" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="responsavel.telefone2" label="Telefone 2"  />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="responsavel.cep" label="CEP" :rules="[
            v => !!v || 'Campo obrigatório',
            v => /^\d{5}-?\d{3}$/.test(v) || 'CEP inválido'
          ]" />
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-text-field v-model="responsavel.logradouro" label="Endereço"            :rules="[v => !!v || 'Campo obrigatório']"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="responsavel.cidade" label="Cidade"           :rules="[v => !!v || 'Campo obrigatório']"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="responsavel.estado" label="Estado"           :rules="[v => !!v || 'Campo obrigatório']"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="responsavel.nascimento"
                      label="Data de Nascimento"
                      type="date"
                      :rules="[v => !!v || 'Campo obrigatório']"

                    />
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-text-field v-model="responsavel.email" label="Email"   :rules="[
            v => !!v || 'Campo obrigatório',
            v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email inválido'
          ]" />
                  </v-col>
                  <v-col cols="12" md="8">
                    <h4 class="text-h5">O responsável é o próprio aprendente?</h4>
                    <div class="d-flex ">
                      <v-radio-group
                        v-model="responsavel.atendimentoProprio"
                        :rules="[v => v !== null || 'Escolha uma opção']"
                        row
                      >
                        <v-radio label="Sim" :value="true"></v-radio>
                        <v-radio label="Não" :value="false"></v-radio>
                      </v-radio-group>
                    </div>
                  </v-col>

                  <v-col cols="12" md="4">
                    <h4 class="text-h5">Sexo</h4>
                    <div class="d-flex ">
                      <v-radio-group
                        v-model="responsavel.sexo"
                        :rules="[v => !!v || 'Selecione o sexo']"
                        row
                      >
                        <v-radio label="Masculino" value="M"></v-radio>
                        <v-radio label="Feminino" value="F"></v-radio>
                      </v-radio-group>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="responsavel.tipoAtendimento"
                      :items="['Avulso', 'Contrato']"
                      label="Tipo de Atendimento"
                      :rules="[v => v !== null || 'Escolha uma opção']"
                    />
                  </v-col>
                </v-row>

                <!-- Dependentes -->
                <div class="mt-6" v-if="responsavel.atendimentoProprio === false"
                >
                  <h3 class="text-subtitle-1 font-weight-medium mb-2">Aprendentes</h3>
                  <v-row v-for="(dep, i) in responsavel.aprendentes" :key="i" dense>
                    <v-col cols="6">
                      <v-text-field v-model="dep.nomeAprendente" label="Nome do Aprendente"          :rules="[v => !!v || 'Campo obrigatório']"
                      />
                    </v-col>
                    <v-col cols="4">
                      <v-text-field
                        v-model="dep.nascimento"
                        label="Nascimento"
                        type="date"
                        :rules="[v => !!v || 'Campo obrigatório']"
                      />
                    </v-col>

                    <v-col cols="2" class="d-flex align-end">
                      <v-btn icon color="red" @click="Aprendente(i)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-btn
                    v-if="responsavel.atendimentoProprio === false"
                    class="mt-2"
                    variant="text"
                    color="primary"
                    @click="adicionarAprendente"
                  >
                    <v-icon start>mdi-plus</v-icon> Adicionar Aprendente
                  </v-btn>


                  <!-- Botão para gerar contrato -->


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
                <v-alert
                  v-if="responsavel.tipoAtendimento === 'Contrato' && !contrato.cadastrado"
                  type="info"
                  class="mt-4"
                >
                  Gere o modelo de contrato para o responsavel.
                </v-alert>

                <v-btn
                  v-if="responsavel.tipoAtendimento === 'Contrato' && !contrato.cadastrado"
                  class="mt-2"
                  variant="text"
                  color="green"
                  @click="modalContrato = true"
                >
                  <v-icon start>mdi-plus</v-icon> Gerar Contrato
                </v-btn>

                <!-- Ações finais do formulário -->
                <v-row class="mt-8">
                  <v-btn text color="red" @click="cancelar">Cancelar</v-btn>
                  <v-spacer />
                  <v-btn color="primary" @click="salvar">Cadastrar Responsavel</v-btn>
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
        <ModalContrato
          v-model="modalContrato"
          :contrato-inicial="novoContrato"
          @salvar="salvarContrato"
        />
      </v-container>
    </v-main>
  </v-layout>

  <!-- Snackbar para mensagens de erro -->
  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="3000"
    location="top"
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {useRouter} from 'vue-router'
import Todo from '@/components/todo.vue'
import CalendarioDiario from '@/components/calendario-diario.vue'
import ModalContrato from '@/components/ModalContrato.vue'
import { ContratoService } from '@/services/contratoService.ts'
import { ResponsavelService } from '@/services/responsavelService'
import { AprendenteService } from '@/services/AprendenteService.ts'
import Contrato from '@/models/Contrato.ts'
import type DiasAtendimentoContrato from '@/models/DiasAtendimentoContrato.ts'

const valid = ref(false)
const form = ref()
const modalContrato = ref(false)
const router = useRouter()
const contratoService = new ContratoService();
const responsavelService = new ResponsavelService()
const aprendenteService = new AprendenteService()

// Snackbar state
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const responsavel = ref({
  nome: '',
  cpf: '',
  telefone: '',
  telefone2: '',
  cep: '',
  logradouro: '',
  cidade: '',
  estado: '',
  sexo: '',
  atendimentoProprio:'',
  nascimento: '',
  email: '',
  tipoAtendimento: '',
  aprendentes: [] as { nomeAprendente: string; nascimento: string ;  idResponsavel:string}[],
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

const adicionarAprendente = () => {
  if (responsavel.value.aprendentes.length >= 1) {
    alert("Apenas um aprendente pode ser adicionado.");
    return;
  }

  responsavel.value.aprendentes.push({ nomeAprendente: '', nascimento: '' ,idResponsavel:''});
};

const removerAprendente = (index: number) => {
  responsavel.value.aprendentes.splice(index, 1)
}

const salvarContrato = (contratoSalvo: Contrato) => {
  contrato.value = {
    ...contratoSalvo,
    cadastrado: true,
    diasAtendimento: [...contratoSalvo.diasAtendimento],
  }
  responsavel.value.contrato = contrato.value;
}

const cancelar = () => {
  router.push({ name: 'home' }) // ou use o path: router.push('/')
}
const limparResponsavelState = () => {
  responsavel.value = {
    nome: '',
    cpf: '',
    telefone: '',
    telefone2: '',
    cep: '',
    logradouro: '',
    cidade: '',
    estado: '',
    sexo: '',
    atendimentoProprio: '',
    nascimento: '',
    email: '',
    tipoAtendimento: '',
    aprendentes: [] as { nomeAprendente: string; nascimento: string ;  idResponsavel:string}[],
    contrato: null,
  };
  contrato.value = new Contrato();
  contrato.value.cadastrado = false;
  contrato.value.diasAtendimento = [];
  novoContrato.value = new Contrato();
};

const salvar = () => {
  form.value?.validate().then(async (result: any) => {
    if (result.valid) {
      // Check for duplicate CPF first
      const isDuplicate = await responsavelService.checkDuplicateCPF(responsavel.value.cpf);
      if (isDuplicate) {
        snackbar.value = {
          show: true,
          text: 'Já existe um responsável cadastrado com este CPF!',
          color: 'error'
        };
        return;
      }

      if (responsavel.value.tipoAtendimento == 'Contrato' && contrato.value.cadastrado) {
        await responsavelService.addResponsavel(responsavel.value);
        snackbar.value = {
          show: true,
          text: 'Responsável salvo com sucesso!',
          color: 'success'
        };
      } else {
        await responsavelService.addResponsavel(responsavel.value);
        snackbar.value = {
          show: true,
          text: 'Responsável salvo com sucesso!',
          color: 'success'
        };
      }
      limparResponsavelState();
    }
  });
};
</script>
