<!-- src/components/ModalGenerico.vue -->
<template>
  <v-dialog v-model="isOpen" max-width="600px">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        {{ title }}
      </v-card-title>

      <v-card-text>
        <slot name="content" />
      </v-card-text>

      <v-card-actions class="justify-end">
        <slot name="actions">
          <v-btn color="primary" @click="isOpen = false">Fechar</v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = defineModel<boolean>({ local: true, name: 'modelValue' })
</script>
