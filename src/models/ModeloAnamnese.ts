export default class ModeloAnamnese {
    id: string
    nome: string
    created_at: string
  
    constructor(nome: string, id: string, created_at: string) {
      this.nome = nome
      this.id = id
      this.created_at = created_at
    }
  }
  