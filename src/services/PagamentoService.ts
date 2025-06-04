import supabase from '@/config/supabase'

interface PagamentoData {
  id_sessao: string;
  valor: number;
  forma_pagamento_tipo: string;
  observacao?: string;
  pago: boolean;
  created_at?: string;
}

export const PagamentoService = {
  async criarPagamento(dados: PagamentoData, arquivo: File | null) {
   
    const { data: pagamento, error } = await supabase
      .from('tb_pagamento_sessao')
      .insert({
        id_sessao: dados.id_sessao,
        valor_pago: dados.valor,
        forma_pagamento_tipo: dados.forma_pagamento_tipo,
        observacao: dados.observacao,
        pago: dados.pago
      })
      .select()
      .single()

    if (error) throw error

    if (arquivo) {
      const path = `comprovantes-pagamento/${pagamento.id}/${arquivo.name}`
      const { error: uploadError } = await supabase.storage
        .from('comprovantes-pagamento')
        .upload(path, arquivo, {
          upsert: true,
        })

      if (uploadError) throw uploadError

      await supabase
        .from('tb_comprovante_pagamento')
        .insert([
          {
            id_pagamento_sessao: pagamento.id,
            path_comprovante: path,
          },
        ])
    }

    return pagamento
  },

  async getPagamentoSessaoById(idSessao:string){
    const { data, error } = await supabase
    .rpc('buscar_pagamento_por_sessao', { sessao_id: idSessao })

  if (error) {
    console.error('Erro ao buscar pagamento:', error)
    throw error
  }
  
  if(data.length>0) return data[0]
  return null;
  },


  async atualizarPagamento(id: string, dados: Partial<PagamentoData>, arquivo?: File) {
    const { error } = await supabase
      .from('tb_pagamento_sessao')
      .update({
        valor_pago: dados.valor,
        forma_pagamento_tipo: dados.forma_pagamento_tipo,
        observacao: dados.observacao,
        pago: dados.pago
      })
      .eq('id', id)

    if (error) throw error

    if (arquivo) {
      const path = `comprovantes-pagamento/${id}/${arquivo.name}`
      const { error: uploadError } = await supabase.storage
        .from('comprovantes-pagamento')
        .upload(path, arquivo, { upsert: true })

      if (uploadError) throw uploadError

      await supabase
        .from('tb_comprovante_pagamento')
        .upsert([
          {
            id_pagamento_sessao: id,
            path_comprovante: path,
          },
        ])
    }
  },

  async excluirPagamento(id: string) {
    const { error } = await supabase
      .from('tb_pagamento_sessao')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
