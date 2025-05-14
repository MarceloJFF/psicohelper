export default class ModeloPergunta {
    id: string
    texto: string
    ordem: number
    idModeloAnamnese: string
    createdAt: string
  
    constructor(
      texto: string,
      ordem: number,
      idModeloAnamnese: string,
      id?: string,
      created_at?: string
    ) {
      this.texto = texto
      this.ordem = ordem
      this.idModeloAnamnese = idModeloAnamnese
      this.id = id || ''
      this.createdAt = created_at || ''
    }
  }
  