// src/services/PagamentoService.ts
import supabase from '@/config/supabase'
import { UploadService } from './UploadService'

export class PagamentoService {
  private uploadService = new UploadService()

  async createPagamento(pagamentoData: {
    id_sessao: string[]
    valor: number
    forma_pagamento: string
    comprovante?: File
  }) {
    let comprovante_url = null
    if (pagamentoData.comprovante) {
      comprovante_url = await this.uploadService.uploadArquivo(
        'comprovantes-pagamento',
        `comprovante/${pagamentoData.id_sessao[0]}`,
        pagamentoData.comprovante,
      )
    }

    // Create a payment in tb_pagamento
    const { data: pagamento, error: pagamentoError } = await supabase
      .from('tb_pagamento')
      .insert({
        valor: pagamentoData.valor,
        forma_pagamento: pagamentoData.forma_pagamento,
        comprovante_url,
        data_pagamento: new Date().toISOString(), // Ensure data_pagamento is set
      })
      .select('id_pagamento, valor, forma_pagamento, comprovante_url, data_pagamento')
      .single()

    if (pagamentoError) {
      console.error('Erro ao criar tb_pagamento:', pagamentoError)
      throw pagamentoError
    }

    // Link sessions in tb_pagamento_sessao
    const { data: pagamentoSessao, error: sessaoError } = await supabase
      .from('tb_pagamento_sessao')
      .insert(
        pagamentoData.id_sessao.map((id) => ({
          id_sessao: id,
          id_pagamento: pagamento.id_pagamento,
        })),
      )
      .select('id, id_sessao, id_pagamento')
      .single()

    if (sessaoError) {
      console.error('Erro ao criar tb_pagamento_sessao:', sessaoError)
      throw sessaoError
    }

    console.log('Pagamento criado:', { pagamento, pagamentoSessao })
    return pagamento // Return tb_pagamento data to match getPagamentoBySessao
  }

  async updatePagamento(
    id_pagamento: string,
    pagamento: {
      valor: number
      forma_pagamento: string
      comprovante?: File
    },
  ) {
    let comprovante_url = null
    if (pagamento.comprovante) {
      comprovante_url = await this.uploadService.uploadArquivo(
        'pagamentos',
        `comprovante/${id_pagamento}`,
        pagamento.comprovante,
      )
    }

    const { data, error } = await supabase
      .from('tb_pagamento')
      .update({
        valor: pagamento.valor,
        forma_pagamento: pagamento.forma_pagamento,
        comprovante_url: comprovante_url || undefined,
        data_pagamento: new Date().toISOString(),
      })
      .eq('id_pagamento', id_pagamento)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getPagamentoBySessao(id_sessao: string) {
    const { data, error } = await supabase
      .from('tb_pagamento_sessao')
      .select(
        `
        id,
        id_sessao,
        id_pagamento,
        tb_pagamento (
          id_pagamento,
          valor,
          forma_pagamento,
          comprovante_url,
          data_pagamento
        )
      `,
      )
      .eq('id_sessao', id_sessao)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error(`Erro ao buscar pagamento para sessão ${id_sessao}:`, error)
      throw error
    }
    console.log(`Pagamento para sessão ${id_sessao}:`, data)
    return data
  }
}
