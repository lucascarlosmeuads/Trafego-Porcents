
import { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { checkUserType, getManagerName } from '@/utils/authHelpers'
import type { UserType } from '@/types/auth'

interface SimpleAuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  isAdmin: boolean
  isGestor: boolean
  isCliente: boolean
  isVendedor: boolean
  isSites: boolean
  currentManagerName: string
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined)

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [userType, setUserType] = useState<UserType>('unauthorized')
  const [currentManagerName, setCurrentManagerName] = useState<string>('')

  // Função simplificada para determinar tipo de usuário
  const determineUserType = async (userEmail: string) => {
    console.log('🔍 [SimpleAuth] Determinando tipo para:', userEmail)
    
    try {
      const tipo = await checkUserType(userEmail)
      const nome = await getManagerName(userEmail)
      
      console.log('✅ [SimpleAuth] Tipo determinado:', tipo)
      console.log('✅ [SimpleAuth] Nome determinado:', nome)
      
      setUserType(tipo)
      setCurrentManagerName(nome)
    } catch (error) {
      console.error('❌ [SimpleAuth] Erro ao determinar tipo:', error)
      setUserType('error')
      setCurrentManagerName('')
    }
  }

  // Configurar listener de autenticação - SEM TIMEOUT, SEM COMPLEXIDADE
  useEffect(() => {
    console.log('🚀 [SimpleAuth] Inicializando autenticação simplificada')
    
    // Verificar sessão atual imediatamente
    const checkCurrentSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [SimpleAuth] Erro na sessão:', error)
          setUser(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          console.log('✅ [SimpleAuth] Sessão encontrada para:', session.user.email)
          setUser(session.user)
          await determineUserType(session.user.email)
        } else {
          console.log('ℹ️ [SimpleAuth] Nenhuma sessão encontrada')
          setUser(null)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('❌ [SimpleAuth] Erro crítico na verificação:', error)
        setUser(null)
        setLoading(false)
      }
    }

    // Configurar listener de mudanças
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [SimpleAuth] Mudança de auth:', event, session?.user?.email)
        
        if (session?.user) {
          setUser(session.user)
          await determineUserType(session.user.email)
        } else {
          setUser(null)
          setUserType('unauthorized')
          setCurrentManagerName('')
        }
        
        setLoading(false)
      }
    )

    // Executar verificação inicial
    checkCurrentSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Função de login simplificada
  const signIn = async (email: string, password: string) => {
    console.log('🔐 [SimpleAuth] Fazendo login para:', email)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) {
        console.error('❌ [SimpleAuth] Erro no login:', error.message)
        return { error }
      }
      
      console.log('✅ [SimpleAuth] Login bem-sucedido')
      return { error: null }
    } catch (error) {
      console.error('❌ [SimpleAuth] Erro inesperado:', error)
      return { error }
    }
  }

  // Função de cadastro simplificada
  const signUp = async (email: string, password: string) => {
    console.log('📝 [SimpleAuth] Fazendo cadastro para:', email)
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
      })
      
      if (error) {
        console.error('❌ [SimpleAuth] Erro no cadastro:', error.message)
        return { error }
      }
      
      console.log('✅ [SimpleAuth] Cadastro bem-sucedido')
      return { error: null }
    } catch (error) {
      console.error('❌ [SimpleAuth] Erro inesperado no cadastro:', error)
      return { error }
    }
  }

  // Função de logout simplificada
  const signOut = async () => {
    console.log('🚪 [SimpleAuth] Fazendo logout')
    
    try {
      // Limpar estado local primeiro
      setUser(null)
      setUserType('unauthorized')
      setCurrentManagerName('')
      
      // Limpar localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase') || key.includes('sb-') || key.includes('auth')) {
          localStorage.removeItem(key)
        }
      })
      
      // Logout no Supabase
      await supabase.auth.signOut({ scope: 'global' })
      
      // Redirecionar
      window.location.href = '/'
    } catch (error) {
      console.error('❌ [SimpleAuth] Erro no logout:', error)
      window.location.href = '/'
    }
  }

  // Computed properties
  const isAdmin = userType === 'admin'
  const isGestor = userType === 'gestor'
  const isCliente = userType === 'cliente'
  const isVendedor = userType === 'vendedor'
  const isSites = userType === 'sites'

  return (
    <SimpleAuthContext.Provider value={{ 
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
      currentManagerName
    }}>
      {children}
    </SimpleAuthContext.Provider>
  )
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext)
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider')
  }
  return context
}
