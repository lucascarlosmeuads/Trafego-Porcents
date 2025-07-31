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
    const ontem = new Date()
    const seteDiasAtras = new Date()
    const inicioMes = new Date()
    const inicioAno = new Date()
    
    // Configurar as datas de referência
    hoje.setHours(0, 0, 0, 0)
    
    ontem.setDate(hoje.getDate() - 1)
    ontem.setHours(0, 0, 0, 0)
    
    seteDiasAtras.setDate(hoje.getDate() - 7)
    seteDiasAtras.setHours(0, 0, 0, 0)

    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)
    
    inicioAno.setMonth(0, 1)
    inicioAno.setHours(0, 0, 0, 0)
    
    console.log('🗓️ [DateFilters] Hoje:', hoje.toISOString())
    console.log('🗓️ [DateFilters] Ontem:', ontem.toISOString())
    console.log('🗓️ [DateFilters] Total clientes para filtrar:', clientes.length)

    // Helper function to check if date is between two dates
    const isDateBetween = (date: Date, start: Date, end: Date) => {
      return date >= start && date <= end
    }

    const clientesHoje = clientes.filter(cliente => {
      if (!cliente.created_at) return false
      try {
        const dataCliente = new Date(cliente.created_at)
        dataCliente.setHours(0, 0, 0, 0)
        const isToday = dataCliente.getTime() === hoje.getTime()
        if (isToday) {
          console.log('✅ Cliente de hoje:', cliente.nome_cliente, dataCliente.toISOString())
        }
        return isToday
      } catch (error) {
        console.error('❌ Erro ao processar data do cliente:', cliente.nome_cliente, error)
        return false
      }
    })

    const clientesOntem = clientes.filter(cliente => {
      if (!cliente.created_at) return false
      try {
        const dataCliente = new Date(cliente.created_at)
        dataCliente.setHours(0, 0, 0, 0)
        const isYesterday = dataCliente.getTime() === ontem.getTime()
        if (isYesterday) {
          console.log('✅ Cliente de ontem:', cliente.nome_cliente, dataCliente.toISOString())
        }
        return isYesterday
      } catch (error) {
        console.error('❌ Erro ao processar data do cliente:', cliente.nome_cliente, error)
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

    const result = {
      hoje: clientesHoje,
      ontem: clientesOntem,
      ultimos7Dias: clientesUltimos7Dias,
      esteMes: clientesEsteMes,
      esteAno: clientesEsteAno,
      customRange: clientesCustomRange,
      total: clientes
    }
    
    console.log('📊 [DateFilters] Resumo dos filtros:')
    console.log('  - Hoje:', result.hoje.length)
    console.log('  - Ontem:', result.ontem.length)
    console.log('  - Últimos 7 dias:', result.ultimos7Dias.length)
    console.log('  - Este mês:', result.esteMes.length)
    console.log('  - Este ano:', result.esteAno.length)
    console.log('  - Total:', result.total.length)
    
    return result
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