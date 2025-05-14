export default class DiasAtendimentoContrato {
  id: string = '';
  dia: string = '';
  inicio:string = '';
  fim:string = '';
  contratoId:string='';

  constructor(dia,inicio,fim) {
    this.dia = dia;
    this.inicio = inicio;
    this.fim = fim;
  }

}
