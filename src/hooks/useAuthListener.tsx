
import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthState } from '@/hooks/useAuthState'

export function useAuthListener() {
  const {
    setUser,
    setLoading,
    updateUserType,
    resetUserState
  } = useAuthState()

  // Função para lidar com mudanças de autenticação
  const handleAuthChange = useCallback(async (event: string, session: any) => {
    console.log('🔄 [useAuthListener] === MUDANÇA DE AUTENTICAÇÃO ===')
    console.log('🔄 [useAuthListener] Evento:', event)
    console.log('🔄 [useAuthListener] Email do usuário:', session?.user?.email || 'nenhum usuário')
    console.log('🔄 [useAuthListener] Sessão válida:', !!session)
    
    // Atualizar estado do usuário imediatamente
    setUser(session?.user ?? null)
    
    if (session?.user?.email) {
      console.log('✅ [useAuthListener] === USUÁRIO AUTENTICADO ===')
      console.log('✅ [useAuthListener] Email:', session.user.email)
      console.log('🔍 [useAuthListener] Iniciando determinação de tipo de usuário...')
      
      // Usar setTimeout para evitar deadlock, mas com delay menor
      setTimeout(async () => {
        try {
          console.log('🔄 [useAuthListener] Executando updateUserType...')
          await updateUserType(session.user.email)
          console.log('✅ [useAuthListener] updateUserType concluído com sucesso')
        } catch (error) {
          console.error('❌ [useAuthListener] === ERRO NO updateUserType ===')
          console.error('❌ [useAuthListener] Erro:', error)
          console.error('❌ [useAuthListener] Forçando fim do loading por erro')
          setLoading(false)
        }
      }, 100) // Reduzido para 100ms
    } else {
      console.log('❌ [useAuthListener] === SEM USUÁRIO AUTENTICADO ===')
      console.log('🧹 [useAuthListener] Limpando estado...')
      resetUserState()
    }
  }, [setUser, updateUserType, resetUserState, setLoading])

  useEffect(() => {
    let mounted = true
    let initialCheckComplete = false
    
    console.log('🚀 [useAuthListener] === INICIALIZANDO AUTH LISTENER ===')
    
    // Timeout de segurança reduzido
    const loadingTimeout = setTimeout(() => {
      if (mounted && !initialCheckComplete) {
        console.log('⚠️ [useAuthListener] === TIMEOUT DE CARREGAMENTO ===')
        console.log('⚠️ [useAuthListener] Forçando fim do loading por timeout')
        setLoading(false)
        initialCheckComplete = true
      }
    }, 8000) // Reduzido para 8 segundos

    // Configuração do listener PRIMEIRO
    console.log('🔧 [useAuthListener] Configurando onAuthStateChange...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)
    console.log('✅ [useAuthListener] Listener configurado')

    // Verificação inicial da sessão existente
    const checkInitialSession = async () => {
      try {
        console.log('🔍 [useAuthListener] === VERIFICAÇÃO INICIAL DE SESSÃO ===')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [useAuthListener] Erro ao verificar sessão inicial:', error)
          if (mounted) {
            setLoading(false)
            initialCheckComplete = true
          }
          return
        }

        if (mounted) {
          console.log('🔍 [useAuthListener] Sessão inicial encontrada:', session?.user?.email || 'nenhuma')
          
          if (session?.user?.email) {
            console.log('✅ [useAuthListener] Usuário já autenticado na inicialização')
            setUser(session.user)
            
            try {
              console.log('🔄 [useAuthListener] Determinando tipo na inicialização...')
              await updateUserType(session.user.email)
              console.log('✅ [useAuthListener] Tipo determinado na inicialização')
            } catch (error) {
              console.error('❌ [useAuthListener] Erro na verificação inicial:', error)
              setLoading(false)
            }
          } else {
            console.log('ℹ️ [useAuthListener] Nenhum usuário autenticado na inicialização')
            setLoading(false)
          }
          
          initialCheckComplete = true
        }
      } catch (error) {
        console.error('❌ [useAuthListener] === ERRO CRÍTICO NA INICIALIZAÇÃO ===')
        console.error('❌ [useAuthListener] Erro:', error)
        if (mounted) {
          setLoading(false)
          initialCheckComplete = true
        }
      }
    }

    checkInitialSession()

    // Cleanup
    return () => {
      console.log('🧹 [useAuthListener] Limpando listener...')
      mounted = false
      initialCheckComplete = true
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
      console.log('✅ [useAuthListener] Listener limpo')
    }
  }, [handleAuthChange, setUser, updateUserType, setLoading])
}
