
import { useState, useEffect, useContext, createContext, useMemo } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { AuthContextType, UserType } from '@/types/auth'

type AuthProviderProps = {
  children: React.ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userType, setUserType] = useState<UserType>('unauthorized')
  const [currentManagerName, setCurrentManagerName] = useState('')

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true)
        const {
          data: { session },
        } = await supabase.auth.getSession()

        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false)
      }
    }

    getSession()

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      setSession(session)
    })
  }, [])

  useEffect(() => {
    const getCurrentManagerName = async (email: string) => {
      if (!email) return

      try {
        const { data, error } = await supabase
          .from('gestores')
          .select('nome')
          .eq('email', email)
          .single()

        if (error) {
          console.error('Erro ao buscar nome do gestor:', error)
          setCurrentManagerName(email)
        }

        if (data) {
          setCurrentManagerName(data.nome)
        } else {
          setCurrentManagerName(email)
        }
      } catch (error) {
        console.error('Erro ao buscar nome do gestor:', error)
        setCurrentManagerName(email)
      }
    }

    if (user?.email) {
      getCurrentManagerName(user.email)
    }
  }, [user?.email])

  useEffect(() => {
    const checkUserType = async () => {
      if (user?.email) {
        const type = await determineUserType(user.email)
        setUserType(type)
      } else {
        setUserType('unauthorized')
      }
      setLoading(false)
    }

    checkUserType()
  }, [user?.email])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error }
    } catch (error) {
      console.error("Error signing in:", error);
      return { error };
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      return { error }
    } catch (error) {
      console.error("Error signing up:", error);
      return { error };
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false)
    }
  }

const determineUserType = async (email: string): Promise<UserType> => {
  console.log('🔍 [useAuth] Determinando tipo de usuário para:', email)
  
  // ADMIN: Verificação prioritária
  if (email === 'admin@exemple.com' || email === 'admin@example.com') {
    console.log('👑 [useAuth] Usuário identificado como ADMIN')
    return 'admin'
  }

  // CRIADOR DE SITES: Verificação por padrão de email
  if (email.includes('site') || email.includes('criador') || email.endsWith('@sites.com')) {
    console.log('🌐 [useAuth] Usuário identificado como CRIADOR DE SITES')
    return 'criador_site'
  }

  // GESTOR: Busca na tabela 'gestores'
  const { data: gestor, error: gestorError } = await supabase
    .from('gestores')
    .select('email')
    .eq('email', email)
    .single()

  if (gestorError && gestorError.code !== 'PGRST116') {
    console.error('Erro ao buscar gestor:', gestorError)
    return 'error'
  }

  if (gestor) {
    console.log('👨‍💼 [useAuth] Usuário identificado como GESTOR')
    return 'gestor'
  }

  // VENDEDOR: Busca na tabela 'vendedores'
  const { data: vendedor, error: vendedorError } = await supabase
    .from('vendedores')
    .select('email')
    .eq('email', email)
    .single()

  if (vendedorError && vendedorError.code !== 'PGRST116') {
    console.error('Erro ao buscar vendedor:', vendedorError)
    return 'error'
  }

  if (vendedor) {
    console.log('💼 [useAuth] Usuário identificado como VENDEDOR')
    return 'vendedor'
  }

  // CLIENTE: Por padrão, qualquer outro usuário é cliente
  console.log('👤 [useAuth] Usuário identificado como CLIENTE (padrão)')
  return 'cliente'
}

  const contextValue = useMemo(() => ({
    user,
    loading,
    signIn,
    signUp, 
    signOut,
    isAdmin: userType === 'admin',
    isGestor: userType === 'gestor',
    isCliente: userType === 'cliente',
    isVendedor: userType === 'vendedor',
    isCriadorSite: userType === 'criador_site',
    currentManagerName
  }), [user, loading, userType, currentManagerName])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
