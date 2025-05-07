// src/services/DiasAtendimentoService.ts
import supabase from '@/config/supabase'
import DiasAtendimentoContrato from '@/models/DiasAtendimentoContrato'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'

export class DiasAtendimentoService {
  private showError = useShowErrorMessage().showError

  async loadDiasAtendimento(contratoId: string): Promise<DiasAtendimentoContrato[]> {
    try {
      const { data, error } = await supabase
        .from('tb_dias_atendimento')
        .select('*')
        .eq('contrato_id', contratoId)

      if (error) throw error
      return data as DiasAtendimentoContrato[]
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar dias de atendimento')
      return []
    }
  }

  async addDiasAtendimento(dias: DiasAtendimentoContrato[], contratoId: string): Promise<void> {
    try {
      const payload = dias.map(d => ({
        dia: d.dia,
        inicio: d.inicio,
        fim: d.fim,
        contrato_id: contratoId
      }))
      const { error } = await supabase
        .from('tb_dias_atendimento')
        .insert(payload)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao adicionar dias de atendimento')
    }
  }

  async deleteDiasAtendimentoByContrato(contratoId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_dias_atendimento')
        .delete()
        .eq('contrato_id', contratoId)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao excluir dias de atendimento')
    }
  }

  async updateDiaAtendimento(diaAtendimento: DiasAtendimentoContrato): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_dias_atendimento')
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
