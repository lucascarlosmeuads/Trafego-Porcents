
import { supabase } from '@/lib/supabase'

interface OrphanClient {
  email: string
  id: string
  created_at: string
}

interface RecoveryResult {
  email: string
  status: 'recovered' | 'already_exists' | 'error'
  message: string
}

/**
 * Função para detectar e recuperar clientes órfãos
 * (existem no auth.users mas não na tabela todos_clientes)
 */
export async function detectAndRecoverOrphanClients(): Promise<RecoveryResult[]> {
  console.log('🔍 [OrphanRecovery] === INICIANDO DETECÇÃO DE CLIENTES ÓRFÃOS ===')
  
  const results: RecoveryResult[] = []
  
  try {
    // 1. Buscar todos os usuários no auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ [OrphanRecovery] Erro ao buscar usuários auth:', authError)
      return [{
        email: 'system',
        status: 'error',
        message: `Erro ao acessar auth.users: ${authError.message}`
      }]
    }

    console.log(`📊 [OrphanRecovery] ${authUsers.users.length} usuários encontrados no auth`)

    // 2. Filtrar apenas clientes (não gestores/admins) - com verificação de tipo
    const clientEmails = authUsers.users
      .filter(user => user?.email && !user.email.includes('@trafegoporcents.com'))
      .map(user => ({
        email: user.email!.toLowerCase(),
        id: user.id,
        created_at: user.created_at
      }))

    console.log(`👥 [OrphanRecovery] ${clientEmails.length} emails de clientes no auth`)

    // 3. Verificar quais existem na tabela todos_clientes
    const { data: existingClients, error: clientsError } = await supabase
      .from('todos_clientes')
      .select('email_cliente')
      .in('email_cliente', clientEmails.map(c => c.email))

    if (clientsError) {
      console.error('❌ [OrphanRecovery] Erro ao buscar clientes na tabela:', clientsError)
      return [{
        email: 'system',
        status: 'error',
        message: `Erro ao acessar todos_clientes: ${clientsError.message}`
      }]
    }

    const existingClientEmails = new Set(
      (existingClients || []).map(c => c.email_cliente?.toLowerCase()).filter(Boolean)
    )

    console.log(`📋 [OrphanRecovery] ${existingClientEmails.size} clientes existem na tabela`)

    // 4. Identificar órfãos
    const orphanClients = clientEmails.filter(client => 
      !existingClientEmails.has(client.email)
    )

    console.log(`🚨 [OrphanRecovery] ${orphanClients.length} clientes órfãos detectados:`)
    orphanClients.forEach(orphan => {
      console.log(`   - ${orphan.email} (criado em ${orphan.created_at})`)
    })

    // 5. Tentar recuperar cada órfão
    for (const orphan of orphanClients) {
      try {
        console.log(`🔧 [OrphanRecovery] Recuperando: ${orphan.email}`)
        
        // Inserir registro básico na tabela
        const { error: insertError } = await supabase
          .from('todos_clientes')
          .insert([{
            email_cliente: orphan.email,
            nome_cliente: orphan.email.split('@')[0], // Nome temporário baseado no email
            status_campanha: 'Cliente Novo',
            vendedor: 'Sistema - Recuperação Automática',
            email_gestor: '', // Será atribuído depois
            comissao_paga: false,
            valor_comissao: 60.00,
            site_status: 'pendente',
            telefone: '',
            data_venda: null
          }])

        if (insertError) {
          console.error(`❌ [OrphanRecovery] Erro ao recuperar ${orphan.email}:`, insertError)
          results.push({
            email: orphan.email,
            status: 'error',
            message: `Erro na recuperação: ${insertError.message}`
          })
        } else {
          console.log(`✅ [OrphanRecovery] ${orphan.email} recuperado com sucesso`)
          results.push({
            email: orphan.email,
            status: 'recovered',
            message: 'Cliente órfão recuperado automaticamente'
          })
        }

        // Pequena pausa para evitar sobrecarga
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`💥 [OrphanRecovery] Erro inesperado para ${orphan.email}:`, error)
        results.push({
          email: orphan.email,
          status: 'error',
          message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
        })
      }
    }

    // 6. Resumo final
    const recovered = results.filter(r => r.status === 'recovered').length
    const errors = results.filter(r => r.status === 'error').length
    
    console.log(`📈 [OrphanRecovery] === RECUPERAÇÃO CONCLUÍDA ===`)
    console.log(`✅ Recuperados: ${recovered}`)
    console.log(`❌ Erros: ${errors}`)
    console.log(`📊 Total processados: ${orphanClients.length}`)

    return results

  } catch (error) {
    console.error('💥 [OrphanRecovery] Erro fatal:', error)
    return [{
      email: 'system',
      status: 'error',
      message: `Erro fatal: ${error instanceof Error ? error.message : 'Desconhecido'}`
    }]
  }
}

/**
 * Função para verificar se um cliente específico é órfão e recuperá-lo
 */
export async function recoverSpecificOrphanClient(emailCliente: string): Promise<RecoveryResult> {
  console.log(`🔍 [OrphanRecovery] Verificando cliente específico: ${emailCliente}`)
  
  try {
    // 1. Verificar se existe no auth
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const authUser = authUsers?.users?.find(user => 
      user?.email?.toLowerCase() === emailCliente.toLowerCase()
    )

    if (!authUser) {
      return {
        email: emailCliente,
        status: 'error',
        message: 'Cliente não existe no sistema de autenticação'
      }
    }

    // 2. Verificar se existe na tabela
    const { data: tableClient } = await supabase
      .from('todos_clientes')
      .select('id')
      .eq('email_cliente', emailCliente)
      .maybeSingle()

    if (tableClient) {
      return {
        email: emailCliente,
        status: 'already_exists',
        message: 'Cliente já existe na tabela - não é órfão'
      }
    }

    // 3. É órfão - recuperar
    const { error: insertError } = await supabase
      .from('todos_clientes')
      .insert([{
        email_cliente: emailCliente,
        nome_cliente: emailCliente.split('@')[0],
        status_campanha: 'Cliente Novo',
        vendedor: 'Sistema - Recuperação Manual',
        email_gestor: '',
        comissao_paga: false,
        valor_comissao: 60.00,
        site_status: 'pendente',
        telefone: '',
        data_venda: null
      }])

    if (insertError) {
      return {
        email: emailCliente,
        status: 'error',
        message: `Erro na recuperação: ${insertError.message}`
      }
    }

    return {
      email: emailCliente,
      status: 'recovered',
      message: 'Cliente órfão recuperado com sucesso'
    }

  } catch (error) {
    return {
      email: emailCliente,
      status: 'error',
      message: `Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`
    }
  }
}
