export default interface Configuracao {
  id: string;
  valor: number;
  formaPagamento: string;
  comprovante: string;
  idSessao: string;
  Sessao:? Sessao;
  pago: boolean;
}
