
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSimpleAuth } from '@/hooks/useSimpleAuth'

export function useSolicitacoesPagas() {
  const { user } = useSimpleAuth()
  const [solicitacoesPagas, setSolicitacoesPagas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.email) return

    const fetchSolicitacoesPagas = async () => {
      try {
        console.log('🔍 [useSolicitacoesPagas] Buscando solicitações pagas...')
        
        const { data, error } = await supabase
          .from('solicitacoes_saque')
          .select('cliente_id')
          .eq('status_saque', 'pago')

        if (error) {
          console.error('❌ [useSolicitacoesPagas] Erro ao buscar solicitações pagas:', error)
          setSolicitacoesPagas([])
        } else {
          const clienteIds = data?.map(item => item.cliente_id.toString()) || []
          console.log('✅ [useSolicitacoesPagas] Clientes com saque pago:', clienteIds)
          setSolicitacoesPagas(clienteIds)
        }
      } catch (error) {
        console.error('💥 [useSolicitacoesPagas] Erro ao verificar solicitações pagas:', error)
        setSolicitacoesPagas([])
      } finally {
        setLoading(false)
      }
    }

    fetchSolicitacoesPagas()

    // Configurar realtime para atualizações
    const channel = supabase
      .channel(`solicitacoes-pagas-${user.email}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'solicitacoes_saque'
        },
        (payload) => {
          console.log('🔄 [useSolicitacoesPagas] Mudança detectada:', payload)
          fetchSolicitacoesPagas()
        }
      )
      .subscribe((status) => {
        console.log(`📡 [useSolicitacoesPagas] Status do realtime:`, status)
      })

    return () => {
      console.log('🧹 [useSolicitacoesPagas] Removendo canal de realtime')
      supabase.removeChannel(channel)
    }
  }, [user?.email])

  return {
    solicitacoesPagas,
    loading
  }
}
