import supabase from '/src/config/supabase'
import { useStoreProfissional } from '/src/stores/storeProfissional'
import { ContratoService } from '@/services/contratoService.ts'
import { DependenteService } from '@/services/DependenteService.ts'
import { DiasAtendimentoService } from '@/services/DiasAtendimentoContrato.ts'

import { useShowErrorMessage } from '/src/userCases/useShowErrorMessage'
import Cliente from '@/models/Cliente'

export class ClienteService {
  private showError: (msg: string) => void
  private readonly storeProfissional = useStoreProfissional()
  private contratoService = new ContratoService()
  private dependenteService = new DependenteService()
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

  async addCliente(cliente: any): Promise<void> {
    try {
      cliente.idProfissional = this.storeProfissional.profissionalDetails?.id || ''
      cliente.status = true
      const { error } = await supabase.from('tb_cliente').insert([
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
            status: cliente.status,
          },
        ])
        if (error) throw error


      if (cliente.dependentes?.length > 0) {
        for (const dependente of cliente.dependentes) {
          dependente.idCliente = cliente.id // Ajuste se necessário
          await this.dependenteService.addDependente(dependente)
        }
      }
      if (cliente.contrato) {
        const idContrato = await this.contratoService.addContrato(cliente.contrato)
        this.diasAtendimentoService.addDiasAtendimento(cliente.diasAtendimento, idContrato)
      }

    } catch (err: any) {
      this.showError(err.message || 'Erro ao adicionar cliente')
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

  async deleteCliente(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('tb_cliente').update({ status: false }).eq('id', id)

      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao remover cliente')
    }
  }
}
