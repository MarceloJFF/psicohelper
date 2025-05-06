import type Cliente from '@/models/Cliente.ts'
import type Profissional from '@/models/Profissional.ts'

export default interface Contrato {
  idContrato: string;
  valorMensal: number;
  duracao: bigint;
  vencimento: string;
  descricaoServico: string
  idCliente: string;
  cliente?:Cliente;
  idProfissional: string;
  profissional?:Profissional;
}
