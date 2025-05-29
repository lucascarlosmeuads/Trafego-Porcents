
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

// Nova função para painel do gestor - calcula e formata exibição da data limite
export const getDataLimiteDisplayForGestor = (dataVenda: string, created_at: string | null, statusCampanha: string): { texto: string, classeCor: string } => {
  console.log(`🔍 Analisando data: venda=${dataVenda}, created=${created_at}, status=${statusCampanha}`);
  
  // Se status for "No Ar" ou "Otimização" - campanha cumprida
  if (isStatusEntregue(statusCampanha)) {
    return {
      texto: '✅ Cumprido',
      classeCor: 'bg-green-100 text-green-800 border-green-300'
    }
  }
  
  // Determinar a data base para cálculo (data_venda ou created_at como fallback)
  let dataBase: string | null = null;
  
  if (dataVenda && dataVenda.trim() !== '') {
    dataBase = dataVenda;
  } else if (created_at && created_at.trim() !== '') {
    dataBase = created_at;
  }
  
  if (!dataBase) {
    console.log('⚠️ Sem data base válida');
    return {
      texto: 'Não informado',
      classeCor: 'text-gray-400'
    }
  }
  
  try {
    // Converter para Date (tentando diferentes formatos)
    const baseDate = new Date(dataBase);
    
    // Verificar se a data é válida
    if (isNaN(baseDate.getTime())) {
      console.log(`⚠️ Data inválida: ${dataBase}`);
      return {
        texto: 'Data inválida',
        classeCor: 'text-gray-400'
      }
    }
    
    console.log(`✅ Data base válida: ${baseDate.toISOString()}`);
    
    // Calcular data limite (15 dias úteis após a data base)
    const dataLimite = addBusinessDays(baseDate, 15);
    console.log(`📅 Data limite calculada: ${dataLimite.toISOString()}`);
    
    // Data de hoje (sem horas)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Verificar se já passou da data limite
    if (hoje > dataLimite) {
      // Atrasado - calcular dias de atraso
      const diasAtraso = getBusinessDaysBetween(dataLimite, hoje) - 1;
      
      return {
        texto: `🚨 Atrasado há ${diasAtraso} dias úteis`,
        classeCor: 'text-red-600 font-bold'
      }
    }
    
    // Dentro do prazo - calcular dias restantes
    const diasRestantes = getBusinessDaysBetween(hoje, dataLimite) - 1;
    
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
    console.error('Erro ao calcular exibição da data limite:', error);
    return {
      texto: 'Erro de cálculo',
      classeCor: 'text-gray-400'
    }
  }
}
