
// Utilitários para padronizar timezone brasileiro
export const BRAZIL_TIMEZONE = 'America/Sao_Paulo'

// Obter data atual no timezone brasileiro
export const getBrazilDate = (): Date => {
  const now = new Date()
  
  // Usar Intl.DateTimeFormat para obter componentes da data no timezone brasileiro
  const formatter = new Intl.DateTimeFormat('en-CA', { 
    timeZone: BRAZIL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  
  const parts = formatter.formatToParts(now)
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '0')
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1 // Date constructor uses 0-based months
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '0')
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0')
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0')
  const second = parseInt(parts.find(p => p.type === 'second')?.value || '0')
  
  const brazilTime = new Date(year, month, day, hour, minute, second)
  
  console.log('🇧🇷 [TimezoneUtils] Data atual Brasil (corrigida):', {
    utc: now.toISOString(),
    brazil: brazilTime.toISOString(),
    localString: brazilTime.toLocaleDateString('pt-BR'),
    timezone: BRAZIL_TIMEZONE,
    components: { year, month: month + 1, day, hour, minute, second }
  })
  
  return brazilTime
}

// Converter data para string no formato YYYY-MM-DD (timezone brasileiro)
export const formatDateBrazil = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const formatted = `${year}-${month}-${day}`
  
  console.log('📅 [TimezoneUtils] Formatando data:', {
    input: date.toISOString(),
    output: formatted,
    timezone: BRAZIL_TIMEZONE
  })
  
  return formatted
}

// Obter data de hoje no timezone brasileiro
export const getTodayBrazil = (): string => {
  const today = getBrazilDate()
  return formatDateBrazil(today)
}

// Obter data de ontem no timezone brasileiro
export const getYesterdayBrazil = (): string => {
  const today = getBrazilDate()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  return formatDateBrazil(yesterday)
}

// Obter data de anteontem no timezone brasileiro
export const getDayBeforeYesterdayBrazil = (): string => {
  const today = getBrazilDate()
  const dayBeforeYesterday = new Date(today)
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)
  return formatDateBrazil(dayBeforeYesterday)
}

// Calcular período baseado no preset (timezone brasileiro)
export const getDateRangeFromPresetBrazil = (preset: string) => {
  const today = getBrazilDate()
  
  console.log('📊 [TimezoneUtils] Calculando período:', {
    preset,
    todayBrazil: formatDateBrazil(today)
  })
  
  switch (preset) {
    case 'today':
      const todayStr = formatDateBrazil(today)
      return {
        startDate: todayStr,
        endDate: todayStr
      }
    case 'yesterday':
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = formatDateBrazil(yesterday)
      return {
        startDate: yesterdayStr,
        endDate: yesterdayStr
      }
    case 'anteontem':
      const dayBeforeYesterday = new Date(today)
      dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)
      const anteOntemStr = formatDateBrazil(dayBeforeYesterday)
      return {
        startDate: anteOntemStr,
        endDate: anteOntemStr
      }
    case 'last_7_days':
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return {
        startDate: formatDateBrazil(sevenDaysAgo),
        endDate: formatDateBrazil(today)
      }
    case 'last_30_days':
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return {
        startDate: formatDateBrazil(thirtyDaysAgo),
        endDate: formatDateBrazil(today)
      }
    default:
      const defaultStr = formatDateBrazil(today)
      return {
        startDate: defaultStr,
        endDate: defaultStr
      }
  }
}

// Debug: Log detalhado de consulta de vendas
export const logVendasQuery = (startDate: string, endDate: string, context: string) => {
  console.log(`💰 [${context}] Query de vendas:`, {
    startDate,
    endDate,
    timezone: BRAZIL_TIMEZONE,
    currentTimeBrazil: getBrazilDate().toLocaleString('pt-BR', { timeZone: BRAZIL_TIMEZONE })
  })
}

// Debug: Log detalhado de vendas encontradas para auditoria
export const logVendasAuditoria = (
  startDate: string, 
  endDate: string, 
  vendasCliente: any[], 
  vendasTodosClientes: any[], 
  context: string
) => {
  console.log(`🔍 [${context}] === AUDITORIA DETALHADA DE VENDAS ===`)
  console.log(`📅 Período: ${startDate} até ${endDate}`)
  
  // Log vendas_cliente
  if (vendasCliente && vendasCliente.length > 0) {
    console.log(`💰 VENDAS_CLIENTE encontradas: ${vendasCliente.length}`)
    vendasCliente.forEach((venda, index) => {
      console.log(`  ${index + 1}. Email: ${venda.email_cliente} | Data: ${venda.data_venda} | Valor: R$ ${venda.valor_venda}`)
    })
    const totalVendasCliente = vendasCliente.reduce((sum, venda) => sum + (venda.valor_venda || 0), 0)
    console.log(`💵 Total vendas_cliente: R$ ${totalVendasCliente.toFixed(2)}`)
  } else {
    console.log(`❌ VENDAS_CLIENTE: Nenhuma venda encontrada`)
  }
  
  // Log todos_clientes
  if (vendasTodosClientes && vendasTodosClientes.length > 0) {
    console.log(`👥 TODOS_CLIENTES encontrados: ${vendasTodosClientes.length}`)
    vendasTodosClientes.forEach((cliente, index) => {
      console.log(`  ${index + 1}. Email: ${cliente.email_cliente} | Data: ${cliente.data_venda} | Valor Inicial: R$ ${cliente.valor_venda_inicial || 0} | Created: ${cliente.created_at}`)
    })
    const totalTodosClientes = vendasTodosClientes.reduce((sum, cliente) => sum + (cliente.valor_venda_inicial || 0), 0)
    console.log(`💵 Total todos_clientes: R$ ${totalTodosClientes.toFixed(2)}`)
  } else {
    console.log(`❌ TODOS_CLIENTES: Nenhum cliente encontrado`)
  }
  
  const totalGeral = (vendasCliente?.reduce((sum, venda) => sum + (venda.valor_venda || 0), 0) || 0) +
                     (vendasTodosClientes?.reduce((sum, cliente) => sum + (cliente.valor_venda_inicial || 0), 0) || 0)
  
  console.log(`🎯 TOTAL GERAL: R$ ${totalGeral.toFixed(2)}`)
  console.log(`🔍 [${context}] === FIM AUDITORIA ===`)
  
  return {
    vendasClienteCount: vendasCliente?.length || 0,
    todosClientesCount: vendasTodosClientes?.length || 0,
    totalValue: totalGeral,
    totalCount: (vendasCliente?.length || 0) + (vendasTodosClientes?.length || 0)
  }
}
