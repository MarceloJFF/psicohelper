import type Profissional from '@/models/Profissional.ts'

export default class Cliente {
  id: string = '';
  nomeCliente: string='';
  cpf: string ='';
  telefone1: string ='';
  telefone2: string = '';
  cep: string = '';
  logradouro: string='';
  cidade: string ='';
  estado: string = '';
  nascimento: string='';
  atendimentoProprio: boolea= false;
  sexo: string ='';
  tipoAtendimento: string = '';
  idProfissional: string ='';
  profissional?: Profissional;
  status: boolean =true;
}
