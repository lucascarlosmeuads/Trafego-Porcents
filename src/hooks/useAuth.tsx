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
    console.log('🔍 [useAuth] Verificando tipo de usuário para usuário AUTENTICADO:', email)
    console.log('🔍 [useAuth] Email original recebido:', `"${email}"`)
    
    // Normalizar o email para evitar problemas de comparação
    const normalizedEmail = email.toLowerCase().trim()
    console.log('🔍 [useAuth] Email normalizado:', `"${normalizedEmail}"`)
    
    try {
      // PRIMEIRO: Verificar se é gestor na tabela gestores
      console.log('🔍 [useAuth] Verificando se é gestor...')
      const { data: gestorData, error: gestorError } = await supabase
        .from('gestores')
        .select('nome, email, ativo')
        .eq('email', normalizedEmail)
        .eq('ativo', true)
        .single()

      console.log('🔍 [useAuth] Resultado da busca de gestor:', { gestorData, gestorError })

      if (!gestorError && gestorData) {
        console.log('✅ [useAuth] Usuário autenticado é GESTOR:', gestorData.nome)
        setIsGestor(true)
        setIsCliente(false)
        setCurrentManagerName(gestorData.nome)
        return 'gestor'
      } else {
        console.log('ℹ️ [useAuth] Não é gestor, erro:', gestorError?.message || 'não encontrado')
      }

      // SEGUNDO: Verificar se é cliente na tabela todos_clientes (só se não for gestor)
      console.log('🔍 [useAuth] Verificando se é cliente...')
      console.log('🔍 [useAuth] Fazendo query para todos_clientes com email:', `"${normalizedEmail}"`)
      
      const { data: clienteData, error: clienteError } = await supabase
        .from('todos_clientes')
        .select('email_cliente, nome_cliente')
        .eq('email_cliente', normalizedEmail)
        .maybeSingle()

      console.log('🔍 [useAuth] Resultado da busca de cliente:', { clienteData, clienteError })
      console.log('🔍 [useAuth] Dados retornados:', clienteData)

      if (!clienteError && clienteData) {
        console.log('✅ [useAuth] Usuário autenticado é CLIENTE:', clienteData.nome_cliente)
        setIsGestor(false)
        setIsCliente(true)
        setCurrentManagerName('')
        return 'cliente'
      } else {
        console.log('ℹ️ [useAuth] Não é cliente, erro:', clienteError?.message || 'não encontrado')
        
        // Verificação adicional: listar alguns emails da tabela para debug
        console.log('🔍 [useAuth] DEBUGGING: Vamos verificar alguns emails na tabela todos_clientes')
        const { data: allEmails, error: debugError } = await supabase
          .from('todos_clientes')
          .select('email_cliente')
          .limit(5)
        
        console.log('🔍 [useAuth] DEBUG - Primeiros 5 emails na tabela:', allEmails)
        console.log('🔍 [useAuth] DEBUG - Erro na consulta de debug:', debugError)
      }

      // Se não está em nenhuma tabela, é um usuário sem permissão
      console.log('⚠️ [useAuth] Usuário autenticado não encontrado nas tabelas de permissão')
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
      console.log('🔍 [useAuth] Sessão inicial verificada:', session?.user?.email || 'nenhuma')
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
      console.log('🔄 [useAuth] Auth state changed:', event, session?.user?.email || 'nenhum usuário')
      
      setUser(session?.user ?? null)
      
      if (session?.user?.email) {
        console.log('✅ [useAuth] Usuário AUTENTICADO pelo Supabase:', session.user.email)
        if (session.user.email === 'lucas@admin.com') {
          setIsGestor(false)
          setIsCliente(false)
          setCurrentManagerName('Administrador')
        } else {
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
