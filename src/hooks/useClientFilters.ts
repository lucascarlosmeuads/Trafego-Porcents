
import { useState, useMemo } from 'react'
import { Cliente } from '@/lib/supabase'

export function useClientFilters(clientes: Cliente[]) {
  const [dateFilter, setDateFilter] = useState('all')

  const filteredClientes = useMemo(() => {
    if (dateFilter === 'all') return clientes

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const yearStart = new Date(now.getFullYear(), 0, 1)

    return clientes.filter(cliente => {
      if (!cliente.created_at) return false
      
      const createdDate = new Date(cliente.created_at)
      const createdDateOnly = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate())

      switch (dateFilter) {
        case 'today':
          return createdDateOnly.getTime() === today.getTime()
        case 'yesterday':
          return createdDateOnly.getTime() === yesterday.getTime()
        case 'last7days':
          return createdDate >= sevenDaysAgo
        case 'thisMonth':
          return createdDate >= monthStart
        case 'thisYear':
          return createdDate >= yearStart
        default:
          return true
      }
    })
  }, [clientes, dateFilter])

  // Organize filtered clients by date
  const organizedClientes = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const clientesHoje = filteredClientes.filter(c => {
      if (!c.created_at) return false
      const clientDate = new Date(c.created_at)
      const clientDateOnly = new Date(clientDate.getFullYear(), clientDate.getMonth(), clientDate.getDate())
      return clientDateOnly.getTime() === today.getTime()
    })

    const clientesOntem = filteredClientes.filter(c => {
      if (!c.created_at) return false
      const clientDate = new Date(c.created_at)
      const clientDateOnly = new Date(clientDate.getFullYear(), clientDate.getMonth(), clientDate.getDate())
      return clientDateOnly.getTime() === yesterday.getTime()
    })

    const clientesUltimos7Dias = filteredClientes.filter(c => {
      if (!c.created_at) return false
      const clientDate = new Date(c.created_at)
      const clientDateOnly = new Date(clientDate.getFullYear(), clientDate.getMonth(), clientDate.getDate())
      return clientDate >= sevenDaysAgo && 
             clientDateOnly.getTime() !== today.getTime() && 
             clientDateOnly.getTime() !== yesterday.getTime()
    })

    const clientesAnteriores = filteredClientes.filter(c => {
      if (!c.created_at) return true
      const clientDate = new Date(c.created_at)
      return clientDate < sevenDaysAgo
    })

    return {
      hoje: clientesHoje,
      ontem: clientesOntem,
      ultimos7Dias: clientesUltimos7Dias,
      anteriores: clientesAnteriores,
      total: filteredClientes
    }
  }, [filteredClientes])

  return {
    dateFilter,
    setDateFilter,
    filteredClientes,
    organizedClientes
  }
}
