
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
        console.log('🔍 [useSolicitacoesPagas] Buscando clientes com comissão paga...')
        
        // SIMPLIFICADO: buscar diretamente pela coluna comissao = 'Pago'
        const { data, error } = await supabase
          .from('todos_clientes')
          .select('id')
          .eq('comissao', 'Pago')

        if (error) {
          console.error('❌ [useSolicitacoesPagas] Erro ao buscar comissões pagas:', error)
          setSolicitacoesPagas([])
        } else {
          const clienteIds = data?.map(item => item.id.toString()) || []
          console.log('✅ [useSolicitacoesPagas] Clientes com comissão paga:', clienteIds)
          setSolicitacoesPagas(clienteIds)
        }
      } catch (error) {
        console.error('💥 [useSolicitacoesPagas] Erro ao verificar comissões pagas:', error)
        setSolicitacoesPagas([])
      } finally {
        setLoading(false)
      }
    }

    fetchSolicitacoesPagas()

    // Configurar realtime para atualizações na tabela todos_clientes
    const channel = supabase
      .channel(`comissoes-pagas-${user.email}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos_clientes'
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
