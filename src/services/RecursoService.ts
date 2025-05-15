import supabase from '@/config/supabase'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'
import { useStoreProfissional } from '@/stores/storeProfissional'
import type Recurso from '@/models/Recurso'

export function mapToRecurso(data: any): Recurso {
  return {
    id: data.id,
    nome: data.nome,
    tipo: data.tipo,
    preco: data.preco,
    status: data.status,
    idProfissional: data.id_profissional,
    quantidade: data.quantidade,
    observacao: data.observacao,
    habilitarDespesa: data.habilitar_despesa,
    dataCompra: data.data_compra ? new Date(data.data_compra) : new Date(0),
  }
}

export class RecursoService {
  private showError = useShowErrorMessage().showError
  private profissionalStore = useStoreProfissional()

  async listarRecursos(): Promise<Recurso[]> {
    try {
      const idProfissional = this.profissionalStore.profissionalDetails?.id
      if (!idProfissional) throw new Error('Profissional não autenticado')

      const { data, error } = await supabase
        .from('tb_recurso')
        .select('*')
        .eq('id_profissional', idProfissional)
        .order('nome')

      if (error) throw error
        return data?.map(mapToRecurso) ?? []
    } catch (err: any) {
      this.showError(err.message || 'Erro ao listar recursos')
      return []
    }
  }

  async criarRecurso(recurso: Partial<Recurso>): Promise<Recurso | null> {
    try {
      const idProfissional = this.profissionalStore.profissionalDetails?.id
      if (!idProfissional) throw new Error('Profissional não autenticado')

      const novoRecurso = {
        nome: recurso.nome,
        tipo: recurso.tipo,
        preco: recurso.preco,
        status: recurso.status ?? true,
        id_profissional: idProfissional,
        quantidade: recurso.quantidade,
        observacao: recurso.observacao,
        habilitar_despesa: recurso.habilitarDespesa,
        data_compra: recurso.dataCompra,
      }

      const { data, error } = await supabase
        .from('tb_recurso')
        .insert(novoRecurso)
        .select()

      if (error) throw error
      return mapToRecurso(data?.[0])
    } catch (err: any) {
      this.showError(err.message || 'Erro ao criar recurso')
      return null
    }
  }

  async atualizarRecurso(recurso: Recurso): Promise<Recurso | null> {
    try {
      const { data, error } = await supabase
        .from('tb_recurso')
        .update({
          nome: recurso.nome,
          tipo: recurso.tipo,
          preco: recurso.preco,
          status: recurso.status,
          id_profissional: recurso.idProfissional,
          quantidade: recurso.quantidade,
          observacao: recurso.observacao,
          habilitar_despesa: recurso.habilitarDespesa,
          data_compra: recurso.dataCompra,
        })
        .eq('id', recurso.id)
        .select()

      if (error) throw error
      return   mapToRecurso(data);
    } catch (err: any) {
      this.showError(err.message || 'Erro ao atualizar recurso')
      return null
    }
  }

  async alternarStatus(id: string, status: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_recurso')
        .update({ status })
        .eq('id', id)
      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao alterar status do recurso')
    }
  }

  async excluirRecurso(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_recurso')
        .delete()
        .eq('id', id)
      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao excluir recurso')
    }
  }
}
