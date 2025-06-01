<template>
  <!-- Botão Responsivo para adicionar cliente -->
  <v-btn
    color="purple"
    fab
    dark
    @click="addCliente"
    aria-label="Adicionar Cliente"
    size="small"
  >
    <v-icon>mdi-plus</v-icon>
  </v-btn>
</template>

<script setup lang="ts">
const addCliente = () => {
  // Função que será chamada quando o botão for clicado
  console.log('Adicionar Cliente');
}
</script>

<style scoped>
/* Responsivo - Define tamanhos diferentes do botão dependendo da tela */
@media (min-width: 600px) {
  .v-btn {
    font-size: 1.2rem; /* Tamanho do botão para telas médias */
  }
}

@media (min-width: 960px) {
  .v-btn {
    font-size: 1.5rem; /* Tamanho do botão para telas grandes */
  }
}
</style>
