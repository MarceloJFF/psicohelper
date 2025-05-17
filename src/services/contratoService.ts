// src/services/ContratoService.ts
import supabase from '@/config/supabase'
import Contrato from '@/models/Contrato'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'
import { useStoreProfissional } from '@/stores/storeProfissional'
import { UploadService } from '@/services/UploadService'

export class ContratoService {
  private showError = useShowErrorMessage().showError
  private profissionalStore = useStoreProfissional()
  private uploadService = new UploadService()

  async loadContratos(idResponsavel: string): Promise<Contrato[]> {
    try {
      const { data, error } = await supabase
        .from('tb_contrato')
        .select('*')
        .eq('id_responsavel', idResponsavel)

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

  async addContrato(
    contrato: Contrato,
    idResponsavel: string,
    idAprendente: string,
  ): Promise<string | undefined> {
    try {
      contrato.idProfissional = this.profissionalStore.profissionalDetails?.id || ''
      console.log(contrato)
      const { data, error } = await supabase
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
      return data?.[0]?.id_contrato
    } catch (err: any) {
      this.showError(err.message || 'Erro ao adicionar contrato')
    }
  }

  async deleteContrato(idContrato: string, motivo: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_contrato')
        .update({
          cancelado: true,
          motivo_cancelamento: motivo,
        })
        .eq('id_contrato', idContrato)
      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao cancelar contrato')
    }
  }

  async pagarMensalidadeContrato(mensalidade: {
    id_contrato: string;
    mes_referencia: string;
    valor: number;
    forma_pagamento: string;
    comprovante?: File;
  }) {
    let comprovante_url = null;
    if (mensalidade.comprovante) {
      comprovante_url = await this.uploadService.uploadArquivo(
        'pagamentos',
        `mensalidade/${mensalidade.id_contrato}/${mensalidade.mes_referencia}`,
        mensalidade.comprovante
      );
    }

    const { data, error } = await supabase
      .from('tb_mensalidades')
      .insert({
        id_contrato: mensalidade.id_contrato,
        mes_referencia: mensalidade.mes_referencia,
        valor: mensalidade.valor,
        status_pagamento: 'Pago',
        comprovante_url,
        data_pagamento: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Criar registro em tb_pagamentos
    await supabase
      .from('tb_pagamentos')
      .insert({
        id_mensalidade: data.id_mensalidade,
        valor: mensalidade.valor,
        forma_pagamento: mensalidade.forma_pagamento,
        comprovante_url,
        data_pagamento: new Date().toISOString()
      });

    return data;
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
