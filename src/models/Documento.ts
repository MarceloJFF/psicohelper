import type Cliente from '@/models/Cliente.ts'
import type Dependente from '@/models/Dependente.ts'
import type Pasta from '@/models/Pasta.ts'

export default interface Documento {
  id: string;
  nome: string;
  url: string;
  dataEnvio: Date;
  idPasta: string;
  pasta?: Pasta;
  idCliente: string;
  cliente?: Cliente;
  idDependente: string;
  Dependente?: Dependente;
}
