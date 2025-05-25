
import { useEffect, createContext, useContext } from 'react'
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
    currentManagerName,
    updateUserType,
    resetUserState
  } = useAuthState()

  useEffect(() => {
    // Configuração inicial - verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 [useAuth] Sessão inicial verificada:', session?.user?.email || 'nenhuma')
      setUser(session?.user ?? null)
      if (session?.user?.email) {
        updateUserType(session.user.email)
      }
      setLoading(false)
    })

    // Configuração do listener para mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [useAuth] Auth state changed:', event, session?.user?.email || 'nenhum usuário')
      
      setUser(session?.user ?? null)
      
      if (session?.user?.email) {
        console.log('✅ [useAuth] Usuário AUTENTICADO pelo Supabase:', session.user.email)
        await updateUserType(session.user.email)
      } else {
        console.log('❌ [useAuth] Nenhum usuário autenticado')
        resetUserState()
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('🔐 [useAuth] Tentativa de login para:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })
    
    if (error) {
      console.error('❌ [useAuth] Falha na autenticação do Supabase:', error.message)
    } else if (data.user) {
      console.log('✅ [useAuth] Autenticação do Supabase bem-sucedida para:', data.user.email)
    }
    
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signOut = async () => {
    console.log('🚪 [useAuth] Fazendo logout')
    resetUserState()
    await supabase.auth.signOut()
  }

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
