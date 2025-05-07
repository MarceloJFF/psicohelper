// src/services/DependenteService.ts
import supabase from '@/config/supabase'
import Dependente from '@/models/Dependente'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'

export class DependenteService {
  private showError = useShowErrorMessage().showError

  async loadDependentes(idCliente: string): Promise<Dependente[]> {
    try {
      const { data, error } = await supabase
        .from('tb_dependente')
        .select('*')
        .eq('id_cliente', idCliente)

      if (error) throw error
      return data as Dependente[]
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar dependentes')
      return []
    }
  }

  async addDependente(dependente: Dependente): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_dependente')
        .insert([{
          id: dependente.id,
          nome_dependente: dependente.nomeDependente,
          id_cliente: dependente.idCliente,
          nascimento: dependente.nascimento,
          sexo: dependente.sexo
        }])
      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao adicionar dependente')
    }
  }

  async updateDependente(dependente: Dependente): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_dependente')
        .update({
          nome_dependente: dependente.nomeDependente,
          nascimento: dependente.nascimento,
          sexo: dependente.sexo
        })
        .eq('id', dependente.id)
      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao atualizar dependente')
    }
  }

  async deleteDependente(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_dependente')
        .delete()
        .eq('id', id)
      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao remover dependente')
    }
  }
}
