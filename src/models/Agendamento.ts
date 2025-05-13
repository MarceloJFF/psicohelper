import type Cliente from '@/models/Responsavel'
import type Dependente from '@/models/Aprendente'
import type Profissional from '@/models/Profissional.ts'

export default class Agendamento {
  agendamento_id: string = ''
  titulo: string = ''
  dataAgendamento: Date = new Date()
  horarioInicio: string = ''
  duracao: number = 0
  clienteId: string = ''
  cliente?: Cliente
  idDependente: string = ''
  dependente?: Dependente
  idProfissional: string = ''
  profissional?: Profissional
  tipoAtendimento: 'Avulso' | 'Contrato' = 'Avulso'
  valorAtendimento?: number
  observacoes?: string
  idContrato?: string
}
