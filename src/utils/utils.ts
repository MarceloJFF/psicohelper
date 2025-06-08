
// Function to get date range for last 30 days
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
