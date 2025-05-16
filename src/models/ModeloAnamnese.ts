export default class ModeloAnamnese {
  id: string
  nome: string
  created_at: string
  perguntas?: string

  constructor(nome: string, id: string, created_at: string, perguntas?: string) {
    this.nome = nome
    this.id = id
    this.created_at = created_at
    this.perguntas = perguntas
  }
}

