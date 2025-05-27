
import { supabase } from '@/lib/supabase'

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

export const checkUserType = async (email: string): Promise<'admin' | 'gestor' | 'cliente' | 'vendedor' | 'unauthorized' | 'error'> => {
  console.log('🔍 [authHelpers] === VERIFICAÇÃO DE TIPO DE USUÁRIO ===')
  console.log('🔍 [authHelpers] Email autenticado:', `"${email}"`)
  console.log('🔍 [authHelpers] IMPORTANTE: Este usuário JÁ foi autenticado pelo Supabase Auth')
  
  const normalizedEmail = normalizeEmail(email)
  console.log('🔍 [authHelpers] Email normalizado:', `"${normalizedEmail}"`)
  
  try {
    // LÓGICA BASEADA NO DOMÍNIO
    if (normalizedEmail.includes('@admin')) {
      console.log('👑 [authHelpers] Usuário é ADMIN (domínio @admin)')
      return 'admin'
    }

    // NOVO: Verificação para vendedores
    if (normalizedEmail.startsWith('vendedor') && normalizedEmail.includes('@trafegoporcents.com')) {
      console.log('💼 [authHelpers] Usuário é VENDEDOR (vendedor*@trafegoporcents.com)')
      return 'vendedor'
    }

    if (normalizedEmail.includes('@trafegoporcents.com')) {
      console.log('👨‍💼 [authHelpers] Usuário é GESTOR (domínio @trafegoporcents.com)')
      return 'gestor'
    }

    // TODOS OS OUTROS EMAILS SÃO CLIENTES
    console.log('👤 [authHelpers] Usuário é CLIENTE (qualquer outro domínio)')
    console.log('📋 [authHelpers] Verificando se existe em todos_clientes (apenas para logging)')
    
    // Check if client exists in todos_clientes (for logging purposes only)
    try {
      const { data: clienteData, error: clienteError } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, email_cliente')
        .eq('email_cliente', normalizedEmail)
        .single()

      if (clienteError && clienteError.code !== 'PGRST116') {
        console.warn('⚠️ [authHelpers] Erro ao verificar cliente na tabela:', clienteError)
      }

      if (clienteData) {
        console.log('✅ [authHelpers] Cliente encontrado na tabela todos_clientes:', clienteData.nome_cliente)
        console.log('🆔 [authHelpers] ID do cliente:', clienteData.id)
      } else {
        console.log('📋 [authHelpers] Cliente NÃO encontrado na tabela todos_clientes')
        console.log('💡 [authHelpers] Isso é normal para novos usuários ou clientes sem registro na tabela')
        console.log('🔧 [authHelpers] O sistema permitirá acesso como cliente mesmo sem registro na tabela')
      }
    } catch (error) {
      console.warn('⚠️ [authHelpers] Erro ao verificar cliente:', error)
      console.log('🔧 [authHelpers] Permitindo acesso como cliente mesmo com erro na verificação')
    }

    return 'cliente'

  } catch (error) {
    console.error('❌ [authHelpers] ERRO CRÍTICO:', error)
    console.log('🔧 [authHelpers] Fallback: permitindo acesso como cliente')
    return 'cliente' // Fallback to cliente instead of error
  }
}

export const getManagerName = async (email: string): Promise<string> => {
  const normalizedEmail = normalizeEmail(email)
  
  try {
    const { data: gestorData, error: gestorError } = await supabase
      .from('gestores')
      .select('nome')
      .ilike('email', normalizedEmail)
      .eq('ativo', true)
      .single()

    if (!gestorError && gestorData) {
      return gestorData.nome
    }
  } catch (error) {
    console.warn('⚠️ [authHelpers] Erro ao buscar nome do gestor:', error)
  }
  
  return 'Gestor'
}
