import supabase from '@/config/supabase'
import ModeloAnamnese from '@/models/ModeloAnamnese'
import ModeloPergunta from '@/models/ModeloPergunta'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'
import { useStoreConfig } from '@/stores/storeConfig'

export class ModeloAnamneseService {
  private showError = useShowErrorMessage().showError
  private storeConfig = useStoreConfig()

  async salvarOuAtualizarModelo(id_config: string, nome: string, perguntas: { texto: string }[]): Promise<void> {
    try {
      const { data: modeloExistente, error: errorModelo } = await supabase
        .from('tb_modelo_anamnese')
        .select('*')
        .eq('id_config', id_config)
        .single()
        console.log(modeloExistente)
      if (errorModelo && errorModelo.code !== 'PGRST116') throw errorModelo

      let id_modelo: string

      if (modeloExistente) {
        //se o modelo existir, atualiza as perguntas
        id_modelo = modeloExistente.id_modelo

        // Busca perguntas existentes que já têm respostas
        const { data: perguntasComRespostas, error: errorPerguntas } = await supabase
          .from('tb_modelo_pergunta')
          .select('id, texto')
          .eq('id_modelo_anamnese', id_modelo)
          .in('id', (
            await supabase
              .from('tb_resposta_pergunta')
              .select('id_modelo_pergunta')
          ).data?.map(r => r.id_modelo_pergunta) || [])

        if (errorPerguntas) throw errorPerguntas

        // Mapeia as perguntas existentes que têm respostas
        const perguntasPreservadas = new Map(
          (perguntasComRespostas || []).map(p => [p.texto, p.id])
        )

        // Prepara as novas perguntas, mantendo os IDs das que já existem
        const perguntasData = perguntas.map((p, index) => {
          const idExistente = perguntasPreservadas.get(p.texto)
          return {
            id: idExistente, // Se existir, mantém o ID
            id_modelo_anamnese: id_modelo,
            texto: p.texto,
            ordem: index
          }
        })

        // Remove apenas as perguntas que não têm respostas e não estão na nova lista
        const { error: deleteError } = await supabase
          .from('tb_modelo_pergunta')
          .delete()
          .eq('id_modelo_anamnese', id_modelo)
          .not('id', 'in', `(${Array.from(perguntasPreservadas.values()).join(',')})`)

        if (deleteError) throw deleteError

        // Insere ou atualiza as perguntas
        const { error: upsertError } = await supabase
          .from('tb_modelo_pergunta')
          .upsert(perguntasData)

        if (upsertError) throw upsertError
      } else {
        //cria o novo modelo
        const { data: modeloCriado, error: insertModeloError } = await supabase
          .from('tb_modelo_anamnese')
          .insert({
            id_config,
            nome
          })
          .select()
          .single()
        if (insertModeloError) throw insertModeloError
        id_modelo = modeloCriado.id

        const perguntasData = perguntas.map((p, index) => ({
          id_modelo_anamnese: id_modelo,
          texto: p.texto,
          ordem: index
        }))

        const { error: insertPerguntasError } = await supabase
          .from('tb_modelo_pergunta')
          .insert(perguntasData)

        if (insertPerguntasError) throw insertPerguntasError
      }
    } catch (err: any) {
      this.showError(err.message || 'Erro ao salvar/atualizar modelo de anamnese')
      throw err
    }
  }
  async obterModeloPorConfig(id_config: string): Promise<ModeloAnamnese | null> {
    try {
      const { data, error } = await supabase
        .from('tb_modelo_anamnese')
        .select('*')
        .eq('id_config', id_config)
        .maybeSingle()  // Use maybeSingle em vez de single

      if (error) throw error
      const modeloAnamnese = new ModeloAnamnese(data.nome, data.id_modelo, data.id_config)
      return modeloAnamnese
    } catch (err: any) {
      this.showError(err.message || 'Erro ao buscar modelo de anamnese')
      return null
    }
  }
  async salvarModelo(nome: string, perguntas: string[]): Promise<void> {
    try {
      const id_config = this.storeConfig.configuracao?.id

      if (!id_config) throw new Error('Configuração não encontrada')

      // Verifica se já existe modelo com esse id_config
      const { data: modeloExistente, error: fetchError } = await supabase
        .from('tb_modelo_anamnese')
        .select('id_modelo')
        .eq('id_config', id_config)
        .single()

      let id_modelo: string

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = No rows found
        throw fetchError
      }

      if (modeloExistente) {
        // Modelo já existe → atualiza perguntas
        id_modelo = modeloExistente.id_modelo
        console.log(modeloExistente)
        // Remove perguntas antigas
        const { error: deleteError } = await supabase
          .from('tb_modelo_pergunta')
          .delete()
          .eq('id_modelo_anamnese', id_modelo)

        if (deleteError) throw deleteError
      } else {
        // Criar novo modelo
        const { data: novoModelo, error: insertError } = await supabase
          .from('tb_modelo_anamnese')
          .insert({
            nome,
            id_config: id_config
          })
          .select()
          .single()

        if (insertError) throw insertError
        id_modelo = novoModelo.id
      }

      // Inserir perguntas atualizadas
      const perguntasData = perguntas.map((texto, index) => ({
        id_modelo_anamnese: id_modelo,
        texto,
        ordem: index
      }))

      const { error: perguntasError } = await supabase
        .from('tb_modelo_pergunta')
        .insert(perguntasData)

      if (perguntasError) throw perguntasError

    } catch (err: any) {
      this.showError(err.message || 'Erro ao salvar modelo de anamnese')
    }
  }

  async carregarPerguntas(id_modelo: string): Promise<ModeloPergunta[]> {
    try {
      const { data, error } = await supabase
        .from('tb_modelo_pergunta')
        .select('*')
        .eq('id_modelo_anamnese', id_modelo)
        .order('ordem', { ascending: true })

      if (error) throw error
      return data as ModeloPergunta[]
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar perguntas')
      return []
    }
  }

  // Novo método para salvar perguntas como texto
  async salvarModeloTexto(id_config: string, nome: string, perguntas: string): Promise<void> {
    try {
      // Verifica se já existe modelo com esse id_config
      const { data: modeloExistente, error: fetchError } = await supabase
        .from('tb_modelo_anamnese')
        .select('id_modelo')
        .eq('id_config', id_config)
        .maybeSingle()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (modeloExistente) {
        // Atualiza o modelo existente
        const { error: updateError } = await supabase
          .from('tb_modelo_anamnese')
          .update({ nome, perguntas })
          .eq('id_config', id_config)
        if (updateError) throw updateError
      } else {
        // Cria novo modelo
        const { error: insertError } = await supabase
          .from('tb_modelo_anamnese')
          .insert({ id_config, nome, perguntas })
        if (insertError) throw insertError
      }
    } catch (err: any) {
      this.showError(err.message || 'Erro ao salvar modelo de anamnese (texto)')
      throw err
    }
  }

}
