import supabase from '@/config/supabase';

export interface Despesa {
  id_despesa: string;
  tipo: string;
  categoria: string;
  valor: number;
  vencimento: string;
  pago: boolean;
  observacoes: string;
  recorrente: boolean;
  qtd_meses: number;
  data_criacao: string;
  dia_vencimento: number;
}

export const DespesaService = {
  async getDespesas(): Promise<Despesa[]> {
    const { data, error } = await supabase.from('tb_despesa').select('*');
    if (error) throw error;
    return data || [];
  },

  async createDespesa(despesa: Omit<Despesa, 'id_despesa' | 'data_criacao'>): Promise<void> {
    const { error } = await supabase.from('tb_despesa').insert(despesa);
    if (error) throw error;
  },

  async updateDespesa(id_despesa: string, despesa: Partial<Despesa>): Promise<void> {
    const { error } = await supabase.from('tb_despesa').update(despesa).eq('id_despesa', id_despesa);
    if (error) throw error;
  },

  async deleteDespesa(id_despesa: string): Promise<void> {
    const { error } = await supabase.from('tb_despesa').delete().eq('id_despesa', id_despesa);
    if (error) throw error;
  },
};