
import { useEffect, createContext, useContext, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthState } from '@/hooks/useAuthState'
import type { AuthContextType } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    setUser,
    loading,
    setLoading,
    isAdmin,
    isGestor,
    isCliente,
    isVendedor,
    isSites,
    currentManagerName,
    updateUserType,
    resetUserState
  } = useAuthState()

  // Função otimizada para detectar recovery
  const handleAuthChange = useCallback(async (event: string, session: any) => {
    console.log('🔄 [useAuth] Auth state changed:', event, session?.user?.email || 'nenhum usuário')
    
    // Verificar se é um fluxo de recovery de múltiplas formas
    const checkRecoveryContext = () => {
      // 1. Verificar parâmetros da URL (tanto query quanto hash)
      const urlParams = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const hasRecoveryInUrl = urlParams.get('type') === 'recovery' || 
                              hashParams.get('type') === 'recovery' ||
                              window.location.href.includes('type=recovery')
      
      // 2. Verificar se há tokens de recovery no hash (formato Supabase)
      const hasRecoveryTokens = window.location.hash.includes('access_token') && 
                               window.location.hash.includes('recovery')
      
      // 3. Verificar se a sessão tem características de recovery
      const hasRecoverySession = session?.user && 
                                event === 'SIGNED_IN' && 
                                (hasRecoveryInUrl || hasRecoveryTokens)
      
      return hasRecoveryInUrl || hasRecoveryTokens || hasRecoverySession
    }
    
    // Detectar recovery e sinalizar
    if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') && session?.user) {
      const isRecovery = checkRecoveryContext()
      
      if (isRecovery) {
        console.log('🔑 [useAuth] RECOVERY DETECTADO! Usuário deve redefinir senha')
        
        // Limpar URL para evitar loops
        if (window.location.search || window.location.hash) {
          window.history.replaceState({}, document.title, window.location.pathname)
        }
        
        // Sinalizar recovery através de evento customizado
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('supabase-recovery', { 
            detail: { user: session.user, isRecovery: true } 
          }))
        }, 100)
      }
    }
    
    // Atualizar estado do usuário imediatamente (síncrono)
    setUser(session?.user ?? null)
    
    if (session?.user?.email) {
      console.log('✅ [useAuth] Usuário AUTENTICADO:', session.user.email)
      
      // Usar setTimeout para evitar deadlock no onAuthStateChange
      setTimeout(async () => {
        try {
          await updateUserType(session.user.email)
        } catch (error) {
          console.error('❌ [useAuth] Erro ao atualizar tipo de usuário:', error)
        } finally {
          setLoading(false)
        }
      }, 0)
    } else {
      console.log('❌ [useAuth] Nenhum usuário autenticado')
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
          console.error('❌ [useAuth] Erro ao verificar sessão:', error)
          setLoading(false)
          return
        }

        if (mounted) {
          console.log('🔍 [useAuth] Sessão inicial verificada:', session?.user?.email || 'nenhuma')
          
          // Verificar recovery na inicialização também
          const urlParams = new URLSearchParams(window.location.search)
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const hasRecoveryTokens = window.location.hash.includes('access_token') && 
                                   window.location.hash.includes('recovery')
          const isRecovery = urlParams.get('type') === 'recovery' || 
                            hashParams.get('type') === 'recovery' ||
                            hasRecoveryTokens ||
                            window.location.href.includes('type=recovery')
          
          if (isRecovery && session?.user) {
            console.log('🔑 [useAuth] RECOVERY INICIAL DETECTADO!')
            // Limpar URL e sinalizar recovery
            window.history.replaceState({}, document.title, window.location.pathname)
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('supabase-recovery', { 
                detail: { user: session.user, isRecovery: true } 
              }))
            }, 200)
          }
          
          setUser(session?.user ?? null)
          
          if (session?.user?.email) {
            try {
              await updateUserType(session.user.email)
            } catch (error) {
              console.error('❌ [useAuth] Erro na verificação inicial:', error)
            }
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ [useAuth] Erro crítico na inicialização:', error)
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
  }, []) // Dependências vazias para evitar loops

  const signIn = async (email: string, password: string) => {
    console.log('🔐 [useAuth] === PROCESSO DE LOGIN ===')
    console.log('📧 [useAuth] Email:', email)
    console.log('🔍 [useAuth] Validação baseada APENAS no Supabase Auth')
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) {
        console.error('❌ [useAuth] Falha na autenticação Supabase:', error.message)
        console.error('🔥 [useAuth] Código do erro:', error.code)
        setLoading(false)
        return { error }
      }
      
      if (data.user) {
        console.log('✅ [useAuth] Login bem-sucedido para:', data.user.email)
        console.log('🎯 [useAuth] Usuário autenticado via Supabase Auth')
      }
      
      return { error: null }
    } catch (error) {
      console.error('❌ [useAuth] Erro inesperado no login:', error)
      setLoading(false)
      return { error }
    }
  }

  const signUp = async (email: string, password: string) => {
    console.log('🔐 [useAuth] === PROCESSO DE CADASTRO ===')
    console.log('📧 [useAuth] Email:', email)
    console.log('🔍 [useAuth] Validação baseada APENAS no Supabase Auth')
    console.log('❌ [useAuth] NÃO verificando todos_clientes ou outras tabelas')
    
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
      })
      
      if (error) {
        console.error('❌ [useAuth] Erro no cadastro Supabase:', error.message)
        console.error('🔥 [useAuth] Código do erro:', error.code)
        setLoading(false)
        return { error }
      }
      
      if (data.user) {
        console.log('✅ [useAuth] Cadastro bem-sucedido para:', data.user.email)
        console.log('🎯 [useAuth] Conta criada no Supabase Auth')
      }
      
      setLoading(false)
      return { error: null }
    } catch (error) {
      console.error('❌ [useAuth] Erro inesperado no cadastro:', error)
      setLoading(false)
      return { error }
    }
  }

  const resetPassword = async (email: string) => {
    console.log('🔐 [useAuth] === PROCESSO DE RECUPERAÇÃO DE SENHA ===')
    console.log('📧 [useAuth] Email:', email)
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/?type=recovery`
      })
      
      if (error) {
        console.error('❌ [useAuth] Erro na recuperação de senha:', error.message)
        setLoading(false)
        return { error }
      }
      
      console.log('✅ [useAuth] Email de recuperação enviado para:', email)
      setLoading(false)
      return { error: null }
    } catch (error) {
      console.error('❌ [useAuth] Erro inesperado na recuperação:', error)
      setLoading(false)
      return { error }
    }
  }

  const updatePassword = async (newPassword: string) => {
    console.log('🔐 [useAuth] === PROCESSO DE ATUALIZAÇÃO DE SENHA ===')
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      })
      
      if (error) {
        console.error('❌ [useAuth] Erro ao atualizar senha:', error.message)
        setLoading(false)
        return { error }
      }
      
      console.log('✅ [useAuth] Senha atualizada com sucesso!')
      setLoading(false)
      return { error: null }
    } catch (error) {
      console.error('❌ [useAuth] Erro inesperado na atualização:', error)
      setLoading(false)
      return { error }
    }
  }

  const signOut = async () => {
    console.log('🚪 [useAuth] === PROCESSO DE LOGOUT ===')
    setLoading(true)
    
    try {
      console.log('🧹 [useAuth] Limpando estado local primeiro')
      resetUserState()
      
      console.log('🗑️ [useAuth] Limpando localStorage')
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          console.log('🗑️ [useAuth] Removendo:', key)
          localStorage.removeItem(key)
        }
      })
      
      console.log('🚪 [useAuth] Fazendo logout no Supabase')
      await supabase.auth.signOut({ scope: 'global' })
      
      console.log('✅ [useAuth] Logout concluído, redirecionando...')
      
      // Forçar reload da página para limpar completamente o estado
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      
    } catch (error) {
      console.error('❌ [useAuth] Erro no logout:', error)
      // Em caso de erro, forçar redirecionamento mesmo assim
      console.log('🚪 [useAuth] Forçando redirecionamento por erro')
      window.location.href = '/'
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      resetPassword,
      updatePassword,
      isAdmin, 
      isGestor,
      isCliente,
      isVendedor,
      isSites,
      currentManagerName
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
