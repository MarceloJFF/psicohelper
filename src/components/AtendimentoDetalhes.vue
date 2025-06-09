<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted, computed } from 'vue'
import ModalPagamento from '@/components/ModalPagamento.vue' // ajuste o caminho se necessário
import { PagamentoService } from '@/services/PagamentoService'
import supabase from '@/config/supabase'


const props = defineProps({
  atendimento: Object
})

const emit = defineEmits(['atualizar'])
const showModalPagamento = ref(false)
const pagamentoEditando = ref(null)
const sessaoId = ref(null)

function abrirModalPagamento(atendimento: any) {
  pagamentoEditando.value = atendimento.status === 'Pago'
    ? {
        id: atendimento.id_pagamento,
        valor: atendimento.valor_pagamento,
        forma_pagamento_tipo: atendimento.forma_pagamento,
        observacao: ''
      }
    : null
  sessaoId.value = atendimento.id
  showModalPagamento.value = true
}

async function atualizarEstadoPagamento(pagamento: any) {
  if (props.atendimento) {
    props.atendimento.status = 'Pago';
    props.atendimento.valor_pagamento = pagamento.valor_pago;
    props.atendimento.forma_pagamento = pagamento.forma_pagamento_tipo;
    props.atendimento.comprovante_url = pagamento.path_comprovante;
    props.atendimento.id_pagamento = pagamento.id;
  }
}

async function excluirPagamentoConfirmado(pagamentoId: string) {
  if (confirm('Tem certeza que deseja excluir este pagamento?')) {
    try {
      await PagamentoService.excluirPagamento(pagamentoId);

      // Atualizar o estado local
      if (props.atendimento) {
        props.atendimento.status = 'Pendente';
        props.atendimento.valor_pagamento = undefined;
        props.atendimento.forma_pagamento = undefined;
        props.atendimento.comprovante_url = undefined;
        props.atendimento.id_pagamento = undefined;
      }

      emit('atualizar');
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      alert('Erro ao excluir pagamento. Por favor, tente novamente.');
    }
  }
}


async function visualizarComprovante(path: string) {
  try {
    // Extrair o nome do arquivo do path
    const fileName = path.split('/').pop();
    // Obter a URL pública do arquivo
    const { data } = supabase.storage
      .from('comprovantes-pagamento')
      .getPublicUrl(path);

    if (data?.publicUrl) {
      window.open(data.publicUrl, '_blank');
    } else {
      alert('Erro ao obter URL do comprovante');
    }
  } catch (error) {
    console.error('Erro ao visualizar comprovante:', error);
    alert('Erro ao visualizar comprovante');
  }
}

let pagamentoSessao;
onMounted(async() => {
  pagamentoSessao = await PagamentoService.getPagamentoSessaoById(props.atendimento.id)
  if(pagamentoSessao != null){
    props.atendimento.valor_pagamento = pagamentoSessao.valor_pago;
    props.atendimento.status = pagamentoSessao.pago? "Pago":"Pendente"
    props.atendimento.forma_pagamento = pagamentoSessao.forma_pagamento_tipo;
    props.atendimento.anotacao= pagamentoSessao.observacao;
    props.atendimento.comprovante_url = pagamentoSessao.path_comprovante
  }else{
    props.atendimento.status = "Pendente"
  }

})



</script>

<template>
  <v-row>
    <!-- Coluna com os dados principais -->
    <v-col cols="12" sm="6" md="4">
      <v-sheet class="pa-4" color="blue-grey-lighten-5" rounded="lg">
        <div class="mb-2">
          <strong>Horário Agendado:</strong><br />

          <span>{{ atendimento.horario }} - {{ atendimento.horario_fim }}</span>
        </div>

        <div class="mb-2">
          <strong>Aprendente:</strong><br />
          <span class="font-weight-bold text-h6">{{ atendimento.paciente }}</span>
        </div>

        <div class="d-flex flex-wrap align-center gap-2 mb-2">
          <v-chip
            :color="atendimento.status === 'Pago' ? 'success' : 'error'"
            variant="elevated"
            class="text-capitalize"
            size="small"
          >
            {{ atendimento.status }}
          </v-chip>

          <v-chip
            :color="atendimento.id_contrato ? 'primary' : 'secondary'"
            variant="elevated"
            class="text-capitalize"
            size="small"
          >
            {{ atendimento.id_contrato ? 'Contrato' : 'Avulsa' }}
          </v-chip>
        </div>

        <div v-if="atendimento.id_contrato" class="text-caption mb-2">
          <strong>Contrato - {{ atendimento.id_contrato }}</strong>
        </div>

        <div v-if="atendimento.status === 'Pago'" class="mt-2">
          <div class="text-caption mb-1">
            <strong>Valor Pago:</strong> R$ {{ atendimento.valor_pagamento?.toFixed(2) }}
          </div>
          <div class="text-caption mb-1">
            <strong>Forma de Pagamento:</strong> {{ atendimento.forma_pagamento }}
          </div>
          <div v-if="atendimento.comprovante_url">
            <v-btn
              size="small"
              color="info"
              variant="text"
              @click="visualizarComprovante(atendimento.comprovante_url)"
            >
              Ver Comprovante
            </v-btn>
          </div>
        </div>
      </v-sheet>
    </v-col>
    <!-- Coluna com ações -->
    <v-col cols="12" sm="6" class="d-flex align-center flex-wrap gap-2">
      <v-btn icon @click="atendimento.showDetails = !atendimento.showDetails">
        <v-icon>{{ atendimento.showDetails ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
      </v-btn>

      <v-btn
        color="primary"
        variant="text"
        @click="atendimento.showDetails = !atendimento.showDetails"
      >
        {{ atendimento.showDetails ? 'Ocultar Detalhes' : 'Mostrar Detalhes' }}
      </v-btn>

      <v-btn
        v-if="atendimento.status === 'Pendente'"
        color="success"
        variant="outlined"
        @click="abrirModalPagamento(atendimento)"
      >
        Pagar
      </v-btn>

      <v-btn
        v-if="atendimento.status === 'Pago'"
        color="warning"
        variant="outlined"
        @click="abrirModalPagamento(atendimento)"
      >
        Editar Pagamento
      </v-btn>

      <v-btn
        v-if="atendimento.status === 'Pago'"
        color="error"
        variant="outlined"
        @click="excluirPagamentoConfirmado(atendimento.id_pagamento)"
      >
        Excluir Pagamento
      </v-btn>
    </v-col>
  </v-row>

  <!-- Modal de Pagamento -->
  <ModalPagamento
  :show="showModalPagamento"
  :isEdit="!!pagamentoEditando"
  :pagamento="pagamentoEditando"
  :sessaoId="sessaoId"
  @update:show="showModalPagamento = $event"
  @salvo="async (pagamento) => {
    await atualizarEstadoPagamento(pagamento);
    emit('atualizar');
  }"
/>

</template>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
