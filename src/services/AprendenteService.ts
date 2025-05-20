// src/services/AprendenteService.ts
import supabase from '@/config/supabase';
import Aprendente from '@/models/Aprendente';
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage';
import { useStoreProfissional } from '@/stores/storeProfissional';
import ViewAprendenteLogadoProfissional from '@/models/ViewAprendenteLogadoProfissional';

export class AprendenteService {
  private showError = useShowErrorMessage().showError;
  private useStoreProfissional = useStoreProfissional();

  async loadAprendentes(idResponsavel: string): Promise<Aprendente[]> {
    try {
      const { data, error } = await supabase
        .from('tb_aprendente')
        .select('*')
        .eq('id_responsavel', idResponsavel);

      if (error) throw error;
      const aprendentes: Aprendente[] = [];

      data.forEach((item: any) => {
        const aprendente = this.mapAprendente(item);
        aprendentes.push(aprendente);
      });
      return aprendentes;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar aprendentes');
      return [];
    }
  }
  mapAprendente(data: any): Aprendente {
    const aprendente = new Aprendente();
    aprendente.id = data.id;
    aprendente.nomeAprendente = data.nome_aprendente;
    aprendente.idResponsavel = data.id_responsavel;
    aprendente.nascimento = data.nascimento;
    aprendente.sexo = data.sexo;
    aprendente.corAgendamento = data.cor_agendamento;
    aprendente.statusMatricula = data.status_matricula;
    // Adicione outros campos conforme necessário
    return aprendente;
  }

  async loadAprendentesPorProfissional(): Promise<ViewAprendenteLogadoProfissional[]> {
    try {
      const idProfissional = this.useStoreProfissional.profissionalDetails?.id;
      const { data, error } = await supabase
        .from('vw_aprendentes_logado_profissional')
        .select('*')
        .eq('id_profissional', idProfissional);
      if (error) throw error;
      const aprendentes: ViewAprendenteLogadoProfissional[] = [];
      data.forEach((item: any) => {
        const aprendente = new ViewAprendenteLogadoProfissional();
        aprendente.id = item.id;
        aprendente.nomeAprendente = item.nome_aprendente;
        aprendente.idResponsavel = item.id_responsavel;
        aprendente.nomeResponsavel = item.nome_responsavel;
        aprendente.telefone = item.telefone;
        aprendente.statusMatricula = item.status_matricula;
        aprendentes.push(aprendente);
      });
      console.log(aprendentes);
      return aprendentes;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar aprendentes');
      return [];
    }
  }
  async loadAprendentesPorProfissionalENome(
    nome: string,
  ): Promise<ViewAprendenteLogadoProfissional[]> {
    try {
      const idProfissional = this.useStoreProfissional.profissionalDetails?.id;
      const { data, error } = await supabase
        .from('vw_aprendentes_logado_profissional')
        .select('*')
        .eq('id_profissional', idProfissional)
        .ilike('nome_aprendente', `%${nome}%`);
      if (error) throw error;
      const aprendentes: ViewAprendenteLogadoProfissional[] = [];
      data.forEach((item: any) => {
        const aprendente = new ViewAprendenteLogadoProfissional();
        aprendente.id = item.id;
        aprendente.nomeAprendente = item.nome_aprendente;
        aprendente.idResponsavel = item.id_responsavel;
        aprendente.nomeResponsavel = item.nome_responsavel;
        aprendente.telefone = item.telefone;
        aprendente.statusMatricula = item.status_matricula;
        aprendentes.push(aprendente);
      });
      return aprendentes;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar aprendentes');
      return [];
    }
  }
  async buscarAprendentesPorNome(nome: string) {
    const idProfissional = this.useStoreProfissional.profissionalDetails?.id;
    const { data, error } = await supabase
      .from('vw_aprendentes_profissional_logado')
      .select('*')
      .eq('id_profissional', idProfissional)
      .ilike('nome_aprendente', `%${nome}%`);
    if (error) throw error;

    console.log(data);
    return data as Aprendente[];
  }

  async addAprendente(aprendente: Aprendente): Promise<string | undefined> {
    try {
      const { data, error } = await supabase
        .from('tb_aprendente')
        .insert([
          {
            nome_aprendente: aprendente.nomeAprendente,
            id_responsavel: aprendente.idResponsavel,
            nascimento: aprendente.nascimento,
            sexo: aprendente.sexo || '',
          },
        ])
        .select();
      if (error) throw error;
      return data[0].id;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao adicionar aprendente');
    }
  }

  async updateAprendente(aprendente: Aprendente): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_aprendente')
        .update({
          nome_aprendente: aprendente.nomeAprendente,
          nascimento: aprendente.nascimento,
          sexo: aprendente.sexo,
        })
        .eq('id', aprendente.id);
      if (error) throw error;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao atualizar aprendente');
    }
  }

  async addAprendenteComCorAgendamento(aprendente: Aprendente): Promise<string | undefined> {
    console.log(aprendente);
    try {
      const { data, error } = await supabase
        .from('tb_aprendente')
        .insert([
          {
            nome_aprendente: aprendente.nomeAprendente,
            id_responsavel: aprendente.idResponsavel,
            nascimento: aprendente.nascimento,
            sexo: aprendente.sexo,
            cor_agendamento: aprendente.corAgendamento,
          },
        ])
        .select();
      if (error) throw error;
      return data[0].id;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao adicionar aprendente com cor de agendamento');
    }
  }

  async updateAprendenteComCorAgendamento(aprendente: Aprendente): Promise<void> {
    console.log(aprendente);
    try {
      const { error } = await supabase
        .from('tb_aprendente')
        .update({
          nome_aprendente: aprendente.nomeAprendente,
          nascimento: aprendente.nascimento,
          sexo: aprendente.sexo,
          cor_agendamento: aprendente.corAgendamento,
        })
        .eq('id', aprendente.id);
      if (error) throw error;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao atualizar aprendente com cor de agendamento');
    }
  }

  async deleteAprendente(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('tb_aprendente').delete().eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao remover aprendente');
    }
  }
  async getAprendenteById(id: string): Promise<Aprendente | null> {
    try {
      const { data, error } = await supabase
        .from('tb_aprendente')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Aprendente;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar o aprendente');
      return null;
    }
  }
  // async buscarClientesPorNome(termo: string) {
  //   try {
  //     const { data, error } = await supabase
  //       .from('vw_aprendente_responsavel')
  //       .select('*')
  //       .or(
  //         `and(atendimento_proprio.eq.true,nome_responsavel.ilike.%${termo}%),nome_aprendente.ilike.%${termo}%`
  //       )

  //     if (error) throw error

  //     return data.map((item: any) => ({
  //       // id: item.id_aprendente ? item.id_aprendente : item.id_responsavel,
  //       id_responsavel: item.id_responsavel,
  //       id_aprendente: item.id_aprendente,
  //       nome: item.nome_aprendente ? item.nome_aprendente : item.nome_responsavel,
  //       responsavel: item.nome_responsavel,
  //       displayName: `Aprendente: ${item.nome_aprendente ? item.nome_aprendente :item.nome_responsavel } Responsavel: ${item.nome_responsavel}`
  //     }))
  //     // console.log(data)
  //   } catch (err: any) {
  //     this.showError(err.message || 'Erro ao buscar clientes')
  //     return []
  //   }
  // }
  async buscarClientesPorNome(termo: string) {
    try {
      const { data, error } = await supabase
        .from('vw_aprendentes_logado_profissional')
        .select('*')
        .eq('id_profissional', this.useStoreProfissional.profissionalDetails?.id)
        .or(`nome_aprendente.ilike.%${termo}%,nome_responsavel.ilike.%${termo}%`);

      if (error) throw error;

      console.log('Dados brutos da busca:', data);

      return data
        .map((item: any) => {
          // Sempre usa o id_aprendente
          const id = item.id_aprendente;
          if (!id) {
            console.error('Item sem id_aprendente:', item);
            return null;
          }
          const result = {
            id,
            id_responsavel: item.id_responsavel,
            id_aprendente: item.id_aprendente,
            nome: item.nome_aprendente || 'N/A',
            responsavel: item.nome_responsavel || 'N/A',
            displayName: `${item.nome_aprendente || 'N/A'} (Responsável: ${item.nome_responsavel || 'N/A'})`,
          };
          console.log('Item mapeado:', result);
          return result;
        })
        .filter((item: any) => item !== null);
    } catch (err: any) {
      console.error('Erro ao buscar clientes:', err);
      return [];
    }
  }

  async alternarStatusMatricula(id: string, status: boolean, motivo: string) {
    try {
      const { error } = await supabase
        .from('tb_aprendente')
        .update({ status_matricula: status, motivo_alternancia: motivo })
        .eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao alternar status da matrícula');
    }
  }
}
