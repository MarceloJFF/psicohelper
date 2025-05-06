import type Profissional from '@/models/Profissional.ts'

export default interface Cliente {
  id: string;
  nomeCliente: string;
  cpf: string;
  telefone1: string;
  telefone2: string;
  cep: string;
  logradouro: string;
  cidade: string;
  estado: string;
  nascimento: string;
  atendimentoProprio: boolean;
  sexo: number;
  tipoAtendimento: string;
  idProfissional: string;
  profissional?: Profissional;
  status: boolean;
}
