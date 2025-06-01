
import { useState, useEffect } from 'react'
import type { Cliente } from '@/lib/supabase'

export function useGestorStatusRestrictions() {
  // Mantém registro dos clientes que já foram marcados como tendo saque solicitado
  const [clientesTravedos, setClientesTravedos] = useState<Set<string>>(new Set())

  const marcarClienteComoTravado = (clienteId: string) => {
    setClientesTravedos(prev => new Set([...prev, clienteId]))
  }

  const clienteEstaTravado = (clienteId: string) => {
    return clientesTravedos.has(clienteId)
  }

  // Verificar se um cliente deve ter status travado baseado no saque solicitado
  const verificarStatusTravado = (cliente: Cliente) => {
    // Se já tem saque solicitado ou foi marcado anteriormente como travado
    return cliente.saque_solicitado || clienteEstaTravado(cliente.id)
  }

  // Marcar automaticamente clientes que já têm saque solicitado
  const inicializarClientesTravados = (clientes: Cliente[]) => {
    const clientesComSaque = clientes
      .filter(cliente => cliente.saque_solicitado)
      .map(cliente => cliente.id)
    
    if (clientesComSaque.length > 0) {
      setClientesTravedos(prev => new Set([...prev, ...clientesComSaque]))
    }
  }

  return {
    marcarClienteComoTravado,
    clienteEstaTravado,
    verificarStatusTravado,
    inicializarClientesTravados
  }
}
