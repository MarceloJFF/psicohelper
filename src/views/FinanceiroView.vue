<template>
  <v-container>
    <h2>Financeiro</h2>
    <p>Lista de receitas e despesas</p>

    <!-- Indicadores -->
    <v-row class="mb-4 mt-4" justify="center">
      <v-col cols="12" md="4">
        <v-card color="blue" class="pa-8" dark>
          <v-card-text class="text-center ">
            <div>Receitas</div>
            <div class="text-h5">R$ {{ totalReceitas }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card color="red" dark class="pa-8">
          <v-card-text class="text-center">
            <div>Despesas</div>
            <div class="text-h5">R$ {{ totalDespesas }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card color="green" dark class="pa-8">
          <v-card-text class="text-center">
            <div>Lucro</div>
            <div class="text-h5">R$ {{ lucro }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-row align="center" justify="space-between">
      <v-col cols="2">
        <v-select v-model="anoSelecionado" :items="anos" label="Ano" dense outlined ></v-select>
      </v-col>
      <v-col cols="8">
        <v-btn-toggle v-model="mesSelecionado" class="d-flex flex-wrap"  dense mandatory>
          <v-btn v-for="(mes, index) in meses" :key="index" :value="index" class="ma-1 bg-blue" >
            {{ mes }}
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <!-- Botões Receitas / Despesas -->
    <v-row class="mb-2" >
      <v-col cols="6" >
        <v-btn block color="green darken-2" dark @click="tipoSelecionado = 'receita'">Receitas</v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn block color="blue darken-2" dark @click="tipoSelecionado = 'despesa'">Despesas</v-btn>
      </v-col>
    </v-row>

    <!-- Ações -->
    <v-row class="mb-2">
      <v-col>
        <v-btn color="blue  mr-4" >Registrar Pagamento</v-btn>
        <v-btn color="blue"  @click="abrirModal = true">Incluir</v-btn>
      </v-col>
    </v-row>


    <table-receita-despesa></table-receita-despesa>
<!--    &lt;!&ndash; Tabela &ndash;&gt;-->
<!--    <v-data-table :headers="headers" :items="itensFiltrados" class="elevation-1" dense>-->
<!--      <template v-slot:item.acoes="{ item }">-->
<!--        <v-icon small class="mr-2">mdi-pencil</v-icon>-->
<!--        <v-icon small>mdi-delete</v-icon>-->
<!--      </template>-->
<!--      <template v-slot:item.selecionar>-->
<!--        <v-checkbox v-model="selecionados" :value="item.id" />-->
<!--      </template>-->
<!--    </v-data-table>-->

    <!-- Modal Receita / Despesa -->
    <v-dialog v-model="abrirModal" max-width="600px">
      <v-card>
        <v-card-title>Adição de {{ tipoSelecionado === 'receita' ? 'Receita' : 'Despesa' }}</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field v-model="novoLancamento.tipo" label="Informe o tipo / descrição" outlined dense />
            <v-text-field v-model="novoLancamento.categoria" label="Categoria" outlined dense />
            <v-row>
              <v-col cols="8">
                <v-text-field v-model="novoLancamento.observacoes" label="Observações" outlined dense />
              </v-col>
              <v-col cols="4">
                <v-checkbox v-model="novoLancamento.recorrente" label="É Recorrente?" dense />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field v-model="novoLancamento.qtdMeses" label="Quantidade meses" outlined dense type="number" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="novoLancamento.vencimento" label="Vencimento" outlined dense type="date" />
              </v-col>
            </v-row>
            <v-text-field v-model="novoLancamento.cliente" label="Informe o cliente" outlined dense append-icon="mdi-magnify" />
            <v-text-field v-model="novoLancamento.valor" label="Valor" type="number" outlined dense />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="abrirModal = false">Fechar</v-btn>
          <v-btn color="green" @click="adicionarLancamento">Adicionar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import TableReceitaDespesa from '@/components/table-receita-despesa.vue'

const tipoSelecionado = ref('receita');
const mesSelecionado = ref(new Date().getMonth());
const anoSelecionado = ref(new Date().getFullYear());
const anos = [2023, 2024, 2025];
const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const abrirModal = ref(false);
const selecionados = ref([]);

const novoLancamento = ref({
  tipo: '',
  categoria: '',
  observacoes: '',
  recorrente: false,
  qtdMeses: 1,
  vencimento: '',
  cliente: '',
  valor: null,
});


//
// const itensFiltrados = computed(() =>
//   dados.value.filter(
//     (item) =>
//       item.tipoLancamento === tipoSelecionado.value &&
//       new Date(item.vencimento).getMonth() === mesSelecionado.value &&
//       new Date(item.vencimento).getFullYear() === anoSelecionado.value
//   )
// );
//
// const totalReceitas = computed(() =>
//   dados.value
//     .filter((item) => item.tipoLancamento === 'receita')
//     .reduce((acc, curr) => acc + curr.valor, 0)
//     .toFixed(2)
// );
//
// const totalDespesas = computed(() =>
//   dados.value
//     .filter((item) => item.tipoLancamento === 'despesa')
//     .reduce((acc, curr) => acc + curr.valor, 0)
//     .toFixed(2)
// );
//
// const lucro = computed(() =>
//   (parseFloat(totalReceitas.value) - parseFloat(totalDespesas.value)).toFixed(2)
// );

function adicionarLancamento() {
  if (!novoLancamento.value.tipo || !novoLancamento.value.vencimento || !novoLancamento.value.valor) return;

  dados.value.push({
    id: dados.value.length + 1,
    tipo: novoLancamento.value.tipo,
    categoria: novoLancamento.value.categoria,
    recorrente: novoLancamento.value.recorrente ? 'Sim' : 'Não',
    paga: false,
    vencimento: novoLancamento.value.vencimento,
    tipoLancamento: tipoSelecionado.value,
    valor: parseFloat(novoLancamento.value.valor),
  });

  novoLancamento.value = {
    tipo: '',
    categoria: '',
    observacoes: '',
    recorrente: false,
    qtdMeses: 1,
    vencimento: '',
    cliente: '',
    valor: null,
  };
  abrirModal.value = false;
}
</script>

<style scoped>
.v-btn-toggle .v-btn {
  min-width: 48px;
}
</style>
