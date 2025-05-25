
import { supabase } from '@/lib/supabase'

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

export const checkUserType = async (email: string): Promise<'admin' | 'gestor' | 'cliente' | 'unauthorized' | 'error'> => {
  console.log('🔍 [authHelpers] === VERIFICAÇÃO SIMPLIFICADA DE TIPO DE USUÁRIO ===')
  console.log('🔍 [authHelpers] Email recebido:', `"${email}"`)
  
  const normalizedEmail = normalizeEmail(email)
  console.log('🔍 [authHelpers] Email normalizado:', `"${normalizedEmail}"`)
  
  try {
    // LÓGICA SIMPLIFICADA BASEADA NO DOMÍNIO
    if (normalizedEmail.includes('@admin')) {
      console.log('✅ [authHelpers] Usuário é ADMIN (domínio @admin)')
      return 'admin'
    }

    if (normalizedEmail.includes('@trafegoporcents.com')) {
      console.log('✅ [authHelpers] Usuário é GESTOR (domínio @trafegoporcents.com)')
      return 'gestor'
    }

    // TODOS OS OUTROS EMAILS SÃO CLIENTES
    console.log('✅ [authHelpers] Usuário é CLIENTE (qualquer outro domínio)')
    return 'cliente'

  } catch (error) {
    console.error('❌ [authHelpers] ERRO CRÍTICO:', error)
    return 'error'
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
