
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FixRequest {
  email: string
  corrections: Array<{
    type: 'missing_user' | 'wrong_password' | 'unconfirmed_email'
    action: string
  }>
}

interface FixResult {
  email: string
  corrections: Array<{
    action: string
    status: 'success' | 'failed'
    message: string
    timestamp: string
  }>
  success: boolean
  totalCorrections: number
  successfulCorrections: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔧 [FixClientAuth] Iniciando correções automáticas')

    const { email, corrections }: FixRequest = await req.json()
    
    if (!email || !corrections || !Array.isArray(corrections)) {
      throw new Error('Email e lista de correções são obrigatórios')
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

    const normalizedEmail = email.toLowerCase().trim()
    console.log('🔧 [FixClientAuth] Processando correções para:', normalizedEmail)
    console.log('🔧 [FixClientAuth] Correções solicitadas:', corrections.length)

    const appliedCorrections: Array<{
      action: string
      status: 'success' | 'failed'
      message: string
      timestamp: string
    }> = []

    // 1. Verificar se cliente existe na base de dados primeiro
    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from('todos_clientes')
      .select('id, nome_cliente, email_cliente')
      .eq('email_cliente', normalizedEmail)
      .single()

    if (clienteError && clienteError.code !== 'PGRST116') {
      console.error('❌ [FixClientAuth] Erro ao buscar cliente:', clienteError)
      throw new Error(`Erro ao verificar cliente: ${clienteError.message}`)
    }

    if (!cliente) {
      console.log('❌ [FixClientAuth] Cliente não encontrado na base de dados')
      appliedCorrections.push({
        action: 'Verificar cliente na base',
        status: 'failed',
        message: 'Cliente não encontrado na base de dados',
        timestamp: new Date().toISOString()
      })
      
      return new Response(
        JSON.stringify({
          email: normalizedEmail,
          corrections: appliedCorrections,
          success: false,
          totalCorrections: corrections.length,
          successfulCorrections: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    console.log('✅ [FixClientAuth] Cliente encontrado:', cliente.nome_cliente)

    // 2. Buscar usuário existente no Auth
    const { data: existingUsers, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ [FixClientAuth] Erro ao buscar usuários:', usersError)
      throw usersError
    }

    const existingUser = existingUsers.users.find(u => u.email?.toLowerCase() === normalizedEmail)
    console.log('🔍 [FixClientAuth] Usuário existente:', existingUser ? 'SIM' : 'NÃO')

    // 3. Aplicar cada correção
    for (const correction of corrections) {
      console.log(`🔧 [FixClientAuth] Aplicando correção: ${correction.type}`)
      
      try {
        switch (correction.type) {
          case 'missing_user':
            if (existingUser) {
              appliedCorrections.push({
                action: correction.action,
                status: 'failed',
                message: 'Usuário já existe no sistema',
                timestamp: new Date().toISOString()
              })
            } else {
              const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: normalizedEmail,
                password: 'parceriadesucesso',
                email_confirm: true,
                user_metadata: {
                  user_type: 'cliente',
                  created_by_fix_function: true,
                  created_at: new Date().toISOString()
                }
              })

              if (createError) {
                throw createError
              }

              appliedCorrections.push({
                action: correction.action,
                status: 'success',
                message: 'Usuário criado com sucesso',
                timestamp: new Date().toISOString()
              })
              
              console.log('✅ [FixClientAuth] Usuário criado:', newUser.user?.id)
            }
            break

          case 'wrong_password':
            if (!existingUser) {
              appliedCorrections.push({
                action: correction.action,
                status: 'failed',
                message: 'Usuário não existe para resetar senha',
                timestamp: new Date().toISOString()
              })
            } else {
              const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                existingUser.id,
                { 
                  password: 'parceriadesucesso',
                  email_confirm: true
                }
              )

              if (updateError) {
                throw updateError
              }

              appliedCorrections.push({
                action: correction.action,
                status: 'success',
                message: 'Senha resetada para "parceriadesucesso"',
                timestamp: new Date().toISOString()
              })
              
              console.log('✅ [FixClientAuth] Senha resetada para usuário:', existingUser.id)
            }
            break

          case 'unconfirmed_email':
            if (!existingUser) {
              appliedCorrections.push({
                action: correction.action,
                status: 'failed',
                message: 'Usuário não existe para confirmar email',
                timestamp: new Date().toISOString()
              })
            } else {
              const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
                existingUser.id,
                { email_confirm: true }
              )

              if (confirmError) {
                throw confirmError
              }

              appliedCorrections.push({
                action: correction.action,
                status: 'success',
                message: 'Email confirmado automaticamente',
                timestamp: new Date().toISOString()
              })
              
              console.log('✅ [FixClientAuth] Email confirmado para usuário:', existingUser.id)
            }
            break

          default:
            appliedCorrections.push({
              action: correction.action,
              status: 'failed',
              message: 'Tipo de correção não suportado',
              timestamp: new Date().toISOString()
            })
        }
      } catch (error: any) {
        console.error(`❌ [FixClientAuth] Erro na correção ${correction.type}:`, error)
        appliedCorrections.push({
          action: correction.action,
          status: 'failed',
          message: `Erro: ${error.message}`,
          timestamp: new Date().toISOString()
        })
      }
    }

    // 4. Log da operação no banco
    await supabaseAdmin
      .from('client_user_creation_log')
      .insert({
        email_cliente: normalizedEmail,
        operation_type: 'auto_corrections',
        result_message: `Aplicadas ${appliedCorrections.filter(c => c.status === 'success').length}/${appliedCorrections.length} correções`
      })

    const successfulCorrections = appliedCorrections.filter(c => c.status === 'success').length
    const result: FixResult = {
      email: normalizedEmail,
      corrections: appliedCorrections,
      success: successfulCorrections > 0,
      totalCorrections: corrections.length,
      successfulCorrections
    }

    console.log('📝 [FixClientAuth] Resultado final:', result)

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('💥 [FixClientAuth] Erro fatal:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        corrections: [],
        totalCorrections: 0,
        successfulCorrections: 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
