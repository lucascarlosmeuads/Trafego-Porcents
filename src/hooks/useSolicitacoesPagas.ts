
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useSolicitacoesPagas() {
  const { user } = useAuth()
  const [solicitacoesPagas, setSolicitacoesPagas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.email) return

    const fetchSolicitacoesPagas = async () => {
      try {
        console.log('🔍 [useSolicitacoesPagas] Buscando solicitações pagas para:', user.email)
        
        const { data, error } = await supabase
          .from('solicitacoes_saque')
          .select('cliente_id')
          .eq('email_gestor', user.email)
          .eq('status_saque', 'pago')

        if (!error && data) {
          const clienteIds = data.map(item => item.cliente_id.toString())
          setSolicitacoesPagas(clienteIds)
          console.log('✅ [useSolicitacoesPagas] Clientes com saque pago:', clienteIds)
        } else {
          console.error('❌ [useSolicitacoesPagas] Erro:', error)
        }
      } catch (error) {
        console.error('💥 [useSolicitacoesPagas] Erro ao buscar solicitações pagas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSolicitacoesPagas()

    // Configurar listener de realtime para atualizações automáticas
    const channel = supabase
      .channel(`solicitacoes-pagas-${user.email}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'solicitacoes_saque',
          filter: `email_gestor=eq.${user.email}`
        },
        (payload) => {
          console.log('🔄 [useSolicitacoesPagas] Mudança detectada:', payload)
          fetchSolicitacoesPagas()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.email])

  return { solicitacoesPagas, loading }
}
