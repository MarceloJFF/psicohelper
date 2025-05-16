import supabase from '@/config/supabase'
import AnamneseResposta from '@/models/AnamneseResposta'
import RespostaPergunta from '@/models/RespostaPergunta'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'

export class AnamneseService {
  private showError = useShowErrorMessage().showError

  async salvarAnamnese(anamneseResposta: AnamneseResposta, respostas: RespostaPergunta[]): Promise<void> {
    try {
      // Inserir a anamnese resposta
      const { data: anamneseData, error: anamneseError } = await supabase
        .from('tb_anamnese_resposta')
        .insert({
          id_modelo_anamnese: anamneseResposta.idModeloAnamnese,
          id_responsavel: anamneseResposta.idResponsavel,
          id_profissional: anamneseResposta.idProfissional,
          id_aprendente: anamneseResposta.idAprendente
        })
        .select()
        .single()

      if (anamneseError) throw anamneseError

      // Inserir as respostas das perguntas
      const respostasData = respostas.map(resposta => ({
        id_anamnese_resposta: anamneseData.id,
        id_modelo_pergunta: resposta.idModeloPergunta,
        resposta: resposta.resposta
      }))

      const { error: respostasError } = await supabase
        .from('tb_resposta_pergunta')
        .insert(respostasData)

      if (respostasError) throw respostasError
    } catch (err: any) {
      this.showError(err.message || 'Erro ao salvar anamnese')
      throw err
    }
  }

  async carregarAnamnese(idAprendente: string): Promise<{
    anamnese: AnamneseResposta,
    respostas: RespostaPergunta[]
  } | null> {
    try {
      // Buscar a anamnese mais recente do aprendente
      const { data: anamneseData, error: anamneseError } = await supabase
        .from('tb_anamnese_resposta')
        .select('*')
        .eq('id_aprendente', idAprendente)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (anamneseError) {
        if (anamneseError.code === 'PGRST116') return null // Nenhuma anamnese encontrada
        throw anamneseError
      }

      // Buscar as respostas da anamnese
      const { data: respostasData, error: respostasError } = await supabase
        .from('tb_resposta_pergunta')
        .select('*')
        .eq('id_anamnese_resposta', anamneseData.id)

      if (respostasError) throw respostasError

      const anamnese = new AnamneseResposta(
        anamneseData.id,
        anamneseData.id_modelo_anamnese,
        anamneseData.id_responsavel,
        anamneseData.id_profissional,
        anamneseData.id_aprendente
      )

      const respostas = respostasData.map(r => new RespostaPergunta(
        r.id,
        r.id_anamnese_resposta,
        r.id_modelo_pergunta,
        r.resposta
      ))

      return { anamnese, respostas }
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar anamnese')
      return null
    }
  }

  async carregarRespostaAnamnese(id_modelo_anamnese: string, id_aprendente: string) {
    try {
      const { data, error } = await supabase
        .from('tb_anamnese_resposta')
        .select('resposta')
        .eq('id_modelo_anamnese', id_modelo_anamnese)
        .eq('id_aprendente', id_aprendente)
        .maybeSingle()
      if (error) return null
      return data
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar resposta da anamnese')
      return null
    }
  }

  // Busca a resposta de anamnese mais recente para um aprendente ou responsável
  async obterRespostaAnamnese(idAprendenteOuResponsavel: string): Promise<{ texto: string } | null> {
    try {
      const { data, error } = await supabase
        .from('tb_anamnese_resposta')
        .select('id, resposta')
        .or(`id_aprendente.eq.${idAprendenteOuResponsavel},id_responsavel.eq.${idAprendenteOuResponsavel}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error || !data) return null;
      return { texto: data.resposta };
    } catch (err) {
      return null;
    }
  }

  // Cria uma nova resposta de anamnese
  async criarRespostaAnamnese(idAprendenteOuResponsavel: string, texto: string): Promise<void> {
    try {
      // Você pode precisar passar id_modelo_anamnese e outros campos obrigatórios
      await supabase.from('tb_anamnese_resposta').insert({
        id_aprendente: idAprendenteOuResponsavel,
        resposta: texto
      });
    } catch (err) {
      throw err;
    }
  }

  // Atualiza a resposta de anamnese existente
  async atualizarRespostaAnamnese(idAprendenteOuResponsavel: string, texto: string): Promise<void> {
    try {
      // Busca o id da resposta mais recente
      const { data, error } = await supabase
        .from('tb_anamnese_resposta')
        .select('id')
        .or(`id_aprendente.eq.${idAprendenteOuResponsavel},id_responsavel.eq.${idAprendenteOuResponsavel}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error || !data) throw new Error('Resposta não encontrada para atualizar');
      await supabase.from('tb_anamnese_resposta').update({ resposta: texto }).eq('id', data.id);
    } catch (err) {
      throw err;
    }
  }
}
