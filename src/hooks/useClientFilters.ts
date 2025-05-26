
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
    const today = DateTime.now().setZone('America/Sao_Paulo').startOf('day')
    const yesterday = today.minus({ days: 1 })
    const ultimos7DiasInicio = today.minus({ days: 7 })

    const parseDate = (dateStr: string) =>
      DateTime.fromISO(dateStr, { zone: 'utc' }).setZone('America/Sao_Paulo').startOf('day')

    const isSameDay = (a: DateTime, b: DateTime) => a.hasSame(b, 'day')
    const isBetween = (target: DateTime, start: DateTime, end: DateTime) =>
      target >= start && target <= end

    const clientesHoje = clientes.filter(c => isSameDay(parseDate(c.created_at), today))
    const clientesOntem = clientes.filter(c => isSameDay(parseDate(c.created_at), yesterday))
    const clientesUltimos7Dias = clientes.filter(c => {
      const d = parseDate(c.created_at)
      return d >= ultimos7DiasInicio && d < yesterday
    })
    const clientesAnteriores = clientes.filter(c => {
      const d = parseDate(c.created_at)
      return d < ultimos7DiasInicio
    })

    let filteredClientes: Cliente[] = []
    switch (dateFilter) {
      case 'today': filteredClientes = clientesHoje; break
      case 'yesterday': filteredClientes = clientesOntem; break
      case 'last7days': filteredClientes = [...clientesHoje, ...clientesOntem, ...clientesUltimos7Dias]; break
      case 'thisMonth':
        filteredClientes = clientes.filter(c =>
          isBetween(parseDate(c.created_at), today.startOf('month'), today.endOf('month'))
        )
        break
      case 'thisYear':
        filteredClientes = clientes.filter(c =>
          isBetween(parseDate(c.created_at), today.startOf('year'), today.endOf('year'))
        )
        break
      default: filteredClientes = clientes
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
