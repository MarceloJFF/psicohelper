// src/services/AprendenteService.ts
import supabase from '@/config/supabase'
import Dependente from '@/models/Dependente'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'

export class AprendenteService {
  private showError = useShowErrorMessage().showError

  async loadDependentes(idCliente: string): Promise<Dependente[]> {
    try {
      const { data, error } = await supabase
        .from('tb_aprendente')
        .select('*')
        .eq('id_cliente', idCliente)

      if (error) throw error
      return data as Dependente[]
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar dependentes')
      return []
    }
  }

  async addDependente(dependente): Promise<void> {
    try {
      const { data,error } = await supabase
        .from('tb_aprendente')
        .insert([{
          nome_dependente: dependente.nome,
          id_cliente: dependente.idCliente,
          nascimento: dependente.nascimento,
        }]).select()
      console.log(dependente)
      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao adicionar dependente')
    }
  }

  async updateDependente(dependente: Dependente): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_aprendente')
        .update({
          nome_dependente: dependente.nomeDependente,
          nascimento: dependente.nascimento,
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
        .from('tb_aprendente')
        .delete()
        .eq('id', id)
      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao remover dependente')
    }
  }
  async getAprendenteById(id: string): Promise<Dependente | null> {
    try {
      const { data, error } = await supabase
        .from('tb_aprendente')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Dependente
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar o aprendente')
      return null
    }
  }

}
