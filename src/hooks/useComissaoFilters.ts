
import { useState, useMemo } from 'react'
import { Cliente } from '@/lib/supabase'

export function useComissaoFilters(clientes: Cliente[]) {
  const [selectedFilter, setSelectedFilter] = useState('todos')

  const clientesFiltrados = useMemo(() => {
    const agora = new Date()
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())

    switch (selectedFilter) {
      case 'pagos':
        return clientes.filter(c => c.comissao === 'Pago')
      
      case 'pendentes':
        return clientes.filter(c => c.comissao === 'Pendente')
      
      case 'estrela':
        return clientes.filter(c => c.eh_ultimo_pago === true)
      
      case 'hoje':
        return clientes.filter(c => {
          if (!c.ultimo_pagamento_em) return false
          const dataPagamento = new Date(c.ultimo_pagamento_em)
          return dataPagamento >= hoje && c.comissao === 'Pago'
        })
      
      case 'todos':
      default:
        return clientes
    }
  }, [clientes, selectedFilter])

  return {
    selectedFilter,
    setSelectedFilter,
    clientesFiltrados
  }
}
