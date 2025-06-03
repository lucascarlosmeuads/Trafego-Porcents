
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
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [comissaoFilter, setComissaoFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  const filteredClientes = useMemo(() => {
    let filtered = clientes

    // Filtro por termo de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(cliente => 
        cliente.nome_cliente?.toLowerCase().includes(searchLower) ||
        cliente.email_cliente?.toLowerCase().includes(searchLower) ||
        cliente.telefone?.includes(searchTerm) ||
        cliente.vendedor?.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por status da campanha
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(cliente => cliente.status_campanha === statusFilter)
    }

    // Filtro por comissão
    if (comissaoFilter && comissaoFilter !== 'all') {
      if (comissaoFilter === 'pago') {
        filtered = filtered.filter(cliente => cliente.comissao === 'Pago')
      } else if (comissaoFilter === 'pendente') {
        filtered = filtered.filter(cliente => cliente.comissao !== 'Pago')
      }
    }

    return filtered
  }, [clientes, searchTerm, statusFilter, comissaoFilter])

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
    const clientesHoje = filteredClientes.filter(c => {
      const clientDate = convertUTCToBrazil(c.created_at)
      return isSameDay(clientDate, today)
    })

    const clientesOntem = filteredClientes.filter(c => {
      const clientDate = convertUTCToBrazil(c.created_at)
      return isSameDay(clientDate, yesterday)
    })

    const clientesUltimos7Dias = filteredClientes.filter(c => {
      const clientDate = convertUTCToBrazil(c.created_at)
      const dayStart = new Date(clientDate.getFullYear(), clientDate.getMonth(), clientDate.getDate())
      return dayStart >= ultimos7DiasInicio && dayStart < yesterday
    })

    const clientesAnteriores = filteredClientes.filter(c => {
      const clientDate = convertUTCToBrazil(c.created_at)
      const dayStart = new Date(clientDate.getFullYear(), clientDate.getMonth(), clientDate.getDate())
      return dayStart < ultimos7DiasInicio
    })

    // Aplicar filtro de data selecionado
    let finalClientes: Cliente[] = []
    switch (dateFilter) {
      case 'today': 
        finalClientes = clientesHoje
        break
      case 'yesterday': 
        finalClientes = clientesOntem
        break
      case 'last7days': 
        finalClientes = [...clientesHoje, ...clientesOntem, ...clientesUltimos7Dias]
        break
      case 'thisMonth':
        const startMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
        finalClientes = filteredClientes.filter(c => {
          const clientDate = convertUTCToBrazil(c.created_at)
          return isBetween(clientDate, startMonth, endMonth)
        })
        break
      case 'thisYear':
        const startYear = new Date(today.getFullYear(), 0, 1)
        const endYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999)
        finalClientes = filteredClientes.filter(c => {
          const clientDate = convertUTCToBrazil(c.created_at)
          return isBetween(clientDate, startYear, endYear)
        })
        break
      default: 
        finalClientes = filteredClientes
    }

    return {
      hoje: clientesHoje,
      ontem: clientesOntem,
      ultimos7Dias: clientesUltimos7Dias,
      anteriores: clientesAnteriores,
      total: finalClientes
    }
  }, [filteredClientes, dateFilter])

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    comissaoFilter,
    setComissaoFilter,
    dateFilter,
    setDateFilter,
    filteredClientes,
    organizedClientes
  }
}
