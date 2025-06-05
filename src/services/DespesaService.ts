import supabase from '@/config/supabase';
import { useStoreProfissional } from '@/stores/storeProfissional.ts'

export interface Despesa {
  id_despesa: string;
  tipo: string;
  categoria: string;
  valor: number;
  vencimento: string;
  pago: boolean;
  observacoes: string;
  data_criacao: string;
  dia_vencimento: number;
  id_profissional: string;
}

export const DespesaService = {
  async getDespesas(): Promise<Despesa[]> {
    const profissional = useStoreProfissional().profissionalDetails;
    const { data, error } = await supabase
      .from('tb_despesa')
      .select('*')
      .eq('id_profissional', profissional?.id);
    if (error) throw error;
    return data || [];
  },

  async createDespesa(despesa: Omit<Despesa, 'id_despesa' | 'data_criacao'>): Promise<void> {
    const profissional = useStoreProfissional().profissionalDetails;
    despesa.id_profissional = profissional?.id || '';
    const { error } = await supabase.from('tb_despesa').insert(despesa);
    if (error) throw error;
  },

  async updateDespesa(id_despesa: string, despesa: Partial<Despesa>): Promise<void> {
    const profissional = useStoreProfissional().profissionalDetails;
    despesa.id_profissional = profissional?.id || '';
    const { error } = await supabase.from('tb_despesa').update(despesa).eq('id_despesa', id_despesa);
    if (error) throw error;
  },

  async deleteDespesa(id_despesa: string): Promise<void> {
    const profissional = useStoreProfissional().profissionalDetails;
    const { error } = await supabase.from('tb_despesa').delete().eq('id_despesa', id_despesa).eq('id_profissional', profissional?.id);
    if (error) throw error;
  },
};
