
import { useState, useEffect } from 'react'
import type { Cliente } from '@/lib/supabase'

export function useGestorStatusRestrictions() {
  // Mantém registro dos clientes que já foram marcados como "Saque Pendente"
  const [clientesTravedos, setClientesTravedos] = useState<Set<string>>(new Set())

  const marcarClienteComoTravado = (clienteId: string | number) => {
    const id = String(clienteId)
    setClientesTravedos(prev => new Set([...prev, id]))
  }

  const clienteEstaTravado = (clienteId: string | number) => {
    const id = String(clienteId)
    return clientesTravedos.has(id)
  }

  // Verificar se um cliente deve ter status travado
  const verificarStatusTravado = (cliente: Cliente) => {
    const clienteId = String(cliente.id)
    // Se já foi marcado como "Saque Pendente" anteriormente ou tem saque solicitado
    return cliente.status_campanha === 'Saque Pendente' || 
           cliente.saque_solicitado || 
           clienteEstaTravado(clienteId)
  }

  // Marcar automaticamente clientes que já estão "Saque Pendente"
  const inicializarClientesTravados = (clientes: Cliente[]) => {
    const clientesNoAr = clientes
      .filter(cliente => cliente.status_campanha === 'Saque Pendente' || cliente.saque_solicitado)
      .map(cliente => String(cliente.id))
    
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
