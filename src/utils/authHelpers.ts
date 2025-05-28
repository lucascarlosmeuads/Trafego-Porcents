
import { supabase } from '@/lib/supabase'

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

export const checkUserType = async (email: string): Promise<'admin' | 'gestor' | 'cliente' | 'vendedor' | 'sites' | 'unauthorized' | 'error'> => {
  console.log('🔍 [authHelpers] === VERIFICAÇÃO DETALHADA DE TIPO ===')
  console.log('🔍 [authHelpers] Email recebido:', `"${email}"`)
  console.log('🔍 [authHelpers] IMPORTANTE: Usuário JÁ autenticado pelo Supabase')
  
  const normalizedEmail = normalizeEmail(email)
  console.log('🔍 [authHelpers] Email normalizado:', `"${normalizedEmail}"`)
  
  try {
    // CASO ESPECÍFICO: falcao@trafegoporcents.com deve ser gestor
    if (normalizedEmail === 'falcao@trafegoporcents.com') {
      console.log('👨‍💼 [authHelpers] === USUÁRIO ESPECÍFICO DETECTADO ===')
      console.log('👨‍💼 [authHelpers] falcao@trafegoporcents.com identificado como GESTOR')
      return 'gestor'
    }

    // Admin primeiro (domínio @admin)
    if (normalizedEmail.includes('@admin')) {
      console.log('👑 [authHelpers] Usuário é ADMIN (domínio @admin)')
      return 'admin'
    }

    // Sites (criadores)
    if (normalizedEmail.includes('criador') || normalizedEmail.includes('site') || normalizedEmail.includes('webdesign')) {
      console.log('🌐 [authHelpers] Usuário é SITES (criador/site/webdesign)')
      return 'sites'
    }

    // Vendedores
    if (normalizedEmail.startsWith('vendedor') && normalizedEmail.includes('@trafegoporcents.com')) {
      console.log('💼 [authHelpers] Usuário é VENDEDOR (vendedor*@trafegoporcents.com)')
      return 'vendedor'
    }

    // Gestores (@trafegoporcents.com mas não vendedor)
    if (normalizedEmail.includes('@trafegoporcents.com')) {
      console.log('👨‍💼 [authHelpers] Usuário do domínio @trafegoporcents.com')
      console.log('🔍 [authHelpers] Verificando na tabela gestores...')
      
      try {
        const { data: gestor, error: gestorError } = await supabase
          .from('gestores')
          .select('id, nome, email, ativo')
          .eq('email', normalizedEmail)
          .single()

        if (gestorError) {
          console.log('⚠️ [authHelpers] Erro ao buscar gestor:', gestorError.message)
          console.log('⚠️ [authHelpers] Assumindo gestor por domínio')
        } else if (gestor) {
          console.log('✅ [authHelpers] GESTOR ENCONTRADO na tabela!')
          console.log('👤 [authHelpers] ID:', gestor.id)
          console.log('👤 [authHelpers] Nome:', gestor.nome)
          console.log('👤 [authHelpers] Ativo:', gestor.ativo)
        }
        
        console.log('👨‍💼 [authHelpers] Retornando GESTOR para domínio @trafegoporcents.com')
        return 'gestor'
      } catch (error) {
        console.log('⚠️ [authHelpers] Erro na consulta gestores, assumindo gestor por domínio')
        return 'gestor'
      }
    }

    // Verificar clientes na tabela todos_clientes
    console.log('🔍 [authHelpers] Verificando se é cliente...')
    const { data: cliente, error: clienteError } = await supabase
      .from('todos_clientes')
      .select('id, email_cliente, nome_cliente')
      .eq('email_cliente', normalizedEmail)
      .single()

    if (clienteError) {
      console.log('⚠️ [authHelpers] Cliente não encontrado:', clienteError.message)
      console.log('⚠️ [authHelpers] Código:', clienteError.code)
    } else if (cliente) {
      console.log('✅ [authHelpers] CLIENTE ENCONTRADO!')
      console.log('👤 [authHelpers] ID:', cliente.id)
      console.log('👤 [authHelpers] Nome:', cliente.nome_cliente)
      return 'cliente'
    }

    // Se chegou até aqui, não foi encontrado
    console.log('❌ [authHelpers] === USUÁRIO NÃO ENCONTRADO ===')
    console.log('❌ [authHelpers] Email não encontrado em nenhuma categoria')
    return 'unauthorized'

  } catch (error) {
    console.error('❌ [authHelpers] === ERRO CRÍTICO ===')
    console.error('❌ [authHelpers] Erro:', error)
    return 'error'
  }
}

export const getManagerName = async (email: string): Promise<string> => {
  const normalizedEmail = normalizeEmail(email)
  
  // CASO ESPECÍFICO: falcao@trafegoporcents.com
  if (normalizedEmail === 'falcao@trafegoporcents.com') {
    console.log('👤 [authHelpers] Nome específico para falcao@trafegoporcents.com')
    return 'Falcão - Gestor'
  }
  
  // Para usuários de sites
  if (normalizedEmail.includes('criador') || normalizedEmail.includes('site') || normalizedEmail.includes('webdesign')) {
    return 'Criador de Sites'
  }
  
  try {
    // Tentar buscar nome do gestor
    const { data: gestorData, error: gestorError } = await supabase
      .from('gestores')
      .select('nome')
      .ilike('email', normalizedEmail)
      .eq('ativo', true)
      .single()

    if (!gestorError && gestorData) {
      console.log('✅ [authHelpers] Nome do gestor encontrado:', gestorData.nome)
      return gestorData.nome
    }

    // Se não for gestor, tentar buscar nome do cliente
    const { data: clienteData, error: clienteError } = await supabase
      .from('todos_clientes')
      .select('nome_cliente')
      .eq('email_cliente', normalizedEmail)
      .single()

    if (!clienteError && clienteData) {
      console.log('✅ [authHelpers] Nome do cliente encontrado:', clienteData.nome_cliente)
      return clienteData.nome_cliente || 'Cliente'
    }

  } catch (error) {
    console.warn('⚠️ [authHelpers] Erro ao buscar nome:', error)
  }
  
  return 'Usuário'
}
