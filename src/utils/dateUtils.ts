
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

// Nova função específica para o painel do gestor
export const getDataLimiteDisplayForGestor = (dataVenda: string | null): { texto: string; estilo: string } => {
  console.log('📊 [getDataLimiteDisplayForGestor] Input:', dataVenda)
  
  if (!dataVenda) {
    console.log('❌ [getDataLimiteDisplayForGestor] Sem data de venda')
    return {
      texto: 'Não informado',
      estilo: 'text-gray-400'
    }
  }

  try {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    // Calcular data limite (data_venda + 15 dias úteis)
    const venda = new Date(dataVenda)
    const dataLimite = addBusinessDays(venda, 15)
    dataLimite.setHours(0, 0, 0, 0)
    
    console.log('📅 [getDataLimiteDisplayForGestor] Cálculo:', {
      dataVenda,
      hoje: hoje.toISOString().split('T')[0],
      dataLimite: dataLimite.toISOString().split('T')[0]
    })
    
    if (hoje <= dataLimite) {
      // Ainda dentro do prazo - calcular dias restantes
      const diasRestantes = getBusinessDaysBetween(hoje, dataLimite)
      
      console.log('✅ [getDataLimiteDisplayForGestor] Dentro do prazo, dias restantes:', diasRestantes)
      
      if (diasRestantes > 5) {
        return {
          texto: `Faltam ${diasRestantes} dias úteis`,
          estilo: 'text-green-600 font-medium'
        }
      } else if (diasRestantes >= 1) {
        return {
          texto: `Atenção: ${diasRestantes} dias úteis restantes`,
          estilo: 'text-yellow-600 font-bold'
        }
      } else {
        return {
          texto: 'Atenção: último dia útil',
          estilo: 'text-yellow-600 font-bold'
        }
      }
    } else {
      // Prazo vencido - calcular dias de atraso
      const diasAtraso = getBusinessDaysBetween(dataLimite, hoje)
      
      console.log('❌ [getDataLimiteDisplayForGestor] Atrasado, dias de atraso:', diasAtraso)
      
      return {
        texto: `Atrasado há ${diasAtraso} dias úteis`,
        estilo: 'text-red-600 font-bold'
      }
    }
  } catch (error) {
    console.error('💥 [getDataLimiteDisplayForGestor] Erro ao calcular:', error)
    return {
      texto: 'Erro no cálculo',
      estilo: 'text-gray-400'
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
