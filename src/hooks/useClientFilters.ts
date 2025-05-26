import { useState, useMemo } from 'react'
import { Cliente } from '@/lib/supabase'

export interface OrganizedClientes {
  hoje: Cliente[]
  ontem: Cliente[]
  ultimos7Dias: Cliente[]
  anteriores: Cliente[]
  total: Cliente[]
}

// ✅ Função para ajustar a data do Supabase (UTC) para horário do Brasil
function adjustToBrazilTime(dateString: string): Date | null {
  try {
    const utcDate = new Date(dateString)
    if (isNaN(utcDate.getTime())) return null
    return new Date(utcDate.getTime() - 3 * 60 * 60 * 1000) // -3h
  } catch (error) {
    return null
  }
}

export function useClientFilters(clientes: Cliente[]) {
  const [dateFilter, setDateFilter] = useState<string>('all')

  const organizedClientes = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const ultimos7DiasInicio = new Date(today)
    ultimos7DiasInicio.setDate(today.getDate() - 7)

    const isDateEqual = (dateString: string, targetDate: Date) => {
      const date = adjustToBrazilTime(dateString)
      if (!date) return false
      const normDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const normTarget = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
      return normDate.getTime() === normTarget.getTime()
    }

    const isDateInRange = (dateString: string, startDate: Date, endDate: Date) => {
      const date = adjustToBrazilTime(dateString)
      if (!date) return false
      const normDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const normStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      const normEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
      return normDate >= normStart && normDate <= normEnd
    }

    const clientesHoje = clientes.filter(c => isDateEqual(c.created_at, today))
    const clientesOntem = clientes.filter(c => isDateEqual(c.created_at, yesterday))
    const clientesUltimos7Dias = clientes.filter(c => {
      const date = adjustToBrazilTime(c.created_at)
      if (!date) return false
      const normDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      return normDate >= ultimos7DiasInicio && normDate < yesterday
    })
    const clientesAnteriores = clientes.filter(c => {
      const date = adjustToBrazilTime(c.created_at)
      if (!date) return false
      const normDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      return normDate < ultimos7DiasInicio
    })

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
        filteredClientes = clientes.filter(c => isDateInRange(c.created_at, inicioMes, fimMes))
        break
      case 'thisYear':
        const inicioAno = new Date(today.getFullYear(), 0, 1)
        const fimAno = new Date(today.getFullYear(), 11, 31)
        filteredClientes = clientes.filter(c => isDateInRange(c.created_at, inicioAno, fimAno))
        break
      default:
        filteredClientes = clientes
    }

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
