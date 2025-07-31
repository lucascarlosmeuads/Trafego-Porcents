import { useState, useMemo } from 'react'

interface ClienteSimples {
  id: string | number
  nome_cliente: string
  telefone: string
  email_cliente: string
  vendedor: string
  email_gestor: string
  status_campanha: string
  created_at: string
}

interface OrganizedClientes {
  hoje: ClienteSimples[]
  ontem: ClienteSimples[]
  ultimos7Dias: ClienteSimples[]
  esteMes: ClienteSimples[]
  esteAno: ClienteSimples[]
  customRange: ClienteSimples[]
  total: ClienteSimples[]
}

export function useClienteNovoDateFilters(clientes: ClienteSimples[]) {
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  const organizedClientes = useMemo(() => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const ontem = new Date(hoje)
    ontem.setDate(ontem.getDate() - 1)
    
    const seteDiasAtras = new Date(hoje)
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    
    const inicioAno = new Date(hoje.getFullYear(), 0, 1)

    // Helper function to check if date is between two dates
    const isDateBetween = (date: Date, start: Date, end: Date) => {
      return date >= start && date <= end
    }

    const clientesHoje = clientes.filter(cliente => {
      if (!cliente.created_at) return false
      try {
        const dataCliente = new Date(cliente.created_at)
        dataCliente.setHours(0, 0, 0, 0)
        return dataCliente.getTime() === hoje.getTime()
      } catch (error) {
        return false
      }
    })

    const clientesOntem = clientes.filter(cliente => {
      if (!cliente.created_at) return false
      try {
        const dataCliente = new Date(cliente.created_at)
        dataCliente.setHours(0, 0, 0, 0)
        return dataCliente.getTime() === ontem.getTime()
      } catch (error) {
        return false
      }
    })

    const clientesUltimos7Dias = clientes.filter(cliente => {
      if (!cliente.created_at) return false
      try {
        const dataCliente = new Date(cliente.created_at)
        return dataCliente >= seteDiasAtras
      } catch (error) {
        return false
      }
    })

    const clientesEsteMes = clientes.filter(cliente => {
      if (!cliente.created_at) return false
      try {
        const dataCliente = new Date(cliente.created_at)
        return dataCliente >= inicioMes
      } catch (error) {
        return false
      }
    })

    const clientesEsteAno = clientes.filter(cliente => {
      if (!cliente.created_at) return false
      try {
        const dataCliente = new Date(cliente.created_at)
        return dataCliente >= inicioAno
      } catch (error) {
        return false
      }
    })

    const clientesCustomRange = clientes.filter(cliente => {
      if (!cliente.created_at || !customStartDate || !customEndDate) return false
      try {
        const dataCliente = new Date(cliente.created_at)
        const startDate = new Date(customStartDate)
        const endDate = new Date(customEndDate)
        endDate.setHours(23, 59, 59, 999) // Include full end date
        
        return isDateBetween(dataCliente, startDate, endDate)
      } catch (error) {
        return false
      }
    })

    return {
      hoje: clientesHoje,
      ontem: clientesOntem,
      ultimos7Dias: clientesUltimos7Dias,
      esteMes: clientesEsteMes,
      esteAno: clientesEsteAno,
      customRange: clientesCustomRange,
      total: clientes
    }
  }, [clientes, customStartDate, customEndDate])

  const getFilteredClientes = () => {
    switch (dateFilter) {
      case 'today':
        return organizedClientes.hoje
      case 'yesterday':
        return organizedClientes.ontem
      case 'last7days':
        return organizedClientes.ultimos7Dias
      case 'thisMonth':
        return organizedClientes.esteMes
      case 'thisYear':
        return organizedClientes.esteAno
      case 'custom':
        return organizedClientes.customRange
      default:
        return organizedClientes.total
    }
  }

  return {
    dateFilter,
    setDateFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    organizedClientes,
    filteredClientes: getFilteredClientes(),
    clientsCount: getFilteredClientes().length
  }
}