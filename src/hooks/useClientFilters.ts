
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
  const [colorFilter, setColorFilter] = useState<string>('all')

  const organizedClientes = useMemo(() => {
    // Função para converter UTC para UTC-3 (Brasil)
    const convertUTCToBrazil = (dateStr: string) => {
      const utcTime = new Date(dateStr).getTime()
      const brazilTime = utcTime - (3 * 60 * 60 * 1000) // UTC-3
      return new Date(brazilTime)
    }

    // Obter data atual no Brasil
    const nowBrazil = new Date(Date.now() - (3 * 60 * 60 * 1000))
    const today = new Date(nowBrazil.getFullYear(), nowBrazil.getMonth(), nowBrazil.getDate())
    const yesterday = new Date(today.getTime() - (24 * 60 * 60 * 1000))
    const ultimos7DiasInicio = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000))

    // Função para verificar se duas datas são do mesmo dia
    const isSameDay = (date1: Date, date2: Date) => {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate()
    }

    // Função para verificar se uma data está entre duas outras
    const isBetween = (target: Date, start: Date, end: Date) => {
      return target >= start && target <= end
    }

    // Filtrar clientes por categorias
    const clientesHoje = clientes.filter(c => {
      const clientDate = convertUTCToBrazil(c.created_at)
      return isSameDay(clientDate, today)
    })

    const clientesOntem = clientes.filter(c => {
      const clientDate = convertUTCToBrazil(c.created_at)
      return isSameDay(clientDate, yesterday)
    })

    const clientesUltimos7Dias = clientes.filter(c => {
      const clientDate = convertUTCToBrazil(c.created_at)
      const dayStart = new Date(clientDate.getFullYear(), clientDate.getMonth(), clientDate.getDate())
      return dayStart >= ultimos7DiasInicio && dayStart < yesterday
    })

    const clientesAnteriores = clientes.filter(c => {
      const clientDate = convertUTCToBrazil(c.created_at)
      const dayStart = new Date(clientDate.getFullYear(), clientDate.getMonth(), clientDate.getDate())
      return dayStart < ultimos7DiasInicio
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
        const startMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
        filteredClientes = clientes.filter(c => {
          const clientDate = convertUTCToBrazil(c.created_at)
          return isBetween(clientDate, startMonth, endMonth)
        })
        break
      case 'thisYear':
        const startYear = new Date(today.getFullYear(), 0, 1)
        const endYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999)
        filteredClientes = clientes.filter(c => {
          const clientDate = convertUTCToBrazil(c.created_at)
          return isBetween(clientDate, startYear, endYear)
        })
        break
      default: 
        filteredClientes = clientes
    }

    // Aplicar filtro de cor
    if (colorFilter !== 'all') {
      filteredClientes = filteredClientes.filter(c => {
        if (colorFilter === 'sem-cor') {
          return !c.cor_marcacao || c.cor_marcacao === null
        }
        return c.cor_marcacao === colorFilter
      })
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
    colorFilter,
    setColorFilter,
    organizedClientes
  }
}
