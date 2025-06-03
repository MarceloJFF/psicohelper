<template>
  <v-list-item class="pa-4 px-2">
    <v-row class="pa-4 d-flex align-self-center">
      <AtendimentoDetalhes :atendimento="atendimento" />
    </v-row>

    <v-expand-transition>
      <div v-if="atendimento.showDetails" class="details-section mt-4">
        <div class="mt-4">
          <div v-for="menu in menus" :key="menu.field" class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-1">
              {{ menu.label }}
            </h4>
            <v-textarea
              v-if="atendimento.isEditing"
              v-model="atendimento[menu.field]"
              v-bind="menu.props"
              class="mt-2"
            />
            <p v-else class="text-body-2">
              {{ atendimento[menu.field] || 'Sem informações' }}
            </p>
          </div>

          <h4 class="text-subtitle-1 font-weight-bold mb-2">
            Anexos
          </h4>
          <v-row
            v-if="
              atendimento.anexosTemporarios &&
              atendimento.anexosTemporarios.length
            "
            class="mt-2"
          >
            <v-col
              v-for="(anexo, index) in atendimento.anexosTemporarios"
              :key="index"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card class="pa-2" elevation="1">
                <v-img
                  v-if="anexo.url && anexo.url.includes('image')"
                  :src="anexo.url"
                  max-height="100"
                  max-width="100"
                  class="rounded"
                />
                <v-icon v-else-if="anexo.url" size="40">
                  mdi-file-document
                </v-icon>
                <v-icon v-else size="40">mdi-file</v-icon>
                <div class="text-caption mt-2">
                  {{ anexo.name || anexo.url.split('/').pop() || 'Arquivo' }}
                </div>
                <v-btn
                  v-if="atendimento.isEditing"
                  icon
                  small
                  @click="$emit('remover-anexo', atendimento, index)"
                  class="mt-2"
                >
                  <v-icon color="red">mdi-delete</v-icon>
                </v-btn>
                <v-btn
                  v-if="anexo.url"
                  icon
                  small
                  @click="$emit('download-anexo', anexo.url)"
                  class="mt-2"
                >
                  <v-icon>mdi-download</v-icon>
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
          <p v-else class="text-body-2">Nenhum anexo disponível.</p>

          <v-file-input
            v-if="atendimento.isEditing"
            label="Adicionar anexos"
            accept="image/*,application/pdf"
            multiple
            v-model="atendimento.novosAnexos"
            class="mt-4"
            :error-messages="atendimento.uploadError"
            @change="$emit('validar-anexos', atendimento)"
          />
        </div>

        <v-btn
          v-if="!atendimento.isEditing"
          color="primary"
          variant="outlined"
          class="mt-4"
          @click="$emit('iniciar-edicao', atendimento)"
        >
          Editar
        </v-btn>
        <v-btn
          v-if="atendimento.isEditing"
          color="success"
          variant="outlined"
          class="mt-4"
          @click="$emit('salvar-edicao', atendimento)"
        >
          Salvar
        </v-btn>
        <v-btn
          v-if="atendimento.isEditing"
          color="error"
          variant="outlined"
          class="mt-4 ml-2"
          @click="$emit('cancelar-edicao', atendimento)"
        >
          Cancelar
        </v-btn>
      </div>
    </v-expand-transition>
  </v-list-item>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';
import AtendimentoDetalhes from './AtendimentoDetalhes.vue';
const props = defineProps<{
  atendimento: {
    id: string;
    data: string;
    horario: string;
    horario_fim: string;
    paciente: string;
    clienteId: string;
    id_aprendente?: string;
    responsavel_id?: string;
    id_agendamento?: number;
    id_contrato?: string | null;
    avatar: string;
    status: string;
    id_pagamento?: string;
    valor_pagamento?: number;
    forma_pagamento?: string;
    comprovante_url?: string;
    anotacao: string | null;
    showDetails: boolean;
    isEditing: boolean;
    preSessao: string;
    queixas: string;
    evolucaoAtual: string;
    habilidadesTrabalhadas: string;
    futurasAcoes: string;
    anexos: string[];
    anexosTemporarios: { url: string; name: string }[];
    anexosParaExcluir: string[];
    novosAnexos: File[];
    uploadError: string;
    resumo: string;
  };
  menus: {
    field: string;
    label: string;
    component: string;
    props: Record<string, any>;
  }[];
}>();

console.log(props.atendimento)


const emit = defineEmits<{
  (e: 'remover-anexo', atendimento: any, index: number): void;
  (e: 'download-anexo', url: string): void;
  (e: 'validar-anexos', atendimento: any): void;
  (e: 'iniciar-edicao', atendimento: any): void;
  (e: 'salvar-edicao', atendimento: any): void;
  (e: 'cancelar-edicao', atendimento: any): void;
}>();
</script>

<style scoped>
.details-section {
  width: 100%;
  padding: 24px;
  background-color: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}
</style> 