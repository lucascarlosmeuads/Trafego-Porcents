
// Utilitários para padronizar timezone brasileiro
export const BRAZIL_TIMEZONE = 'America/Sao_Paulo'

// Obter data atual no timezone brasileiro
export const getBrazilDate = (): Date => {
  const now = new Date()
  const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }))
  console.log('🇧🇷 [TimezoneUtils] Data atual Brasil:', {
    utc: now.toISOString(),
    brazil: brazilTime.toISOString(),
    localString: brazilTime.toLocaleDateString('pt-BR')
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
