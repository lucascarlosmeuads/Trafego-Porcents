
export interface DateRange {
  startDate: Date
  endDate: Date
}

export function getDateRangeFromFilter(filterType: string, customStart?: string, customEnd?: string): DateRange {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (filterType) {
    case 'today':
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) // fim do dia
      }
    
    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      return {
        startDate: yesterday,
        endDate: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
      }
    
    case 'last7days':
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      return {
        startDate: sevenDaysAgo,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      }
    
    case 'last30days':
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      return {
        startDate: thirtyDaysAgo,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      }
    
    case 'custom':
      if (customStart && customEnd) {
        return {
          startDate: new Date(customStart),
          endDate: new Date(customEnd + 'T23:59:59')
        }
      }
      // fallback para hoje se datas customizadas não foram fornecidas
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      }
    
    default:
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      }
  }
}

export function isClienteInDateRange(cliente: any, dateRange: DateRange): boolean {
  if (!cliente.created_at) return false
  
  const clienteDate = new Date(cliente.created_at)
  return clienteDate >= dateRange.startDate && clienteDate <= dateRange.endDate
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  const start = startDate.toLocaleDateString('pt-BR')
  const end = endDate.toLocaleDateString('pt-BR')
  
  if (start === end) {
    return start
  }
  
  return `${start} - ${end}`
}
