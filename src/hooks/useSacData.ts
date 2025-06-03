
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
      console.log('🔄 [useSacData] Buscando solicitações SAC...')
      setLoading(true)
      const { data, error } = await supabase
        .from('sac_clientes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [useSacData] Erro ao buscar solicitações SAC:', error)
        setError(error.message)
        return
      }

      console.log('✅ [useSacData] Solicitações carregadas:', data?.length || 0)
      setSolicitacoes(data || [])
      setError(null)
    } catch (err) {
      console.error('💥 [useSacData] Erro inesperado:', err)
      setError('Erro inesperado ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const updateGestor = async (solicitacaoId: string, emailGestor: string, nomeGestor: string) => {
    try {
      console.log('🔄 [useSacData] Iniciando atualização de gestor:', {
        solicitacaoId,
        emailGestor,
        nomeGestor
      })

      // Validar dados antes de enviar
      if (!solicitacaoId || !emailGestor || !nomeGestor) {
        throw new Error('Dados incompletos para atualização')
      }

      const { data, error } = await supabase
        .from('sac_clientes')
        .update({
          email_gestor: emailGestor,
          nome_gestor: nomeGestor
        })
        .eq('id', solicitacaoId)
        .select() // Retornar os dados atualizados

      if (error) {
        console.error('❌ [useSacData] Erro ao atualizar gestor:', error)
        throw new Error(error.message)
      }

      console.log('✅ [useSacData] Gestor atualizado com sucesso:', data)

      // Atualizar o estado local imediatamente
      setSolicitacoes(prev => prev.map(sol => 
        sol.id === solicitacaoId 
          ? { ...sol, email_gestor: emailGestor, nome_gestor: nomeGestor }
          : sol
      ))

      // Forçar refresh dos dados para garantir consistência
      console.log('🔄 [useSacData] Recarregando dados para confirmar atualização...')
      await fetchSolicitacoes()

      return { success: true, data }
    } catch (err) {
      console.error('💥 [useSacData] Erro ao atualizar gestor:', err)
      throw err
    }
  }

  const getSolicitacoesByGestor = async (emailGestor: string) => {
    try {
      console.log('🔍 [useSacData] Buscando solicitações por gestor:', emailGestor)
      
      const { data, error } = await supabase
        .from('sac_clientes')
        .select('*')
        .eq('email_gestor', emailGestor)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [useSacData] Erro ao buscar por gestor:', error)
        throw new Error(error.message)
      }

      console.log('✅ [useSacData] Solicitações encontradas para gestor:', data?.length || 0)
      return data || []
    } catch (err) {
      console.error('💥 [useSacData] Erro ao buscar por gestor:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchSolicitacoes()

    // Setup realtime subscription
    console.log('📡 [useSacData] Configurando subscription realtime...')
    const channel = supabase
      .channel('sac_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'sac_clientes' 
        }, 
        (payload) => {
          console.log('📡 [useSacData] Mudança detectada via realtime:', payload)
          fetchSolicitacoes()
        }
      )
      .subscribe()

    return () => {
      console.log('📡 [useSacData] Removendo subscription realtime...')
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    solicitacoes,
    loading,
    error,
    refetch: fetchSolicitacoes,
    updateGestor,
    getSolicitacoesByGestor
  }
}
