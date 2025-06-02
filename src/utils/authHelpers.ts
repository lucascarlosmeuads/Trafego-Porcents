
import { supabase } from '@/lib/supabase'

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

export const checkUserType = async (email: string): Promise<'admin' | 'gestor' | 'cliente' | 'vendedor' | 'sites' | 'unauthorized' | 'error'> => {
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

    // Verificação específica e PRIORITÁRIA para criadores de sites
    if (normalizedEmail === 'criadordesite@trafegoporcents.com' ||
        normalizedEmail.includes('criador') || 
        normalizedEmail.includes('site') || 
        normalizedEmail.includes('webdesign') ||
        normalizedEmail.includes('sites') ||
        normalizedEmail.includes('web') ||
        normalizedEmail.startsWith('sites') ||
        normalizedEmail.endsWith('sites.com') ||
        normalizedEmail.includes('design') ||
        normalizedEmail.includes('developer') ||
        normalizedEmail.includes('dev')) {
      console.log('🌐 [authHelpers] ✅ USUÁRIO É SITES (confirmado)')
      console.log('🌐 [authHelpers] 🎯 Email específico reconhecido:', normalizedEmail)
      return 'sites'
    }

    // Verificação para vendedores
    if (normalizedEmail.startsWith('vendedor') && normalizedEmail.includes('@trafegoporcents.com')) {
      console.log('💼 [authHelpers] Usuário é VENDEDOR (vendedor*@trafegoporcents.com)')
      return 'vendedor'
    }

    // Verificação para gestores (@trafegoporcents.com mas não vendedor)
    if (normalizedEmail.includes('@trafegoporcents.com')) {
      console.log('👨‍💼 [authHelpers] Usuário é GESTOR (domínio @trafegoporcents.com)')
      return 'gestor'
    }

    // VERIFICAÇÃO PARA CLIENTES - Buscar na tabela todos_clientes (CASE-INSENSITIVE)
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

    if (clienteError) {
      console.log('⚠️ [authHelpers] Erro ao buscar cliente ou cliente não encontrado:', clienteError.message)
      console.log('⚠️ [authHelpers] Código do erro:', clienteError.code)
      console.log('⚠️ [authHelpers] Detalhes completos do erro:', clienteError)
      
      if (clienteError.code === 'PGRST116') {
        console.log('❌ [authHelpers] Cliente não encontrado na tabela todos_clientes')
        console.log('🔍 [authHelpers] Vamos tentar uma busca mais ampla para debug...')
        
        // Fazer uma busca mais ampla para debug
        const { data: todosClientes, error: debugError } = await supabase
          .from('todos_clientes')
          .select('id, email_cliente, nome_cliente')
          .limit(5)
        
        console.log('🔍 [authHelpers] Primeiros 5 clientes na tabela (para debug):', todosClientes)
        console.log('🔍 [authHelpers] Erro na busca debug:', debugError)
      }
    } else if (cliente) {
      console.log('✅ [authHelpers] CLIENTE ENCONTRADO!')
      console.log('👤 [authHelpers] ID:', cliente.id)
      console.log('👤 [authHelpers] Nome:', cliente.nome_cliente)
      console.log('👤 [authHelpers] Email:', cliente.email_cliente)
      return 'cliente'
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
    console.log('   - Sites (patterns): NÃO')
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
  
  // Para usuários de sites, retornar nome específico
  if (normalizedEmail === 'criadordesite@trafegoporcents.com' ||
      normalizedEmail.includes('criador') || 
      normalizedEmail.includes('site') || 
      normalizedEmail.includes('webdesign') ||
      normalizedEmail.includes('sites') ||
      normalizedEmail.includes('web') ||
      normalizedEmail.includes('design') ||
      normalizedEmail.includes('developer') ||
      normalizedEmail.includes('dev')) {
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
