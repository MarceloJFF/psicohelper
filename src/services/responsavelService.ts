import supabase from '/src/config/supabase'
import { useStoreProfissional } from '/src/stores/storeProfissional'
import { ContratoService } from '@/services/contratoService.ts'
import { AprendenteService } from '@/services/AprendenteService.ts'
import { DiasAtendimentoService } from '@/services/DiasAtendimentoContrato.ts'

import { useShowErrorMessage } from '/src/userCases/useShowErrorMessage'
import Responsavel from '@/models/Responsavel'

export class ClienteService {
  private showError: (msg: string) => void
  private readonly storeProfissional = useStoreProfissional()
  private contratoService = new ContratoService()
  private aprendenteService = new AprendenteService()
  private diasAtendimentoService= new DiasAtendimentoService();

  constructor() {
    this.showError = useShowErrorMessage().showError
  }

  async loadClientes(): Promise<Responsavel[]> {
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

  async addCliente(responsavel: any): Promise<void> {
    try {
      responsavel.idProfissional = this.storeProfissional.profissionalDetails?.id || ''
      responsavel.status = true
      const { data, error } = await supabase.from('tb_responsavel').insert([
          {
            nome_cliente: responsavel.nome,
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
        ]).select()

      if (error) throw error

      if (responsavel.dependentes?.length > 0) {
        for (const dependente of responsavel.dependentes) {
          dependente.idCliente = data[0].id; // Ajuste se necessário
          await this.aprendenteService.addDependente(dependente)
        }
      }
      if (responsavel.contrato) {
        console.log(responsavel)
        const idResponsavel = data[0].id;
        const idContrato = await this.contratoService.addContrato(responsavel.contrato,idResponsavel)
        this.diasAtendimentoService.addDiasAtendimento(responsavel.contrato.diasAtendimento, idContrato)
      }

    } catch (err: any) {
      this.showError(err.message || 'Erro ao adicionar cliente')
    }
  }
  async loadAprendentes(): Promise<any[]> {
    try {
      const idProfissional = this.storeProfissional.profissionalDetails?.id
      if (!idProfissional) {
        this.showError('Profissional não está autenticado')
        return []
      }

      const { data: responsaveis, error: erroClientes } = await supabase
        .from('tb_responsavel')
        .select('id, nome_cliente, telefone, atendimento_proprio')
        .eq('id_profissional', idProfissional)

      if (erroClientes) throw erroClientes
      if (!responsaveis || responsaveis.length === 0) {
        console.warn('Nenhum cliente encontrado')
        return []
      }

      const idsResponsaveis = responsaveis.map(c => c.id)

      const { data: aprendentes, error: erroAprendentes } = await supabase
        .from('tb_aprendente')
        .select('id, nome_dependente, id_responsavel')
        .in('id_responsavel', idsResponsaveis.length > 0 ? idsResponsaveis : [-1])

      if (erroAprendentes) throw erroAprendentes

      const listaFinal: any[] = []

      for (const responsavel of responsaveis) {
        if (responsavel.atendimento_proprio) {
          listaFinal.push({
            idAprendente: responsavel.id, // pode ser um identificador fictício ou gerar um UUID
            idResponsavel:responsavel.id,
            nomeAprendente: responsavel.nome,
            nomeResponsavel: responsavel.nome,
            telefoneResponsavel: responsavel.telefone,
            atendimentoProprio:responsavel.atendimento_proprio
          })
        } else {
          const dependentesDoCliente = aprendentes.filter(dep => dep.id_cliente === responsavel.id)
          for (const dep of dependentesDoCliente) {
            listaFinal.push({
              idAprendente: dep.id,
              nomeAprendente: dep.nome_aprendente,
              nomeResponsavel: responsavel.nome,
              telefoneResponsavel: responsavel.telefone,
              atendimentoProprio:responsavel.atendimento_proprio,
              idResponsavel:responsavel.id,

            })
          }
        }
      }

      console.log('Lista final de aprendentes formatada:', listaFinal)
      return listaFinal
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar aprendentes')
      console.error(err)
      return []
    }
  }



  async updateCliente(responsavel: Responsavel): Promise<void> {
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
          atendimento_proprio: responsavel.atendimentoProprio,
          sexo: responsavel.sexo,
          tipo_atendimento: responsavel.tipoAtendimento,
          status: responsavel.status,
        })
        .eq('id', responsavel.id)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao atualizar Responsavel')
    }
  }
  async inativarResponsavel(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_responsavel')
        .update({ status: false })
        .eq('id', id)

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

}
