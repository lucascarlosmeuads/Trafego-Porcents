
import { useState } from 'react'
import { Cliente } from '@/lib/supabase'

export function useSitePagoUpdate(clientes: Cliente[], setClientes: (clientes: Cliente[]) => void) {
  const handleSitePagoChange = (clienteId: string, newValue: boolean) => {
    setClientes(clientes.map(cliente => 
      cliente.id === clienteId 
        ? { ...cliente, site_pago: newValue }
        : cliente
    ))
  }

  return { handleSitePagoChange }
}
