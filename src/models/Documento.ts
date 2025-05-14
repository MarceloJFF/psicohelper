import type Cliente from '@/models/Responsavel'
import type Dependente from '@/models/Aprendente'
import type Pasta from '@/models/Pasta.ts'

export default interface Documento {
  id: string;
  id_documento: string;
  nome: string;
  url: string;
  storage_path: string;
  dataEnvio: Date;
  idPasta: string;
  pasta?: Pasta;
  idCliente: string;
  cliente?: Cliente;
  idDependente: string;
  Dependente?: Dependente;
}
