import supabase from '@/config/supabase'
import { useStoreProfissional } from '@/stores/storeProfissional'
import{ useShowErrorMessage } from '@/userCases/useShowErrorMessage'
export class PastaService {
  private showError = useShowErrorMessage().showError
  private readonly storeProfissional = useStoreProfissional()
  async listarPastas(idPai = null) {
    try {
      let query = supabase
        .from('tb_pasta')
        .select('*')
        .eq("id_profissional", this.storeProfissional.profissionalDetails.id)
        .order('nome')

      if (idPai) {
        query = query.eq('id_pasta_pai', idPai)
      } else {
        query = query.is('id_pasta_pai', null)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao listar pastas:', error)
      throw error
    }
  }

  async criarPasta(nome, idPastaPai = null) {
    try {
      const { data, error } = await supabase
        .from('tb_pasta')
        .insert([
          {
            nome,
            id_profissional: this.storeProfissional.profissionalDetails.id,
            id_pasta_pai: idPastaPai
          }
        ])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erro ao criar pasta:', error)
      throw error
    }
  }

  async atualizarPasta(idPasta, novoNome) {
    try {
      const { data, error } = await supabase
        .from('tb_pasta')
        .update({ nome: novoNome })
        .eq('id_pasta', idPasta)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erro ao atualizar pasta:', error)
      throw error
    }
  }

  async excluirPasta(idPasta) {
    try {
      // Primeiro, verificar se existem subpastas
      const { data: subpastas, error: errorSubpastas } = await supabase
        .from('tb_pasta')
        .select('id_pasta')
        .eq('id_pasta_pai', idPasta)

      if (errorSubpastas) throw errorSubpastas

      if (subpastas && subpastas.length > 0) {
        this.showError('Não é possível excluir uma pasta que contém subpastas. Exclua as subpastas primeiro.')
        throw new Error('Não é possível excluir uma pasta que contém subpastas')
      }

      // Verificar se existem documentos
      const { data: documentos, error: errorDocumentos } = await supabase
        .from('tb_documento')
        .select('id_documento')
        .eq('id_pasta', idPasta)

      if (errorDocumentos) throw errorDocumentos

      if (documentos && documentos.length > 0) {
        this.showError('Não é possível excluir uma pasta que contém documentos. Exclua os documentos primeiro.')
        throw new Error('Não é possível excluir uma pasta que contém documentos')
      }

      // Se não houver subpastas nem documentos, excluir a pasta
      const { error } = await supabase
        .from('tb_pasta')
        .delete()
        .eq('id_pasta', idPasta)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao excluir pasta:', error)
      throw error
    }
  }
}
