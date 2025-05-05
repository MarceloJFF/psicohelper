<template>
  <v-card class="pa-6 rounded-xl shadow-lg max-w-2xl mx-auto mt-8">
    <v-card-title class="text-h5 font-weight-bold text-center mb-4">
      Anamnese Padrão
    </v-card-title>

    <v-card-text>
      <v-form @submit.prevent="submit">
        <v-row dense v-for="(question, index) in questions" :key="index" class="mb-4">
          <v-col cols="12">
            <v-textarea
              v-model="answers[index]"
              :label="question.label"
              auto-grow
              outlined
              dense
              rows="1"
            />
          </v-col>
        </v-row>

        <div class="d-flex justify-end mt-6">
          <v-btn color="success" type="submit" class="px-6">
            Salvar Anamnese
          </v-btn>
        </div>
      </v-form>
    </v-card-text>

    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          Resumo das Respostas
        </v-card-title>
        <v-card-text>
          <v-list dense>
            <v-list-item
              v-for="(question, index) in questions"
              :key="index"
            >
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">
                  {{ question.label }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ answers[index] || 'Sem resposta' }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="dialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
// Anamnese
const perguntasAnamnese = ref([])  // Definindo perguntasAnamnese
const respostasAnamnese = ref([])  // Definindo respostasAnamnese



const questions = ref([
  { label: 'Qual o motivo principal da sua consulta?' },
  { label: 'Você tem alguma condição médica preexistente?' },
  { label: 'Está fazendo uso de alguma medicação?' },
  { label: 'Possui alergias? Se sim, quais?' },
  { label: 'Pratica atividade física? Com que frequência?' },
]);

const answers = ref(Array(questions.value.length).fill(''));
const dialog = ref(false);

const submit = () => {
  dialog.value = true;
};


//anamnese
function adicionarPergunta() {
  perguntasAnamnese.value.push({ label: '', obrigatorio: false })
  respostasAnamnese.value.push('')
}

function removerPergunta(index) {
  perguntasAnamnese.value.splice(index, 1)
  respostasAnamnese.value.splice(index, 1)
}

</script>
