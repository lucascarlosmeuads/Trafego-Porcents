
import { supabase } from '@/lib/supabase'

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

export const checkUserType = async (email: string): Promise<'admin' | 'gestor' | 'cliente' | 'vendedor' | 'sites' | 'relatorios' | 'unauthorized' | 'error'> => {
  console.log('🔍 [authHelpers] Verificando tipo para:', email)
  
  const normalizedEmail = normalizeEmail(email)
  
  try {
    // RELATÓRIOS - primeira prioridade
    if (normalizedEmail.includes('@relatorios.com')) {
      console.log('📊 [authHelpers] Usuário de relatórios confirmado')
      return 'relatorios'
    }

    // Admin
    if (normalizedEmail.includes('@admin')) {
      console.log('👑 [authHelpers] Usuário admin confirmado')
      return 'admin'
    }

    // Sites
    const emailsAutorizadosSites = ['criadordesite@trafegoporcents.com']
    if (emailsAutorizadosSites.includes(normalizedEmail)) {
      console.log('🌐 [authHelpers] Usuário de sites confirmado')
      return 'sites'
    }

    // Vendedores
    if (normalizedEmail.startsWith('vendedor') && normalizedEmail.includes('@trafegoporcents.com')) {
      console.log('💼 [authHelpers] Usuário vendedor confirmado')
      return 'vendedor'
    }

    // Gestores @trafegoporcents.com
    if (normalizedEmail.includes('@trafegoporcents.com')) {
      console.log('👨‍💼 [authHelpers] Usuário gestor confirmado')
      return 'gestor'
    }

    // Verificação na tabela clientes
    console.log('🔍 [authHelpers] Verificando tabela todos_clientes...')
    const { data: cliente, error: clienteError } = await supabase
      .from('todos_clientes')
      .select('id, email_cliente, nome_cliente')
      .ilike('email_cliente', normalizedEmail)
      .single()

    if (!clienteError && cliente) {
      console.log('✅ [authHelpers] Cliente encontrado')
      return 'cliente'
    }

    // Verificação na tabela gestores
    console.log('🔍 [authHelpers] Verificando tabela gestores...')
    const { data: gestor, error: gestorError } = await supabase
      .from('gestores')
      .select('id, email, nome, ativo')
      .ilike('email', normalizedEmail)
      .single()

    if (!gestorError && gestor && gestor.ativo) {
      console.log('✅ [authHelpers] Gestor encontrado')
      return 'gestor'
    }

    console.log('❌ [authHelpers] Usuário não autorizado')
    return 'unauthorized'

  } catch (error) {
    console.error('❌ [authHelpers] Erro:', error)
    return 'error'
  }
}

export const getManagerName = async (email: string): Promise<string> => {
  const normalizedEmail = normalizeEmail(email)
  
  // Para usuários de relatórios
  if (normalizedEmail.includes('@relatorios.com')) {
    return 'Analista de Relatórios'
  }
  
  // Para usuários de sites autorizados
  const emailsAutorizadosSites = ['criadordesite@trafegoporcents.com']
  if (emailsAutorizadosSites.includes(normalizedEmail)) {
    return 'Criador de Sites'
  }
  
  try {
    // Buscar nome do gestor
    const { data: gestorData, error: gestorError } = await supabase
      .from('gestores')
      .select('nome')
      .ilike('email', normalizedEmail)
      .eq('ativo', true)
      .single()

    if (!gestorError && gestorData) {
      return gestorData.nome
    }

    // Buscar nome do cliente
    const { data: clienteData, error: clienteError } = await supabase
      .from('todos_clientes')
      .select('nome_cliente')
      .ilike('email_cliente', normalizedEmail)
      .single()

    if (!clienteError && clienteData) {
      return clienteData.nome_cliente || 'Cliente'
    }

  } catch (error) {
    console.warn('⚠️ [authHelpers] Erro ao buscar nome:', error)
  }
  
  return 'Usuário'
}
