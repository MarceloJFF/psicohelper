import supabase from '@/config/supabase'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'
import { useStoreProfissional } from '@/stores/storeProfissional.ts'

interface Sessao {
  id?: string
  pre_sessao?: string
  queixas?: string
  evolucao?: string
  habilidades_trabalhadas?: string
  futuras_acoes?: string
  resumo?: string
  fotos?: string
  id_agendamento?: number
}

interface GetAllSessoesOptions {
  page?: number
  pageSize?: number
  clienteId?: string | null
  startDate?: string
  endDate?: string
  tipoSessao?: 'contrato' | 'avulsa'
}

interface Mensalidade {
  id_mensalidade: string;
  valor: number;
  forma_pagamento: string;
  comprovante_url: string | null;
  status_pagamento: string;
}

export class SessaoService {
  private showError = useShowErrorMessage().showError

  async createSessao(sessao: Sessao): Promise<string> {
    console.log("SESSAO")
    console.log(sessao)
    try {
      const { data, error } = await supabase
        .from('tb_sessao')
        .insert([sessao])
        .select('id')
        .single()
      if (error) throw error
      return data.id
    } catch (err: any) {
      this.showError(err.message || 'Erro ao criar sessão')
      throw err
    }
  }

  // async getAllSessoes(): Promise<any[]> {
  //   try {
  //     const { data, error } = await supabase
  //       .from('tb_sessao')
  //       .select(`
  //         id,
  //         pre_sessao,
  //         queixas,
  //         evolucao,
  //         habilidades_trabalhadas,
  //         futuras_acoes,
  //         resumo,
  //         fotos,
  //         id_agendamento,
  //         tb_agendamento (
  //           data_agendamento,
  //           horario_inicio,
  //           duracao,
  //           id_aprendente,
  //           responsavel_id
  //         )
  //       `);
  //     if (error) throw error;

  //     console.log('Sessões brutas:', data);
  //     return (data || []).sort((a, b) => {
  //       const dateA = new Date(a.tb_agendamento?.data_agendamento || '9999-12-31');
  //       const dateB = new Date(b.tb_agendamento?.data_agendamento || '9999-12-31');
  //       return dateB.getTime() - dateA.getTime();
  //     });
  //   } catch (err: any) {
  //     this.showError(err.message || 'Erro ao carregar sessões');
  //     return [];
  //   }
  // }
  async getAllSessoes(options: GetAllSessoesOptions = {}) {
    const storeProfissional = useStoreProfissional()
    const {
      page = 1,
      pageSize = 10,
      clienteId = null,
      startDate,
      endDate,
      tipoSessao,
    } = options

    try {
      const profissionalId = storeProfissional.profissionalDetails?.id
      if (!profissionalId) {
        throw new Error('Profissional não identificado')
      }
      const params = {
        cliente: clienteId ?? null,
        data_fim: endDate ? endDate.split('T')[0] : null,
        data_inicio: startDate ? startDate.split('T')[0] : null,
        pagina: page,
        profissional: profissionalId,
        tamanho_pagina: pageSize,
        tipo: tipoSessao ?? null
      }
      const { data, error } = await supabase.rpc('filtrar_sessoes', params);
      if (error) throw error;

     if (error) throw error

      return data ?? []
    } catch (err: any) {
      console.error('Erro ao buscar sessões:', err)
      this.showError(err.message || 'Erro ao carregar sessões')
      return []
    }
  }


  async getSessaoById(id: string): Promise<Sessao | null> {
    try {
      const { data, error } = await supabase.from('tb_sessao').select('*').eq('id', id).single()
      if (error) throw error
      return data
    } catch (err: any) {
      this.showError(err.message || 'Erro ao buscar sessão')
      return null
    }
  }
  
  async updateSessao(id: string, sessao: Partial<Sessao>): Promise<void> {
    console.log('updateSessao:', id, sessao)

    try {
      const { error } = await supabase.from('tb_sessao').update(sessao).eq('id', id)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao atualizar sessão')
      throw err
    }
  }

  async getSessaoByAgendamentoId(idAgendamento: number): Promise<Sessao | null> {
    try {
      const { data, error } = await supabase
        .from('tb_sessao')
        .select('*')
        .eq('id_agendamento', idAgendamento)
        .single()

      if (error) throw error
      return data
    } catch (err: any) {
      // if (err.code !== 'PGRST116') { // Ignore "No rows found" error
      //   this.showError(err.message || 'Erro ao buscar sessão');
      // }
      return null
    }
  }

  async buscarMensalidade(idContrato: string, mesReferencia: string): Promise<Mensalidade | null> {
    const { data, error } = await supabase
      .from('tb_mensalidade')
      .select('id_mensalidade, valor, forma_pagamento, comprovante_url, status_pagamento')
      .eq('id_contrato', idContrato)
      .eq('mes_referencia', mesReferencia)
      .maybeSingle()
    if (error && error.code !== 'PGRST116') throw error
    return data
  }
}
