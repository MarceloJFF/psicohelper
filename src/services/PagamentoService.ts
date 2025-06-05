import supabase from '@/config/supabase'

export interface Pagamento {
  id: string;
  id_sessao: string;
  valor: number;
  forma_pagamento: string;
  forma_pagamento_tipo: string;
  data_pagamento?: string;
  observacao?: string;
  pago: boolean;
  created_at?: string;
  data_sessao?: string;
  comprovante_url?: string;
}

export const PagamentoService = {
  async getPagamentos(): Promise<Pagamento[]> {
    const { data, error } = await supabase
      .from('tb_pagamento_sessao')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async criarPagamento(dados: Pagamento, arquivo: File | null) {
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

  async getPagamentosPorMesAno(mes: number, ano: number): Promise<Pagamento[]> {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;

    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .rpc('buscar_pagamentos_por_mes_ano', {
        p_mes: mes,
        p_ano: ano,
        p_usuario_id: userId
      });

    if (error) {
      console.error('Erro ao buscar pagamentos:', error);
      throw error;
    }
    console.log("PAGAMENTOS POR MÊS E ANO", data);
    return data || [];
  },

  async atualizarPagamento(id: string, dados: Partial<Pagamento>, arquivo?: File) {
    const { data: pagamento, error } = await supabase
      .from('tb_pagamento_sessao')
      .update({
        valor_pago: dados.valor,
        forma_pagamento_tipo: dados.forma_pagamento_tipo,
        observacao: dados.observacao,
        pago: dados.pago
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (arquivo) {
      const path = `comprovantes-pagamento/${id}/${arquivo.name}`
      const { error: uploadError } = await supabase.storage
        .from('comprovantes-pagamento')
        .upload(path, arquivo, { upsert: true })

      if (uploadError) throw uploadError

      const { data: comprovante, error: comprovanteError } = await supabase
        .from('tb_comprovante_pagamento')
        .upsert([
          {
            id_pagamento_sessao: id,
            path_comprovante: path,
          },
        ])
        .select()
        .single()

      if (comprovanteError) throw comprovanteError

      return {
        ...pagamento,
        path_comprovante: comprovante.path_comprovante
      }
    }

    return pagamento
  },

  async excluirComprovantePagamento(idPagamento: string) {
    const { error } = await supabase
      .from('tb_comprovante_pagamento')
      .delete()
      .eq('id_pagamento_sessao', idPagamento)
    if (error) throw error
  },

  async excluirPagamento(id: string) {
    try {
      // 1. Buscar informações do comprovante
      const { data: comprovante, error: fetchError } = await supabase
        .from('tb_comprovante_pagamento')
        .select('path_comprovante')
        .eq('id_pagamento_sessao', id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // 2. Se existir comprovante, excluir do storage
      if (comprovante?.path_comprovante) {
        const { error: deleteStorageError } = await supabase.storage
          .from('comprovantes-pagamento')
          .remove([comprovante.path_comprovante]);

        if (deleteStorageError) {
          throw deleteStorageError;
        }
      }

      // 3. Excluir registro do comprovante
      const { error: deleteComprovanteError } = await supabase
        .from('tb_comprovante_pagamento')
        .delete()
        .eq('id_pagamento_sessao', id);

      if (deleteComprovanteError) {
        throw deleteComprovanteError;
      }

      // 4. Excluir registro do pagamento
      const { error: deleteError } = await supabase
        .from('tb_pagamento_sessao')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      throw error;
    }
  }
}
