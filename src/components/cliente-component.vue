<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  search: string
}>()

const clientes = ref([
  { nome: 'Ana Souza', grupo: 'Premium', status: 'Ativo', contatos: 'ana@email.com / (11) 99999-0001' },
  { nome: 'Carlos Lima', grupo: 'Padrão', status: 'Inativo', contatos: 'carlos@email.com / (11) 98888-0002' },
  { nome: 'Beatriz Silva', grupo: 'VIP', status: 'Ativo', contatos: 'bia@email.com / (11) 97777-0003' },
  // ... outros clientes
])

const page = ref(1)
const itemsPerPage = 5

const filteredClientes = computed(() => {
  return clientes.value.filter(cliente =>
    cliente.nome.toLowerCase().includes(props.search.toLowerCase())
  )
})

const paginatedClientes = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return filteredClientes.value.slice(start, start + itemsPerPage)
})

// Reiniciar para página 1 ao buscar
watch(() => props.search, () => {
  page.value = 1
})
</script>

<template>
  <div>
    <v-table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Grupo</th>
          <th>Status</th>
          <th>Contatos</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cliente, index) in paginatedClientes" :key="index">
          <td>{{ cliente.nome }}</td>
          <td>{{ cliente.grupo }}</td>
          <td>
            <v-chip :color="cliente.status === 'Ativo' ? 'green' : 'grey'" text-color="white" size="small">
              {{ cliente.status }}
            </v-chip>
          </td>
          <td>{{ cliente.contatos }}</td>
          <td>
            <v-btn icon variant="text" color="red" title="Inativar">
              <v-icon>mdi-close-circle</v-icon>
            </v-btn>
            <v-btn icon variant="text" color="blue" title="Editar">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <div class="d-flex justify-center mt-4">
      <v-pagination
        v-model="page"
        :length="Math.ceil(filteredClientes.length / itemsPerPage)"
        rounded
        color="primary"
      />
    </div>
  </div>
</template>
