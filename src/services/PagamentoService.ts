import supabase from '@/config/supabase';

export interface Pagamento {
  id: string;
  created_at: string;
  forma_pagamento: string;
  comprovante_url: string | null;
  data_pagamento: string | null;
  valor: number;
  id_mensalidade: string | null;
  tb_pagamento_sessao?: { id: string; id_sessao: string }[];
}

export const PagamentoService = {
  async getPagamentos(): Promise<Pagamento[]> {
    const { data, error } = await supabase
      .from('tb_pagamento')
      .select(`
        *,
        tb_pagamento_sessao (id, id_sessao)
      `);
    if (error) throw error;
    return data || [];
  },

  async createPagamento(
    pagamento: Omit<Pagamento, 'id' | 'created_at'>,
    sessoes: string[] = []
  ): Promise<void> {
    const { data: pagamentoData, error: pagamentoError } = await supabase
      .from('tb_pagamento')
      .insert({
        forma_pagamento: pagamento.forma_pagamento,
        comprovante_url: pagamento.comprovante_url,
        data_pagamento: pagamento.data_pagamento,
        valor: pagamento.valor,
        id_mensalidade: pagamento.id_mensalidade,
      })
      .select('id')
      .single();
    if (pagamentoError) throw pagamentoError;

    if (sessoes.length > 0) {
      const sessoesData = sessoes.map((id_sessao) => ({
        id_pagamento: pagamentoData.id,
        id_sessao,
      }));
      const { error: sessaoError } = await supabase
        .from('tb_pagamento_sessao')
        .insert(sessoesData);
      if (sessaoError) throw sessaoError;
    }
  },

  async updatePagamento(
    id: string,
    pagamento: Partial<Pagamento>,
    sessoes: string[] = []
  ): Promise<void> {
    const { error: pagamentoError } = await supabase
      .from('tb_pagamento')
      .update({
        forma_pagamento: pagamento.forma_pagamento,
        comprovante_url: pagamento.comprovante_url,
        data_pagamento: pagamento.data_pagamento,
        valor: pagamento.valor,
        id_mensalidade: pagamento.id_mensalidade,
      })
      .eq('id', id);
    if (pagamentoError) throw pagamentoError;

    if (sessoes.length > 0) {
      await supabase.from('tb_pagamento_sessao').delete().eq('id_pagamento', id);
      const sessoesData = sessoes.map((id_sessao) => ({
        id_pagamento: id,
        id_sessao,
      }));
      const { error: sessaoError } = await supabase
        .from('tb_pagamento_sessao')
        .insert(sessoesData);
      if (sessaoError) throw sessaoError;
    }
  },

  async deletePagamento(id: string): Promise<void> {
    await supabase.from('tb_pagamento_sessao').delete().eq('id_pagamento', id);
    const { error } = await supabase.from('tb_pagamento').delete().eq('id', id);
    if (error) throw error;
  },
};