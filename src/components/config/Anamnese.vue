<template>
  <v-card class="pa-6 rounded-xl shadow-lg max-w-2xl mx-auto mt-8">
    <v-card-title class="text-h5 font-weight-bold text-center mb-4">
      Anamnese Padrão
    </v-card-title>

    <v-card-text>
      <v-form @submit.prevent="submit">
        <v-row dense v-for="(question, index) in questions" :key="index" class="mb-4">
          <v-col cols="11">
            <v-textarea
              v-model="answers[index]"
              :label="question.label"
              auto-grow
              outlined
              dense
              rows="1"
            />
          </v-col>
          <v-col cols="1" class="d-flex align-center">
            <v-btn
              icon
              color="error"
              @click="removerPergunta(index)"
              v-if="index >= defaultQuestions.length"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <div class="d-flex justify-space-between mt-6">
          <v-btn color="primary" @click="adicionarPergunta" class="px-6">
            Adicionar Pergunta
          </v-btn>
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

<script setup lang="ts">
import { ref } from 'vue';

const defaultQuestions = [
  { label: 'Qual o motivo principal da sua consulta?' },
  { label: 'Você tem alguma condição médica preexistente?' },
  { label: 'Está fazendo uso de alguma medicação?' },
  { label: 'Possui alergias? Se sim, quais?' },
  { label: 'Pratica atividade física? Com que frequência?' },
];

const questions = ref([...defaultQuestions]);
const answers = ref(Array(questions.value.length).fill(''));
const dialog = ref(false);

const submit = () => {
  // Aqui você pode implementar a lógica para salvar as perguntas e respostas
  dialog.value = true;
};

function adicionarPergunta() {
  questions.value.push({ label: 'Nova pergunta' });
  answers.value.push('');
}

function removerPergunta(index: number) {
  if (index >= defaultQuestions.length) {
    questions.value.splice(index, 1);
    answers.value.splice(index, 1);
  }
}
</script>
