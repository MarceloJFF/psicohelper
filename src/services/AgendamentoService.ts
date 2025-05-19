import supabase from '@/config/supabase';
import Agendamento from '@/models/Agendamento';
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage';
import { useStoreProfissional } from '@/stores/storeProfissional';

export class AgendamentoService {
  private showError = useShowErrorMessage().showError;

  async createAgendamento(agendamento: Agendamento): Promise<string | undefined> {
    const storeProfissional = useStoreProfissional();
    console.log('[Service] Evento a ser salvo:', agendamento);

    try {
      const { data, error } = await supabase
        .from('tb_agendamento')
        .insert([
          {
            titulo: agendamento.titulo,
            data_agendamento: agendamento.dataAgendamento, // Enviar como YYYY-MM-DD
            horario_inicio: agendamento.horarioInicio,
            duracao: agendamento.duracao,
            responsavel_id: agendamento.responsavel_id,
            id_aprendente: agendamento.idDependente,
            id_profissional: agendamento.idProfissional,
            tipo_atendimento: agendamento.tipoAtendimento,
            valor_atendimento: agendamento.valorAtendimento,
            observacoes: agendamento.observacoes,
            id_contrato: agendamento.idContrato,
            color: agendamento.color,
          },
        ])
        .select();

      if (error) throw error;
      return data[0].id_agendamento; // Ajustado para retornar id_agendamento
    } catch (err: any) {
      this.showError(err.message || 'Erro ao criar agendamento');
      return undefined;
    }
  }

  async updateAgendamento(agendamento: Agendamento): Promise<void> {
    const storeProfissional = useStoreProfissional();

    try {
      const { error } = await supabase
        .from('tb_agendamento')
        .update({
          titulo: agendamento.titulo,
          data_agendamento: agendamento.dataAgendamento, // Enviar como YYYY-MM-DD
          horario_inicio: agendamento.horarioInicio,
          duracao: agendamento.duracao,
          responsavel_id: agendamento.idResponsavel,
          id_aprendente: agendamento.idDependente,
          id_profissional: agendamento.idProfissional,
          tipo_atendimento: agendamento.tipoAtendimento,
          valor_atendimento: agendamento.valorAtendimento,
          observacoes: agendamento.observacoes,
          id_contrato: agendamento.idContrato,
          color: agendamento.color,
        })
        .eq('id_profissional', storeProfissional.profissionalDetails?.id)
        .eq('id_agendamento', agendamento.id);

      if (error) throw error;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao atualizar agendamento');
    }
  }

  async deleteAgendamento(id: string): Promise<void> {
    const storeProfissional = useStoreProfissional();

    try {
      const { error } = await supabase
        .from('tb_agendamento')
        .delete()
        .eq('id_agendamento', id)
        .eq('id_profissional', storeProfissional.profissionalDetails?.id);
      if (error) throw error;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao remover agendamento');
    }
  }

  async getAgendamentoById(id: string): Promise<Agendamento | null> {
    const storeProfissional = useStoreProfissional();

    try {
      const { data, error } = await supabase
        .from('tb_agendamento')
        .select('*')
        .eq('id', id)
        .eq('id_profissional', storeProfissional.profissionalDetails?.id)
        .single();

      if (error) throw error;
      return data as Agendamento;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar o agendamento');
      return null;
    }
  }

  async getAllAgendamentos(): Promise<Agendamento[] | null> {
    const storeProfissional = useStoreProfissional();
    try {
      const { data: agendamentos, error: errorAgendamento } = await supabase
        .from('tb_agendamento')
        .select('*')
        .eq('id_profissional', storeProfissional.profissionalDetails?.id);
      if (errorAgendamento)
        throw new Error('Erro ao carregar os agendamentos' + { errorAgendamento });
      return agendamentos as Agendamento[];
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar os agendamentos');
      return null;
    }
  }
}
