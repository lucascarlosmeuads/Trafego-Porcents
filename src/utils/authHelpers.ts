
import { supabase } from '@/lib/supabase'

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

export const checkUserType = async (email: string): Promise<'admin' | 'gestor' | 'cliente' | 'vendedor' | 'sites' | 'relatorios' | 'unauthorized' | 'error'> => {
  console.log('🔍 [authHelpers] === VERIFICAÇÃO DE TIPO DE USUÁRIO ===')
  console.log('🔍 [authHelpers] Email autenticado:', `"${email}"`)
  console.log('🔍 [authHelpers] IMPORTANTE: Este usuário JÁ foi autenticado pelo Supabase Auth')
  
  const normalizedEmail = normalizeEmail(email)
  console.log('🔍 [authHelpers] Email normalizado:', `"${normalizedEmail}"`)
  
  try {
    // LÓGICA BASEADA NO DOMÍNIO - Admin primeiro
    if (normalizedEmail.includes('@admin')) {
      console.log('👑 [authHelpers] Usuário é ADMIN (domínio @admin)')
      return 'admin'
    }

    // VERIFICAÇÃO PARA RELATÓRIOS - NOVA FUNCIONALIDADE
    if (normalizedEmail.includes('@relatorios.com')) {
      console.log('📊 [authHelpers] Usuário é RELATÓRIOS (domínio @relatorios.com)')
      return 'relatorios'
    }

    // VERIFICAÇÃO RESTRITIVA PARA CRIADORES DE SITES - MOVIDA PARA CIMA
    console.log('🔍 [authHelpers] Verificando se é criador de sites autorizado...')
    const emailsAutorizadosSites = [
      'criadordesite@trafegoporcents.com'
    ]
    
    if (emailsAutorizadosSites.includes(normalizedEmail)) {
      console.log('🌐 [authHelpers] ✅ USUÁRIO É SITES (email autorizado na whitelist)')
      console.log('🌐 [authHelpers] 🎯 Email específico autorizado:', normalizedEmail)
      console.log('🔒 [authHelpers] WHITELIST DE SITES:', emailsAutorizadosSites)
      return 'sites'
    } else {
      console.log('❌ [authHelpers] Email NÃO está na whitelist de criadores de sites')
      console.log('🔒 [authHelpers] Emails autorizados para sites:', emailsAutorizadosSites)
      console.log('🚫 [authHelpers] Email testado:', normalizedEmail)
    }

    // Verificação para vendedores
    if (normalizedEmail.startsWith('vendedor') && normalizedEmail.includes('@trafegoporcents.com')) {
      console.log('💼 [authHelpers] Usuário é VENDEDOR (vendedor*@trafegoporcents.com)')
      return 'vendedor'
    }

    // Verificação para gestores (@trafegoporcents.com mas não vendedor e não criador de sites)
    if (normalizedEmail.includes('@trafegoporcents.com')) {
      console.log('👨‍💼 [authHelpers] Usuário é GESTOR (domínio @trafegoporcents.com)')
      return 'gestor'
    }

    // VERIFICAÇÃO PARA CLIENTES - PRIORIDADE MÁXIMA (antes de sites)
    console.log('🔍 [authHelpers] Verificando se é cliente na tabela todos_clientes...')
    console.log('🔍 [authHelpers] Fazendo query: SELECT id, email_cliente, nome_cliente FROM todos_clientes WHERE LOWER(email_cliente) = ?', normalizedEmail)
    
    const { data: cliente, error: clienteError } = await supabase
      .from('todos_clientes')
      .select('id, email_cliente, nome_cliente')
      .ilike('email_cliente', normalizedEmail)
      .single()

    console.log('🔍 [authHelpers] Resultado da query cliente:', {
      data: cliente,
      error: clienteError
    })

    if (!clienteError && cliente) {
      console.log('✅ [authHelpers] CLIENTE ENCONTRADO NA TABELA!')
      console.log('👤 [authHelpers] ID:', cliente.id)
      console.log('👤 [authHelpers] Nome:', cliente.nome_cliente)
      console.log('👤 [authHelpers] Email:', cliente.email_cliente)
      console.log('🎯 [authHelpers] DIRECIONANDO PARA PAINEL DE CLIENTE')
      return 'cliente'
    } else {
      console.log('⚠️ [authHelpers] Cliente não encontrado na tabela todos_clientes')
      if (clienteError && clienteError.code === 'PGRST116') {
        console.log('❌ [authHelpers] Código PGRST116 - Cliente definitivamente não existe')
      }
    }

    // Verificação adicional na tabela gestores
    console.log('🔍 [authHelpers] Verificando se é gestor na tabela gestores...')
    const { data: gestor, error: gestorError } = await supabase
      .from('gestores')
      .select('id, email, nome, ativo')
      .ilike('email', normalizedEmail)
      .single()

    console.log('🔍 [authHelpers] Resultado da query gestor:', {
      data: gestor,
      error: gestorError
    })

    if (!gestorError && gestor && gestor.ativo) {
      console.log('✅ [authHelpers] GESTOR ENCONTRADO NA TABELA!')
      console.log('👨‍💼 [authHelpers] ID:', gestor.id)
      console.log('👨‍💼 [authHelpers] Nome:', gestor.nome)
      console.log('👨‍💼 [authHelpers] Email:', gestor.email)
      console.log('👨‍💼 [authHelpers] Ativo:', gestor.ativo)
      return 'gestor'
    }

    console.log('❌ [authHelpers] USUÁRIO NÃO AUTORIZADO')
    console.log('❌ [authHelpers] Email não encontrado em nenhuma tabela do sistema')
    console.log('❌ [authHelpers] Resumo das verificações:')
    console.log('   - Admin (@admin): NÃO')
    console.log('   - Relatórios (@relatorios.com): NÃO')
    console.log('   - Sites (whitelist específica): NÃO AUTORIZADO')
    console.log('   - Vendedor (vendedor*@trafegoporcents.com): NÃO')
    console.log('   - Gestor (@trafegoporcents.com): NÃO ou INATIVO')
    console.log('   - Cliente (tabela todos_clientes): NÃO ENCONTRADO')
    console.log('   - Gestor (tabela gestores): NÃO ENCONTRADO OU INATIVO')
    
    return 'unauthorized'

  } catch (error) {
    console.error('❌ [authHelpers] ERRO CRÍTICO:', error)
    console.error('❌ [authHelpers] Stack trace:', error instanceof Error ? error.stack : 'N/A')
    return 'error'
  }
}

export const getManagerName = async (email: string): Promise<string> => {
  const normalizedEmail = normalizeEmail(email)
  
  // Para usuários de relatórios, retornar nome específico
  if (normalizedEmail.includes('@relatorios.com')) {
    return 'Analista de Relatórios'
  }
  
  // Para usuários de sites, retornar nome específico APENAS para emails autorizados
  const emailsAutorizadosSites = [
    'criadordesite@trafegoporcents.com'
  ]
  
  if (emailsAutorizadosSites.includes(normalizedEmail)) {
    return 'Criador de Sites'
  }
  
  try {
    // Tentar buscar nome do gestor primeiro (CASE-INSENSITIVE)
    const { data: gestorData, error: gestorError } = await supabase
      .from('gestores')
      .select('nome')
      .ilike('email', normalizedEmail)
      .eq('ativo', true)
      .single()

    if (!gestorError && gestorData) {
      return gestorData.nome
    }

    // Se não for gestor, tentar buscar nome do cliente (CASE-INSENSITIVE)
    const { data: clienteData, error: clienteError } = await supabase
      .from('todos_clientes')
      .select('nome_cliente')
      .ilike('email_cliente', normalizedEmail)
      .single()

    if (!clienteError && clienteData) {
      return clienteData.nome_cliente || 'Cliente'
    }

  } catch (error) {
    console.warn('⚠️ [authHelpers] Erro ao buscar nome do usuário:', error)
  }
  
  return 'Usuário'
}
