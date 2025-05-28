
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessResult {
  email: string
  operation: 'created' | 'updated' | 'skipped' | 'error'
  message: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 [CreateClientUsers] Iniciando processamento de usuários clientes')

    // Criar cliente Supabase com service_role para privilégios administrativos
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Buscar todos os e-mails únicos da tabela todos_clientes
    const { data: clientes, error: clientesError } = await supabaseAdmin
      .from('todos_clientes')
      .select('email_cliente')
      .not('email_cliente', 'is', null)
      .neq('email_cliente', '')

    if (clientesError) {
      console.error('❌ [CreateClientUsers] Erro ao buscar clientes:', clientesError)
      throw clientesError
    }

    console.log(`📊 [CreateClientUsers] Encontrados ${clientes?.length || 0} registros de clientes`)

    // Extrair e-mails únicos e válidos
    const emailsUnicos = [...new Set(
      clientes
        ?.map(c => c.email_cliente?.trim().toLowerCase())
        .filter(email => {
          if (!email) return false
          
          // Validar formato de e-mail básico
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(email)) return false
          
          // Excluir e-mails do sistema
          if (email.includes('@trafegoporcents.com')) return false
          if (email.startsWith('admin@')) return false
          if (email.startsWith('gestor@')) return false
          
          return true
        }) || []
    )]

    console.log(`✅ [CreateClientUsers] ${emailsUnicos.length} e-mails únicos e válidos para processar`)

    const results: ProcessResult[] = []
    const SENHA_PADRAO = 'parceriadesucesso'

    // Buscar todos os usuários existentes para verificação
    const { data: existingUsers, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ [CreateClientUsers] Erro ao buscar usuários existentes:', usersError)
      throw usersError
    }

    const existingUserEmails = new Set(existingUsers.users.map(u => u.email?.toLowerCase()))
    console.log(`📋 [CreateClientUsers] ${existingUsers.users.length} usuários já existem no sistema`)

    // Processar cada e-mail
    for (const email of emailsUnicos) {
      try {
        console.log(`🔍 [CreateClientUsers] Processando: ${email}`)
        
        let result: ProcessResult

        if (existingUserEmails.has(email)) {
          // Usuário já existe - verificar se é cliente e atualizar senha
          const existingUser = existingUsers.users.find(u => u.email?.toLowerCase() === email)
          
          if (existingUser) {
            // Verificar se é um gestor/admin (baseado no e-mail)
            const { data: gestorCheck } = await supabaseAdmin
              .from('gestores')
              .select('email')
              .eq('email', email)
              .single()

            if (gestorCheck) {
              result = {
                email,
                operation: 'skipped',
                message: 'E-mail pertence a um gestor - não alterado'
              }
              console.log(`⏭️ [CreateClientUsers] ${email} - Gestor detectado, pulando`)
            } else {
              // É um cliente - atualizar senha
              const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                existingUser.id,
                { password: SENHA_PADRAO }
              )

              if (updateError) {
                result = {
                  email,
                  operation: 'error',
                  message: `Erro ao atualizar senha: ${updateError.message}`
                }
                console.error(`❌ [CreateClientUsers] ${email} - Erro ao atualizar:`, updateError)
              } else {
                result = {
                  email,
                  operation: 'updated',
                  message: 'Senha atualizada para padrão do sistema'
                }
                console.log(`✅ [CreateClientUsers] ${email} - Senha atualizada`)
              }
            }
          } else {
            result = {
              email,
              operation: 'error',
              message: 'Usuário encontrado mas não foi possível acessar dados'
            }
          }
        } else {
          // Usuário não existe - criar novo
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: SENHA_PADRAO,
            email_confirm: true, // Confirmar e-mail automaticamente
            user_metadata: {
              user_type: 'cliente',
              created_by_system: true,
              created_at: new Date().toISOString()
            }
          })

          if (createError) {
            result = {
              email,
              operation: 'error',
              message: `Erro ao criar usuário: ${createError.message}`
            }
            console.error(`❌ [CreateClientUsers] ${email} - Erro ao criar:`, createError)
          } else {
            result = {
              email,
              operation: 'created',
              message: 'Usuário criado com sucesso'
            }
            console.log(`✅ [CreateClientUsers] ${email} - Usuário criado`)
          }
        }

        results.push(result)

        // Log da operação no banco
        await supabaseAdmin
          .from('client_user_creation_log')
          .insert({
            email_cliente: email,
            operation_type: result.operation,
            result_message: result.message
          })

        // Rate limiting - pausa entre operações
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`💥 [CreateClientUsers] Erro inesperado para ${email}:`, error)
        const errorResult: ProcessResult = {
          email,
          operation: 'error',
          message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        }
        results.push(errorResult)

        // Log do erro no banco
        await supabaseAdmin
          .from('client_user_creation_log')
          .insert({
            email_cliente: email,
            operation_type: 'error',
            result_message: errorResult.message
          })
      }
    }

    // Estatísticas finais
    const stats = {
      total: results.length,
      created: results.filter(r => r.operation === 'created').length,
      updated: results.filter(r => r.operation === 'updated').length,
      skipped: results.filter(r => r.operation === 'skipped').length,
      errors: results.filter(r => r.operation === 'error').length
    }

    console.log(`📈 [CreateClientUsers] Processamento concluído:`, stats)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Processamento de usuários clientes concluído',
        statistics: stats,
        results: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('💥 [CreateClientUsers] Erro fatal:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
