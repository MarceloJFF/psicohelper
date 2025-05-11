// src/services/AprendenteService.ts
import supabase from '@/config/supabase'
import Aprendente from '@/models/Aprendente'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'

export class AprendenteService {
  private showError = useShowErrorMessage().showError

  async loadAprendentes(idResponsavel: string): Promise<Aprendente[]> {
    try {
      const { data, error } = await supabase
        .from('tb_aprendente')
        .select('*')
        .eq('id_responsavel', idResponsavel)

      if (error) throw error
      return data as Aprendente[]
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar aprendentes')
      return []
    }
  }

  async addAprendente(aprendente:any): Promise<void> {
    try {
      const { data,error } = await supabase
        .from('tb_aprendente')
        .insert([{
          nome_aprendente: aprendente.nomeAprendente,
          id_responsavel: aprendente.idResponsavel,
          nascimento: aprendente.nascimento,
          sexo: aprendente.sexo,
        }]).select()
      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao adicionar aprendente')
    }
  }

  async updateAprendente(aprendente: Aprendente): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_aprendente')
        .update({
          nome_aprendente: aprendente.nomeAprendente,
          nascimento: aprendente.nascimento,
          sexo: aprendente.sexo,
        })
        .eq('id', aprendente.id)
      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao atualizar aprendente')
    }
  }

  async deleteAprendente(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_aprendente')
        .delete()
        .eq('id', id)
      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao remover aprendente')
    }
  }
  async getAprendenteById(id: string): Promise<Aprendente | null> {
    try {
      const { data, error } = await supabase
        .from('tb_aprendente')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Aprendente
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar o aprendente')
      return null
    }
  }

}
