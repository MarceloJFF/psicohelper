// src/services/DiasAtendimentoService.ts
import supabase from '@/config/supabase'
import DiasAtendimentoContrato from '@/models/DiasAtendimentoContrato'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'

export class DiasAtendimentosContratoService {
  private showError = useShowErrorMessage().showError

  async loadDiasAtendimento(contratoId: string): Promise<DiasAtendimentoContrato[]> {
    try {
      const { data, error } = await supabase
        .from('tb_dias_atendimento_contrato')
        .select('*')
        .eq('contrato_id', contratoId)

      if (error) throw error
      return data as DiasAtendimentoContrato[]
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar dias de atendimento')
      return []
    }
  }

  async addDiasAtendimento(dias:any, contratoId:string): Promise<void> {
 
    try {
      const payload = dias.map(d => ({
        dia: d.dia,
        inicio: d.inicio,
        fim: d.fim,
        contrato_id: contratoId
      }))
      const {data,error } = await supabase
        .from('tb_dias_atendimento_contrato')
        .insert(payload).select()


      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao adicionar dias de atendimento')
    }
  }

  async deleteDiasAtendimentoByContrato(contratoId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_dias_atendimento_contrato')
        .delete()
        .eq('contrato_id', contratoId)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao excluir dias de atendimento')
    }
  }

  async updateDiaAtendimento(diaAtendimento:any): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_dias_atendimento_contrato')
        .update({
          dia: diaAtendimento.dia,
          inicio: diaAtendimento.inicio,
          fim: diaAtendimento.fim
        })
        .eq('id', diaAtendimento.id)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao atualizar dia de atendimento')
    }
  }
}
