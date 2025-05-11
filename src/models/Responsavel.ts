import type Profissional from '@/models/Profissional.ts'

export default class Responsavel {
  id: string = '';
  nome: string='';
  cpf: string ='';
  telefone: string ='';
  telefone2: string = '';
  email: string = '';
  cep: string = '';
  logradouro: string='';
  cidade: string ='';
  estado: string = '';
  nascimento: string='';
  atendimentoProprio: boolean= false;
  sexo: string ='';
  tipoAtendimento: string = '';
  idProfissional: string ='';
  profissional?: Profissional;
  status: boolean =true;
}
