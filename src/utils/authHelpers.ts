
import { supabase } from '@/lib/supabase'

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

export const checkUserType = async (email: string): Promise<'admin' | 'gestor' | 'cliente' | 'unauthorized' | 'error'> => {
  console.log('🔍 [authHelpers] === VERIFICAÇÃO DE TIPO DE USUÁRIO ===')
  console.log('🔍 [authHelpers] Email recebido:', `"${email}"`)
  
  const normalizedEmail = normalizeEmail(email)
  console.log('🔍 [authHelpers] Email normalizado:', `"${normalizedEmail}"`)
  
  try {
    // PRIMEIRO: Verificar se é admin
    if (normalizedEmail === 'lucas@admin.com') {
      console.log('✅ [authHelpers] Usuário é ADMIN')
      return 'admin'
    }

    // SEGUNDO: Verificar clientes com estratégia MÚLTIPLA
    console.log('🔍 [authHelpers] === VERIFICANDO CLIENTES ===')
    
    // Buscar TODOS os clientes primeiro
    const { data: todosClientes, error: clientesError } = await supabase
      .from('todos_clientes')
      .select('email_cliente, nome_cliente, id')
    
    console.log('🔍 [authHelpers] Total de clientes na tabela:', todosClientes?.length || 0)
    console.log('🔍 [authHelpers] Erro na consulta:', clientesError)
    
    if (clientesError) {
      console.error('❌ [authHelpers] Erro ao buscar clientes:', clientesError)
      return 'error'
    }
    
    if (todosClientes && todosClientes.length > 0) {
      console.log('🔥 [authHelpers] LISTANDO TODOS OS EMAILS:')
      todosClientes.forEach((cliente, index) => {
        const emailTabela = cliente.email_cliente || ''
        console.log(`Cliente ${index + 1}: "${emailTabela}" (${emailTabela.length} chars)`)
      })
      
      // ESTRATÉGIA 1: Busca exata (case insensitive)
      let clienteEncontrado = todosClientes.find(cliente => {
        if (!cliente.email_cliente) return false
        const emailTabela = cliente.email_cliente.toLowerCase().trim()
        return emailTabela === normalizedEmail
      })
      
      if (clienteEncontrado) {
        console.log('✅ [authHelpers] CLIENTE ENCONTRADO (busca exata):', clienteEncontrado.nome_cliente)
        return 'cliente'
      }
      
      // ESTRATÉGIA 2: Busca por inclusão (para casos com caracteres extras)
      clienteEncontrado = todosClientes.find(cliente => {
        if (!cliente.email_cliente) return false
        const emailTabela = cliente.email_cliente.toLowerCase().trim()
        return emailTabela.includes(normalizedEmail) || normalizedEmail.includes(emailTabela)
      })
      
      if (clienteEncontrado) {
        console.log('✅ [authHelpers] CLIENTE ENCONTRADO (busca por inclusão):', clienteEncontrado.nome_cliente)
        return 'cliente'
      }
      
      // ESTRATÉGIA 3: Busca ignorando caracteres especiais
      const emailLimpo = normalizedEmail.replace(/[^a-z0-9@.]/g, '')
      clienteEncontrado = todosClientes.find(cliente => {
        if (!cliente.email_cliente) return false
        const emailTabelaLimpo = cliente.email_cliente.toLowerCase().replace(/[^a-z0-9@.]/g, '')
        return emailTabelaLimpo === emailLimpo
      })
      
      if (clienteEncontrado) {
        console.log('✅ [authHelpers] CLIENTE ENCONTRADO (busca limpa):', clienteEncontrado.nome_cliente)
        return 'cliente'
      }
      
      console.log('❌ [authHelpers] Cliente NÃO encontrado após todas as estratégias')
    }

    // TERCEIRO: Verificar gestores
    console.log('🔍 [authHelpers] Verificando GESTORES...')
    
    const { data: gestorData, error: gestorError } = await supabase
      .from('gestores')
      .select('nome, email, ativo')
      .ilike('email', normalizedEmail)
      .eq('ativo', true)
      .maybeSingle()

    console.log('🔍 [authHelpers] Resultado gestor:', gestorData)
    console.log('🔍 [authHelpers] Erro gestor:', gestorError)

    if (!gestorError && gestorData) {
      console.log('✅ [authHelpers] GESTOR ENCONTRADO:', gestorData.nome)
      return 'gestor'
    }

    console.log('❌ [authHelpers] Usuário não encontrado em nenhuma tabela')
    return 'unauthorized'

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
  
  return ''
}
