<template>
  <v-card elevation="1" class="pa-4 rounded-lg mb-8">
    <v-row align="center">
      <!-- Avatar e botão de edição -->
      <v-col cols="12" md="2" class="text-center">
        <v-avatar size="90" color="grey-lighten-3">
          <span class="text-h4 font-weight-medium">M</span>
        </v-avatar>
        <v-btn icon class="mt-2" size="small" color="primary" variant="tonal">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </v-col>

      <!-- Dados do cliente -->
      <v-col cols="12" md="6">
        <div class="d-flex align-center mb-2">
          <span class="text-h6 font-weight-bold me-3">Maria</span>
          <v-chip class="me-2" color="green-lighten-3" text-color="green-darken-2" size="small">sem débitos</v-chip>
          <v-chip color="green-lighten-2" text-color="green-darken-4" size="small">Ativo</v-chip>
        </div>

        <div class="d-flex flex-wrap align-center mb-2">
          <v-icon size="20" class="me-1">mdi-phone</v-icon><span class="me-4">--</span>
          <v-icon size="20" class="me-1">mdi-email</v-icon><span class="me-4">--</span>
          <v-icon size="20" class="me-1">mdi-account</v-icon><span class="me-4">--</span>
          <v-icon size="20" class="me-1">mdi-calendar</v-icon><span>--</span>
        </div>

        <div class="text-caption">
          <strong>CIDADE:</strong> -- |
          <strong>PRÓXIMA SESSÃO:</strong> -- |
          <strong>SESSÕES:</strong> 1
        </div>
      </v-col>

      <!-- Botão e status -->
      <v-col cols="12" md="4" class="text-md-end text-start mt-4 mt-md-0">
        <v-btn color="deep-purple-accent-4" class="mb-2" prepend-icon="mdi-download">
          Exportar prontuário
        </v-btn>
        <div>
          <span class="text-success me-2"><strong>ATENDIDAS:</strong> 0</span>
          <span class="text-warning me-2"><strong>FALTAS:</strong> 0</span>
          <span class="text-error"><strong>CANCELADAS:</strong> 0</span>
        </div>
      </v-col>
    </v-row>
  </v-card>

</template>

<script setup>
import { ref } from 'vue'

</script>
