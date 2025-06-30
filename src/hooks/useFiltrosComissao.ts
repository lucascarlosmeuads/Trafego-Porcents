
import { useState, useMemo } from 'react'
import { Cliente } from '@/lib/supabase'

export interface FiltroComissao {
  status: 'todos' | 'pagos' | 'pendentes' | 'ultimos_pagos'
  valorMin?: number
  valorMax?: number
  gestor?: string
}

export function useFiltrosComissao(clientes: Cliente[]) {
  const [filtros, setFiltros] = useState<FiltroComissao>({
    status: 'todos'
  })

  const clientesFiltrados = useMemo(() => {
    let resultado = [...clientes]

    // Filtrar por status
    if (filtros.status !== 'todos') {
      switch (filtros.status) {
        case 'pagos':
          resultado = resultado.filter(c => c.comissao === 'Pago')
          break
        case 'pendentes':
          resultado = resultado.filter(c => c.comissao !== 'Pago')
          break
        case 'ultimos_pagos':
          resultado = resultado.filter(c => c.eh_ultimo_pago === true)
          break
      }
    }

    // Filtrar por valor mínimo
    if (filtros.valorMin !== undefined) {
      resultado = resultado.filter(c => (c.valor_comissao || 60) >= filtros.valorMin!)
    }

    // Filtrar por valor máximo
    if (filtros.valorMax !== undefined) {
      resultado = resultado.filter(c => (c.valor_comissao || 60) <= filtros.valorMax!)
    }

    // Filtrar por gestor
    if (filtros.gestor) {
      resultado = resultado.filter(c => c.email_gestor === filtros.gestor)
    }

    // Ordenação inteligente
    return resultado.sort((a, b) => {
      // 1. Pendentes primeiro
      const aIsPendente = a.comissao !== 'Pago'
      const bIsPendente = b.comissao !== 'Pago'
      
      if (aIsPendente && !bIsPendente) return -1
      if (!aIsPendente && bIsPendente) return 1

      // 2. Últimos pagos destacados
      const aIsUltimo = a.eh_ultimo_pago || false
      const bIsUltimo = b.eh_ultimo_pago || false
      
      if (aIsUltimo && !bIsUltimo) return -1
      if (!aIsUltimo && bIsUltimo) return 1

      // 3. Dentro da mesma categoria: mais recente primeiro
      const dataA = new Date(a.created_at).getTime()
      const dataB = new Date(b.created_at).getTime()
      
      return dataB - dataA
    })
  }, [clientes, filtros])

  const estatisticas = useMemo(() => {
    const total = clientes.length
    const pagos = clientes.filter(c => c.comissao === 'Pago').length
    const pendentes = total - pagos
    const ultimosPagos = clientes.filter(c => c.eh_ultimo_pago).length
    
    const valorTotalPendente = clientes
      .filter(c => c.comissao !== 'Pago')
      .reduce((sum, c) => sum + (c.valor_comissao || 60), 0)
    
    const valorTotalPago = clientes
      .filter(c => c.comissao === 'Pago')
      .reduce((sum, c) => sum + (c.total_pago_comissao || c.valor_comissao || 60), 0)

    return {
      total,
      pagos,
      pendentes,
      ultimosPagos,
      valorTotalPendente,
      valorTotalPago,
      filtrados: clientesFiltrados.length
    }
  }, [clientes, clientesFiltrados])

  return {
    filtros,
    setFiltros,
    clientesFiltrados,
    estatisticas
  }
}
