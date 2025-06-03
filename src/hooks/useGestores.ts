
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Gestor {
  id: string
  nome: string
  email: string
  ativo: boolean
}

export function useGestores() {
  const [gestores, setGestores] = useState<Gestor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGestores = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('gestores')
          .select('id, nome, email, ativo')
          .eq('ativo', true)
          .order('nome')

        if (error) {
          console.error('Erro ao buscar gestores:', error)
          setError(error.message)
          return
        }

        setGestores(data || [])
        setError(null)
      } catch (err) {
        console.error('Erro inesperado:', err)
        setError('Erro inesperado ao carregar gestores')
      } finally {
        setLoading(false)
      }
    }

    fetchGestores()
  }, [])

  return { gestores, loading, error }
}
