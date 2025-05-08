import supabase from '/src/config/supabase'
import { useStoreProfissional } from '/src/stores/storeProfissional'
import { ContratoService } from '@/services/contratoService.ts'
import { AprendenteService } from '@/services/AprendenteService.ts'
import { DiasAtendimentoService } from '@/services/DiasAtendimentosContratoService.ts'

import { useShowErrorMessage } from '/src/userCases/useShowErrorMessage'
import Cliente from '@/models/Cliente'

export class ClienteService {
  private showError: (msg: string) => void
  private readonly storeProfissional = useStoreProfissional()
  private contratoService = new ContratoService()
  private aprendenteService = new AprendenteService()
  private diasAtendimentoService= new DiasAtendimentoService();

  constructor() {
    this.showError = useShowErrorMessage().showError
  }

  async loadClientes(): Promise<Cliente[]> {
    try {
      const idProfissional = this.storeProfissional.profissionalDetails?.id
      if (!idProfissional) {
        this.showError('Profissional não está autenticado')
        return []
      }

      const { data, error } = await supabase
        .from('tb_cliente')
        .select('*')
        .eq('id_profissional', idProfissional)

      if (error) throw error

      return data as Cliente[]
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar clientes')
      return []
    }
  }
  async getContratosPorResponsavel(idResponsavel: string) {
    const idProfissional = this.storeProfissional.profissionalDetails?.id || ''
    const { data, error } = await supabase
      .from('tb_contrato')
      .select('*')
      .eq('id_cliente', idResponsavel)
      .eq('id_profissional', idProfissional).select()
  console.log(data)
    if (error) throw error
    return data
  }

  async addCliente(cliente: any): Promise<void> {
    try {
      cliente.idProfissional = this.storeProfissional.profissionalDetails?.id || ''
      cliente.status = true
      const { data, error } = await supabase.from('tb_cliente').insert([
          {
            nome_cliente: cliente.nome,
            cpf: cliente.cpf,
            telefone: cliente.telefone,
            telefone2: cliente.telefone2,
            cep: cliente.cep,
            logradouro: cliente.logradouro,
            cidade: cliente.cidade,
            estado: cliente.estado,
            nascimento: cliente.nascimento,
            atendimento_proprio: cliente.atendimentoProprio,
            sexo: cliente.sexo,
            tipo_atendimento: cliente.tipoAtendimento,
            id_profissional: cliente.idProfissional,
            email: cliente.email,
            status: cliente.status,
          },
        ]).select()

      if (error) throw error
      let idContrato;
      if (cliente.contrato) {
        const idCliente = data[0].id;
         idContrato = await this.contratoService.addContrato(cliente.contrato,idCliente)
        this.diasAtendimentoService.addDiasAtendimento(cliente.contrato.diasAtendimento, idContrato)
      }
      if (cliente.dependentes?.length > 0) {
        for (const dependente of cliente.dependentes) {
          dependente.idCliente = data[0].id; // Ajuste se necessário
          const dependenteId = await this.aprendenteService.addDependente(dependente)
          await this.contratoService.adicionarAprendenteAoContrato(idContrato, dependenteId)
        }
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

      const { data: clientes, error: erroClientes } = await supabase
        .from('tb_cliente')
        .select('id, nome_cliente, telefone, atendimento_proprio')
        .eq('id_profissional', idProfissional)

      if (erroClientes) throw erroClientes
      if (!clientes || clientes.length === 0) {
        console.warn('Nenhum cliente encontrado')
        return []
      }

      const idsClientes = clientes.map(c => c.id)

      const { data: aprendentes, error: erroAprendentes } = await supabase
        .from('tb_aprendente')
        .select('id, nome_dependente, id_cliente')
        .in('id_cliente', idsClientes.length > 0 ? idsClientes : [-1])

      if (erroAprendentes) throw erroAprendentes

      const listaFinal: any[] = []

      for (const cliente of clientes) {
        if (cliente.atendimento_proprio) {
          listaFinal.push({
            idAprendente: '', // pode ser um identificador fictício ou gerar um UUID
            idResponsavel:cliente.id,
            nomeAprendente: cliente.nome_cliente,
            nomeResponsavel: cliente.nome_cliente,
            telefoneResponsavel: cliente.telefone,
            atendimentoProprio:cliente.atendimento_proprio
          })
        } else {
          const dependentesDoCliente = aprendentes.filter(dep => dep.id_cliente === cliente.id)
          for (const dep of dependentesDoCliente) {
            listaFinal.push({
              idAprendente: dep.id,
              nomeAprendente: dep.nome_dependente,
              nomeResponsavel: cliente.nome_cliente,
              telefoneResponsavel: cliente.telefone,
              atendimentoProprio:cliente.atendimento_proprio,
              idResponsavel:cliente.id,

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



  async updateCliente(cliente: Cliente): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_cliente')
        .update({
          nome_cliente: cliente.nomeCliente,
          cpf: cliente.cpf,
          telefone: cliente.telefone,
          telefone2: cliente.telefone2,
          cep: cliente.cep,
          logradouro: cliente.logradouro,
          cidade: cliente.cidade,
          estado: cliente.estado,
          nascimento: cliente.nascimento,
          atendimento_proprio: cliente.atendimentoProprio,
          sexo: cliente.sexo,
          tipo_atendimento: cliente.tipoAtendimento,
          status: cliente.status,
        })
        .eq('id', cliente.id)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao atualizar cliente')
    }
  }
  async inativarCliente(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_cliente')
        .update({ status: false })
        .eq('id', id)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao inativar cliente')
    }
  }


  async deleteCliente(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('tb_cliente').update({ status: false }).eq('id', id)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao remover cliente')
    }
  }
  async getClienteById(id: string): Promise<Cliente | null> {
    try {
      const { data, error } = await supabase
        .from('tb_cliente')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return data as Cliente
    } catch (err: any) {
      this.showError(err.message || 'Erro ao buscar cliente')
      return null
    }
  }

}
