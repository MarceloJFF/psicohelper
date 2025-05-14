import supabase from '@/config/supabase'

export class DocumentoService {
  async listarDocumentos(idPasta = null) {
    try {
      let query = supabase
        .from('tb_documento')
        .select('*')
        .order('nome')

      if (idPasta) {
        query = query.eq('id_pasta', idPasta)
      } else {
        query = query.is('id_pasta', null)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao listar documentos:', error)
      throw error
    }
  }

  async criarDocumento(nome: string, idPasta: string, arquivo: File, idAprendente: string) {
    try {
      // 1. Upload do arquivo para o storage
      const fileExt = arquivo.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `documentos_aprendentes/${idAprendente}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, arquivo)

      if (uploadError) throw uploadError

      // 2. Criar registro do documento no banco
      const { data, error } = await supabase
        .from('tb_documento')
        .insert([
          {
            nome,
            id_pasta: idPasta,
            id_aprendente: idAprendente,
            storage_path: filePath
          }
        ])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erro ao criar documento: ', error)
      throw error
    }
  }

  async atualizarDocumento(idDocumento: string, novoNome: string) {
    try {
      const { data, error } = await supabase
        .from('tb_documento')
        .update({ nome: novoNome })
        .eq('id_documento', idDocumento)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erro ao atualizar documento:', error)
      throw error
    }
  }

  async excluirDocumento(idDocumento: string) {
    try {
      // 1. Buscar informações do documento
      const { data: documento, error: fetchError } = await supabase
        .from('tb_documento')
        .select('storage_path')
        .eq('id_documento', idDocumento)
        .single()

      if (fetchError) throw fetchError

      // 2. Excluir arquivo do storage
      const { error: deleteStorageError } = await supabase.storage
        .from('documentos')
        .remove([documento.storage_path])

      if (deleteStorageError) throw deleteStorageError

      // 3. Excluir registro do banco
      const { error: deleteError } = await supabase
        .from('tb_documento')
        .delete()
        .eq('id_documento', idDocumento)

      if (deleteError) throw deleteError
    } catch (error) {
      console.error('Erro ao excluir documento:', error)
      throw error
    }
  }

  async moverDocumento(idDocumento: string, novaPastaId: string) {
    try {
      const { data, error } = await supabase
        .from('tb_documento')
        .update({ id_pasta: novaPastaId })
        .eq('id_documento', idDocumento)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erro ao mover documento:', error)
      throw error
    }
  }

  async carregarDocumentosAprendente(idAprendente: string) {
    try {
      const { data, error } = await supabase
        .from('tb_documento')
        .select('*')
        .eq('id_aprendente', idAprendente)
        .order('nome')

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao carregar documentos do aprendente:', error)
      throw error
    }
  }
} 