
import { useState, useEffect } from 'react'
import type { Cliente } from '@/lib/supabase'

export function useGestorStatusRestrictions() {
  // Mantém registro dos clientes que já foram marcados como "No Ar"
  const [clientesTravedos, setClientesTravedos] = useState<Set<string>>(new Set())

  const marcarClienteComoTravado = (clienteId: string) => {
    setClientesTravedos(prev => new Set([...prev, clienteId]))
  }

  const clienteEstaTravado = (clienteId: string) => {
    return clientesTravedos.has(clienteId)
  }

  // Verificar se um cliente deve ter status travado
  const verificarStatusTravado = (cliente: Cliente) => {
    // Se já foi marcado como "No Ar" anteriormente ou tem saque solicitado
    return cliente.status_campanha === 'No Ar' || 
           cliente.saque_solicitado || 
           clienteEstaTravado(cliente.id)
  }

  // Marcar automaticamente clientes que já estão "No Ar"
  const inicializarClientesTravados = (clientes: Cliente[]) => {
    const clientesNoAr = clientes
      .filter(cliente => cliente.status_campanha === 'No Ar' || cliente.saque_solicitado)
      .map(cliente => cliente.id)
    
    if (clientesNoAr.length > 0) {
      setClientesTravedos(prev => new Set([...prev, ...clientesNoAr]))
    }
  }

  return {
    marcarClienteComoTravado,
    clienteEstaTravado,
    verificarStatusTravado,
    inicializarClientesTravados
  }
}
