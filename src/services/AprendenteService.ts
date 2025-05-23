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

  async  buscarAprendentesPorNome(nome: string) {
    const { data, error } = await supabase
      .from('tb_aprendente')
      .select('id, nome_dependente')
      .ilike('nome_dependente', `%${nome}%`) // busca por similaridade (case-insensitive)

    if (error) {
      console.error('Erro ao buscar aprendentes:', error)
      return []
    }
    return data
  }

  async addAprendente(aprendente: Aprendente): Promise<string | undefined> {
    try {
      const { data, error } = await supabase
        .from('tb_aprendente')
        .insert([{
          nome_aprendente: aprendente.nomeAprendente,
          id_responsavel: aprendente.idResponsavel,
          nascimento: aprendente.nascimento,
          sexo: aprendente.sexo || '',
        }]).select()
      if (error) throw error
      return data[0].id

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
  async buscarClientesPorNome(termo: string) {
    try {
      const { data, error } = await supabase
        .from('vw_aprendente_responsavel')
        .select('*')
        .or(
          `and(atendimento_proprio.eq.true,nome_responsavel.ilike.%${termo}%),nome_aprendente.ilike.%${termo}%`
        )
  
      if (error) throw error
  
     
      return data.map((item: any) => ({
        id: item.id_aprendente ? item.id_aprendente : item.id_responsavel,
        nome: item.nome_aprendente ? item.nome_aprendente : item.nome_responsavel,
        tipo: 'aprendente',
        responsavel: item.nome_responsavel,
        displayName: `Aprendente: ${item.nome_aprendente ? item.nome_aprendente :item.nome_responsavel } Responsavel: ${item.nome_responsavel}`
      }))
      console.log(data)
    } catch (err: any) {
      this.showError(err.message || 'Erro ao buscar clientes')
      return []
    }
  }
  
  
  
}
