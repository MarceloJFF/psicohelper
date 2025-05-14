import supabase from '@/config/supabase'
import ModeloPergunta from '@/models/ModeloPergunta'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'

export class ModeloPerguntaAnamneseService {
  private showError = useShowErrorMessage().showError


  async listarPerguntasPorModelo(id_modelo_anamnese: string): Promise<ModeloPergunta[]> {
    try {
      const { data, error } = await supabase
        .from('tb_modelo_pergunta')
        .select('*')
        .eq('id_modelo_anamnese', id_modelo_anamnese)
        .order('ordem', { ascending: true })

      if (error) throw error
      return data as ModeloPergunta[]
    } catch (err: any) {
      this.showError(err.message || 'Erro ao listar perguntas')
      return []
    }
  }

  async reordenarPerguntas(perguntas: { id: string, ordem: number }[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_modelo_pergunta')
        .upsert(perguntas)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao reordenar perguntas')
    }
  }
}
