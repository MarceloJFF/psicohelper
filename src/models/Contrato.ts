import  Profissional from '@/models/Profissional.ts'
import type DiasAtendimentoContrato from '@/models/DiasAtendimentoContrato.ts'

export default class Contrato {
  idContrato: string = ''
  valorMensal: number = 0.0
  duracao: number = 0         // Duração em dias (ou unidades que desejar)
  vencimento: Date = (() => {
    const data = new Date()
    data.setDate(data.getDate() + 30)
    return data
  })()
  descricaoServico: string = ''
  idDiasAtendimento:string = ''
  diasAtendimento?:DiasAtendimentoContrato[]
  idResponsavel: string = ''
  idProfissional: string = ''
  profissional?: Profissional
  cadastrado: boolean = false;
  descricao: string ='';

}
