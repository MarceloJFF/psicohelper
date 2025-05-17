// src/services/PagamentoService.ts
import supabase from '@/config/supabase'
import { UploadService } from './UploadService'

export class PagamentoService {
  private uploadService = new UploadService()

  async createPagamento(pagamento: {
    id_sessao: string[]
    valor: number
    forma_pagamento: string
    comprovante?: File
  }) {
    let comprovante_url = null
    if (pagamento.comprovante) {
      const folder = `comprovante/${pagamento.id_sessao.join('_')}`
      comprovante_url = await this.uploadService.uploadArquivo(
        'pagamentos',
        folder,
        pagamento.comprovante,
      )
    }

    const { data: pagamentoData, error: pagamentoError } = await supabase
      .from('tb_pagamento')
      .insert({
        valor: pagamento.valor,
        forma_pagamento: pagamento.forma_pagamento,
        comprovante_url,
        data_pagamento: new Date().toISOString(),
      })
      .select()
      .single()

    if (pagamentoError) throw pagamentoError

    if (pagamento.id_sessao.length > 0) {
      const sessaoInserts = pagamento.id_sessao.map((id) => ({
        id_pagamento: pagamentoData.id_pagamento,
        id_sessao: id,
      }))
      const { error: sessaoError } = await supabase
        .from('tb_pagamento_sessao')
        .insert(sessaoInserts)
      if (sessaoError) throw sessaoError
    }

    return pagamentoData
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
      .from('tb_pagamento')
      .select('*, tb_pagamento_sessao(id_sessao)')
      .eq('tb_pagamento_sessao.id_sessao', id_sessao)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }
}
