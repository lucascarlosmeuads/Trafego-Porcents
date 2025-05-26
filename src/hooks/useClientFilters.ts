import { useState, useMemo } from 'react'
import { DateTime } from 'luxon'
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
    const now = DateTime.now().setZone('America/Sao_Paulo')
    const today = now.startOf('day')
    const yesterday = today.minus({ days: 1 })
    const ultimos7DiasInicio = today.minus({ days: 7 })

    const parseDate = (dateStr: string) => {
      try {
        return DateTime.fromISO(dateStr, { zone: 'utc' }).setZone('America/Sao_Paulo').startOf('day')
      } catch {
        return null
      }
    }

    const isSameDay = (clientDate: string, reference: DateTime) => {
      const parsed = parseDate(clientDate)
      return parsed?.hasSame(reference, 'day')
    }

    const isInRange = (clientDate: string, start: DateTime, end: DateTime) => {
      const parsed = parseDate(clientDate)
      return parsed && parsed >= start && parsed <= end
    }

    const clientesHoje = clientes.filter(c => isSameDay(c.created_at, today))
    const clientesOntem = clientes.filter(c => isSameDay(c.created_at, yesterday))
    const clientesUltimos7Dias = clientes.filter(c => {
      const parsed = parseDate(c.created_at)
      return parsed && parsed >= ultimos7DiasInicio && parsed < yesterday
    })
    const clientesAnteriores = clientes.filter(c => {
      const parsed = parseDate(c.created_at)
      return parsed && parsed < ultimos7DiasInicio
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
        const startMonth = today.startOf('month')
        const endMonth = today.endOf('month')
        filteredClientes = clientes.filter(c => isInRange(c.created_at, startMonth, endMonth))
        break
      case 'thisYear':
        const startYear = today.startOf('year')
        const endYear = today.endOf('year')
        filteredClientes = clientes.filter(c => isInRange(c.created_at, startYear, endYear))
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
