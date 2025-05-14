import supabase from '@/config/supabase'
import { useStoreProfissional } from '@/stores/storeProfissional'
import { ContratoService } from '@/services/contratoService'
import { AprendenteService } from '@/services/AprendenteService'
import { DiasAtendimentosContratoService } from '@/services/DiasAtendimentosContratoService'

import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'
import Responsavel from '@/models/Responsavel'

export class ResponsavelService {
  private showError: (msg: string) => void
  private readonly storeProfissional = useStoreProfissional()
  private contratoService = new ContratoService()
  private aprendenteService = new AprendenteService()
  private diasAtendimentoService = new DiasAtendimentosContratoService()

  constructor() {
    this.showError = useShowErrorMessage().showError
  }

  async loadResponsaveis(): Promise<Responsavel[]> {
    try {
      const idProfissional = this.storeProfissional.profissionalDetails?.id
      if (!idProfissional) {
        this.showError('Profissional não está autenticado')
        return []
      }

      const { data, error } = await supabase
        .from('tb_responsavel')
        .select('*')
        .eq('id_profissional', idProfissional)
      if (error) throw error
      return data as Responsavel[]
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar responsaveis')
      return []
    }
  }

  async loadResponsaveisGerenciarClientes(): Promise<Responsavel[]> {
    try {
      const idProfissional = this.storeProfissional.profissionalDetails?.id
      if (!idProfissional) {
        this.showError('Profissional não está autenticado')
        return []
      }

      const { data, error } = await supabase
        .from('tb_responsavel')
        .select('*')
        .eq('id_profissional', idProfissional)
      if (error) throw error
      const responsaveis: Responsavel[] = []
      
      for (const responsavel of data) {

        responsaveis.push(this.mapResponsavel(responsavel))
      }
      return responsaveis
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar responsaveis')
      return []
    }
  }

  mapResponsavel(data: any): Responsavel {
    const responsavel = new Responsavel();
    responsavel.id = data.id;
    responsavel.nome = data.nome;
    responsavel.cpf = data.cpf;
    responsavel.telefone = data.telefone;
    responsavel.nascimento = data.nascimento;
    responsavel.sexo = data.sexo;
    responsavel.idProfissional = data.id_profissional;
    responsavel.email = data.email;
    // Adicione outros campos conforme necessário
    return responsavel;
  }
  async addResponsavelGerenciarClientes(responsavel: Responsavel): Promise<void> {
    try {
      const idProfissional = this.storeProfissional.profissionalDetails?.id

      const { error } = await supabase.from('tb_responsavel').insert({
        nome: responsavel.nome,
        cpf: responsavel.cpf,
        telefone: responsavel.telefone,
        nascimento: responsavel.nascimento,
        sexo: responsavel.sexo,
        email: responsavel.email,
        id_profissional: idProfissional,
      }).select()

      if (error) throw error
    } catch (err: any) {  
      this.showError(err.message || 'Erro ao adicionar responsavel')
    }
  } 
  

  async updateResponsavelGerenciarClientes(responsavel: Responsavel): Promise<void> {
    try {
      const { error } = await supabase.from('tb_responsavel').update({
        nome: responsavel.nome,
        cpf: responsavel.cpf,
        telefone: responsavel.telefone,
        nascimento: responsavel.nascimento,
        sexo: responsavel.sexo,
        email: responsavel.email,
        
      }).eq('id', responsavel.id)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao atualizar responsavel')  
    }
  }


  async addResponsavel(responsavel: any): Promise<void> {
    try {
      responsavel.idProfissional = this.storeProfissional.profissionalDetails?.id || ''
      responsavel.status = true
      console.log(responsavel)
      const { data, error } = await supabase.from('tb_responsavel').insert([
          {
            nome: responsavel.nome,
            cpf: responsavel.cpf,
            telefone: responsavel.telefone,
            telefone2: responsavel.telefone2,
            cep: responsavel.cep,
            logradouro: responsavel.logradouro,
            cidade: responsavel.cidade,
            estado: responsavel.estado,
            nascimento: responsavel.nascimento,
            atendimento_proprio: responsavel.atendimentoProprio,
            sexo: responsavel.sexo,
            tipo_atendimento: responsavel.tipoAtendimento,
            id_profissional: responsavel.idProfissional,
            email: responsavel.email,
            status: responsavel.status,
          },
        ])
        .select()

      if (error) throw error
      let idAprendente: string | undefined = undefined;
      if (responsavel.aprendentes?.length > 0 && responsavel.atendimento_proprio!=true) {
        for (const aprendente of responsavel.aprendentes) {
          aprendente.idResponsavel = data[0].id // Ajuste se necessário
          idAprendente = await this.aprendenteService.addAprendente(aprendente)
          if (!idAprendente) {
            throw new Error('Erro ao adicionar aprendente')
          }
        }
      }
      if (responsavel.contrato) {
        console.log(responsavel)
        const idResponsavel = data[0].id;
        console.log("gerando contrato")
        console.log("Responsavel"+ idResponsavel,"Aprendente"+ idAprendente)
        if (idAprendente) {
          const idContrato = await this.contratoService.addContrato(responsavel.contrato, idResponsavel, idAprendente)
          if (idContrato) {
            this.diasAtendimentoService.addDiasAtendimento(responsavel.contrato.diasAtendimento, idContrato)
          }
        }
      }
    } catch (err: any) {
      this.showError(err.message || 'Erro ao adicionar cliente')
    }
  }

  async loadResponsaveisAprendentesEAprendentes(): Promise<any[]> {
    return [];
  }


  async loadAprendentes(): Promise<any[]> {
    try {
      const idProfissional = this.storeProfissional.profissionalDetails?.id;
      if (!idProfissional) {
        this.showError('Profissional não está autenticado');
        return [];
      }

      // Agora fazemos apenas UMA consulta à view
      const { data, error } = await supabase
        .from('vw_aprendentes_com_responsaveis')
        .select('*')
        .eq('id_profissional', idProfissional)
        .order('nome_exibicao', { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) {
        console.warn('Nenhum aprendente/responsável encontrado');
        return [];
      }

      // Formatamos os dados conforme necessário

      const listaFinal = data.map(item => ({
        idAprendente: item.atendimento_proprio ? item.id_responsavel : item.id_aprendente,
        idResponsavel: item.id_responsavel,
        nomeAprendente: item.atendimento_proprio ? item.nome_responsavel : item.nome_aprendente,
        nomeResponsavel: item.nome_responsavel,
        telefoneResponsavel: item.telefone_responsavel,
      }));

      console.log('Lista final de aprendentes formatada:', listaFinal);
      return listaFinal;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar aprendentes');
      console.error(err);
      return [];
    }
  }

  async updateResponsavel(responsavel: Responsavel): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_responsavel')
        .update({
          nome: responsavel.nome,
          cpf: responsavel.cpf,
          telefone: responsavel.telefone,
          telefone2: responsavel.telefone2 || '',
          cep: responsavel.cep,
          logradouro: responsavel.logradouro,
          cidade: responsavel.cidade,
          estado: responsavel.estado,
          nascimento: responsavel.nascimento,
          sexo: responsavel.sexo,
          email: responsavel.email,
        })
        .eq('id', responsavel.id)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao atualizar Responsavel')
    }
  }
  async inativarResponsavel(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('tb_responsavel').update({ status: false }).eq('id', id)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao inativar Responsavel')
    }
  }

  async getResponsavelById(id: string): Promise<Responsavel | null> {
    try {
      const { data, error } = await supabase
        .from('tb_responsavel')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return data as Responsavel
    } catch (err: any) {
      this.showError(err.message || 'Erro ao buscar responsavel')
      return null
    }
  }

  async checkDuplicateCPF(cpf: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('tb_responsavel')
        .select('id')
        .eq('cpf', cpf)
        .eq('status', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is the error code for no rows returned
        throw error
      }

      return !!data // Returns true if a responsavel with this CPF exists
    } catch (err: any) {
      this.showError(err.message || 'Erro ao verificar CPF duplicado')
      return false
    }
  }
}
