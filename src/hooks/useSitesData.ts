
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Cliente {
  id: number
  nome_cliente: string
  telefone: string
  email_cliente: string
  email_gestor: string
  link_site: string
  site_status: string
  site_pago: boolean
  data_venda: string
  created_at: string
  // adicione outros campos conforme sua tabela
}

export function useSitesData() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClientes = async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('todos_clientes')
      .select('*')
      .eq('site_status', 'aguardando_link')
      .order('data_venda', { ascending: false })

    if (error) {
      console.error('Erro ao buscar clientes aguardando site:', error)
      setError(error.message)
    } else {
      setClientes(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  return {
    clientes,
    loading,
    error,
    refetch: fetchClientes,
  }
}
