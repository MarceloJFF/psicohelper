import supabase from '@/config/supabase';
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage';
import { useStoreProfissional } from '@/stores/storeProfissional';

export interface Lembrete {
  id?: string;
  created_at?: string;
  descricao: string;
  data_expiracao: string; // formato: 'HH:mm:ss' ou 'YYYY-MM-DD' se alterar tipo
  feito: boolean;
  cancelado?: boolean;
  idProfissional: string;
  data_conclusao?: string | null;
}

export class LembreteService {
  private showError = useShowErrorMessage().showError;

  async criarLembrete(lembrete: Lembrete): Promise<string | undefined> {
    try {
      const { data, error } = await supabase
        .from('tb_lembrete')
        .insert([
          {
            descricao: lembrete.descricao,
            data_expiracao: lembrete.data_expiracao,
            feito: lembrete.feito,
            cancelado: lembrete.cancelado || false,
            idProfissional: lembrete.idProfissional,
            data_conclusao: lembrete.data_conclusao || null,
          },
        ])
        .select();
      if (error) throw error;
      return data[0].id;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao criar lembrete');
      return undefined;
    }
  }

  async atualizarLembrete(lembrete: Lembrete): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_lembrete')
        .update({
          descricao: lembrete.descricao,
          data_expiracao: lembrete.data_expiracao,
          feito: lembrete.feito,
          cancelado: lembrete.cancelado,
          data_conclusao: lembrete.data_conclusao || null,
        })
        .eq('id', lembrete.id)
        .eq('idProfissional', lembrete.idProfissional);
      if (error) throw error;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao atualizar lembrete');
    }
  }

  async deletarLembrete(id: string, idProfissional: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_lembrete')
        .delete()
        .eq('id', id)
        .eq('idProfissional', idProfissional);
      if (error) throw error;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao remover lembrete');
    }
  }

  async buscarLembretePorId(id: string, idProfissional: string): Promise<Lembrete | null> {
    try {
      const { data, error } = await supabase
        .from('tb_lembrete')
        .select('*')
        .eq('id', id)
        .eq('idProfissional', idProfissional)
        .single();
      if (error) throw error;
      return data as Lembrete;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar o lembrete');
      return null;
    }
  }

  async buscarLembretesDoProfissional(idProfissional: string): Promise<Lembrete[] | null> {
    try {
      const { data, error } = await supabase
        .from('tb_lembrete')
        .select('*')
        .eq('idProfissional', idProfissional)
        .order('data_expiracao', { ascending: true });
      if (error) throw error;
      return data as Lembrete[];
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar os lembretes');
      return null;
    }
  }

  async buscarLembretesPorData(idProfissional: string, data: string): Promise<Lembrete[] | null> {
    try {
      const dataInicio = new Date(data);
      dataInicio.setHours(0, 0, 0, 0);
      
      const dataFim = new Date(data);
      dataFim.setHours(23, 59, 59, 999);

      const { data: lembretes, error } = await supabase
        .from('tb_lembrete')
        .select('*')
        .eq('idProfissional', idProfissional)
        .gte('data_expiracao', dataInicio.toISOString())
        .lte('data_expiracao', dataFim.toISOString())
        .order('data_expiracao', { ascending: true });

      if (error) throw error;
      return lembretes as Lembrete[];
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar os lembretes');
      return null;
    }
  }
} 