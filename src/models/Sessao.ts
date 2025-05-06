export default interface Sessao {
  id: string;
  preSessao: string;
  queixas: string;
  evolução:string;
  habilidadesTrabalhadas: string;
  futurasAcoes: string;
  idAnexo: string;
  anexo:?Anexo;
  resumo: string;
  idAgendamento: string;
  fotos: string;
}
