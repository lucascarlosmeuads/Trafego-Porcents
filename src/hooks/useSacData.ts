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
      console.log('🔄 [useSacData] === INÍCIO ATUALIZAÇÃO GESTOR ===')
      console.log('🔄 [useSacData] Dados recebidos:', {
        solicitacaoId,
        emailGestor,
        nomeGestor,
        idType: typeof solicitacaoId,
        idLength: solicitacaoId?.length
      })

      // Validar dados antes de enviar
      if (!solicitacaoId || !emailGestor || !nomeGestor) {
        throw new Error('Dados incompletos para atualização')
      }

      // Validar formato UUID do ID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(solicitacaoId)) {
        console.error('❌ [useSacData] ID inválido (não é UUID):', solicitacaoId)
        throw new Error('ID da solicitação inválido')
      }

      // Verificar se o registro existe antes de tentar atualizar
      console.log('🔍 [useSacData] Verificando se registro existe...')
      const { data: existingRecord, error: checkError } = await supabase
        .from('sac_clientes')
        .select('id, nome, email_gestor, nome_gestor')
        .eq('id', solicitacaoId)
        .single()

      if (checkError) {
        console.error('❌ [useSacData] Erro ao verificar registro:', checkError)
        throw new Error(`Registro não encontrado: ${checkError.message}`)
      }

      if (!existingRecord) {
        throw new Error('Solicitação não encontrada no banco de dados')
      }

      console.log('✅ [useSacData] Registro encontrado:', existingRecord)

      // Atualizar no banco - CORREÇÃO: Remover verificação restritiva do resultado
      console.log('💾 [useSacData] Executando UPDATE...')
      const { error: updateError } = await supabase
        .from('sac_clientes')
        .update({
          email_gestor: emailGestor,
          nome_gestor: nomeGestor
        })
        .eq('id', solicitacaoId)

      // CORREÇÃO: Verificar apenas se houve erro, não o resultado vazio
      if (updateError) {
        console.error('❌ [useSacData] Erro no UPDATE:', updateError)
        throw new Error(`Erro ao atualizar: ${updateError.message}`)
      }

      console.log('✅ [useSacData] UPDATE executado sem erros')

      // Verificar se a atualização foi realmente aplicada
      console.log('🔍 [useSacData] Verificando se atualização foi aplicada...')
      const { data: updatedRecord, error: verifyError } = await supabase
        .from('sac_clientes')
        .select('id, nome, email_gestor, nome_gestor')
        .eq('id', solicitacaoId)
        .single()

      if (verifyError) {
        console.error('❌ [useSacData] Erro ao verificar atualização:', verifyError)
        throw new Error('Erro ao verificar se atualização foi aplicada')
      }

      if (!updatedRecord || updatedRecord.email_gestor !== emailGestor || updatedRecord.nome_gestor !== nomeGestor) {
        console.error('❌ [useSacData] Atualização não foi aplicada corretamente')
        console.error('   - Esperado:', { email_gestor: emailGestor, nome_gestor: nomeGestor })
        console.error('   - Encontrado:', { email_gestor: updatedRecord?.email_gestor, nome_gestor: updatedRecord?.nome_gestor })
        throw new Error('Atualização não foi aplicada corretamente no banco de dados')
      }

      console.log('✅ [useSacData] Verificação confirmada - dados atualizados:', updatedRecord)

      // Atualizar estado local imediatamente
      setSolicitacoes(prev => {
        const updated = prev.map(sol => 
          sol.id === solicitacaoId 
            ? { ...sol, email_gestor: emailGestor, nome_gestor: nomeGestor }
            : sol
        )
        console.log('🔄 [useSacData] Estado local atualizado')
        return updated
      })

      // Forçar um refresh completo para garantir consistência
      setTimeout(() => {
        console.log('🔄 [useSacData] Fazendo refresh após atualização...')
        fetchSolicitacoes()
      }, 500)

      return { success: true, data: updatedRecord }
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
