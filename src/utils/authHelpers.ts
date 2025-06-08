
import { supabase } from '@/lib/supabase'

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

export const checkUserType = async (email: string): Promise<'admin' | 'gestor' | 'cliente' | 'vendedor' | 'sites' | 'relatorios' | 'unauthorized' | 'error'> => {
  console.log('🔍 [authHelpers] === VERIFICAÇÃO DE TIPO DE USUÁRIO ===')
  console.log('🔍 [authHelpers] Email recebido:', `"${email}"`)
  
  const normalizedEmail = normalizeEmail(email)
  console.log('🔍 [authHelpers] Email normalizado:', `"${normalizedEmail}"`)
  
  try {
    // VERIFICAÇÃO PARA RELATÓRIOS - PRIORIDADE MÁXIMA
    console.log('📊 [authHelpers] === TESTANDO @relatorios.com ===')
    console.log('📊 [authHelpers] Email para teste:', `"${normalizedEmail}"`)
    console.log('📊 [authHelpers] Contém @relatorios.com?', normalizedEmail.includes('@relatorios.com'))
    
    if (normalizedEmail.includes('@relatorios.com')) {
      console.log('📊 [authHelpers] ✅ SUCESSO! Email contém @relatorios.com')
      console.log('📊 [authHelpers] 🎯 RETORNANDO: "relatorios"')
      console.log('📊 [authHelpers] 🚀 Usuário tem acesso total ao painel /admin-relatorios')
      return 'relatorios'
    }

    // Admin - segunda prioridade
    if (normalizedEmail.includes('@admin')) {
      console.log('👑 [authHelpers] Usuário é ADMIN (domínio @admin)')
      return 'admin'
    }

    // Sites - verificação específica
    const emailsAutorizadosSites = ['criadordesite@trafegoporcents.com']
    if (emailsAutorizadosSites.includes(normalizedEmail)) {
      console.log('🌐 [authHelpers] Usuário é SITES (email autorizado)')
      return 'sites'
    }

    // Vendedores
    if (normalizedEmail.startsWith('vendedor') && normalizedEmail.includes('@trafegoporcents.com')) {
      console.log('💼 [authHelpers] Usuário é VENDEDOR')
      return 'vendedor'
    }

    // Gestores @trafegoporcents.com
    if (normalizedEmail.includes('@trafegoporcents.com')) {
      console.log('👨‍💼 [authHelpers] Usuário é GESTOR (domínio @trafegoporcents.com)')
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
      console.log('✅ [authHelpers] Cliente encontrado na tabela')
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
      console.log('✅ [authHelpers] Gestor encontrado na tabela')
      return 'gestor'
    }

    console.log('❌ [authHelpers] USUÁRIO NÃO AUTORIZADO')
    console.log('❌ [authHelpers] Nenhuma verificação passou para:', normalizedEmail)
    return 'unauthorized'

  } catch (error) {
    console.error('❌ [authHelpers] ERRO CRÍTICO:', error)
    return 'error'
  }
}

export const getManagerName = async (email: string): Promise<string> => {
  const normalizedEmail = normalizeEmail(email)
  
  // Para usuários de relatórios
  if (normalizedEmail.includes('@relatorios.com')) {
    console.log('📊 [authHelpers] Nome para usuário de relatórios: "Analista de Relatórios"')
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
