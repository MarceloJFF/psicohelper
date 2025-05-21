// src/services/ContratoService.ts
import supabase from '@/config/supabase'
import Contrato from '@/models/Contrato'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'
import { useStoreProfissional } from '@/stores/storeProfissional'
import { DiasAtendimentosContratoService } from '@/services/DiasAtendimentosContratoService.ts'
import { UploadService } from '@/services/UploadService'

export class ContratoService {
  private showError = useShowErrorMessage().showError
  private profissionalStore = useStoreProfissional()
  private diasAtendimentoContratoService = new DiasAtendimentosContratoService();
  private uploadService = new UploadService()

  async loadContratos(idAprendente: string): Promise<Contrato[]> {
    try {
      const { data, error } = await supabase
        .from('tb_contrato')
        .select('*')
        .eq('id_aprendente', idAprendente)

      if (error) throw error
      return data as Contrato[]
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar contratos')
      return []
    }
  }

  async loadContratoPorAprendente(idAprendente: string): Promise<Contrato[] | null> {
    try {
      const { data, error } = await supabase
        .from('tb_contrato')
        .select('*')
        .eq('id_aprendente', idAprendente)
        .eq('cancelado','FALSE')
        .select()

      if (error) throw error
      return data as Contrato[]
    } catch (err: any) {
      this.showError(err.message || 'Erro ao buscar contrato por aprendente')
      return null
    }
  }

  async adicionarAprendenteAoContrato(idContrato: string, idAprendente: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_contrato')
        .update({ id_aprendente: idAprendente })
        .eq('id_contrato', idContrato)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao associar aprendente ao contrato')
    }
  }
  private async verificarContratosAtivosAprendente(idAprendente: string): Promise<Contrato[]> {
    try {
      const { data, error } = await supabase
        .from('tb_contrato')
        .select('id')
        .eq('id_aprendente', idAprendente)
        .eq('cadastrado','TRUE')
        .select()
      if (error) throw error
      return data as Contrato[]
    } catch (err: any) {
      this.showError(err.message || 'Erro ao buscar contrato por aprendente')
      return null
    }
  }
  private async addContrato(
    contrato: Contrato,
    idResponsavel: string,
    idAprendente: string,
  ): Promise<string | undefined> {
    try {
      contrato.idProfissional = this.profissionalStore.profissionalDetails?.id || ''
      const searchedContratosAprendente =await this.verificarContratosAtivosAprendente(idAprendente);
      if(searchedContratosAprendente.length>0){
        this.showError( 'Existe mais de 1 contrato ativo para esse aprendente')
        return;
      }
      const {data, error } = await supabase
        .from('tb_contrato')
        .insert({
          valor_mensal: contrato.valorMensal,
          duracao: contrato.duracao,
          vencimento: contrato.vencimento,
          cadastrado: true,
          descricao_servico: contrato.descricao,
          id_responsavel: idResponsavel,
          id_profissional: contrato.idProfissional,
          id_aprendente: idAprendente || null,
          cancelado: false,
        })
        .select()
      if (error) throw error
      // add dias Atendimento Contrato
      contrato.idContrato = data?.[0]?.id_contrato
      await this.addDiasAtendimentoNoContrato(contrato);
      return data?.[0]?.id_contrato
    } catch (err: any) {
      this.showError(err.message || 'Erro ao adicionar contrato')
    }
  }

  private async  addDiasAtendimentoNoContrato(contrato:Contrato) {
    await this.diasAtendimentoContratoService.addDiasAtendimento(contrato.diasAtendimento, contrato.idContrato);
  }

  async inativarContrato(idContrato: string, motivo: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_contrato')
        .update({
          cancelado: true,
          motivo_cancelamento: motivo,
          cadastrado:false,
          data_cancelamento: new Date().toISOString(),
        })
        .eq('id_contrato', idContrato)

      if (error) throw error
      else alert("Cancelado com sucesso")
    } catch (err: any) {
      this.showError(err.message || 'Erro ao cancelar contrato')
    }
  }


  async pagarMensalidadeContrato(mensalidade: {
    id_contrato: string
    mes_referencia: string
    valor: number
    forma_pagamento: string
    comprovante?: File
  }) {
    let comprovante_url = null
    if (mensalidade.comprovante) {
      comprovante_url = await this.uploadService.uploadArquivo(
        'pagamentos',
        `mensalidade/${mensalidade.id_contrato}/${mensalidade.mes_referencia}`,
        mensalidade.comprovante,
      )
    }

    const { data: existingMensalidade, error: checkError } = await supabase
      .from('tb_mensalidade')
      .select('id_mensalidade, status_pagamento')
      .eq('id_contrato', mensalidade.id_contrato)
      .eq('mes_referencia', mensalidade.mes_referencia)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') throw checkError

    let mensalidadeData
    if (existingMensalidade) {
      if (existingMensalidade.status_pagamento === 'Pago') {
        throw new Error('Mensalidade já está paga')
      }
      const { data, error } = await supabase
        .from('tb_mensalidade')
        .update({
          valor: mensalidade.valor,
          forma_pagamento: mensalidade.forma_pagamento,
          comprovante_url,
          status_pagamento: 'Pago',
          data_pagamento: new Date().toISOString(),
        })
        .eq('id_mensalidade', existingMensalidade.id_mensalidade)
        .select()
        .single()
      if (error) throw error
      mensalidadeData = data
    } else {
      const { data, error } = await supabase
        .from('tb_mensalidade')
        .insert({
          id_contrato: mensalidade.id_contrato,
          mes_referencia: mensalidade.mes_referencia,
          valor: mensalidade.valor,
          forma_pagamento: mensalidade.forma_pagamento,
          comprovante_url,
          status_pagamento: 'Pago',
          data_pagamento: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) throw error
      mensalidadeData = data
    }

    const { data: pagamentoData, error: pagamentoError } = await supabase
      .from('tb_pagamento')
      .upsert({
        id_mensalidade: mensalidadeData.id_mensalidade,
        valor: mensalidade.valor,
        forma_pagamento: mensalidade.forma_pagamento,
        comprovante_url,
        data_pagamento: new Date().toISOString(),
      })
      .select()
      .single()

    if (pagamentoError) throw pagamentoError

    return mensalidadeData
  }
  async getMensalidadesByContrato(id_contrato: string) {
    const { data, error } = await supabase
      .from('tb_mensalidade')
      .select('*')
      .eq('id_contrato', id_contrato)
    if (error) throw error
    return data
  }
  
}
