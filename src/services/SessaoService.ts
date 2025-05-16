import supabase from '@/config/supabase';
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage';

interface Sessao {
  id?: string;
  pre_sessao?: string;
  queixas?: string;
  evolucao?: string;
  habilidades_trabalhadas?: string;
  futuras_acoes?: string;
  resumo?: string;
  fotos?: string;
  id_agendamento?: number;
}

export class SessaoService {
  private showError = useShowErrorMessage().showError;

  async createSessao(sessao: Sessao): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('tb_sessao')
        .insert([sessao])
        .select('id')
        .single();
      if (error) throw error;
      return data.id;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao criar sessão');
      throw err;
    }
  }

  async getAllSessoes(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('tb_sessao')
        .select(`
          id,
          pre_sessao,
          queixas,
          evolucao,
          habilidades_trabalhadas,
          futuras_acoes,
          resumo,
          fotos,
          id_agendamento,
          tb_agendamento (
            data_agendamento,
            horario_inicio,
            duracao,
            id_aprendente,
            responsavel_id
          )
        `);
      if (error) throw error;

      console.log('Sessões brutas:', data);
      return (data || []).sort((a, b) => {
        const dateA = new Date(a.tb_agendamento?.data_agendamento || '9999-12-31');
        const dateB = new Date(b.tb_agendamento?.data_agendamento || '9999-12-31');
        return dateB.getTime() - dateA.getTime();
      });
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar sessões');
      return [];
    }
  }

  async updateSessao(id: string, sessao: Partial<Sessao>): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_sessao')
        .update(sessao)
        .eq('id', id);
      
      if (error) throw error;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao atualizar sessão');
      throw err;
    }
  }

  async getSessaoByAgendamentoId(idAgendamento: number): Promise<Sessao | null> {
    try {
      const { data, error } = await supabase
        .from('tb_sessao')
        .select('*')
        .eq('id_agendamento', idAgendamento)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err: any) {
      // if (err.code !== 'PGRST116') { // Ignore "No rows found" error
      //   this.showError(err.message || 'Erro ao buscar sessão');
      // }
      return null;
    }
  }
}