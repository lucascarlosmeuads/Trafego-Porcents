
import { useState, useMemo } from 'react'

interface ClienteSimples {
  id: string
  nome_cliente: string
  telefone: string
  email_cliente: string
  vendedor: string
  email_gestor: string
  status_campanha: string
  created_at: string
}

export function useSimpleClientFilters(clientes: ClienteSimples[]) {
  const [dateFilter, setDateFilter] = useState<string>('all')

  const organizedClientes = useMemo(() => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const ontem = new Date(hoje)
    ontem.setDate(ontem.getDate() - 1)
    
    const seteDiasAtras = new Date(hoje)
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)

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

    return {
      hoje: clientesHoje,
      ontem: clientesOntem,
      ultimos7Dias: clientesUltimos7Dias,
      total: clientes
    }
  }, [clientes])

  return {
    dateFilter,
    setDateFilter,
    organizedClientes
  }
}
