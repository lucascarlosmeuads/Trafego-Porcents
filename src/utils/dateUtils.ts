export const addBusinessDays = (startDate: Date, businessDays: number): Date => {
  const result = new Date(startDate)
  let daysAdded = 0
  
  while (daysAdded < businessDays) {
    result.setDate(result.getDate() + 1)
    // Se não for fim de semana (0 = domingo, 6 = sábado)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      daysAdded++
    }
  }
  
  return result
}

export const calculateDataLimite = (dataVenda: string): string => {
  if (!dataVenda) return ''
  
  try {
    const venda = new Date(dataVenda)
    const limite = addBusinessDays(venda, 15)
    return limite.toISOString().split('T')[0] // Formato YYYY-MM-DD
  } catch (error) {
    console.error('Erro ao calcular data limite:', error)
    return ''
  }
}

export const isDataLimiteVencida = (dataLimite: string): boolean => {
  if (!dataLimite) return false
  
  try {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0) // Reset das horas para comparação apenas de data
    
    const limite = new Date(dataLimite)
    limite.setHours(0, 0, 0, 0)
    
    return hoje > limite
  } catch (error) {
    console.error('Erro ao verificar data limite:', error)
    return false
  }
}

export const isStatusEntregue = (status: string): boolean => {
  if (!status) return false
  
  const statusLower = status.toLowerCase().trim()
  return statusLower === 'no ar' || statusLower === 'otimização'
}

// Nova função para calcular dias úteis entre duas datas
export const getBusinessDaysBetween = (startDate: Date, endDate: Date): number => {
  let count = 0
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    // Se não for fim de semana (0 = domingo, 6 = sábado)
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      count++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return count
}

// Nova função para gerar mensagem dinâmica da data limite
export const getDataLimiteMensagem = (dataLimite: string, statusCampanha: string) => {
  if (!dataLimite) return { texto: '-', estilo: 'text-muted-foreground' }
  
  try {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const limite = new Date(dataLimite)
    limite.setHours(0, 0, 0, 0)
    
    // Se status for "No Ar" ou "Otimização" - campanha cumprida
    if (isStatusEntregue(statusCampanha)) {
      return {
        texto: '✅ Cumprido',
        estilo: 'bg-green-100 text-green-800 border border-green-300 px-2 py-1 rounded font-medium'
      }
    }
    
    // Comparar datas
    if (hoje < limite) {
      // Ainda dentro do prazo - calcular dias restantes
      const diasRestantes = getBusinessDaysBetween(hoje, limite) - 1 // -1 para não contar o dia atual
      
      if (diasRestantes === 0) {
        return {
          texto: '📍 Último dia para entrega',
          estilo: 'text-orange-600 font-bold'
        }
      }
      
      return {
        texto: `⏳ Faltam ${diasRestantes} dias úteis`,
        estilo: 'text-blue-600 font-medium'
      }
    } else if (hoje.getTime() === limite.getTime()) {
      // Hoje é o último dia
      return {
        texto: '📍 Último dia para entrega',
        estilo: 'text-orange-600 font-bold'
      }
    } else {
      // Atrasado - calcular dias de atraso
      const diasAtraso = getBusinessDaysBetween(limite, hoje) - 1 // -1 para não contar o dia limite
      
      return {
        texto: `❌ Atrasado em ${diasAtraso} dias úteis`,
        estilo: 'text-red-600 font-bold'
      }
    }
  } catch (error) {
    console.error('Erro ao calcular mensagem da data limite:', error)
    return { texto: '-', estilo: 'text-muted-foreground' }
  }
}

// Manter função antiga para compatibilidade (deprecated)
export const getDataLimiteStyle = (dataLimite: string, statusCampanha: string) => {
  if (!dataLimite) return 'text-muted-foreground'
  
  const vencida = isDataLimiteVencida(dataLimite)
  const entregue = isStatusEntregue(statusCampanha)
  
  if (!vencida) {
    // Dentro do prazo - normal
    return 'text-foreground'
  }
  
  if (vencida && entregue) {
    // Vencida mas entregue - verde claro
    return 'bg-green-100 text-green-800 border border-green-300 px-2 py-1 rounded'
  }
  
  if (vencida && !entregue) {
    // Vencida e não entregue - texto vermelho
    return 'text-red-600 font-medium'
  }
  
  return 'text-foreground'
}

// Função auxiliar para converter diferentes formatos de data para Date object
const parseDate = (dateInput: string | Date | null | undefined): Date | null => {
  if (!dateInput) return null
  
  try {
    // Se já é um objeto Date
    if (dateInput instanceof Date) {
      return isNaN(dateInput.getTime()) ? null : dateInput
    }
    
    // Se é string, tentar diferentes formatos
    if (typeof dateInput === 'string') {
      const trimmed = dateInput.trim()
      if (trimmed === '') return null
      
      // Formato YYYY-MM-DD (mais comum do banco)
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const date = new Date(trimmed + 'T00:00:00.000Z')
        return isNaN(date.getTime()) ? null : date
      }
      
      // Tentar parse normal
      const date = new Date(trimmed)
      return isNaN(date.getTime()) ? null : date
    }
    
    return null
  } catch (error) {
    console.error('Erro ao fazer parse da data:', error, 'Input:', dateInput)
    return null
  }
}

// Nova função para painel do gestor - calcula e formata exibição da data limite
export const getDataLimiteDisplayForGestor = (dataVenda: string, created_at: string | null, statusCampanha: string): { texto: string, classeCor: string } => {
  console.log(`🔍 [dateUtils] Analisando dados:`, {
    dataVenda,
    created_at,
    statusCampanha,
    dataVendaType: typeof dataVenda,
    createdAtType: typeof created_at
  })
  
  // Se status for "No Ar" ou "Otimização" - campanha cumprida
  if (isStatusEntregue(statusCampanha)) {
    console.log(`✅ [dateUtils] Status entregue detectado: ${statusCampanha}`)
    return {
      texto: '✅ Cumprido',
      classeCor: 'bg-green-100 text-green-800 border-green-300'
    }
  }
  
  // Determinar a data base para cálculo (data_venda ou created_at como fallback)
  let dataBase: Date | null = null
  let fonteDados = ''
  
  // Tentar data_venda primeiro
  if (dataVenda) {
    dataBase = parseDate(dataVenda)
    if (dataBase) {
      fonteDados = 'data_venda'
      console.log(`📅 [dateUtils] Usando data_venda: ${dataVenda} -> ${dataBase.toISOString()}`)
    }
  }
  
  // Fallback para created_at se data_venda não funcionou
  if (!dataBase && created_at) {
    dataBase = parseDate(created_at)
    if (dataBase) {
      fonteDados = 'created_at'
      console.log(`📅 [dateUtils] Fallback para created_at: ${created_at} -> ${dataBase.toISOString()}`)
    }
  }
  
  if (!dataBase) {
    console.log('⚠️ [dateUtils] Nenhuma data base válida encontrada')
    return {
      texto: 'Sem data base',
      classeCor: 'text-gray-400'
    }
  }
  
  try {
    // Calcular data limite (15 dias úteis após a data base)
    const dataLimite = addBusinessDays(dataBase, 15)
    console.log(`📅 [dateUtils] Data limite calculada (${fonteDados} + 15 dias úteis): ${dataLimite.toISOString()}`)
    
    // Data de hoje (sem horas)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    // Data limite sem horas
    const limiteComparar = new Date(dataLimite)
    limiteComparar.setHours(0, 0, 0, 0)
    
    console.log(`📊 [dateUtils] Comparação: hoje=${hoje.toISOString()} vs limite=${limiteComparar.toISOString()}`)
    
    // Verificar se já passou da data limite
    if (hoje > limiteComparar) {
      // Atrasado - calcular dias de atraso
      const diasAtraso = getBusinessDaysBetween(limiteComparar, hoje) - 1
      console.log(`🚨 [dateUtils] Atrasado: ${diasAtraso} dias úteis`)
      
      return {
        texto: `🚨 Atrasado há ${diasAtraso} dias úteis`,
        classeCor: 'text-red-600 font-bold'
      }
    }
    
    // Dentro do prazo - calcular dias restantes
    const diasRestantes = getBusinessDaysBetween(hoje, limiteComparar) - 1
    console.log(`⏳ [dateUtils] Dias restantes: ${diasRestantes}`)
    
    // Formatação conforme regras
    if (diasRestantes > 5) {
      return {
        texto: `🟢 Faltam ${diasRestantes} dias úteis`,
        classeCor: 'text-green-600 font-medium'
      }
    } else if (diasRestantes >= 1) {
      return {
        texto: `🟠 Atenção: ${diasRestantes} dias úteis`,
        classeCor: 'text-amber-600 font-bold'
      }
    } else {
      return {
        texto: '🔴 Último dia!',
        classeCor: 'text-orange-600 font-bold'
      }
    }
    
  } catch (error) {
    console.error('❌ [dateUtils] Erro ao calcular exibição da data limite:', error)
    return {
      texto: 'Erro de cálculo',
      classeCor: 'text-gray-400'
    }
  }
}

// Nova função para painel do admin - calcula e formata exibição da data limite
export const getDataLimiteDisplayForAdmin = (dataVenda: string, created_at: string | null, statusCampanha: string): { texto: string, classeCor: string } => {
  console.log(`🔍 [dateUtils] Admin - Analisando dados:`, {
    dataVenda,
    created_at,
    statusCampanha,
    dataVendaType: typeof dataVenda,
    createdAtType: typeof created_at
  })
  
  // Se status for "No Ar" ou "Otimização" - campanha cumprida
  if (isStatusEntregue(statusCampanha)) {
    console.log(`✅ [dateUtils] Admin - Status entregue detectado: ${statusCampanha}`)
    return {
      texto: '✅ Cumprido',
      classeCor: 'bg-green-100 text-green-800 border-green-300'
    }
  }
  
  // Determinar a data base para cálculo (data_venda ou created_at como fallback)
  let dataBase: Date | null = null
  let fonteDados = ''
  
  // Tentar data_venda primeiro
  if (dataVenda) {
    dataBase = parseDate(dataVenda)
    if (dataBase) {
      fonteDados = 'data_venda'
      console.log(`📅 [dateUtils] Admin - Usando data_venda: ${dataVenda} -> ${dataBase.toISOString()}`)
    }
  }
  
  // Fallback para created_at se data_venda não funcionou
  if (!dataBase && created_at) {
    dataBase = parseDate(created_at)
    if (dataBase) {
      fonteDados = 'created_at'
      console.log(`📅 [dateUtils] Admin - Fallback para created_at: ${created_at} -> ${dataBase.toISOString()}`)
    }
  }
  
  if (!dataBase) {
    console.log('⚠️ [dateUtils] Admin - Nenhuma data base válida encontrada')
    return {
      texto: 'Sem data base',
      classeCor: 'text-gray-400'
    }
  }
  
  try {
    // Calcular data limite (15 dias úteis após a data base)
    const dataLimite = addBusinessDays(dataBase, 15)
    console.log(`📅 [dateUtils] Admin - Data limite calculada (${fonteDados} + 15 dias úteis): ${dataLimite.toISOString()}`)
    
    // Data de hoje (sem horas)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    // Data limite sem horas
    const limiteComparar = new Date(dataLimite)
    limiteComparar.setHours(0, 0, 0, 0)
    
    console.log(`📊 [dateUtils] Admin - Comparação: hoje=${hoje.toISOString()} vs limite=${limiteComparar.toISOString()}`)
    
    // Verificar se já passou da data limite
    if (hoje > limiteComparar) {
      // Atrasado - calcular dias de atraso
      const diasAtraso = getBusinessDaysBetween(limiteComparar, hoje) - 1
      console.log(`🚨 [dateUtils] Admin - Atrasado: ${diasAtraso} dias úteis`)
      
      return {
        texto: `🚨 Atrasado há ${diasAtraso} dias úteis`,
        classeCor: 'text-red-600 font-bold'
      }
    }
    
    // Dentro do prazo - calcular dias restantes
    const diasRestantes = getBusinessDaysBetween(hoje, limiteComparar) - 1
    console.log(`⏳ [dateUtils] Admin - Dias restantes: ${diasRestantes}`)
    
    // Formatação conforme regras
    if (diasRestantes > 5) {
      return {
        texto: `🟢 Faltam ${diasRestantes} dias úteis`,
        classeCor: 'text-green-600 font-medium'
      }
    } else if (diasRestantes >= 1) {
      return {
        texto: `🟠 Atenção: ${diasRestantes} dias úteis`,
        classeCor: 'text-amber-600 font-bold'
      }
    } else {
      return {
        texto: '🔴 Último dia!',
        classeCor: 'text-orange-600 font-bold'
      }
    }
    
  } catch (error) {
    console.error('❌ [dateUtils] Admin - Erro ao calcular exibição da data limite:', error)
    return {
      texto: 'Erro de cálculo',
      classeCor: 'text-gray-400'
    }
  }
}
