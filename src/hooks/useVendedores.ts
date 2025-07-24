import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Vendedor {
  nome: string
  email?: string
}

export function useVendedores() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVendedores = async () => {
      try {
        setLoading(true)
        
        // Lista fixa dos 3 vendedores específicos
        const vendedoresFixos = [
          { nome: 'Edu', email: 'vendedoredu@trafegoporcents.com' },
          { nome: 'Itamar', email: 'vendedoritamar@trafegoporcents.com' },
          { nome: 'João', email: 'vendedorjoao@trafegoporcents.com' }
        ]

        console.log('✅ [useVendedores] Vendedores fixos carregados:', vendedoresFixos)
        setVendedores(vendedoresFixos)
        setError(null)
      } catch (err) {
        console.error('Erro inesperado:', err)
        setError('Erro inesperado ao carregar vendedores')
      } finally {
        setLoading(false)
      }
    }

    fetchVendedores()
  }, [])

  return { vendedores, loading, error }
}