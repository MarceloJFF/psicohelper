import type Documento from '@/models/Documento.ts'
import type Sessao from '@/models/Sessao.ts'

export default interface Configuracao {
  id: string;
  tipoArquivo: string;
  tamanho: number;
  arquivo: string;
  idDocumento:string;
  documento?:Documento;
  idSessao:string;
  sessao?:Sessao;
}
