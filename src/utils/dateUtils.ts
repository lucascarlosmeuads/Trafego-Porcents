
import { StatusCampanha } from '@/lib/supabase'

export function getDataLimiteDisplayForGestor(
  dataVenda: string, 
  createdAt: string, 
  statusCampanha: StatusCampanha
): { texto: string; classeCor: string } {
  console.log(`📅 [getDataLimiteDisplayForGestor] Entrada:`, {
    dataVenda,
    createdAt,
    statusCampanha
  })

  // Se o status for "Saque Pendente" (que é exibido como "Campanha no Ar"), mostrar "Entregue"
  if (statusCampanha === 'Saque Pendente') {
    console.log(`📅 [getDataLimiteDisplayForGestor] Status Campanha no Ar - retornando verde`)
    return {
      texto: 'Entregue',
      classeCor: 'bg-green-600 text-white'
    }
  }

  // Usar data_venda se disponível, senão usar created_at
  const dataBase = dataVenda && dataVenda.trim() !== '' ? dataVenda : createdAt
  
  if (!dataBase) {
    console.log(`📅 [getDataLimiteDisplayForGestor] Sem data base - retornando não informado`)
    return {
      texto: 'Não informado',
      classeCor: 'bg-gray-600 text-white'
    }
  }

  try {
    const dataInicio = new Date(dataBase)
    const hoje = new Date()
    
    // Calcular 15 dias úteis
    let diasUteis = 0
    let dataAtual = new Date(dataInicio)
    
    while (diasUteis < 15) {
      dataAtual.setDate(dataAtual.getDate() + 1)
      const diaSemana = dataAtual.getDay()
      if (diaSemana !== 0 && diaSemana !== 6) { // Não é domingo (0) nem sábado (6)
        diasUteis++
      }
    }
    
    const dataLimite = dataAtual
    const diffTime = dataLimite.getTime() - hoje.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    console.log(`📅 [getDataLimiteDisplayForGestor] Cálculo:`, {
      dataInicio: dataInicio.toISOString(),
      dataLimite: dataLimite.toISOString(),
      hoje: hoje.toISOString(),
      diffDays
    })

    if (diffDays > 0) {
      return {
        texto: `${diffDays} dia${diffDays > 1 ? 's' : ''} restante${diffDays > 1 ? 's' : ''}`,
        classeCor: diffDays > 3 ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
      }
    } else if (diffDays === 0) {
      return {
        texto: 'Vence hoje',
        classeCor: 'bg-yellow-600 text-white'
      }
    } else {
      const diasAtraso = Math.abs(diffDays)
      return {
        texto: `${diasAtraso} dia${diasAtraso > 1 ? 's' : ''} em atraso`,
        classeCor: 'bg-red-600 text-white'
      }
    }
  } catch (error) {
    console.error(`📅 [getDataLimiteDisplayForGestor] Erro:`, error)
    return {
      texto: 'Erro no cálculo',
      classeCor: 'bg-gray-600 text-white'
    }
  }
}

export function getDataLimiteDisplayForAdmin(
  dataVenda: string, 
  createdAt: string, 
  statusCampanha: StatusCampanha
): { texto: string; classeCor: string } {
  console.log(`📅 [getDataLimiteDisplayForAdmin] Entrada:`, {
    dataVenda,
    createdAt,
    statusCampanha
  })

  // Se o status for "Saque Pendente" (que é exibido como "Campanha no Ar"), mostrar "Entregue"
  if (statusCampanha === 'Saque Pendente') {
    console.log(`📅 [getDataLimiteDisplayForAdmin] Status Campanha no Ar - retornando verde`)
    return {
      texto: 'Entregue',
      classeCor: 'bg-green-600 text-white'
    }
  }

  // Usar data_venda se disponível, senão usar created_at
  const dataBase = dataVenda && dataVenda.trim() !== '' ? dataVenda : createdAt
  
  if (!dataBase) {
    console.log(`📅 [getDataLimiteDisplayForAdmin] Sem data base - retornando não informado`)
    return {
      texto: 'Não informado',
      classeCor: 'bg-gray-600 text-white'
    }
  }

  try {
    const dataInicio = new Date(dataBase)
    const hoje = new Date()
    
    // Calcular 15 dias úteis
    let diasUteis = 0
    let dataAtual = new Date(dataInicio)
    
    while (diasUteis < 15) {
      dataAtual.setDate(dataAtual.getDate() + 1)
      const diaSemana = dataAtual.getDay()
      if (diaSemana !== 0 && diaSemana !== 6) { // Não é domingo (0) nem sábado (6)
        diasUteis++
      }
    }
    
    const dataLimite = dataAtual
    const diffTime = dataLimite.getTime() - hoje.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    console.log(`📅 [getDataLimiteDisplayForAdmin] Cálculo:`, {
      dataInicio: dataInicio.toISOString(),
      dataLimite: dataLimite.toISOString(),
      hoje: hoje.toISOString(),
      diffDays
    })

    if (diffDays > 0) {
      return {
        texto: `${diffDays} dia${diffDays > 1 ? 's' : ''} restante${diffDays > 1 ? 's' : ''}`,
        classeCor: diffDays > 3 ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
      }
    } else if (diffDays === 0) {
      return {
        texto: 'Vence hoje',
        classeCor: 'bg-yellow-600 text-white'
      }
    } else {
      const diasAtraso = Math.abs(diffDays)
      return {
        texto: `${diasAtraso} dia${diasAtraso > 1 ? 's' : ''} em atraso`,
        classeCor: 'bg-red-600 text-white'
      }
    }
  } catch (error) {
    console.error(`📅 [getDataLimiteDisplayForAdmin] Erro:`, error)
    return {
      texto: 'Erro no cálculo',
      classeCor: 'bg-gray-600 text-white'
    }
  }
}
