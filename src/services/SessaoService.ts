import supabase from "@/config/supabase";

export class SessaoService {
  async getAllSessoes() {
    const { data, error } = await supabase
      .from('tb_sessao')
      .select('*, tb_agendamento(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar sessões:', error);
      throw error;
    }
    return data;
  }

  async createSessao(sessao: {
    pre_sessao: string;
    queixas: string;
    evolucao: string;
    habilidades_trabalhadas: string;
    futuras_acoes: string;
    resumo: string;
    fotos: string | null;
    id_agendamento: string | number | null;
  }) {
    const { data: agendamento, error: agendamentoError } = await supabase
      .from('tb_agendamento')
      .select('id, id_aprendente')
      .eq('id_agendamento', sessao.id_agendamento)
      .single();

    if (agendamentoError || !agendamento) {
      console.error('id_agendamento inválido:', sessao.id_agendamento, agendamentoError);
      throw new Error('Agendamento não encontrado');
    }

    const { data: aprendente, error: aprendenteError } = await supabase
      .from('tb_aprendente')
      .select('id')
      .eq('id', agendamento.id_aprendente)
      .single();

    if (aprendenteError || !aprendente) {
      console.error('id_aprendente inválido:', agendamento.id_aprendente, aprendenteError);
      throw new Error('Cliente não encontrado na tabela tb_aprendente');
    }

    const { data, error } = await supabase
      .from('tb_sessao')
      .insert([sessao])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar sessão:', error);
      throw error;
    }

    console.log('Sessão criada:', data);
    return data;
  }

  async updateSessao(id: string, sessao: {
    pre_sessao: string;
    queixas: string;
    evolucao: string;
    habilidades_trabalhadas: string;
    futuras_acoes: string;
    resumo: string;
    fotos: string | null;
  }) {
    const { data, error } = await supabase
      .from('tb_sessao')
      .update(sessao)
      .eq('id_agendamento', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar sessão:', error);
      throw error;
    }

    console.log('Sessão atualizada:', data);
    return data;
  }
}