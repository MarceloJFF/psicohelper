export default class ModeloPergunta {
    id?: string
    texto!: string
    ordem!: number
    id_modelo_anamnese!: string
    created_at?: string
  
    constructor(
      texto: string,
      ordem: number,
      id_modelo_anamnese: string,
      id?: string,
      created_at?: string
    ) {
      this.texto = texto
      this.ordem = ordem
      this.id_modelo_anamnese = id_modelo_anamnese
      this.id = id
      this.created_at = created_at
    }
  }
  