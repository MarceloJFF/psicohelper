<template>
  <v-dialog v-model="internalModel" max-width="1200px" min-width="900px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <span>Atendimento - {{ title }}</span>
        <v-spacer />
        <v-btn icon @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Menu Superior -->
        <v-tabs v-model="tab" center-active grow>
          <v-tab v-for="(item, index) in menus" :key="index" :value="index">
            {{ item.label }}
          </v-tab>
        </v-tabs>

        <!-- Conteúdo Dinâmico -->
        <v-window v-model="tab" class="mt-4">
          <v-window-item v-for="(item, index) in menus" :key="index" :value="index">
            <h4>{{item.label}}</h4>
            <component
              :is="item.component"
              :model-value="item.value"
              @update:modelValue="item.value = $event"
              v-bind="item.props"
            />


          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="primary" @click="salvar">Salvar</v-btn>
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Fechar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import EditorText from '@/components/editor-text.vue'

const props = defineProps({
  modelValue: Boolean,
  title: String
})

const emit = defineEmits(['update:modelValue'])

const internalModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const tab = ref(0)

// Configuração dos menus e componentes
const menus = ref([
  {
    label: 'Pré-sessão',
    component: 'v-textarea',
    value: ref(''),
    props: {
      label: 'Anotações antes da sessão',
      rows: 3,
      placeholder: 'Registre preparativos e observações prévias...'
    }
  },
  {
    label: 'Queixas',
    component: 'v-text-area',
    value: ref(''),
    props: {
      label: 'Principais queixas relatadas'
    }
  },
  {
    label: 'Evolução Atual',
    component: 'v-textarea',
    value: ref(''),
    props: {
      label: 'Progresso do paciente',
      rows: 3,
      placeholder: 'Descreva a evolução atual...'
    }
  },
  {
    label: 'Habilidades Trabalhadas',
    component: 'v-textarea',
    value: ref(''),
    props: {
      label: 'Planejamento futuro',
      rows: 3,
      placeholder: 'Registre próximos passos...'
    }
  },
  {
    label: 'Futuras Ações',
    component: 'v-textarea',
    value: ref(''),
    props: {
      label: 'Planejamento futuro',
      rows: 3,
      placeholder: 'Registre próximos passos...'
    }
  },
  {
    label: 'Anexos',
    component: 'v-file-input',
    value: ref([]),
    props: {
      label: 'Anexar documentos/fotos',
      multiple: true,
      chips: true,
      accept: 'image/*, .pdf'
    }
  },
  {
    label: 'Resumo',
    component: 'v-textarea',
    value: ref(''),
    props: {
      label: 'Resumo da sessão',
      rows: 5,
      placeholder: 'Detalhes sobre o desenvolvimento da sessão...'
    }
  },
])
function salvar() {
  const dados = menus.value.reduce((acc, menu) => {
    acc[menu.label] = menu.value.value
    return acc
  }, {})
  console.log('Dados salvos:', dados)
}

</script>

<style scoped>
.v-card-title {
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  padding: 16px;
}

.v-tabs {
  border-bottom: 1px solid #eee;
}

.v-window {
  min-height: 300px;
}

.v-textarea, .v-file-input {
  margin-top: 16px;
}
</style>
