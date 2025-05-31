
import { useState, useMemo } from 'react'
import { Cliente } from '@/lib/supabase'

export interface OrganizedClientes {
  hoje: Cliente[]
  ontem: Cliente[]
  ultimos7Dias: Cliente[]
  anteriores: Cliente[]
  total: Cliente[]
}

export function useClientFilters(clientes: Cliente[], clientesWithCreatives?: Record<string, boolean>) {
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [creativeFilter, setCreativeFilter] = useState<string>('all')
  const [bmFilter, setBmFilter] = useState<string>('all')

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

    // Aplicar filtro de data selecionado
    let filteredByDate: Cliente[] = []
    switch (dateFilter) {
      case 'today': 
        filteredByDate = clientesHoje
        break
      case 'yesterday': 
        filteredByDate = clientesOntem
        break
      case 'last7days': 
        filteredByDate = [...clientesHoje, ...clientesOntem, ...clientesUltimos7Dias]
        break
      case 'thisMonth':
        const startMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
        filteredByDate = clientes.filter(c => {
          const clientDate = convertUTCToBrazil(c.created_at)
          return isBetween(clientDate, startMonth, endMonth)
        })
        break
      case 'thisYear':
        const startYear = new Date(today.getFullYear(), 0, 1)
        const endYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999)
        filteredByDate = clientes.filter(c => {
          const clientDate = convertUTCToBrazil(c.created_at)
          return isBetween(clientDate, startYear, endYear)
        })
        break
      default: 
        filteredByDate = clientes
    }

    // Aplicar filtro de criativos
    let filteredByCreative = filteredByDate
    if (creativeFilter !== 'all' && clientesWithCreatives) {
      switch (creativeFilter) {
        case 'falta_fazer':
          filteredByCreative = filteredByDate.filter(c => !clientesWithCreatives[c.email_cliente || ''])
          break
        case 'criativo_feito':
          filteredByCreative = filteredByDate.filter(c => clientesWithCreatives[c.email_cliente || ''])
          break
      }
    }

    // Aplicar filtro de BM
    let filteredByBM = filteredByCreative
    if (bmFilter !== 'all') {
      switch (bmFilter) {
        case 'bm_configurada':
          filteredByBM = filteredByCreative.filter(c => c.numero_bm && c.numero_bm.trim() !== '')
          break
        case 'bm_nao_configurada':
          filteredByBM = filteredByCreative.filter(c => !c.numero_bm || c.numero_bm.trim() === '')
          break
      }
    }

    return {
      hoje: clientesHoje,
      ontem: clientesOntem,
      ultimos7Dias: clientesUltimos7Dias,
      anteriores: clientesAnteriores,
      total: filteredByBM
    }
  }, [clientes, dateFilter, creativeFilter, bmFilter, clientesWithCreatives])

  return {
    dateFilter,
    setDateFilter,
    creativeFilter,
    setCreativeFilter,
    bmFilter,
    setBmFilter,
    organizedClientes
  }
}
