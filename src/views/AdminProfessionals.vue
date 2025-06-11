<template>
  <v-container>
    <v-alert
      v-if="error"
      type="error"
      class="mb-4"
      closable
      @click:close="error = null"
    >
      {{ error }}
    </v-alert>

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
      :loading="loading"
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
import supabase from '../config/supabase'

interface Profissional {
  profissional_id: string;
  profissional_nome: string;
  profissao: string;
  telefone: string;
  status_prof: boolean;
  user_id: string;
  user_email: string;
  assinatura_id: string;
  data_expiracao: string;
  ativo: boolean;
  plano_id: string;
  plano_nome: string;
}

interface ProfissionalForm {
  id: string | null;
  email: string;
  senha?: string; // Tornando senha opcional
  nome: string;
  profissao: string;
  telefone: string;
  idPlano: number | null;
  dataExpiracao: string;
  ativo: boolean;
}

const search = ref('')
const dialogProfissional = ref(false)
const profissionalEditando = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

const form = ref<ProfissionalForm>({
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
    nome: p.profissional_nome,
    email: p.user_email || '---',
    planoLabel: p.plano_nome || '---',
    dataExpiracao: p.data_expiracao || '---',
    ativo: p.ativo ?? false
  }))
)

function abrirModalProfissional(profissional: Profissional | null = null) {
  if (profissional) {
    profissionalEditando.value = true
    form.value = {
      id: profissional.profissional_id,
      email: profissional.user_email || '',
      senha: '',
      nome: profissional.profissional_nome,
      profissao: profissional.profissao,
      telefone: profissional.telefone,
      idPlano: null,
      dataExpiracao: profissional.data_expiracao || '',
      ativo: profissional.ativo ?? true
    }
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
      const { senha, ...payloadWithoutSenha } = payload;
      if (profissionalEditando.value) {
        const atualizado = await ProfissionalService.atualizar(payloadWithoutSenha as ProfissionalForm)
        const idx = profissionais.value.findIndex(p => p.profissional_id === atualizado.id)
        if (idx !== -1) profissionais.value[idx] = atualizado
      }
    } else {
      const novo = await ProfissionalService.criar(payload)
      profissionais.value.push(novo)
    }

    dialogProfissional.value = false
  } catch (error) {
    console.error('Erro ao salvar profissional:', error)
  }
}

function alternarStatus(profissional: Profissional) {
  if (profissional.status_prof) {
    profissional.status_prof = !profissional.status_prof
  }
}

const ProfissionalService = {
  async listar() {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch("https://ycomsbcspjbudrdeulgo.supabase.co/functions/v1/manager_profissional", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar profissionais')
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Erro ao buscar profissionais:', err)
      error.value = 'Erro ao carregar profissionais'
      return []
    } finally {
      loading.value = false
    }
  },

  async criar(profissional: ProfissionalForm) {
    try {
      loading.value = true
      error.value = null

      const response = await fetch('/functions/v1/manager_profissional', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: profissional.email,
          senha: profissional.senha || '123456',
          nome: profissional.nome,
          profissao: profissional.profissao,
          telefone: profissional.telefone,
          expiracao: profissional.dataExpiracao,
          idPlano: profissional.idPlano
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar profissional')
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Erro ao criar profissional:', err)
      error.value = 'Erro ao criar profissional'
      throw err
    } finally {
      loading.value = false
    }
  },

  async atualizar(profissional: ProfissionalForm) {
    try {
      loading.value = true
      error.value = null

      const response = await fetch('/functions/v1/manager_profissional', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: profissional.id,
          nome: profissional.nome,
          profissao: profissional.profissao,
          telefone: profissional.telefone,
          expiracao: profissional.dataExpiracao,
          idPlano: profissional.idPlano,
          ativo: profissional.ativo
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar profissional')
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Erro ao atualizar profissional:', err)
      error.value = 'Erro ao atualizar profissional'
      throw err
    } finally {
      loading.value = false
    }
  }
}

onMounted(async () => {
  try {
    profissionais.value = await ProfissionalService.listar()
    console.log("========")
    console.log(profissionais)
  } catch (err) {
    console.error('Erro ao carregar profissionais:', err)
  }
})
</script>
