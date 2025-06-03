
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface SacSolicitacao {
  id: string
  nome: string
  email: string
  whatsapp: string
  tipo_problema: string
  descricao: string
  email_gestor: string | null
  nome_gestor: string | null
  data_envio: string
  created_at: string
}

export function useSacData() {
  const [solicitacoes, setSolicitacoes] = useState<SacSolicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSolicitacoes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('sac_clientes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar solicitações SAC:', error)
        setError(error.message)
        return
      }

      setSolicitacoes(data || [])
      setError(null)
    } catch (err) {
      console.error('Erro inesperado:', err)
      setError('Erro inesperado ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSolicitacoes()

    // Setup realtime subscription
    const channel = supabase
      .channel('sac_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'sac_clientes' 
        }, 
        () => {
          fetchSolicitacoes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    solicitacoes,
    loading,
    error,
    refetch: fetchSolicitacoes
  }
}
