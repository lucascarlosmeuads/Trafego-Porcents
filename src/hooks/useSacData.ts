
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

      // Atualizar no banco
      const { data, error } = await supabase
        .from('sac_clientes')
        .update({
          email_gestor: emailGestor,
          nome_gestor: nomeGestor
        })
        .eq('id', solicitacaoId)
        .select()

      if (error) {
        console.error('❌ [useSacData] Erro ao atualizar gestor:', error)
        throw new Error(error.message)
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhuma linha foi atualizada - verifique se o ID existe')
      }

      console.log('✅ [useSacData] Gestor atualizado no banco:', data[0])

      // Atualizar estado local imediatamente para feedback instantâneo
      setSolicitacoes(prev => prev.map(sol => 
        sol.id === solicitacaoId 
          ? { ...sol, email_gestor: emailGestor, nome_gestor: nomeGestor }
          : sol
      ))

      // Forçar um refresh completo para garantir consistência
      setTimeout(() => {
        console.log('🔄 [useSacData] Fazendo refresh após atualização...')
        fetchSolicitacoes()
      }, 100)

      return { success: true, data: data[0] }
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
          
          // Se foi uma atualização, atualizar o estado local também
          if (payload.eventType === 'UPDATE' && payload.new) {
            setSolicitacoes(prev => prev.map(sol => 
              sol.id === payload.new.id 
                ? { ...sol, ...payload.new }
                : sol
            ))
          }
          
          // Fazer um refresh suave após pequeno delay
          setTimeout(() => {
            fetchSolicitacoes()
          }, 500)
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
