
import { useState, useMemo } from 'react'
import { Cliente } from '@/lib/supabase'

export interface OrganizedClientes {
  hoje: Cliente[]
  ontem: Cliente[]
  ultimos7Dias: Cliente[]
  anteriores: Cliente[]
  total: Cliente[]
}

export function useClientFilters(clientes: Cliente[]) {
  const [dateFilter, setDateFilter] = useState<string>('all')

  const organizedClientes = useMemo(() => {
    // Usar timezone do Brasil (UTC-3) para garantir comparação correta
    const now = new Date()
    const brNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
    const today = new Date(brNow.getFullYear(), brNow.getMonth(), brNow.getDate())
    
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    
    const ultimos7DiasInicio = new Date(today)
    ultimos7DiasInicio.setDate(today.getDate() - 7)

    console.log('📅 [useClientFilters] Data atual (Brasil):', brNow.toLocaleString('pt-BR'))
    console.log('📅 [useClientFilters] Hoje (00:00):', today.toLocaleDateString('pt-BR'))
    console.log('📅 [useClientFilters] Ontem (00:00):', yesterday.toLocaleDateString('pt-BR'))
    console.log('📅 [useClientFilters] Total de clientes para filtrar:', clientes.length)

    // Função melhorada para verificar se uma data está em um período específico
    const isDateEqual = (dateString: string, targetDate: Date) => {
      if (!dateString || dateString.trim() === '') {
        console.log('❌ [useClientFilters] Data vazia ou inválida:', dateString)
        return false
      }
      
      try {
        // Parse da data do cliente em UTC e converter para timezone do Brasil
        const clientDate = new Date(dateString)
        
        // Verificar se a data é válida
        if (isNaN(clientDate.getTime())) {
          console.log('❌ [useClientFilters] Data inválida:', dateString)
          return false
        }

        // Converter para timezone do Brasil
        const brClientDate = new Date(clientDate.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
        
        // Normalizar para 00:00:00 para comparação apenas de data
        const normalizedClientDate = new Date(brClientDate.getFullYear(), brClientDate.getMonth(), brClientDate.getDate())
        const normalizedTargetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
        
        const isEqual = normalizedClientDate.getTime() === normalizedTargetDate.getTime()
        
        if (isEqual) {
          console.log(`✅ [useClientFilters] Data match: ${dateString} = ${targetDate.toLocaleDateString('pt-BR')}`)
        }
        
        return isEqual
      } catch (error) {
        console.error('❌ [useClientFilters] Erro ao processar data:', dateString, error)
        return false
      }
    }

    const isDateInRange = (dateString: string, startDate: Date, endDate: Date) => {
      if (!dateString || dateString.trim() === '') return false
      
      try {
        const clientDate = new Date(dateString)
        if (isNaN(clientDate.getTime())) return false

        // Converter para timezone do Brasil
        const brClientDate = new Date(clientDate.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
        
        const normalizedClientDate = new Date(brClientDate.getFullYear(), brClientDate.getMonth(), brClientDate.getDate())
        const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
        
        return normalizedClientDate >= normalizedStartDate && normalizedClientDate <= normalizedEndDate
      } catch (error) {
        console.error('❌ [useClientFilters] Erro ao verificar range de data:', dateString, error)
        return false
      }
    }

    // Organizar clientes por período baseado em created_at
    const clientesHoje = clientes.filter(cliente => {
      const isToday = isDateEqual(cliente.created_at, today)
      if (isToday) {
        console.log(`✅ [useClientFilters] Cliente HOJE: ${cliente.nome_cliente} - ${cliente.created_at}`)
      }
      return isToday
    })

    const clientesOntem = clientes.filter(cliente => {
      const isYesterday = isDateEqual(cliente.created_at, yesterday)
      if (isYesterday) {
        console.log(`✅ [useClientFilters] Cliente ONTEM: ${cliente.nome_cliente} - ${cliente.created_at}`)
      }
      return isYesterday
    })

    const clientesUltimos7Dias = clientes.filter(cliente => {
      if (!cliente.created_at || cliente.created_at.trim() === '') return false
      
      try {
        const clientDate = new Date(cliente.created_at)
        if (isNaN(clientDate.getTime())) return false

        // Converter para timezone do Brasil
        const brClientDate = new Date(clientDate.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
        const normalizedClientDate = new Date(brClientDate.getFullYear(), brClientDate.getMonth(), brClientDate.getDate())
        
        // Últimos 7 dias: entre 7 dias atrás e hoje (exclusive), não incluindo hoje nem ontem
        return normalizedClientDate >= ultimos7DiasInicio && normalizedClientDate < yesterday
      } catch (error) {
        return false
      }
    })

    const clientesAnteriores = clientes.filter(cliente => {
      if (!cliente.created_at || cliente.created_at.trim() === '') return false
      
      try {
        const clientDate = new Date(cliente.created_at)
        if (isNaN(clientDate.getTime())) return false

        // Converter para timezone do Brasil
        const brClientDate = new Date(clientDate.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
        const normalizedClientDate = new Date(brClientDate.getFullYear(), brClientDate.getMonth(), brClientDate.getDate())
        
        return normalizedClientDate < ultimos7DiasInicio
      } catch (error) {
        return false
      }
    })

    // Aplicar filtro selecionado
    let filteredClientes: Cliente[] = []
    
    switch (dateFilter) {
      case 'today':
        filteredClientes = clientesHoje
        break
      case 'yesterday':
        filteredClientes = clientesOntem
        break
      case 'last7days':
        filteredClientes = [...clientesHoje, ...clientesOntem, ...clientesUltimos7Dias]
        break
      case 'thisMonth':
        const inicioMes = new Date(today.getFullYear(), today.getMonth(), 1)
        const fimMes = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        filteredClientes = clientes.filter(cliente => 
          isDateInRange(cliente.created_at, inicioMes, fimMes)
        )
        break
      case 'thisYear':
        const inicioAno = new Date(today.getFullYear(), 0, 1)
        const fimAno = new Date(today.getFullYear(), 11, 31)
        filteredClientes = clientes.filter(cliente => 
          isDateInRange(cliente.created_at, inicioAno, fimAno)
        )
        break
      default:
        filteredClientes = clientes
    }

    console.log('📊 [useClientFilters] Resultados finais:')
    console.log(`   - Hoje (${today.toLocaleDateString('pt-BR')}): ${clientesHoje.length}`)
    console.log(`   - Ontem (${yesterday.toLocaleDateString('pt-BR')}): ${clientesOntem.length}`)
    console.log(`   - Últimos 7 dias: ${clientesUltimos7Dias.length}`)
    console.log(`   - Anteriores: ${clientesAnteriores.length}`)
    console.log(`   - Filtro aplicado (${dateFilter}): ${filteredClientes.length}`)

    return {
      hoje: clientesHoje,
      ontem: clientesOntem,
      ultimos7Dias: clientesUltimos7Dias,
      anteriores: clientesAnteriores,
      total: filteredClientes
    }
  }, [clientes, dateFilter])

  return {
    dateFilter,
    setDateFilter,
    organizedClientes
  }
}
