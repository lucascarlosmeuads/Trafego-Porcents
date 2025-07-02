
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

    // Parse request body to check for specific client email
    let requestBody: any = {}
    try {
      const text = await req.text()
      if (text) {
        requestBody = JSON.parse(text)
      }
    } catch (error) {
      console.log('📝 [CreateClientUsers] Sem body na requisição ou body inválido, processando todos os clientes')
    }

    // Criar cliente Supabase com service_role para privilégios administrativos
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const SENHA_PADRAO = 'parceriadesucesso'
    const results: ProcessResult[] = []

    // Verificar se foi solicitado processamento de cliente específico
    if (requestBody.clientEmail) {
      console.log(`🎯 [CreateClientUsers] Processamento específico para: ${requestBody.clientEmail}`)
      
      const clientEmail = requestBody.clientEmail.trim().toLowerCase()
      
      // Validar formato de e-mail básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(clientEmail)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Email inválido fornecido'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          },
        )
      }

      // Excluir e-mails do sistema
      if (clientEmail.includes('@trafegoporcents.com') || clientEmail.startsWith('admin@')) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Email do sistema - não processado',
            statistics: { total: 0, created: 0, updated: 0, skipped: 1, errors: 0 },
            results: [{
              email: clientEmail,
              operation: 'skipped',
              message: 'E-mail pertence ao sistema - não processado'
            }]
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        )
      }

      // Verificar se usuário já existe
      const { data: existingUsers, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (usersError) {
        console.error('❌ [CreateClientUsers] Erro ao buscar usuários existentes:', usersError)
        throw usersError
      }

      const existingUser = existingUsers.users.find(u => u.email?.toLowerCase() === clientEmail)
      let result: ProcessResult

      if (existingUser) {
        // Verificar se é um gestor/admin
        const { data: gestorCheck } = await supabaseAdmin
          .from('gestores')
          .select('email')
          .eq('email', clientEmail)
          .single()

        if (gestorCheck) {
          result = {
            email: clientEmail,
            operation: 'skipped',
            message: 'E-mail pertence a um gestor - não alterado'
          }
          console.log(`⏭️ [CreateClientUsers] ${clientEmail} - Gestor detectado, pulando`)
        } else {
          // É um cliente - atualizar senha
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            { password: SENHA_PADRAO }
          )

          if (updateError) {
            result = {
              email: clientEmail,
              operation: 'error',
              message: `Erro ao atualizar senha: ${updateError.message}`
            }
            console.error(`❌ [CreateClientUsers] ${clientEmail} - Erro ao atualizar:`, updateError)
          } else {
            result = {
              email: clientEmail,
              operation: 'updated',
              message: 'Senha atualizada para padrão do sistema'
            }
            console.log(`✅ [CreateClientUsers] ${clientEmail} - Senha atualizada`)
          }
        }
      } else {
        // Usuário não existe - criar novo
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: clientEmail,
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
            email: clientEmail,
            operation: 'error',
            message: `Erro ao criar usuário: ${createError.message}`
          }
          console.error(`❌ [CreateClientUsers] ${clientEmail} - Erro ao criar:`, createError)
        } else {
          result = {
            email: clientEmail,
            operation: 'created',
            message: 'Usuário criado com sucesso'
          }
          console.log(`✅ [CreateClientUsers] ${clientEmail} - Usuário criado`)
        }
      }

      results.push(result)

      // Log da operação no banco (sem aguardar)
      supabaseAdmin
        .from('client_user_creation_log')
        .insert({
          email_cliente: clientEmail,
          operation_type: result.operation,
          result_message: result.message
        })
        .then(() => console.log(`📝 [CreateClientUsers] Log registrado para ${clientEmail}`))
        .catch(error => console.error(`❌ [CreateClientUsers] Erro ao registrar log:`, error))

      // Estatísticas finais
      const stats = {
        total: 1,
        created: result.operation === 'created' ? 1 : 0,
        updated: result.operation === 'updated' ? 1 : 0,
        skipped: result.operation === 'skipped' ? 1 : 0,
        errors: result.operation === 'error' ? 1 : 0
      }

      console.log(`🎯 [CreateClientUsers] Processamento específico concluído:`, stats)

      return new Response(
        JSON.stringify({
          success: true,
          message: `Processamento de cliente específico concluído: ${result.operation}`,
          statistics: stats,
          results: results
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Processamento em lote (comportamento original)
    console.log('📊 [CreateClientUsers] Iniciando processamento em lote de todos os clientes')

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
          
          return true
        }) || []
    )]

    console.log(`✅ [CreateClientUsers] ${emailsUnicos.length} e-mails únicos e válidos para processar`)

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

        // Rate limiting - pausa entre operações apenas no processamento em lote
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

    console.log(`📈 [CreateClientUsers] Processamento em lote concluído:`, stats)

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
