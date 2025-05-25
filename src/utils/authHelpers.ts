
import { supabase } from '@/lib/supabase'

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

export const checkUserType = async (email: string): Promise<'admin' | 'gestor' | 'cliente' | 'unauthorized' | 'error'> => {
  console.log('🔍 [authHelpers] === INICIANDO VERIFICAÇÃO DE TIPO DE USUÁRIO ===')
  console.log('🔍 [authHelpers] Email recebido:', `"${email}"`)
  
  const normalizedEmail = normalizeEmail(email)
  console.log('🔍 [authHelpers] Email normalizado:', `"${normalizedEmail}"`)
  
  try {
    // PRIMEIRO: Verificar se é gestor na tabela gestores
    console.log('🔍 [authHelpers] === ETAPA 1: Verificando se é gestor ===')
    const { data: gestorData, error: gestorError } = await supabase
      .from('gestores')
      .select('nome, email, ativo')
      .eq('email', normalizedEmail)
      .eq('ativo', true)
      .maybeSingle()

    console.log('🔍 [authHelpers] Query gestores - Data:', gestorData)
    console.log('🔍 [authHelpers] Query gestores - Error:', gestorError)

    if (!gestorError && gestorData) {
      console.log('✅ [authHelpers] RESULTADO: Usuário é GESTOR:', gestorData.nome)
      return 'gestor'
    }

    // SEGUNDO: Verificar se é cliente na tabela todos_clientes
    console.log('🔍 [authHelpers] === ETAPA 2: Verificando se é cliente ===')
    console.log('🔍 [authHelpers] Fazendo query na tabela todos_clientes...')
    
    const { data: clienteData, error: clienteError } = await supabase
      .from('todos_clientes')
      .select('email_cliente, nome_cliente')
      .eq('email_cliente', normalizedEmail)
      .maybeSingle()

    console.log('🔍 [authHelpers] Query clientes - Data:', clienteData)
    console.log('🔍 [authHelpers] Query clientes - Error:', clienteError)

    if (!clienteError && clienteData) {
      console.log('✅ [authHelpers] RESULTADO: Usuário é CLIENTE:', clienteData.nome_cliente || 'Nome não informado')
      return 'cliente'
    }

    // Debug adicional: verificar se o email existe na tabela
    console.log('🔍 [authHelpers] === DEBUG: Verificando emails na tabela todos_clientes ===')
    const { data: debugEmails, error: debugError } = await supabase
      .from('todos_clientes')
      .select('email_cliente, nome_cliente')
      .limit(10)
    
    console.log('🔍 [authHelpers] DEBUG - Primeiros 10 emails encontrados:', debugEmails)
    console.log('🔍 [authHelpers] DEBUG - Error na consulta:', debugError)

    // Verificar se há emails similares
    if (debugEmails) {
      const similarEmails = debugEmails.filter(item => 
        item.email_cliente && item.email_cliente.toLowerCase().includes(normalizedEmail.split('@')[0])
      )
      console.log('🔍 [authHelpers] DEBUG - Emails similares encontrados:', similarEmails)
    }

    // Se não está em nenhuma tabela, é um usuário sem permissão
    console.log('❌ [authHelpers] RESULTADO: Usuário não encontrado em nenhuma tabela de permissão')
    return 'unauthorized'

  } catch (error) {
    console.error('❌ [authHelpers] Erro crítico ao verificar tipo de usuário:', error)
    return 'error'
  }
}

export const getManagerName = async (email: string): Promise<string> => {
  const normalizedEmail = normalizeEmail(email)
  
  try {
    const { data: gestorData, error: gestorError } = await supabase
      .from('gestores')
      .select('nome')
      .eq('email', normalizedEmail)
      .eq('ativo', true)
      .single()

    if (!gestorError && gestorData) {
      return gestorData.nome
    }
  } catch (error) {
    console.warn('⚠️ [authHelpers] Erro ao buscar nome do gestor:', error)
  }
  
  return ''
}
