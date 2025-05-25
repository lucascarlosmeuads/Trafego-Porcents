
import { supabase } from '@/lib/supabase'

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

export const checkUserType = async (email: string): Promise<'admin' | 'gestor' | 'cliente' | 'unauthorized' | 'error'> => {
  console.log('🔍 [authHelpers] === VERIFICAÇÃO DETALHADA DE TIPO DE USUÁRIO ===')
  console.log('🔍 [authHelpers] Email original:', `"${email}"`)
  
  const normalizedEmail = normalizeEmail(email)
  console.log('🔍 [authHelpers] Email normalizado:', `"${normalizedEmail}"`)
  
  try {
    // PRIMEIRO: Verificar se é admin
    if (normalizedEmail === 'lucas@admin.com') {
      console.log('✅ [authHelpers] Usuário é ADMIN (hardcoded)')
      return 'admin'
    }

    // SEGUNDO: Verificar clientes PRIMEIRO (prioridade) - Busca mais robusta
    console.log('🔍 [authHelpers] Verificando tabela TODOS_CLIENTES...')
    console.log('🔍 [authHelpers] Buscando por email_cliente com múltiplas estratégias...')
    const clienteStartTime = Date.now()
    
    // Primeira tentativa: busca exata case-insensitive
    let { data: clienteData, error: clienteError } = await supabase
      .from('todos_clientes')
      .select('email_cliente, nome_cliente, id')
      .ilike('email_cliente', normalizedEmail)
      .limit(1)

    // Se não encontrou, tenta busca com LIKE pattern matching
    if (!clienteData || clienteData.length === 0) {
      console.log('🔍 [authHelpers] Primeira busca não retornou resultados, tentando pattern matching...')
      const { data: patternData, error: patternError } = await supabase
        .from('todos_clientes')
        .select('email_cliente, nome_cliente, id')
        .ilike('email_cliente', `%${normalizedEmail}%`)
        .limit(1)
      
      clienteData = patternData
      clienteError = patternError
    }

    // Se ainda não encontrou, faz busca geral para debug
    if (!clienteData || clienteData.length === 0) {
      console.log('🔍 [authHelpers] === BUSCA DE DEBUG DETALHADA ===')
      const { data: allEmails } = await supabase
        .from('todos_clientes')
        .select('email_cliente, nome_cliente, id')
        .limit(20)
      
      console.log('🔍 [authHelpers] Todos os emails encontrados na tabela:', allEmails)
      
      // Busca manual case-insensitive nos resultados
      const manualMatch = allEmails?.find(cliente => 
        cliente.email_cliente?.toLowerCase().trim() === normalizedEmail
      )
      
      if (manualMatch) {
        console.log('✅ [authHelpers] ENCONTRADO NA BUSCA MANUAL!')
        console.log('✅ [authHelpers] Email da tabela:', manualMatch.email_cliente)
        console.log('✅ [authHelpers] Email procurado:', normalizedEmail)
        clienteData = [manualMatch]
        clienteError = null
      }
    }

    const clienteEndTime = Date.now()
    console.log(`🔍 [authHelpers] Consulta clientes levou: ${clienteEndTime - clienteStartTime}ms`)
    console.log('🔍 [authHelpers] Resultado cliente - data:', clienteData)
    console.log('🔍 [authHelpers] Resultado cliente - error:', clienteError)

    if (!clienteError && clienteData && clienteData.length > 0) {
      const cliente = clienteData[0]
      console.log('✅ [authHelpers] CLIENTE ENCONTRADO!')
      console.log('✅ [authHelpers] Nome:', cliente.nome_cliente || 'Nome não informado')
      console.log('✅ [authHelpers] Email encontrado na tabela:', cliente.email_cliente)
      console.log('✅ [authHelpers] ID do cliente:', cliente.id)
      return 'cliente'
    }

    // TERCEIRO: Verificar gestores (apenas se não for cliente)
    console.log('🔍 [authHelpers] Verificando tabela GESTORES...')
    console.log('🔍 [authHelpers] Buscando por email ILIKE:', `"${normalizedEmail}"`)
    const gestorStartTime = Date.now()
    
    const { data: gestorData, error: gestorError } = await supabase
      .from('gestores')
      .select('nome, email, ativo')
      .ilike('email', normalizedEmail)
      .eq('ativo', true)
      .maybeSingle()

    const gestorEndTime = Date.now()
    console.log(`🔍 [authHelpers] Consulta gestores levou: ${gestorEndTime - gestorStartTime}ms`)
    console.log('🔍 [authHelpers] Resultado gestor - data:', gestorData)
    console.log('🔍 [authHelpers] Resultado gestor - error:', gestorError)

    if (!gestorError && gestorData) {
      console.log('✅ [authHelpers] GESTOR ENCONTRADO!')
      console.log('✅ [authHelpers] Nome:', gestorData.nome)
      console.log('✅ [authHelpers] Email encontrado na tabela:', gestorData.email)
      return 'gestor'
    }

    // QUARTO: Se não encontrou em nenhuma tabela
    console.log('❌ [authHelpers] === DIAGNÓSTICO DE FALHA ===')
    console.log('❌ [authHelpers] Email não encontrado em TODOS_CLIENTES nem GESTORES')
    console.log('❌ [authHelpers] Detalhes da busca:')
    console.log('   - Email procurado (normalizado):', normalizedEmail)
    console.log('   - Cliente Error:', clienteError)
    console.log('   - Cliente Data:', clienteData)
    console.log('   - Gestor Error:', gestorError)
    console.log('   - Gestor Data:', gestorData)
    
    return 'unauthorized'

  } catch (error) {
    console.error('❌ [authHelpers] === ERRO CRÍTICO ===')
    console.error('❌ [authHelpers] Erro na verificação:', error)
    console.error('❌ [authHelpers] Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    return 'error'
  }
}

export const getManagerName = async (email: string): Promise<string> => {
  const normalizedEmail = normalizeEmail(email)
  
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout ao buscar nome do gestor')), 5000)
    )
    
    const gestorPromise = supabase
      .from('gestores')
      .select('nome')
      .ilike('email', normalizedEmail)
      .eq('ativo', true)
      .single()

    const { data: gestorData, error: gestorError } = await Promise.race([
      gestorPromise,
      timeoutPromise
    ]) as any

    if (!gestorError && gestorData) {
      return gestorData.nome
    }
  } catch (error) {
    console.warn('⚠️ [authHelpers] Erro ao buscar nome do gestor:', error)
  }
  
  return ''
}
