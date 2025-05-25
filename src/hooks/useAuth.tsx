
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

  // Verificar tipo de usuário no banco de dados - APENAS para usuários autenticados
  const checkUserType = async (email: string) => {
    console.log('🔍 [useAuth] === INICIANDO VERIFICAÇÃO DE TIPO DE USUÁRIO ===')
    console.log('🔍 [useAuth] Email recebido:', `"${email}"`)
    
    // Normalizar o email para evitar problemas de comparação
    const normalizedEmail = email.toLowerCase().trim()
    console.log('🔍 [useAuth] Email normalizado:', `"${normalizedEmail}"`)
    
    try {
      // PRIMEIRO: Verificar se é gestor na tabela gestores
      console.log('🔍 [useAuth] === ETAPA 1: Verificando se é gestor ===')
      const { data: gestorData, error: gestorError } = await supabase
        .from('gestores')
        .select('nome, email, ativo')
        .eq('email', normalizedEmail)
        .eq('ativo', true)
        .maybeSingle()

      console.log('🔍 [useAuth] Query gestores - Data:', gestorData)
      console.log('🔍 [useAuth] Query gestores - Error:', gestorError)

      if (!gestorError && gestorData) {
        console.log('✅ [useAuth] RESULTADO: Usuário é GESTOR:', gestorData.nome)
        setIsGestor(true)
        setIsCliente(false)
        setCurrentManagerName(gestorData.nome)
        return 'gestor'
      }

      // SEGUNDO: Verificar se é cliente na tabela todos_clientes
      console.log('🔍 [useAuth] === ETAPA 2: Verificando se é cliente ===')
      console.log('🔍 [useAuth] Fazendo query na tabela todos_clientes...')
      
      const { data: clienteData, error: clienteError } = await supabase
        .from('todos_clientes')
        .select('email_cliente, nome_cliente')
        .eq('email_cliente', normalizedEmail)
        .maybeSingle()

      console.log('🔍 [useAuth] Query clientes - Data:', clienteData)
      console.log('🔍 [useAuth] Query clientes - Error:', clienteError)

      if (!clienteError && clienteData) {
        console.log('✅ [useAuth] RESULTADO: Usuário é CLIENTE:', clienteData.nome_cliente || 'Nome não informado')
        setIsGestor(false)
        setIsCliente(true)
        setCurrentManagerName('')
        return 'cliente'
      }

      // Debug adicional: verificar se o email existe na tabela
      console.log('🔍 [useAuth] === DEBUG: Verificando emails na tabela todos_clientes ===')
      const { data: debugEmails, error: debugError } = await supabase
        .from('todos_clientes')
        .select('email_cliente, nome_cliente')
        .limit(10)
      
      console.log('🔍 [useAuth] DEBUG - Primeiros 10 emails encontrados:', debugEmails)
      console.log('🔍 [useAuth] DEBUG - Error na consulta:', debugError)

      // Verificar se há emails similares
      if (debugEmails) {
        const similarEmails = debugEmails.filter(item => 
          item.email_cliente && item.email_cliente.toLowerCase().includes(normalizedEmail.split('@')[0])
        )
        console.log('🔍 [useAuth] DEBUG - Emails similares encontrados:', similarEmails)
      }

      // Se não está em nenhuma tabela, é um usuário sem permissão
      console.log('❌ [useAuth] RESULTADO: Usuário não encontrado em nenhuma tabela de permissão')
      setIsGestor(false)
      setIsCliente(false)
      setCurrentManagerName('')
      return 'unauthorized'

    } catch (error) {
      console.error('❌ [useAuth] Erro crítico ao verificar tipo de usuário:', error)
      setIsGestor(false)
      setIsCliente(false)
      setCurrentManagerName('')
      return 'error'
    }
  }

  useEffect(() => {
    // Configuração inicial - verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 [useAuth] Sessão inicial verificada:', session?.user?.email || 'nenhuma')
      setUser(session?.user ?? null)
      if (session?.user?.email) {
        if (session.user.email === 'lucas@admin.com') {
          console.log('🔍 [useAuth] Usuário é ADMIN')
          setIsGestor(false)
          setIsCliente(false)
          setCurrentManagerName('Administrador')
        } else {
          console.log('🔍 [useAuth] Iniciando verificação de tipo para:', session.user.email)
          checkUserType(session.user.email)
        }
      }
      setLoading(false)
    })

    // Configuração do listener para mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [useAuth] Auth state changed:', event, session?.user?.email || 'nenhum usuário')
      
      setUser(session?.user ?? null)
      
      if (session?.user?.email) {
        console.log('✅ [useAuth] Usuário AUTENTICADO pelo Supabase:', session.user.email)
        if (session.user.email === 'lucas@admin.com') {
          console.log('🔍 [useAuth] Usuário é ADMIN')
          setIsGestor(false)
          setIsCliente(false)
          setCurrentManagerName('Administrador')
        } else {
          console.log('🔍 [useAuth] Iniciando verificação de tipo para:', session.user.email)
          await checkUserType(session.user.email)
        }
      } else {
        console.log('❌ [useAuth] Nenhum usuário autenticado')
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
    
    // CRÍTICO: Usar signInWithPassword que valida email/senha no Supabase Auth
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
