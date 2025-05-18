// src/services/DespesaService.ts
import supabase from '@/config/supabase';

export class DespesaService {
  async getAllDespesas() {
    const { data, error } = await supabase
      .from('tb_despesa')
      .select('*');
    if (error) {
      console.error('Erro ao buscar despesas:', error);
      throw error;
    }
    return data;
  }

  async createDespesa(despesaData: {
    tipo: string;
    categoria?: string;
    valor: number;
    vencimento: string;
    pago: boolean;
    observacoes?: string;
    recorrente: boolean;
    qtd_meses: number;
  }) {
    const { data, error } = await supabase
      .from('tb_despesa')
      .insert(despesaData)
      .select()
      .single();
    if (error) {
      console.error('Erro ao criar despesa:', error);
      throw error;
    }
    return data;
  }

  async updateDespesa(id_despesa: string, despesaData: Partial<{
    tipo: string;
    categoria: string;
    valor: number;
    vencimento: string;
    pago: boolean;
    observacoes: string;
    recorrente: boolean;
    qtd_meses: number;
  }>) {
    const { data, error } = await supabase
      .from('tb_despesa')
      .update(despesaData)
      .eq('id_despesa', id_despesa)
      .select()
      .single();
    if (error) {
      console.error('Erro ao atualizar despesa:', error);
      throw error;
    }
    return data;
  }

  async deleteDespesa(id_despesa: string) {
    const { error } = await supabase
      .from('tb_despesa')
      .delete()
      .eq('id_despesa', id_despesa);
    if (error) {
      console.error('Erro ao excluir despesa:', error);
      throw error;
    }
  }
}