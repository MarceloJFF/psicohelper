// src/services/PastaService.ts
import supabase from '/src/config/supabase'

export interface Pasta {
  id: number
  nome: string
  parent_id: number | null
}

export class PastaService {
  async listarPastas(parentId: number | null): Promise<Pasta[]> {
    const { data, error } = await supabase
      .from('tb_pastas')
      .select('*')
      .eq('parent_id', parentId)

    if (error) throw error
    return data
  }

  async criarPasta(nome: string, parentId: number | null): Promise<Pasta> {
    const { data, error } = await supabase
      .from('tb_pastas')
      .insert([{ nome, parent_id: parentId }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async atualizarPasta(id: number, novoNome: string): Promise<void> {
    const { error } = await supabase
      .from('pastas')
      .update({ nome: novoNome })
      .eq('id', id)

    if (error) throw error
  }

  async excluirPasta(id: number): Promise<void> {
    const { error } = await supabase
      .from('tb_pastas')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
