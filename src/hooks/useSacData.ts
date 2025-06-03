
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
      console.log('💾 [useSacData] === INÍCIO SALVAMENTO NO BANCO ===')
      console.log('💾 [useSacData] Dados para UPDATE:', {
        id: solicitacaoId,
        email_gestor: emailGestor,
        nome_gestor: nomeGestor
      })

      // Validação dos parâmetros
      if (!solicitacaoId || !emailGestor || !nomeGestor) {
        throw new Error(`Parâmetros inválidos: ID=${solicitacaoId}, Email=${emailGestor}, Nome=${nomeGestor}`)
      }

      // Executar UPDATE no banco
      console.log('💾 [useSacData] Executando UPDATE no Supabase...')
      const { data, error: updateError } = await supabase
        .from('sac_clientes')
        .update({
          email_gestor: emailGestor,
          nome_gestor: nomeGestor
        })
        .eq('id', solicitacaoId)
        .select('*')

      if (updateError) {
        console.error('❌ [useSacData] Erro no UPDATE:', updateError)
        throw new Error(`Falha ao salvar no banco: ${updateError.message}`)
      }

      console.log('✅ [useSacData] UPDATE executado com sucesso:', data)

      // Verificar se o registro foi realmente atualizado
      if (!data || data.length === 0) {
        console.warn('⚠️ [useSacData] Nenhum registro foi atualizado')
        throw new Error('Nenhum registro foi encontrado ou atualizado')
      }

      const updatedRecord = data[0]
      console.log('✅ [useSacData] Registro atualizado confirmado:', {
        id: updatedRecord.id,
        email_gestor: updatedRecord.email_gestor,
        nome_gestor: updatedRecord.nome_gestor
      })

      // Atualizar estado local com os dados confirmados do banco
      setSolicitacoes(prev => {
        const updated = prev.map(sol => 
          sol.id === solicitacaoId 
            ? { ...sol, email_gestor: updatedRecord.email_gestor, nome_gestor: updatedRecord.nome_gestor }
            : sol
        )
        console.log('🔄 [useSacData] Estado local atualizado com dados do banco')
        return updated
      })

      return { 
        success: true, 
        data: updatedRecord,
        message: 'Gestor salvo no banco de dados com sucesso'
      }

    } catch (err) {
      console.error('💥 [useSacData] Erro ao atualizar gestor:', err)
      
      // Não atualizar estado local em caso de erro
      throw new Error(err instanceof Error ? err.message : 'Erro desconhecido ao salvar')
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

  // Função para atualizar uma solicitação específica no estado local
  const updateSolicitacaoLocal = (solicitacaoId: string, updates: Partial<SacSolicitacao>) => {
    setSolicitacoes(prev => prev.map(sol => 
      sol.id === solicitacaoId 
        ? { ...sol, ...updates }
        : sol
    ))
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
          
          // Se foi uma atualização, atualizar o estado local
          if (payload.eventType === 'UPDATE' && payload.new) {
            console.log('📡 [useSacData] Atualizando estado local via realtime')
            setSolicitacoes(prev => prev.map(sol => 
              sol.id === payload.new.id 
                ? { ...sol, ...payload.new }
                : sol
            ))
          }
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
    getSolicitacoesByGestor,
    updateSolicitacaoLocal
  }
}
