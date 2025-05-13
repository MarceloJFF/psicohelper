import supabase from '@/config/supabase'
import Agendamento from '@/models/Agendamento'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'

export class AgendamentoService {
  private showError = useShowErrorMessage().showError

  async createAgendamento(agendamento: Agendamento): Promise<string | undefined> {

    try {
      const { data, error } = await supabase
        .from('tb_agendamento')
        .insert([
          {
            titulo: agendamento.titulo,
            data_agendamento: agendamento.dataAgendamento.toLocaleString(),
            horario_inicio: agendamento.horarioInicio,
            duracao: agendamento.duracao,
            responsavel_id: agendamento.responsavel_id,
            id_aprendente: agendamento.idDependente,
            id_profissional: agendamento.idProfissional,
            tipo_atendimento: agendamento.tipoAtendimento,
            valor_atendimento: agendamento.valorAtendimento,
            observacoes: agendamento.observacoes,
          },
        ])
        .select()

      if (error) throw error
      return data[0].id
    } catch (err: any) {
      this.showError(err.message || 'Erro ao criar agendamento')
    }
  }

  async updateAgendamento(agendamento: Agendamento): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_agendamento')
        .update({
          titulo: agendamento.titulo,
          data_agendamento: agendamento.dataAgendamento,
          horario_inicio: agendamento.horarioInicio,
          duracao: agendamento.duracao,
          cliente_id: agendamento.clienteId,
          id_dependente: agendamento.idDependente,
          id_profissional: agendamento.idProfissional,
          tipo_atendimento: agendamento.tipoAtendimento,
          valor_atendimento: agendamento.valorAtendimento,
          observacoes: agendamento.observacoes,
        })
        .eq('id', agendamento.id)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao atualizar agendamento')
    }
  }

  async deleteAgendamento(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('tb_agendamento').delete().eq('id_agendamento', id)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao remover agendamento')
    }
  }

  async getAgendamentoById(id: string): Promise<Agendamento | null> {
    try {
      const { data, error } = await supabase
        .from('tb_agendamento')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Agendamento
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar o agendamento')
      return null
    }
  }

  async getAllAgendamentos(): Promise<Agendamento[] | null> {
    try {
      const { data: dataContrato, error: errorContrato } = await supabase
        .from('tb_contrato')
        .select('*')
        .eq('cancelado', false) //.eq('vencido', false)
      const { data: agendamentos, error: errorAgendamento } = await supabase
        .from('tb_agendamento')
        .select('*')
      console.log('[services] getAllAgendamentos', agendamentos)

      if (errorContrato || errorAgendamento)
        throw new Error(
          'Erro ao carregar os agendamentos' + { cause: errorContrato || errorAgendamento },
        )
      return agendamentos as Agendamento[]
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar os agendamentos')
      return null
    }
  }
}
