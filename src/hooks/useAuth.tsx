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
    isRelatorios,
    isClienteNovo,
    isClienteParceria,
    currentManagerName,
    updateUserType,
    resetUserState
  } = useAuthState()

  // Função otimizada para evitar loops
  const handleAuthChange = useCallback(async (event: string, session: any) => {
    console.log('🔄 [useAuth] Auth state changed:', event, session?.user?.email || 'nenhum usuário')
    
    // Atualizar estado do usuário imediatamente (síncrono)
    setUser(session?.user ?? null)
    
    if (session?.user?.email) {
      console.log('✅ [useAuth] Usuário AUTENTICADO:', session.user.email)
      console.log('🔍 [useAuth] Determinando tipo de usuário baseado apenas em autenticação válida')
      
      // Usar setTimeout para evitar deadlock no onAuthStateChange
      setTimeout(async () => {
        try {
          await updateUserType(session.user.email)
        } catch (error) {
          console.error('❌ [useAuth] Erro ao atualizar tipo de usuário:', error)
          // Em caso de erro, não travar - permitir que o usuário continue
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

  console.log('🔍 [useAuth] === ESTADO ATUAL ===')
  console.log('🔍 [useAuth] Usuário:', user?.email)
  console.log('🔍 [useAuth] Loading:', loading)
  console.log('🔍 [useAuth] Tipos de usuário:', {
    isAdmin,
    isGestor,
    isCliente,
    isVendedor,
    isSites,
    isRelatorios
  })

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      isAdmin, 
      isGestor,
      isCliente,
      isVendedor,
      isSites,
      isRelatorios,
      isClienteNovo,
      isClienteParceria,
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
