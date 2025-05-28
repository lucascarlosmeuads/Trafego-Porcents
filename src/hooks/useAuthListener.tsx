
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

  // Função otimizada para evitar loops
  const handleAuthChange = useCallback(async (event: string, session: any) => {
    console.log('🔄 [useAuthListener] Auth state changed:', event, session?.user?.email || 'nenhum usuário')
    
    // Atualizar estado do usuário imediatamente (síncrono)
    setUser(session?.user ?? null)
    
    if (session?.user?.email) {
      console.log('✅ [useAuthListener] Usuário AUTENTICADO:', session.user.email)
      console.log('🔍 [useAuthListener] Determinando tipo de usuário baseado apenas em autenticação válida')
      
      // Usar setTimeout para evitar deadlock no onAuthStateChange
      setTimeout(async () => {
        try {
          await updateUserType(session.user.email)
        } catch (error) {
          console.error('❌ [useAuthListener] Erro ao atualizar tipo de usuário:', error)
          // Em caso de erro, não travar - permitir que o usuário continue
        } finally {
          setLoading(false)
        }
      }, 0)
    } else {
      console.log('❌ [useAuthListener] Nenhum usuário autenticado')
      resetUserState()
      setLoading(false)
    }
  }, [setUser, updateUserType, resetUserState, setLoading])

  useEffect(() => {
    let mounted = true
    
    // Configuração do listener PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)

    // Verificação inicial da sessão existente
    const checkInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [useAuthListener] Erro ao verificar sessão:', error)
          setLoading(false)
          return
        }

        if (mounted) {
          console.log('🔍 [useAuthListener] Sessão inicial verificada:', session?.user?.email || 'nenhuma')
          setUser(session?.user ?? null)
          
          if (session?.user?.email) {
            try {
              await updateUserType(session.user.email)
            } catch (error) {
              console.error('❌ [useAuthListener] Erro na verificação inicial:', error)
            }
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ [useAuthListener] Erro crítico na inicialização:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkInitialSession()

    // Cleanup
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [handleAuthChange, setUser, updateUserType, setLoading])
}
