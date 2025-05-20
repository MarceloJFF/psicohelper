import supabase from '@/config/supabase';
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage';
import { useStoreProfissional } from '@/stores/storeProfissional.ts'

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

interface GetAllSessoesOptions {
  page?: number;
  pageSize?: number;
  clienteId?: string | null;
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

  // async getAllSessoes(): Promise<any[]> {
  //   try {
  //     const { data, error } = await supabase
  //       .from('tb_sessao')
  //       .select(`
  //         id,
  //         pre_sessao,
  //         queixas,
  //         evolucao,
  //         habilidades_trabalhadas,
  //         futuras_acoes,
  //         resumo,
  //         fotos,
  //         id_agendamento,
  //         tb_agendamento (
  //           data_agendamento,
  //           horario_inicio,
  //           duracao,
  //           id_aprendente,
  //           responsavel_id
  //         )
  //       `);
  //     if (error) throw error;

  //     console.log('Sessões brutas:', data);
  //     return (data || []).sort((a, b) => {
  //       const dateA = new Date(a.tb_agendamento?.data_agendamento || '9999-12-31');
  //       const dateB = new Date(b.tb_agendamento?.data_agendamento || '9999-12-31');
  //       return dateB.getTime() - dateA.getTime();
  //     });
  //   } catch (err: any) {
  //     this.showError(err.message || 'Erro ao carregar sessões');
  //     return [];
  //   }
  // }
  async getAllSessoes(options: GetAllSessoesOptions = {}) {
    const storeProfissional = useStoreProfissional();
    const { page = 1, pageSize = 10, clienteId = null } = options;
  
    try {
      // Primeiro, buscar os agendamentos do profissional
      const { data: agendamentos, error: errorAg } = await supabase
        .from('tb_agendamento')
        .select('*')
        .eq('id_profissional', storeProfissional.profissionalDetails?.id);
  
      if (errorAg) throw errorAg;
  
      const agendamentoIds = agendamentos.map(a => a.id_agendamento);
  
      // Construir a query base
      let query = supabase
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
            id_agendamento,
            data_agendamento,
            horario_inicio,
            duracao,
            id_aprendente,
            responsavel_id,
            id_profissional,
            id_contrato
          )
        `, { count: 'exact' })
        .in('id_agendamento', agendamentoIds);
  
      // Aplicar filtro por cliente se fornecido
      if (clienteId) {
        query = query.or(`id_aprendente.eq.${clienteId},responsavel_id.eq.${clienteId}`, { foreignTable: 'tb_agendamento' });
      }
  
      // Aplicar ordenação por data
      query = query.order('tb_agendamento(data_agendamento)', { ascending: false });
  
      // Aplicar paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
  
      const { data, error, count } = await query;
  
      if (error) throw error;
  
      // Mapear os dados para incluir id_contrato no nível raiz
      const mappedData = (data || []).map(session => ({
        ...session,
        id_contrato: session.tb_agendamento?.id_contrato || null
      }));
  
      console.log('Sessões carregadas:', mappedData.map(s => ({
        id: s.id,
        id_contrato: s.id_contrato,
        tipo: s.id_contrato ? 'Contrato' : 'Avulsa'
      })));
  
      return mappedData;
    } catch (err: any) {
      console.error('Erro ao buscar sessões:', err);
      this.showError(err.message || 'Erro ao carregar sessões');
      return [];
    }
  }

  async getSessaoById(id: string): Promise<Sessao | null> {
    try {
      const { data, error } = await supabase
        .from('tb_sessao')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao buscar sessão');
      return null;
    }
  }
  async updateSessao(id: string, sessao: Partial<Sessao>): Promise<void> {
    console.log("updateSessao:", id, sessao);

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
