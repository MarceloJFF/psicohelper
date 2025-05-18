// src/services/ContratoService.ts
import supabase from '@/config/supabase'
import Contrato from '@/models/Contrato'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'
import { useStoreProfissional } from '@/stores/storeProfissional'
import { DiasAtendimentosContratoService } from '@/services/DiasAtendimentosContratoService.ts'

export class ContratoService {
  private showError = useShowErrorMessage().showError
  private profissionalStore = useStoreProfissional()
  private diasAtendimentoContratoService = new DiasAtendimentosContratoService();

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






  async loadContratoPorAprendente(idAprendente: string): Promise<Contrato | null> {
    try {
      const { data, error } = await supabase
        .from('tb_contrato')
        .select('*')
        .eq('id_aprendente', idAprendente).select()

      if (error) throw error
      return data as Contrato
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
      return data as Contrato
    } catch (err: any) {
      this.showError(err.message || 'Erro ao buscar contrato por aprendente')
      return null
    }
  }

  async addContrato(contrato: Contrato, idResponsavel:string, idAprendente:string): Promise<string | undefined> {
    try {
      contrato.idProfissional = this.profissionalStore.profissionalDetails?.id || ''
      const searchedContratosAprendente =this.verificarContratosAtivosAprendente(idAprendente);
      if(searchedContratosAprendente != null){
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
          cancelado: false
          }
        ).select()

      // add dias Atendimento Contrato
      this.addDiasAtendimentoNoContrato(contrato);
      if (error) throw error
      return data?.[0]?.id_contrato;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao adicionar contrato')
    }
  }

  private addDiasAtendimentoNoContrato(contrato:Contrato){
    for(diaAtendimentoContrato of contrato.diasAtendimento){
      this.diasAtendimentoContratoService.addDiasAtendimento(diaAtendimentoContrato);
    }
  }

  async inativarContrato(idContrato: string, motivo: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_contrato')
        .update({
          cancelado: true,
          cadastrado:false,
          motivo_cancelamento: motivo
        })
        .eq('id_contrato', idContrato)

      if (error) throw error
      else alert("Cancelado com sucesso")
    } catch (err: any) {
      this.showError(err.message || 'Erro ao cancelar contrato')
    }
  }

}
