import type Cliente from '@/models/Responsavel'
import type Dependente from '@/models/Aprendente'
import type Profissional from '@/models/Profissional.ts'

export default interface Agendamento {
  id: string;
  titulo: string;
  dataAgendamento: Date;
  horarioInicio: string;
  duracao: number;
  clienteId: string;
  cliente?:Cliente;
  idDependente: string;
  dependente?:Dependente;
  idProfissional: string;
  profissional?:Profissional;
}
