
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

    console.log('🌐 [useSitesData] === BUSCANDO DADOS DOS SITES ===')

    const { data, error } = await supabase
      .from('todos_clientes')
      .select('*')
      .in('site_status', ['aguardando_link', 'finalizado'])
      .order('data_venda', { ascending: false })

    if (error) {
      console.error('❌ [useSitesData] Erro ao buscar clientes:', error)
      setError(error.message)
    } else {
      console.log('✅ [useSitesData] Dados encontrados:', {
        total: data?.length || 0,
        aguardandoLink: data?.filter(c => c.site_status === 'aguardando_link').length || 0,
        finalizados: data?.filter(c => c.site_status === 'finalizado').length || 0
      })
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
