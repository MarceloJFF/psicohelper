
// Function to get date range for last 30 days
import supabase from '@/config/supabase'

export function getDateRangeForPeriod(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return { start, end };
  }

export function formatarData(dataStr: string): string {
  const [data] = dataStr.split('T'); // Pega só a parte da data
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export  async function buscarAgendamentoProximoDoAprendente(idAprendente: string): any {
  if(!idAprendente) {
    throw new Error('ID do Aprendente não pode ser vazio');
  }
  const { data, error } = await supabase
    .rpc('buscar_proximo_agendamento_aprendente', {
      id_aprendente_input: idAprendente  // substitua pelo ID real
    });
  if(error) throw error;

  return data[0] || null; // Retorna o primeiro agendamento ou null se não houver
}

export async function contarSessoesDoAprendente(idAprendente:string){
  const { data, error } = await supabase
    .rpc('contar_sessoes_aprendente', {
      id_aprendente_input: idAprendente
    })
  if (error) {
    throw  error;
  }
  return data; // Retorna a contagem de sessões ou 0 se não houver}
}
