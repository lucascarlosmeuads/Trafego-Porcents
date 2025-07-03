
import { useState } from 'react'
import { Cliente } from '@/lib/supabase'

export function useSitePagoUpdate(clientes: Cliente[], setClientes: (clientes: Cliente[]) => void) {
  const handleSitePagoChange = (clienteId: string | number, newValue: boolean) => {
    const id = String(clienteId)
    setClientes(clientes.map(cliente => 
      String(cliente.id) === id
        ? { ...cliente, site_pago: newValue }
        : cliente
    ))
  }

  return { handleSitePagoChange }
}
