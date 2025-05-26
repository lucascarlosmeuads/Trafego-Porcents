
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
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const ontem = new Date(hoje)
    ontem.setDate(hoje.getDate() - 1)
    
    const ultimos7DiasInicio = new Date(hoje)
    ultimos7DiasInicio.setDate(hoje.getDate() - 7)

    console.log('📅 [useClientFilters] Filtering clients by created_at')
    console.log('📅 [useClientFilters] Today:', hoje.toDateString())
    console.log('📅 [useClientFilters] Total clients to filter:', clientes.length)

    // Função para verificar se uma data está em um período específico
    const isDateInRange = (dateString: string, startDate: Date, endDate?: Date) => {
      if (!dateString || dateString.trim() === '') return false
      
      try {
        const clientDate = new Date(dateString)
        clientDate.setHours(0, 0, 0, 0)
        
        if (endDate) {
          return clientDate >= startDate && clientDate <= endDate
        } else {
          return clientDate.getTime() === startDate.getTime()
        }
      } catch (error) {
        console.error('❌ [useClientFilters] Error parsing date:', dateString, error)
        return false
      }
    }

    // Organizar clientes por período baseado em created_at
    const clientesHoje = clientes.filter(cliente => {
      const isToday = isDateInRange(cliente.created_at, hoje)
      if (isToday) {
        console.log(`✅ [useClientFilters] Client ${cliente.nome_cliente} - created_at: ${cliente.created_at} matches TODAY`)
      }
      return isToday
    })

    const clientesOntem = clientes.filter(cliente => 
      isDateInRange(cliente.created_at, ontem)
    )

    const clientesUltimos7Dias = clientes.filter(cliente => {
      if (!cliente.created_at || cliente.created_at.trim() === '') return false
      
      try {
        const clientDate = new Date(cliente.created_at)
        clientDate.setHours(0, 0, 0, 0)
        
        return clientDate >= ultimos7DiasInicio && clientDate < hoje
      } catch (error) {
        return false
      }
    })

    const clientesAnteriores = clientes.filter(cliente => {
      if (!cliente.created_at || cliente.created_at.trim() === '') return false
      
      try {
        const clientDate = new Date(cliente.created_at)
        clientDate.setHours(0, 0, 0, 0)
        
        return clientDate < ultimos7DiasInicio
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
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        filteredClientes = clientes.filter(cliente => {
          if (!cliente.created_at) return false
          try {
            const clientDate = new Date(cliente.created_at)
            return clientDate >= inicioMes && clientDate <= hoje
          } catch (error) {
            return false
          }
        })
        break
      case 'thisYear':
        const inicioAno = new Date(hoje.getFullYear(), 0, 1)
        filteredClientes = clientes.filter(cliente => {
          if (!cliente.created_at) return false
          try {
            const clientDate = new Date(cliente.created_at)
            return clientDate >= inicioAno && clientDate <= hoje
          } catch (error) {
            return false
          }
        })
        break
      default:
        filteredClientes = clientes
    }

    console.log('📊 [useClientFilters] Results:')
    console.log(`   - Hoje: ${clientesHoje.length}`)
    console.log(`   - Ontem: ${clientesOntem.length}`)
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
