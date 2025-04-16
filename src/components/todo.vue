<template>
  <v-card class="pa-6" elevation="2"  width="100%">
    <v-card-title class="text-h6 font-weight-bold pb-4">Task List</v-card-title>

    <div class="mb-2 font-weight-medium">Checklist Items</div>

    <div v-for="(item, index) in tasks" :key="index" class="d-flex align-center mb-2">
      <v-checkbox
        v-model="item.done"
        :label="item.text"
        hide-details
        density="compact"
        class="flex-grow-1"
      />
      <v-btn icon color="grey-darken-1" variant="text" @click="removeTask(index)">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <!-- Adicionar tarefa -->
    <div class="d-flex align-center mb-4">
      <v-text-field
        v-model="newTask"
        label="Nova tarefa"
        hide-details
        density="compact"
        variant="underlined"
        class="mr-2"
        style="flex: 1"
      />
      <v-btn icon color="primary" @click="addTask">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </div>

    <!-- Barra de progresso -->
    <div class="text-caption mb-1">Progress</div>
    <v-progress-linear :model-value="progress" height="6" color="primary" rounded></v-progress-linear>
    <div class="text-caption text-right mt-1">{{ Math.round(progress) }}%</div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Task {
  text: string
  done: boolean
}

const tasks = ref<Task[]>([
  { text: 'Comprar Produtos', done: false },
  { text: 'Estudar Inglês', done: false },
  { text: 'Jogar', done: false },
])

const newTask = ref('')

const addTask = () => {
  if (newTask.value.trim()) {
    tasks.value.push({ text: newTask.value, done: false })
    newTask.value = ''
  }
}

const removeTask = (index: number) => {
  tasks.value.splice(index, 1)
}

const progress = computed(() => {
  const total = tasks.value.length
  const done = tasks.value.filter(t => t.done).length
  return total ? (done / total) * 100 : 0
})
</script>
