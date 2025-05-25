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

    // SEGUNDO: Verificar clientes PRIMEIRO (prioridade) - DIAGNÓSTICO COMPLETO
    console.log('🔍 [authHelpers] === DIAGNÓSTICO COMPLETO TODOS_CLIENTES ===')
    
    // Buscar TODOS os emails para comparação byte a byte
    const { data: todosClientes, error: todosError } = await supabase
      .from('todos_clientes')
      .select('email_cliente, nome_cliente, id')
    
    console.log('🔥 [authHelpers] TODOS OS EMAILS DISPONÍVEIS:')
    console.log('🔥 [authHelpers] Total de registros encontrados:', todosClientes?.length || 0)
    
    if (todosClientes && todosClientes.length > 0) {
      todosClientes.forEach((cliente, index) => {
        const emailTabela = cliente.email_cliente || 'NULL'
        console.log(`🔥 [authHelpers] Cliente ${index + 1}:`)
        console.log(`   - Email na tabela: "${emailTabela}"`)
        console.log(`   - Length: ${emailTabela.length}`)
        console.log(`   - Bytes: [${emailTabela.split('').map(c => c.charCodeAt(0)).join(', ')}]`)
        console.log(`   - Nome: ${cliente.nome_cliente || 'NULL'}`)
        console.log(`   - ID: ${cliente.id}`)
        
        // Comparação detalhada com o email procurado
        if (emailTabela.toLowerCase().trim() === normalizedEmail) {
          console.log('✅ [authHelpers] *** MATCH ENCONTRADO! ***')
          console.log('✅ [authHelpers] Email da tabela após normalização:', `"${emailTabela.toLowerCase().trim()}"`)
          console.log('✅ [authHelpers] Email procurado:', `"${normalizedEmail}"`)
        }
      })
    } else {
      console.log('❌ [authHelpers] Nenhum cliente encontrado na tabela!')
      console.log('❌ [authHelpers] Erro na consulta:', todosError)
    }
    
    console.log('🟡 [authHelpers] Email buscado:')
    console.log(`   - Valor: "${normalizedEmail}"`)
    console.log(`   - Length: ${normalizedEmail.length}`)
    console.log(`   - Bytes: [${normalizedEmail.split('').map(c => c.charCodeAt(0)).join(', ')}]`)
    
    // Busca manual com comparação rigorosa
    const clienteEncontrado = todosClientes?.find(cliente => {
      const emailTabela = (cliente.email_cliente || '').toLowerCase().trim()
      const match = emailTabela === normalizedEmail
      
      if (match) {
        console.log('🎯 [authHelpers] CLIENTE ENCONTRADO NA BUSCA MANUAL!')
        console.log('🎯 [authHelpers] Nome:', cliente.nome_cliente)
        console.log('🎯 [authHelpers] Email original da tabela:', cliente.email_cliente)
        console.log('🎯 [authHelpers] Email normalizado da tabela:', emailTabela)
        console.log('🎯 [authHelpers] Email procurado:', normalizedEmail)
        console.log('🎯 [authHelpers] ID:', cliente.id)
      }
      
      return match
    })

    if (clienteEncontrado) {
      console.log('✅ [authHelpers] === RETORNANDO TIPO: CLIENTE ===')
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
      console.log('✅ [authHelpers] === RETORNANDO TIPO: GESTOR ===')
      return 'gestor'
    }

    // QUARTO: Se não encontrou em nenhuma tabela
    console.log('❌ [authHelpers] === DIAGNÓSTICO DE FALHA ===')
    console.log('❌ [authHelpers] Email não encontrado em TODOS_CLIENTES nem GESTORES')
    console.log('❌ [authHelpers] Detalhes da busca:')
    console.log('   - Email procurado (normalizado):', normalizedEmail)
    console.log('   - Total de clientes na tabela:', todosClientes?.length || 0)
    console.log('   - Gestor Error:', gestorError)
    console.log('   - Gestor Data:', gestorData)
    console.log('✅ [authHelpers] === RETORNANDO TIPO: UNAUTHORIZED ===')
    
    return 'unauthorized'

  } catch (error) {
    console.error('❌ [authHelpers] === ERRO CRÍTICO ===')
    console.error('❌ [authHelpers] Erro na verificação:', error)
    console.error('❌ [authHelpers] Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    console.log('✅ [authHelpers] === RETORNANDO TIPO: ERROR ===')
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
