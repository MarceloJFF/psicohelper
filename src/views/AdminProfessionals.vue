<template>
  <v-container>
    <v-row justify="center" class="mb-6">
      <v-col cols="12" md="8" lg="6">
        <h1 class="text-h4 font-weight-bold text-center">Gerenciar Profissionais</h1>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-data-table
          :headers="headers"
          :items="profissionais"
          item-key="id"
          class="elevation-1"
          dense
          :loading="loading"
          loading-text="Carregando profissionais..."
        >
          <template #item.actions="{ item }">
            <v-btn icon color="primary" @click="abrirModalEditar(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-dialog v-model="modalEditar" max-width="500px">
      <v-card>
        <v-card-title>Editar Profissional</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-text-field
              v-model="editarProfissional.nome"
              label="Nome"
              :rules="[v => !!v || 'Nome é obrigatório']"
              required
            />
            <v-select
              v-model="editarProfissional.role"
              :items="roles"
              label="Role"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="modalEditar = false">Cancelar</v-btn>
          <v-btn
            :disabled="!formValid"
            color="primary"
            @click="salvarEdicao"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
 import { ref, onMounted } from "vue";
 import supabase  from "@/config/supabase"


 const profissionais = ref([]);
 const loading = ref(false);

 const headers = [
   { text: "Nome", value: "nome" },
   { text: "Ações", value: "actions", sortable: false },

  ];

 const modalEditar = ref(false);
 const editarProfissional = ref({ id: null, nome: "", role: "" });
 const roles = ["admin", "user"];
 const formValid = ref(false);

 async function fetchProfissionais() {
   loading.value = true;
   const session = await supabase.auth.getSession();
   const token = session.data.session.access_token;

   const res = await fetch("/functions/v1/listar_profissionais", {
     headers: { Authorization: `Bearer ${token}` },
   });
   profissionais.value = await res.json();
   loading.value = false;
 }

 function abrirModalEditar(profissional) {
   editarProfissional.value = { ...profissional };
   modalEditar.value = true;
 }

 async function salvarEdicao() {
   if (!formValid.value) return;

   const session = await supabase.auth.getSession();
   const token = session.data.session.access_token;

   const res = await fetch("/functions/v1/editar_profissional", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       Authorization: `Bearer ${token}`,
     },
     body: JSON.stringify(editarProfissional.value),
   });

   if (res.ok) {
     modalEditar.value = false;
     fetchProfissionais();
   } else {
     alert("Erro ao salvar profissional");
   }
 }

 onMounted(fetchProfissionais);
 </script>
