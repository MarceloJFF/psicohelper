<template>
  <v-container>
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="Buscar profissional por nome ou e-mail"
          prepend-inner-icon="mdi-magnify"
          clearable
        />
      </v-col>
      <v-col cols="12" md="6" class="text-right">
        <v-btn color="primary" @click="abrirModalProfissional">
          <v-icon start>mdi-plus</v-icon>
          Novo Profissional
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="profissionaisFiltrados"
      :search="search"
      class="elevation-1"
      no-data-text="Nenhum profissional encontrado"
    >
      <template #item.status="{ item }">
        <v-chip :color="item.ativo ? 'green' : 'grey'" dark>
          {{ item.ativo ? 'Ativo' : 'Inativo' }}
        </v-chip>
      </template>

      <template #item.acao="{ item }">
        <v-btn icon @click="abrirModalProfissional(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon @click="alternarStatus(item)">
          <v-icon :color="item.ativo ? 'grey' : 'green'">
            {{ item.ativo ? 'mdi-eye-off' : 'mdi-eye' }}
          </v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Modal -->
    <v-dialog v-model="dialogProfissional" max-width="500px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h6">{{ profissionalEditando ? 'Editar Profissional' : 'Novo Profissional' }}</span>
        </v-card-title>

        <v-card-text>
          <v-text-field v-model="form.email" label="E-mail" type="email" required />

          <v-text-field
            v-if="!profissionalEditando"
            v-model="form.senha"
            label="Senha"
            type="password"
            :rules="[v => !!v || 'Obrigatório']"
          />
          <v-text-field
            v-else
            v-model="form.senha"
            label="Nova senha (opcional)"
            type="password"
          />

          <v-text-field v-model="form.nome" label="Nome" required />
          <v-text-field v-model="form.profissao" label="Profissão" />
          <v-text-field v-model="form.telefone" label="Telefone" />
          <v-text-field
            v-model="form.dataExpiracao"
            label="Data de expiração do acesso"
            type="date"
          />
          <v-select
            v-model="form.idPlano"
            label="Plano"
            :items="planos"
            item-title="label"
            item-value="id"
            required
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogProfissional = false">Cancelar</v-btn>
          <v-btn color="primary" @click="salvarProfissional">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const ProfissionalService = {
  async listar() {
    return [
      {
        id: 1,
        email: 'ana@email.com',
        nome: 'Ana sssssss  aaaasss assasssa',
        profissao: 'Psicóloga',
        telefone: '11999999999',
        idPlano: 1,
        ativo: true,
        dataExpiracao: '2025-12-31'
      },
      {
        id: 2,
        email: 'bruno@email.com',
        nome: 'Bruno',
        profissao: 'Pedagogo',
        telefone: '11888888888',
        idPlano: 2,
        ativo: false,
        dataExpiracao: '2025-10-15'
      }
    ]
  },
  async criar(profissional: any) {
    return { ...profissional, id: Date.now(), ativo: true }
  },
  async atualizar(profissional: any) {
    return profissional
  }
}

const search = ref('')
const dialogProfissional = ref(false)
const profissionalEditando = ref(false)

const form = ref({
  id: null,
  email: '',
  senha: '',
  nome: '',
  profissao: '',
  telefone: '',
  idPlano: null,
  dataExpiracao: '',
  ativo: true
})

const planos = [
  { id: 1, label: 'Plano Anamnese' },
  { id: 2, label: 'Plano Piaget' },
  { id: 3, label: 'Plano Wallon' },
]

const headers = [
  { title: 'Nome', key: 'nome' },
  { title: 'E-mail', key: 'email' },
  { title: 'Profissão', key: 'profissao' },
  { title: 'Telefone', key: 'telefone' },
  { title: 'Plano', key: 'planoLabel' },
  { title: 'Expira em', key: 'dataExpiracao' },
  { title: 'Status', key: 'status' },
  { title: 'Ações', key: 'acao', sortable: false },
]

const profissionais = ref<any[]>([])

const profissionaisFiltrados = computed(() =>
  profissionais.value.map(p => ({
    ...p,
    planoLabel: planos.find(pl => pl.id === p.idPlano)?.label || '---'
  }))
)

function abrirModalProfissional(profissional = null) {
  if (profissional) {
    profissionalEditando.value = true
    form.value = { ...profissional, senha: '' }
  } else {
    profissionalEditando.value = false
    form.value = {
      id: null,
      email: '',
      senha: '',
      nome: '',
      profissao: '',
      telefone: '',
      idPlano: null,
      dataExpiracao: '',
      ativo: true
    }
  }
  dialogProfissional.value = true
}

async function salvarProfissional() {
  try {
    const payload = {
      ...form.value,
      idPlano: Number(form.value.idPlano)
    }

    if (profissionalEditando.value && !payload.senha) {
      delete payload.senha
    }

    if (profissionalEditando.value) {
      const atualizado = await ProfissionalService.atualizar(payload)
      const idx = profissionais.value.findIndex(p => p.id === atualizado.id)
      if (idx !== -1) profissionais.value[idx] = atualizado
    } else {
      const novo = await ProfissionalService.criar(payload)
      profissionais.value.push(novo)
    }

    dialogProfissional.value = false
  } catch (error) {
    console.error('Erro ao salvar profissional:', error)
  }
}

function alternarStatus(profissional) {
  profissional.ativo = !profissional.ativo
}

onMounted(async () => {
  profissionais.value = await ProfissionalService.listar()
})
</script>
