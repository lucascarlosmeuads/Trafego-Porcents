
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  isAdmin: boolean
  isGestor: boolean
  isCliente: boolean
  currentManagerName: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGestor, setIsGestor] = useState(false)
  const [isCliente, setIsCliente] = useState(false)
  const [currentManagerName, setCurrentManagerName] = useState('')

  const isAdmin = user?.email === 'lucas@admin.com'

  // Verificar tipo de usuário no banco de dados
  const checkUserType = async (email: string) => {
    console.log('🔍 [useAuth] Verificando tipo de usuário para:', email)
    
    try {
      // Verificar se é gestor na tabela gestores
      const { data: gestorData, error: gestorError } = await supabase
        .from('gestores')
        .select('nome, email, ativo')
        .eq('email', email)
        .eq('ativo', true)
        .single()

      if (!gestorError && gestorData) {
        console.log('✅ [useAuth] Usuário é GESTOR:', gestorData.nome)
        setIsGestor(true)
        setIsCliente(false)
        setCurrentManagerName(gestorData.nome)
        return 'gestor'
      }

      // Verificar se é cliente na tabela todos_clientes
      const { data: clienteData, error: clienteError } = await supabase
        .from('todos_clientes')
        .select('email_cliente, nome_cliente')
        .eq('email_cliente', email)
        .single()

      if (!clienteError && clienteData) {
        console.log('✅ [useAuth] Usuário é CLIENTE:', clienteData.nome_cliente)
        setIsGestor(false)
        setIsCliente(true)
        setCurrentManagerName('')
        return 'cliente'
      }

      // Se não está em nenhuma tabela, é um usuário sem permissão
      console.log('⚠️ [useAuth] Usuário não encontrado nas tabelas de permissão')
      setIsGestor(false)
      setIsCliente(false)
      setCurrentManagerName('')
      return 'unauthorized'

    } catch (error) {
      console.error('❌ [useAuth] Erro ao verificar tipo de usuário:', error)
      setIsGestor(false)
      setIsCliente(false)
      setCurrentManagerName('')
      return 'error'
    }
  }

  useEffect(() => {
    // Configuração inicial - verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user?.email) {
        if (session.user.email === 'lucas@admin.com') {
          setIsGestor(false)
          setIsCliente(false)
          setCurrentManagerName('Administrador')
        } else {
          checkUserType(session.user.email)
        }
      }
      setLoading(false)
    })

    // Configuração do listener para mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [useAuth] Auth state changed:', event, session?.user?.email)
      
      setUser(session?.user ?? null)
      
      if (session?.user?.email) {
        if (session.user.email === 'lucas@admin.com') {
          setIsGestor(false)
          setIsCliente(false)
          setCurrentManagerName('Administrador')
        } else {
          await checkUserType(session.user.email)
        }
      } else {
        setIsGestor(false)
        setIsCliente(false)
        setCurrentManagerName('')
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('🔐 [useAuth] Tentativa de login para:', email)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signOut = async () => {
    console.log('🚪 [useAuth] Fazendo logout')
    setIsGestor(false)
    setIsCliente(false)
    setCurrentManagerName('')
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
