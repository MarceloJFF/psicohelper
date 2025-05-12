import supabase from '@/config/supabase'
import Agendamento from '@/models/Agendamento'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'

export class AgendamentoService {
  private showError = useShowErrorMessage().showError

  async createAgendamento(agendamento: Agendamento): Promise<string | undefined> {
    try {
      const { data, error } = await supabase
        .from('tb_agendamento')
        .insert([{
          titulo: agendamento.titulo,
          data_agendamento: agendamento.dataAgendamento,
          horario_inicio: agendamento.horarioInicio,
          duracao: agendamento.duracao,
          cliente_id: agendamento.clienteId,
          id_dependente: agendamento.idDependente,
          id_profissional: agendamento.idProfissional,
          tipo_atendimento: agendamento.tipoAtendimento,
          valor_atendimento: agendamento.valorAtendimento,
          observacoes: agendamento.observacoes
        }])
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
          observacoes: agendamento.observacoes
        })
        .eq('id', agendamento.id)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao atualizar agendamento')
    }
  }

  async deleteAgendamento(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_agendamento')
        .delete()
        .eq('id', id)

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
} 