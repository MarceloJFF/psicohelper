<template>
  <v-container class="w-100">
    <v-container class="sessoes rounded pa-8">
      <h1 class="text-deep-purple-lighten-2 mb-4">
        Controle do Pagamento das Sessões Realizadas
      </h1>
      <v-row justify="space-between">
        <v-col cols="6">
          <v-autocomplete v-model="filtroPaciente" :items="pacientes" v-model:search="searchQuery"
            label="Filtrar por paciente" item-title="displayName" item-value="id" :loading="isLoading" clearable
            :filter="() => true" :menu-props="{ maxHeight: 400 }" :return-object="false">
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :key="item.raw.id" :value="item.raw.id">
                <v-list-item-title>
                  {{ item.raw.nomeAprendente}}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6"
          style="display: flex; justify-content: center; align-items: flex-start; flex-direction: column; gap: 2vh;">
          <v-btn style="width: 100%;" color="success" variant="outlined" @click="abrirModalMensalidade"
            :disabled="!filtroPaciente">
            Pagar Mensalidade de Contrato
          </v-btn>
          <v-btn style="width: 100%;" color="success" variant="outlined" @click="abrirModalPagamentoLote">
            Pagar Sessões Avulsas em Lote
          </v-btn>
          <span v-if="!filtroPaciente"
            style="font-size: 15px; color: gray; margin-top: 4px; margin-left: 4px; font-style: italic;">Selecione um
            paciente
            para pagar mensalidades ou sessões avulsas.</span>
        </v-col>
      </v-row>
    </v-container>

    <v-divider class="my-6" />

    <v-alert v-if="!Object.keys(atendimentosAgrupados).length" type="info">
      Nenhuma sessão encontrada para o filtro selecionado.
    </v-alert>

    <div v-for="(grupo, data) in atendimentosAgrupados" :key="data">
      <v-card class="mb-6 elevation-2 rounded-xl">
        <v-card-title class="text-h6 font-weight-bold text-primary">
          {{ formatarData(data) }}
        </v-card-title>

        <v-divider />

        <v-list>
          <v-list-item v-for="atendimento in grupo" :key="atendimento.id" class="pa-4 px-2">
            <v-row class="pa-4 d-flex align-self-center">
              <v-col cols="12" sm="6" md="4">
                <div class="font-weight-medium pa-2">
                  Horário Agendado: {{ atendimento.horario }} - {{ atendimento.horario_fim }}
                </div>
                <div class="font-weight-medium pa-2">
                  Aprendente: {{ atendimento.paciente }}
                </div>
                <v-chip :color="atendimento.status === 'Pago' ? 'success' : 'error'" variant="outlined"
                  class="text-capitalize pa-2" small>
                  {{ atendimento.status }}
                </v-chip>
                <div v-if="atendimento.id_contrato" class="text-caption mt-2">
                  Contrato #{{ atendimento.id_contrato }}
                </div>
              </v-col>

              <v-spacer />
              <v-col cols="12" sm="6" class="d-flex align-center">
                <!-- {{ atendimento }} -->
                <v-btn icon @click="atendimento.showDetails = !atendimento.showDetails">
                  <v-icon>{{ atendimento.showDetails ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                </v-btn>
                <v-btn color="primary" variant="text" @click="atendimento.showDetails = !atendimento.showDetails">
                  {{ atendimento.showDetails ? 'Ocultar Detalhes' : 'Mostrar Detalhes' }}
                </v-btn>
                <v-btn
                  v-if="atendimento.status === 'Pendente' && (atendimento.id_contrato == null || atendimento.id_contrato == undefined)"
                  color="success" variant="outlined" class="ml-2" @click="abrirModalPagamentoIndividual(atendimento)">
                  Lançar Pagamento
                </v-btn>
                <v-btn
                  v-if="atendimento.status === 'Pago' && (atendimento.id_contrato === null || atendimento.id_contrato === undefined)"
                  color="error" variant="outlined" class="ml-2" @click="abrirModalPagamentoIndividual(atendimento)">
                  Editar Pagamento
                </v-btn>
                <!-- <v-btn v-if="atendimento.status === 'Pago' && !atendimento.id_contrato" color="error" variant="outlined"
                  class="ml-2" @click="abrirModalPagamentoIndividual(atendimento)">
                  Editar Pagamento
                </v-btn> -->
              </v-col>
            </v-row>

            <v-expand-transition>
              <div v-if="atendimento.showDetails" class="details-section mt-4">
                <div class="mt-4">
                  <div v-for="menu in menus" :key="menu.field" class="mb-4">
                    <h4 class="text-subtitle-1 font-weight-bold mb-1">{{ menu.label }}</h4>
                    <v-textarea v-if="atendimento.isEditing" v-model="atendimento[menu.field]" v-bind="menu.props"
                      class="mt-2" />
                    <p v-else class="text-body-2">
                      {{ atendimento[menu.field] || 'Sem informações' }}
                    </p>
                  </div>
                  <h4 class="text-subtitle-1 font-weight-bold mb-2">Anexos</h4>
                  <v-row v-if="atendimento.anexosTemporarios && atendimento.anexosTemporarios.length" class="mt-2">
                    <v-col v-for="(anexo, index) in atendimento.anexosTemporarios" :key="index" cols="12" sm="6" md="4">
                      <v-card class="pa-2" elevation="1">
                        <v-img v-if="anexo.url && anexo.url.includes('image')" :src="anexo.url" max-height="100"
                          max-width="100" class="rounded" />
                        <v-icon v-else-if="anexo.url" size="40">mdi-file-document</v-icon>
                        <v-icon v-else size="40">mdi-file</v-icon>
                        <div class="text-caption mt-2">
                          {{ anexo.name || anexo.url.split('/').pop() || 'Arquivo' }}
                        </div>
                        <v-btn v-if="atendimento.isEditing" icon small
                          @click="removerAnexoTemporario(atendimento, index)" class="mt-2">
                          <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                        <v-btn v-if="anexo.url" icon small @click="downloadAnexo(anexo.url)" class="mt-2">
                          <v-icon>mdi-download</v-icon>
                        </v-btn>
                      </v-card>
                    </v-col>
                  </v-row>
                  <p v-else class="text-body-2">Nenhum anexo disponível.</p>
                  <v-file-input v-if="atendimento.isEditing" label="Adicionar anexos" accept="image/*,application/pdf"
                    multiple v-model="atendimento.novosAnexos" class="mt-4" :error-messages="atendimento.uploadError"
                    @change="validarNovosAnexos(atendimento)" />
                </div>
                <v-btn v-if="!atendimento.isEditing" color="primary" variant="outlined" class="mt-4"
                  @click="iniciarEdicao(atendimento)">
                  Editar
                </v-btn>
                <v-btn v-if="atendimento.isEditing" color="success" variant="outlined" class="mt-4"
                  @click="salvarEdicao(atendimento)">
                  Salvar
                </v-btn>
                <v-btn v-if="atendimento.isEditing" color="error" variant="outlined" class="mt-4 ml-2"
                  @click="cancelarEdicao(atendimento)">
                  Cancelar
                </v-btn>
              </div>
            </v-expand-transition>
          </v-list-item>
        </v-list>
      </v-card>
    </div>

    <!-- Diálogo de Pagamento Individual -->
    <v-dialog v-model="modalPagamentoIndividual" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          {{ atendimentoSelecionado?.status === 'Pago' ? 'Editar Pagamento' : 'Lançar Pagamento' }}
        </v-card-title>
        <v-card-text>
          <p><strong>Paciente:</strong> {{ atendimentoSelecionado?.paciente }}</p>
          <p><strong>Data:</strong> {{ formatarData(atendimentoSelecionado?.data) }}</p>
          <p><strong>Horário:</strong> {{ atendimentoSelecionado?.horario }} - {{ atendimentoSelecionado?.horario_fim }}
          </p>
          <v-text-field v-model.number="valorPago" label="Valor Pago" type="number"
            :rules="[v => v > 0 || 'O valor deve ser maior que zero']" required />
          <v-select v-model="formaPagamento" label="Forma de Pagamento" :items="['Dinheiro', 'Pix', 'Cartão']"
            :rules="[v => !!v || 'Selecione uma forma de pagamento']" required />
          <v-file-input label="Anexar comprovante" accept="image/*" v-model="comprovanteImagem" :loading="uploading"
            @change="handleFileChange" />
          <v-alert v-if="uploadError" type="error" class="mt-2">
            {{ uploadError }}
          </v-alert>
          <v-alert v-if="uploadSuccess" type="success" class="mt-2">
            Comprovante enviado com sucesso!
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="cancelarPagamentoIndividual">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmarPagamentoIndividual"
            :disabled="uploading || !valorPago || !formaPagamento" :loading="uploading">
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de Pagamento em Lote (Apenas Avulsas) -->
    <v-dialog v-model="modalPagamentoLote" max-width="800">
      <v-card>
        <v-card-title class="text-h6">Lançar Pagamento em Lote (Sessões Avulsas)</v-card-title>
        <v-card-text>
          <v-data-table
            :headers="[{ title: 'Selecionar', key: 'select', sortable: false }, { title: 'Data', key: 'data' }, { title: 'Paciente', key: 'paciente' }]"
            :items="atendimentosPendentes" show-select v-model="atendimentosSelecionados" item-key="id">
            <template v-slot:item.data="{ item }">
              {{ formatarData(item.data) }}
            </template>
          </v-data-table>
          <v-text-field v-model.number="valorPago" label="Valor Total" type="number"
            :rules="[v => v > 0 || 'O valor deve ser maior que zero']" required />
          <v-select v-model="formaPagamento" label="Forma de Pagamento" :items="['Dinheiro', 'Pix', 'Cartão']"
            :rules="[v => !!v || 'Selecione uma forma de pagamento']" required />
          <v-file-input label="Anexar comprovante" accept="image/*" v-model="comprovanteImagem" :loading="uploading"
            @change="handleFileChange" />
          <v-alert v-if="uploadError" type="error" class="mt-2">
            {{ uploadError }}
          </v-alert>
          <v-alert v-if="uploadSuccess" type="success" class="mt-2">
            Pagamento registrado com sucesso!
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="cancelarPagamentoLote">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmarPagamentoLote"
            :disabled="uploading || !valorPago || !formaPagamento || !atendimentosSelecionados.length"
            :loading="uploading">
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de Pagamento de Mensalidade -->
    <v-dialog v-model="modalMensalidade" max-width="600">
      <v-card>
        <v-card-title class="text-h6">Pagar Mensalidade de Contrato</v-card-title>
        <v-card-text>
          <v-autocomplete v-model="contratoSelecionado" :items="contratos" label="Selecionar Contrato"
            item-title="id_contrato" item-value="id_contrato" clearable @update:modelValue="loadMensalidades" />
          <v-select v-if="contratoSelecionado" v-model="mesReferencia" label="Mês de Referência"
            :items="mensalidadesPendentes" item-title="mes_referencia_display" item-value="mes_referencia_cycle"
            :loading="loadingMensalidades" />
          <v-text-field v-model.number="valorPago" label="Valor da Mensalidade" type="number"
            :rules="[v => v > 0 || 'O valor deve ser maior que zero']" required />
          <v-select v-model="formaPagamento" label="Forma de Pagamento" :items="['Dinheiro', 'Pix', 'Cartão']"
            :rules="[v => !!v || 'Selecione uma forma de pagamento']" required />
          <v-file-input label="Anexar comprovante" accept="image/*" v-model="comprovanteImagem" :loading="uploading"
            @change="handleFileChange" />
          <v-alert v-if="uploadError" type="error" class="mt-2">
            {{ uploadError }}
          </v-alert>
          <v-alert v-if="uploadSuccess" type="success" class="mt-2">
            Mensalidade registrada com sucesso!
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="cancelarMensalidade">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmarMensalidade"
            :disabled="uploading || !valorPago || !formaPagamento || !contratoSelecionado || !mesReferencia"
            :loading="uploading">
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { SessaoService } from '@/services/SessaoService';
import { AprendenteService } from '@/services/AprendenteService';
import { UploadService } from '@/services/UploadService';
import { PagamentoService } from '@/services/PagamentoService';
import { ContratoService } from '@/services/contratoService';
import supabase from '@/config/supabase';

const sessaoService = new SessaoService();
const aprendenteService = new AprendenteService();
const uploadService = new UploadService();
const pagamentoService = new PagamentoService();
const contratoService = new ContratoService();
const atendimentos = ref<any[]>([]);
const pacientes = ref<any[]>([]);
const filtroPaciente = ref<string | null>(null);
const searchQuery = ref('');
const isLoading = ref(false);
const aprendenteCache = new Map();
const modalPagamentoIndividual = ref(false);
const modalPagamentoLote = ref(false);
const modalMensalidade = ref(false);
const atendimentoSelecionado = ref<any>(null);
const valorPago = ref<number | null>(null);
const formaPagamento = ref<string | null>(null);
const comprovanteImagem = ref<File[] | null>(null);
const uploading = ref(false);
const uploadError = ref<string | null>(null);
const uploadSuccess = ref<boolean>(false);
const contratos = ref<any[]>([]);
const contratoSelecionado = ref<string | null>(null);
const mensalidadesPendentes = ref<any[]>([]);
const mesReferencia = ref<number | null>(null);
const atendimentosSelecionados = ref<any[]>([]);
const loadingMensalidades = ref(false);

async function handleFileChange(files: File[] | null) {
  uploadError.value = null;
  uploadSuccess.value = false;
  if (files && files.length > 0) {
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      uploadError.value = 'Por favor, selecione uma imagem (JPEG, PNG, etc.).';
      comprovanteImagem.value = null;
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      uploadError.value = 'A imagem deve ter menos de 25MB.';
      comprovanteImagem.value = null;
      return;
    }
  }
}

async function loadSessoes() {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const sessoes = await sessaoService.getAllSessoes();
    console.log(sessoes)

    atendimentos.value = await Promise.all(
      sessoes.map(async (sessao) => {
        const agendamento = sessao.tb_agendamento;
        const startTime = agendamento?.horario_inicio;
        const duracao = parseInt(agendamento?.duracao) || 60;
        const startDateTime = startTime ? new Date(`1970-01-01T${startTime}`) : null;
        const endDateTime = startDateTime ? new Date(startDateTime.getTime() + duracao * 60000) : null;
        const horarioFim = endDateTime
          ? `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`
          : '';
        console.log(agendamento)
        let paciente = 'N/A';
        let clienteId = agendamento?.id_aprendente || agendamento?.responsavel_id || '';
        if (agendamento?.id_aprendente) {
          if (aprendenteCache.has(agendamento.id_aprendente)) {
            paciente = aprendenteCache.get(agendamento.id_aprendente).nome_aprendente;
          } else {
            const aprendente = await aprendenteService.getAprendenteById(agendamento.id_aprendente);
            paciente = aprendente?.nome_aprendente || 'N/A';
            aprendenteCache.set(agendamento.id_aprendente, aprendente);
          }
        } else if (agendamento?.responsavel_id) {
          const responsavel = await supabase
            .from('tb_responsavel')
            .select('nome')
            .eq('id_responsavel', agendamento.responsavel_id)
            .single();
          paciente = responsavel.data?.nome || 'N/A';
        }

        const anexos = sessao.fotos ? sessao.fotos.split(',').filter((url: string) => url) : [];
        let status = 'Pendente';
        let pagamentoData: any = null;

        const idContrato = sessao.id_contrato || null;
        console.log(`Processando sessão ${sessao.id}, id_contrato: ${idContrato}, tipo: ${idContrato ? 'Contrato' : 'Avulsa'}`);

        if (idContrato) {
          const mesReferencia = new Date(agendamento?.data_agendamento).toISOString().slice(0, 7) + '-01';
          const { data: mensalidade } = await supabase
            .from('tb_mensalidade')
            .select('id_mensalidade, valor, forma_pagamento, comprovante_url, status_pagamento')
            .eq('id_contrato', idContrato)
            .eq('mes_referencia', mesReferencia)
            .eq('status_pagamento', 'Pago')
            .maybeSingle();
          if (mensalidade) {
            status = 'Pago';
            pagamentoData = {
              id_mensalidade: mensalidade.id_mensalidade,
              valor: mensalidade.valor,
              forma_pagamento: mensalidade.forma_pagamento,
              comprovante_url: mensalidade.comprovante_url
            };
            console.log(`Sessão ${sessao.id} marcada como Pago por mensalidade:`, mensalidade);
          } else {
            console.log(`Sessão ${sessao.id} sem mensalidade paga para ${mesReferencia}`);
          }
        } else {
          const pagamento = await pagamentoService.getPagamentoBySessao(sessao.id);
          if (pagamento) {
            status = 'Pago';
            pagamentoData = {
              id_pagamento: pagamento.id_pagamento,
              valor: pagamento.valor,
              forma_pagamento: pagamento.forma_pagamento,
              comprovante_url: pagamento.comprovante_url
            };
            console.log(`Sessão ${sessao.id} marcada como Pago por pagamento avulso:`, pagamento);
          } else {
            console.log(`Sessão ${sessao.id} sem pagamento avulso`);
          }
        }

        const atendimento = {
          id: sessao.id,
          data: agendamento?.data_agendamento || '',
          horario: startTime || '',
          horario_fim: horarioFim,
          paciente,
          clienteId,
          id_aprendente: agendamento?.id_aprendente,
          responsavel_id: agendamento?.responsavel_id,
          id_agendamento: agendamento?.id_agendamento,
          id_contrato: idContrato,
          avatar: '',
          status,
          id_pagamento: pagamentoData?.id_pagamento,
          id_mensalidade: pagamentoData?.id_mensalidade,
          valor_pagamento: pagamentoData?.valor,
          forma_pagamento: pagamentoData?.forma_pagamento,
          comprovante_url: pagamentoData?.comprovante_url,
          anotacao: null,
          showDetails: false,
          isEditing: false,
          preSessao: sessao.pre_sessao || '',
          queixas: sessao.queixas || '',
          evolucaoAtual: sessao.evolucao || '',
          habilidadesTrabalhadas: sessao.habilidades_trabalhadas || '',
          futurasAcoes: sessao.futuras_acoes || '',
          anexos,
          anexosTemporarios: anexos.map(url => ({ url, name: url.split('/').pop() })),
          anexosParaExcluir: [] as string[],
          novosAnexos: [] as File[],
          uploadError: '',
          resumo: sessao.resumo || ''
        };

        return atendimento;
      })
    );
    console.log('Atendimentos carregados:', atendimentos.value.map(a => ({
      id: a.id,
      clienteId: a.clienteId,
      id_aprendente: a.id_aprendente,
      responsavel_id: a.responsavel_id,
      paciente: a.paciente,
      status: a.status,
      id_contrato: a.id_contrato,
      tipo_sessao: a.id_contrato ? 'Contrato' : 'Avulsa'
    })));
  } catch (err) {
    console.error('Erro ao carregar sessões:', err);
    uploadError.value = 'Erro ao carregar sessões: ' + (err as Error).message;
  }
}

async function loadPacientes() {
  try {
    const clientes = await aprendenteService.loadAprendentesPorProfissionalENome('')
    pacientes.value = clientes.map((cliente) => ({
      id: cliente.id,
      aprendente: cliente.nomeAprendente,
      responsavel: cliente.nomeResponsavel
    }));
    console.log('Pacientes carregados:', pacientes.value);
  } catch (err) {
    console.error('Erro ao carregar pacientes:', err);
  }
}

async function loadContratos() {
  try {
    const clienteId = filtroPaciente.value;
    if (clienteId) {
      contratos.value = await contratoService.loadContratos(clienteId);
    } else {
      contratos.value = [];
    }
  } catch (err) {
    console.error('Erro ao carregar contratos:', err);
  }
}

async function loadMensalidades() {
  try {
    loadingMensalidades.value = true;
    mensalidadesPendentes.value = [];
    if (contratoSelecionado.value) {
      console.log('Loading mensalidades for contrato:', contratoSelecionado.value);
      const [mensalidades, contrato] = await Promise.all([
        contratoService.getMensalidadesByContrato(contratoSelecionado.value),
        supabase
          .from('tb_contrato')
          .select('data_criacao, duracao')
          .eq('id_contrato', contratoSelecionado.value)
          .single()
      ]);
      console.log('Mensalidades returned:', mensalidades);
      console.log('Duração do contrato:', contrato.data?.duracao);
      console.log('Contrato data_criacao:', contrato.data?.data_criacao);

      const dataInicio = contrato.data?.data_criacao ? new Date(contrato.data.data_criacao) : new Date();
      const duracao = contrato.data?.duracao || 12;
      if (!contrato.data?.data_criacao) {
        console.warn('Contrato sem data_criacao, usando data atual');
      }
      if (!contrato.data?.duracao) {
        console.warn('Contrato sem duracao, usando 12 meses');
      }

      // Process existing unpaid mensalidades
      const existingPendentes = mensalidades
        .filter(m => m.status_pagamento !== 'Pago')
        .map(m => {
          const mesDate = new Date(m.mes_referencia);
          const cycleNumber = Math.max(
            1,
            (mesDate.getFullYear() - dataInicio.getFullYear()) * 12 +
            mesDate.getMonth() - dataInicio.getMonth() + 1
          );
          if (cycleNumber > duracao) return null; // Exclude cycles beyond duracao
          return {
            ...m,
            mes_referencia_cycle: cycleNumber,
            mes_referencia_display: `Mensalidade ${cycleNumber} (${mesDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`,
            mes_referencia_raw: m.mes_referencia
          };
        })
        .filter(m => m !== null);

      // Generate all billing cycles within duracao
      const meses = [];
      for (let i = 0; i < duracao; i++) {
        const date = new Date(dataInicio.getFullYear(), dataInicio.getMonth() + i, 1);
        const mesReferenciaRaw = date.toISOString().slice(0, 10);
        const cycleNumber = i + 1;
        // Only include if not already paid
        if (!mensalidades.some(m => m.mes_referencia === mesReferenciaRaw && m.status_pagamento === 'Pago')) {
          meses.push({
            id_mensalidade: null,
            id_contrato: contratoSelecionado.value,
            mes_referencia_cycle: cycleNumber,
            mes_referencia_display: `Mensalidade ${cycleNumber} (${date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })})`,
            mes_referencia_raw: mesReferenciaRaw,
            status_pagamento: 'Pendente'
          });
        }
      }

      // Combine and deduplicate by cycle number
      mensalidadesPendentes.value = [...existingPendentes, ...meses]
        .sort((a, b) => a.mes_referencia_cycle - b.mes_referencia_cycle)
        .filter((item, index, self) =>
          index === self.findIndex(t => t.mes_referencia_cycle === item.mes_referencia_cycle)
        );
      console.log('Mensalidades pendentes:', mensalidadesPendentes.value);
    }
  } catch (err) {
    console.error('Erro ao carregar mensalidades:', err);
    mensalidadesPendentes.value = [];
  } finally {
    loadingMensalidades.value = false;
  }
}

function iniciarEdicao(atendimento: any) {
  atendimento.originalData = { ...atendimento };
  atendimento.isEditing = true;
}

function cancelarEdicao(atendimento: any) {
  Object.assign(atendimento, atendimento.originalData);
  atendimento.isEditing = false;
  delete atendimento.originalData;
}

function validarNovosAnexos(atendimento: any) {
  atendimento.uploadError = '';
  if (atendimento.novosAnexos && atendimento.novosAnexos.length > 0) {
    for (const file of atendimento.novosAnexos) {
      if (!file.type.match(/^image\/.+$|^application\/pdf$/)) {
        atendimento.uploadError = 'Apenas imagens ou PDFs são permitidos';
        atendimento.novosAnexos = [];
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        atendimento.uploadError = 'O arquivo deve ter menos de 25MB';
        atendimento.novosAnexos = [];
        return;
      }
    }
    atendimento.anexosTemporarios.push(
      ...atendimento.novosAnexos.map((file: File) => ({ url: '', name: file.name }))
    );
  }
}

function removerAnexoTemporario(atendimento: any, index: number) {
  const anexo = atendimento.anexosTemporarios[index];
  if (anexo.url) {
    atendimento.anexosParaExcluir.push(anexo.url);
  }
  atendimento.anexosTemporarios.splice(index, 1);
  atendimento.novosAnexos = atendimento.novosAnexos.filter(
    (file: File) => file.name !== anexo.name
  );
}

async function downloadAnexo(anexo: string) {
  try {
    const caminho = anexo.split('/storage/v1/object/public/sessoes/')[1];
    const data = await supabase.storage
      .from('sessoes')
      .download(caminho);
    const url = window.URL.createObjectURL(data.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = anexo.split('/').pop() || 'Arquivo';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Erro ao baixar anexo:', err);
    alert('Erro ao baixar anexo: ' + (err as Error).message);
  }
}

async function salvarEdicao(atendimento: any) {
  try {
    const novosUrls: string[] = [];
    if (atendimento.novosAnexos && atendimento.novosAnexos.length > 0) {
      for (const file of atendimento.novosAnexos) {
        const url = await uploadService.uploadArquivo(
          'sessoes',
          `sessao/${atendimento.id_agendamento || 'temp'}`,
          file
        );
        novosUrls.push(url);
      }
    }

    atendimento.anexos = [
      ...atendimento.anexosTemporarios
        .filter((anexo: any) => anexo.url && !atendimento.anexosParaExcluir.includes(anexo.url))
        .map((anexo: any) => anexo.url),
      ...novosUrls
    ];

    const sessaoData = {
      id: atendimento.id,
      pre_sessao: atendimento.preSessao,
      queixas: atendimento.queixas,
      evolucao: atendimento.evolucaoAtual,
      habilidades_trabalhadas: atendimento.habilidadesTrabalhadas,
      futuras_acoes: atendimento.futurasAcoes,
      resumo: atendimento.resumo,
      fotos: atendimento.anexos.length > 0 ? atendimento.anexos.join(',') : null,
      id_agendamento: atendimento.id_agendamento,
      id_contrato: atendimento.id_contrato
    };

    await sessaoService.updateSessao(atendimento.id, sessaoData);

    atendimento.anexosTemporarios = atendimento.anexos.map((url: string) => ({
      url,
      name: url.split('/').pop()
    }));
    atendimento.anexosParaExcluir = [];
    atendimento.novosAnexos = [];
    atendimento.uploadError = '';
    atendimento.isEditing = false;
    delete atendimento.originalData;

    console.log('Sessão atualizada com sucesso:', sessaoData);
    alert('Alterações salvas com sucesso!');
  } catch (err) {
    console.error('Erro ao salvar edição:', err);
    alert('Erro ao salvar alterações: ' + (err as Error).message);
  }
}

function abrirModalPagamentoIndividual(atendimento: any) {
  atendimentoSelecionado.value = atendimento;
  valorPago.value = atendimento.valor_pagamento || null;
  formaPagamento.value = atendimento.forma_pagamento || null;
  comprovanteImagem.value = null;
  modalPagamentoIndividual.value = true;
}

function cancelarPagamentoIndividual() {
  modalPagamentoIndividual.value = false;
  atendimentoSelecionado.value = null;
  valorPago.value = null;
  formaPagamento.value = null;
  comprovanteImagem.value = null;
  uploadError.value = null;
  uploadSuccess.value = false;
}

async function confirmarPagamentoIndividual() {
  if (!atendimentoSelecionado.value || !valorPago.value || !formaPagamento.value) return;

  try {
    uploading.value = true;
    const pagamentoData = {
      id_sessao: [atendimentoSelecionado.value.id],
      valor: valorPago.value,
      forma_pagamento: formaPagamento.value,
      comprovante: comprovanteImagem.value?.[0]
    };

    if (atendimentoSelecionado.value.status === 'Pago') {
      await pagamentoService.updatePagamento(atendimentoSelecionado.value.id_pagamento, pagamentoData);
    } else {
      const pagamento = await pagamentoService.createPagamento(pagamentoData);
      atendimentoSelecionado.value.id_pagamento = pagamento.id_pagamento;
      atendimentoSelecionado.value.status = 'Pago';
    }

    atendimentoSelecionado.value.valor_pagamento = valorPago.value;
    atendimentoSelecionado.value.forma_pagamento = formaPagamento.value;
    atendimentoSelecionado.value.comprovante_url = comprovanteImagem.value?.[0]
      ? await uploadService.uploadArquivo(
        'pagamentos',
        `comprovante/${atendimentoSelecionado.value.id}`,
        comprovanteImagem.value[0]
      )
      : atendimentoSelecionado.value.comprovante_url;

    uploadSuccess.value = true;
    setTimeout(() => {
      cancelarPagamentoIndividual();
    }, 1000);
  } catch (err) {
    console.error('Erro ao salvar pagamento:', err);
    uploadError.value = 'Erro ao salvar pagamento: ' + (err as Error).message;
  } finally {
    uploading.value = false;
  }
}

function abrirModalPagamentoLote() {
  modalPagamentoLote.value = true;
  atendimentosSelecionados.value = [];
  valorPago.value = null;
  formaPagamento.value = null;
  comprovanteImagem.value = null;
  uploadError.value = null;
  uploadSuccess.value = false;
}

function cancelarPagamentoLote() {
  modalPagamentoLote.value = false;
  atendimentosSelecionados.value = [];
  valorPago.value = null;
  formaPagamento.value = null;
  comprovanteImagem.value = null;
  uploadError.value = null;
  uploadSuccess.value = false;
}

async function confirmarPagamentoLote() {
  try {
    uploading.value = true;
    if (!atendimentosSelecionados.value.length || !valorPago.value || !formaPagamento.value) return;

    const pagamentoData = {
      id_sessao: atendimentosSelecionados.value.map(a => a.id),
      valor: valorPago.value,
      forma_pagamento: formaPagamento.value,
      comprovante: comprovanteImagem.value?.[0]
    };
    const pagamento = await pagamentoService.createPagamento(pagamentoData);
    atendimentosSelecionados.value.forEach(atendimento => {
      atendimento.status = 'Pago';
      atendimento.id_pagamento = pagamento.id_pagamento;
      atendimento.valor_pagamento = valorPago.value / atendimentosSelecionados.value.length;
      atendimento.forma_pagamento = formaPagamento.value;
      atendimento.comprovante_url = pagamento.comprovante_url;
    });

    uploadSuccess.value = true;
    setTimeout(() => {
      cancelarPagamentoLote();
    }, 1000);
  } catch (err) {
    console.error('Erro ao salvar pagamento em lote:', err);
    uploadError.value = 'Erro ao salvar pagamento: ' + (err as Error).message;
  } finally {
    uploading.value = false;
  }
}

function abrirModalMensalidade() {
  modalMensalidade.value = true;
  contratoSelecionado.value = null;
  mesReferencia.value = null;
  mensalidadesPendentes.value = [];
  valorPago.value = null;
  formaPagamento.value = null;
  comprovanteImagem.value = null;
  uploadError.value = null;
  uploadSuccess.value = false;
}

function cancelarMensalidade() {
  modalMensalidade.value = false;
  contratoSelecionado.value = null;
  mesReferencia.value = null;
  mensalidadesPendentes.value = [];
  valorPago.value = null;
  formaPagamento.value = null;
  comprovanteImagem.value = null;
  uploadError.value = null;
  uploadSuccess.value = false;
}

async function confirmarMensalidade() {
  try {
    uploading.value = true;
    if (!contratoSelecionado.value || !mesReferencia.value || !valorPago.value || !formaPagamento.value) return;

    const selectedMensalidade = mensalidadesPendentes.value.find(
      m => m.mes_referencia_cycle === mesReferencia.value
    );
    if (!selectedMensalidade) throw new Error('Mês de referência inválido');

    if (!selectedMensalidade.mes_referencia_raw.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error('Formato de mês de referência inválido');
    }

    const mensalidadeData = {
      id_contrato: contratoSelecionado.value,
      mes_referencia: selectedMensalidade.mes_referencia_raw,
      valor: valorPago.value,
      forma_pagamento: formaPagamento.value,
      comprovante: comprovanteImagem.value?.[0]
    };
    const mensalidade = await contratoService.pagarMensalidadeContrato(mensalidadeData);

    const mes = new Date(selectedMensalidade.mes_referencia_raw).toISOString().slice(0, 7);
    atendimentos.value.forEach(atendimento => {
      if (atendimento.id_contrato === contratoSelecionado.value && atendimento.data.startsWith(mes)) {
        atendimento.status = 'Pago';
        atendimento.id_mensalidade = mensalidade.id_mensalidade;
        atendimento.valor_pagamento = valorPago.value;
        atendimento.forma_pagamento = formaPagamento.value;
        atendimento.comprovante_url = mensalidade.comprovante_url;
      }
    });

    uploadSuccess.value = true;
    setTimeout(() => {
      cancelarMensalidade();
    }, 1000);
  } catch (err) {
    console.error('Erro ao salvar mensalidade:', err);
    uploadError.value = 'Erro ao salvar mensalidade: ' + (err as Error).message;
  } finally {
    uploading.value = false;
  }
}

const atendimentosPendentes = computed(() => {
  return atendimentos.value.filter(a => a.status === 'Pendente' && !a.id_contrato);
});

watch(searchQuery, async (newValue) => {
  if (!newValue) {
    await loadPacientes();
    return;
  }

  isLoading.value = true;
  try {
    const resultados = await aprendenteService.buscarClientesPorNome(newValue);
    pacientes.value = resultados.map((cliente) => ({
      id: cliente.id,
      displayName: cliente.displayName || cliente.nome || cliente.responsavel || 'N/A',
      aprendente: cliente.nome,
      responsavel: cliente.responsavel
    }));
    console.log('Resultados da busca:', pacientes.value);
  } catch (err) {
    console.error('Erro na busca:', err);
  } finally {
    isLoading.value = false;
  }
}, { debounce: 300 });

watch(filtroPaciente, async (newValue) => {
  console.log('filtroPaciente alterado:', newValue, typeof newValue);
  await loadContratos();
});

const atendimentosAgrupados = computed(() => {
  const agrupados: Record<string, typeof atendimentos.value> = {};

  const filtroId = typeof filtroPaciente.value === 'object' && filtroPaciente.value
    ? filtroPaciente.value.id
    : filtroPaciente.value;

  const lista = filtroId
    ? atendimentos.value.filter(a => {
      const match = String(a.clienteId) === String(filtroId) ||
        String(a.id_aprendente) === String(filtroId) ||
        String(a.responsavel_id) === String(filtroId);
      console.log(`Atendimento ${a.id}: clienteId=${a.clienteId}, id_aprendente=${a.id_aprendente}, responsavel_id=${a.responsavel_id}, filtro=${filtroId}, match=${match}`);
      return match;
    })
    : atendimentos.value;

  lista.forEach(atendimento => {
    if (!agrupados[atendimento.data]) {
      agrupados[atendimento.data] = [];
    }
    agrupados[atendimento.data].push(atendimento);
  });

  console.log('Filtro paciente:', filtroPaciente.value);
  console.log('Filtro ID usado:', filtroId);
  console.log('Lista filtrada:', lista);
  return agrupados;
});

function formatarData(dataStr: string): string {
  if (!dataStr) return '';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

const menus = [
  {
    field: 'preSessao',
    label: 'Pré-sessão',
    component: 'v-textarea',
    props: { label: 'Pré-sessão' }
  },
  {
    field: 'queixas',
    label: 'Queixas',
    component: 'v-textarea',
    props: { label: 'Queixas' }
  },
  {
    field: 'evolucaoAtual',
    label: 'Evolução Atual',
    component: 'v-textarea',
    props: { label: 'Evolução Atual' }
  },
  {
    field: 'habilidadesTrabalhadas',
    label: 'Habilidades Trabalhadas',
    component: 'v-textarea',
    props: { label: 'Habilidades Trabalhadas' }
  },
  {
    field: 'futurasAcoes',
    label: 'Futuras Ações',
    component: 'v-textarea',
    props: { label: 'Futuras Ações' }
  },
  {
    field: 'resumo',
    label: 'Resumo da Sessão',
    component: 'v-textarea',
    props: { label: 'Resumo da Sessão' }
  }
];

onMounted(() => {
  loadSessoes();
  loadPacientes();
});
</script>

<style scoped>
.details-section {
  width: 100%;
  padding: 24px;
  background-color: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.v-list-item {
  border-bottom: 1px solid #f0f0f0;
}

.sessoes {
  background-color: #f9f9f9 !important;
}
</style>
