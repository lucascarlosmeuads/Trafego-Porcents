
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

// Função melhorada para o painel do gestor
export const getDataLimiteDisplayForGestor = (dataVenda: string | null): { texto: string; estilo: string } => {
  console.log('📊 [getDataLimiteDisplayForGestor] Input:', dataVenda)
  
  if (!dataVenda || dataVenda.trim() === '') {
    console.log('❌ [getDataLimiteDisplayForGestor] Sem data de venda')
    return {
      texto: '⚠️ Sem data de venda',
      estilo: 'bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium border border-orange-300'
    }
  }

  try {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    // Melhorar parsing da data - aceitar diferentes formatos
    let venda: Date
    
    // Se for timestamp com timezone
    if (dataVenda.includes('T') || dataVenda.includes('+')) {
      venda = new Date(dataVenda)
    } 
    // Se for apenas data (YYYY-MM-DD)
    else if (dataVenda.includes('-')) {
      venda = new Date(dataVenda + 'T00:00:00')
    }
    // Fallback genérico
    else {
      venda = new Date(dataVenda)
    }
    
    // Verificar se a data é válida
    if (isNaN(venda.getTime())) {
      console.log('❌ [getDataLimiteDisplayForGestor] Data inválida:', dataVenda)
      return {
        texto: '❌ Data inválida',
        estilo: 'bg-red-100 text-red-800 px-2 py-1 rounded font-medium border border-red-300'
      }
    }
    
    // Calcular data limite (data_venda + 15 dias úteis)
    const dataLimite = addBusinessDays(venda, 15)
    dataLimite.setHours(0, 0, 0, 0)
    
    console.log('📅 [getDataLimiteDisplayForGestor] Cálculo:', {
      dataVenda,
      vendaParsed: venda.toISOString().split('T')[0],
      hoje: hoje.toISOString().split('T')[0],
      dataLimite: dataLimite.toISOString().split('T')[0]
    })
    
    // Calcular diferença em dias úteis
    if (hoje <= dataLimite) {
      // Ainda dentro do prazo
      const diasRestantes = getBusinessDaysBetween(hoje, dataLimite)
      
      console.log('✅ [getDataLimiteDisplayForGestor] Dentro do prazo, dias restantes:', diasRestantes)
      
      if (diasRestantes === 0) {
        return {
          texto: '🚨 ÚLTIMO DIA!',
          estilo: 'bg-red-100 text-red-800 px-2 py-1 rounded font-bold border border-red-300 animate-pulse'
        }
      } else if (diasRestantes <= 2) {
        return {
          texto: `⚠️ ${diasRestantes} dias restantes`,
          estilo: 'bg-orange-100 text-orange-800 px-2 py-1 rounded font-bold border border-orange-300'
        }
      } else if (diasRestantes <= 5) {
        return {
          texto: `⏰ ${diasRestantes} dias úteis`,
          estilo: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium border border-yellow-300'
        }
      } else {
        return {
          texto: `✅ ${diasRestantes} dias úteis`,
          estilo: 'bg-green-100 text-green-800 px-2 py-1 rounded font-medium border border-green-300'
        }
      }
    } else {
      // Prazo vencido
      const diasAtraso = getBusinessDaysBetween(dataLimite, hoje)
      
      console.log('❌ [getDataLimiteDisplayForGestor] Atrasado, dias de atraso:', diasAtraso)
      
      return {
        texto: `🔴 ATRASADO ${diasAtraso} dias`,
        estilo: 'bg-red-200 text-red-900 px-2 py-1 rounded font-bold border-2 border-red-500 animate-pulse'
      }
    }
  } catch (error) {
    console.error('💥 [getDataLimiteDisplayForGestor] Erro ao calcular:', error)
    return {
      texto: '❌ Erro no cálculo',
      estilo: 'bg-red-100 text-red-800 px-2 py-1 rounded font-medium border border-red-300'
    }
  }
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
