
import { supabase } from '@/lib/supabase'

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

export const checkUserType = async (email: string): Promise<'admin' | 'gestor' | 'cliente' | 'unauthorized' | 'error'> => {
  console.log('🔍 [authHelpers] === VERIFICAÇÃO OTIMIZADA DE TIPO DE USUÁRIO ===')
  console.log('🔍 [authHelpers] Email:', `"${email}"`)
  
  const normalizedEmail = normalizeEmail(email)
  
  try {
    // ESTRATÉGIA OTIMIZADA: Fazer as duas consultas em paralelo
    const [gestorPromise, clientePromise] = [
      supabase
        .from('gestores')
        .select('nome, email, ativo')
        .eq('email', normalizedEmail)
        .eq('ativo', true)
        .maybeSingle(),
      supabase
        .from('todos_clientes')
        .select('email_cliente, nome_cliente')
        .eq('email_cliente', normalizedEmail)
        .maybeSingle()
    ]

    // Executar ambas consultas simultaneamente com timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout nas consultas')), 8000)
    )

    const [gestorResult, clienteResult] = await Promise.race([
      Promise.all([gestorPromise, clientePromise]),
      timeoutPromise
    ]) as [any, any]

    const { data: gestorData, error: gestorError } = gestorResult
    const { data: clienteData, error: clienteError } = clienteResult

    console.log('🔍 [authHelpers] Resultado gestor:', gestorData)
    console.log('🔍 [authHelpers] Resultado cliente:', clienteData)

    // Verificar gestor primeiro
    if (!gestorError && gestorData) {
      console.log('✅ [authHelpers] Usuário é GESTOR:', gestorData.nome)
      return 'gestor'
    }

    // Verificar cliente
    if (!clienteError && clienteData) {
      console.log('✅ [authHelpers] Usuário é CLIENTE:', clienteData.nome_cliente || 'Nome não informado')
      return 'cliente'
    }

    console.log('❌ [authHelpers] Usuário não encontrado em nenhuma tabela')
    return 'unauthorized'

  } catch (error) {
    console.error('❌ [authHelpers] Erro crítico na verificação:', error)
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
      .eq('email', normalizedEmail)
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
