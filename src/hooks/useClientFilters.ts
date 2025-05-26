import { useState, useMemo } from 'react'
import { Cliente } from '@/lib/supabase'
import { DateTime } from 'luxon'

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
    const seteDiasAtras = today.minus({ days: 7 })

    const parseDate = (dateStr: string) => {
      try {
        return DateTime.fromISO(dateStr, { zone: 'utc' }).setZone('America/Sao_Paulo').startOf('day')
      } catch {
        return null
      }
    }

    const isSameDay = (data: DateTime | null, target: DateTime) => {
      return data?.hasSame(target, 'day') || false
    }

    const inRange = (data: DateTime | null, start: DateTime, end: DateTime) => {
      return data && data >= start && data <= end
    }

    const clientesHoje = clientes.filter(c => isSameDay(parseDate(c.created_at), today))
    const clientesOntem = clientes.filter(c => isSameDay(parseDate(c.created_at), yesterday))
    const clientesUltimos7Dias = clientes.filter(c => {
      const date = parseDate(c.created_at)
      return date && date > yesterday && date >= seteDiasAtras
    })
    const clientesAnteriores = clientes.filter(c => {
      const date = parseDate(c.created_at)
      return date && date < seteDiasAtras
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
        const inicioMes = today.startOf('month')
        const fimMes = today.endOf('month')
        filteredClientes = clientes.filter(c =>
          inRange(parseDate(c.created_at), inicioMes, fimMes)
        )
        break
      case 'thisYear':
        const inicioAno = today.startOf('year')
        const fimAno = today.endOf('year')
        filteredClientes = clientes.filter(c =>
          inRange(parseDate(c.created_at), inicioAno, fimAno)
        )
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
