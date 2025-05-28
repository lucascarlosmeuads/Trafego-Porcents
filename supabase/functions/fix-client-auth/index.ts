
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FixRequest {
  email: string
  corrections?: Array<{
    type: 'missing_user' | 'wrong_password' | 'unconfirmed_email'
    action: string
  }>
  checkOnly?: boolean // Flag para apenas verificar se usuário existe
}

interface FixResult {
  email: string
  userExists?: boolean
  userData?: any
  corrections?: Array<{
    action: string
    status: 'success' | 'failed'
    message: string
    timestamp: string
  }>
  success: boolean
  totalCorrections?: number
  successfulCorrections?: number
  warnings?: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔧 [FixClientAuth] Iniciando operação')

    const { email, corrections, checkOnly }: FixRequest = await req.json()
    
    if (!email) {
      throw new Error('Email é obrigatório')
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
    console.log('🔧 [FixClientAuth] Processando para:', normalizedEmail)

    // 1. Verificar se usuário existe no Auth usando service role
    console.log('🔍 [FixClientAuth] Verificando existência do usuário...')
    
    let existingUser = null
    let userExists = false
    
    try {
      const { data: usersResponse, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (usersError) {
        console.error('❌ [FixClientAuth] Erro ao buscar usuários:', usersError)
        throw new Error(`Erro ao buscar usuários: ${usersError.message}`)
      }

      existingUser = usersResponse.users.find(u => u.email?.toLowerCase() === normalizedEmail)
      userExists = !!existingUser
      
      console.log('🔍 [FixClientAuth] Usuário existe no Auth:', userExists ? 'SIM' : 'NÃO')
      
      if (existingUser) {
        console.log('👤 [FixClientAuth] Dados do usuário:', {
          id: existingUser.id,
          email: existingUser.email,
          email_confirmed: existingUser.email_confirmed_at !== null,
          created_at: existingUser.created_at
        })
      }
    } catch (error) {
      console.error('❌ [FixClientAuth] Erro crítico ao verificar usuários:', error)
      throw error
    }

    // Se for apenas verificação, retornar resultado
    if (checkOnly) {
      console.log('🔍 [FixClientAuth] Modo verificação - retornando resultado')
      return new Response(
        JSON.stringify({
          email: normalizedEmail,
          userExists,
          userData: existingUser,
          success: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // 2. Verificar cliente na base de dados (não-bloqueante para correções)
    let clienteExists = false
    let clienteData = null
    const warnings: string[] = []
    
    try {
      const { data: cliente, error: clienteError } = await supabaseAdmin
        .from('todos_clientes')
        .select('id, nome_cliente, email_cliente')
        .eq('email_cliente', normalizedEmail)
        .single()

      if (clienteError && clienteError.code !== 'PGRST116') {
        console.error('⚠️ [FixClientAuth] Erro ao buscar cliente:', clienteError)
        warnings.push(`Erro ao verificar cliente na base: ${clienteError.message}`)
      } else if (cliente) {
        clienteExists = true
        clienteData = cliente
        console.log('✅ [FixClientAuth] Cliente encontrado:', cliente.nome_cliente)
      } else {
        console.log('⚠️ [FixClientAuth] Cliente não encontrado na base de dados')
        warnings.push('Cliente não encontrado na base de dados')
      }
    } catch (error) {
      console.error('⚠️ [FixClientAuth] Erro inesperado ao verificar cliente:', error)
      warnings.push(`Erro inesperado ao verificar cliente: ${error.message}`)
    }

    // 3. Aplicar correções se fornecidas
    if (!corrections || corrections.length === 0) {
      return new Response(
        JSON.stringify({
          email: normalizedEmail,
          userExists,
          userData: existingUser,
          success: true,
          warnings: warnings.length > 0 ? warnings : undefined
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    console.log('🔧 [FixClientAuth] Aplicando correções:', corrections.length)

    const appliedCorrections: Array<{
      action: string
      status: 'success' | 'failed'
      message: string
      timestamp: string
    }> = []

    // Aplicar cada correção
    for (const correction of corrections) {
      console.log(`🔧 [FixClientAuth] Aplicando correção: ${correction.type}`)
      
      try {
        switch (correction.type) {
          case 'missing_user':
            if (existingUser) {
              appliedCorrections.push({
                action: correction.action,
                status: 'failed',
                message: 'Usuário já existe no sistema de autenticação',
                timestamp: new Date().toISOString()
              })
              console.log('⚠️ [FixClientAuth] Usuário já existe, pulando criação')
            } else {
              const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: normalizedEmail,
                password: 'parceriadesucesso',
                email_confirm: true,
                user_metadata: {
                  user_type: 'cliente',
                  created_by_fix_function: true,
                  created_at: new Date().toISOString(),
                  client_exists_in_db: clienteExists
                }
              })

              if (createError) {
                throw createError
              }

              appliedCorrections.push({
                action: correction.action,
                status: 'success',
                message: 'Usuário criado com sucesso no sistema de autenticação',
                timestamp: new Date().toISOString()
              })
              
              console.log('✅ [FixClientAuth] Usuário criado:', newUser.user?.id)
              existingUser = newUser.user // Atualizar referência
            }
            break

          case 'wrong_password':
            if (!existingUser) {
              appliedCorrections.push({
                action: correction.action,
                status: 'failed',
                message: 'Usuário não existe para resetar senha - precisa ser criado primeiro',
                timestamp: new Date().toISOString()
              })
              console.log('⚠️ [FixClientAuth] Usuário não existe para resetar senha')
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
                message: 'Usuário não existe para confirmar email - precisa ser criado primeiro',
                timestamp: new Date().toISOString()
              })
              console.log('⚠️ [FixClientAuth] Usuário não existe para confirmar email')
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

    // 4. Log da operação no banco (tentar sempre, mas não falhar se der erro)
    try {
      await supabaseAdmin
        .from('client_user_creation_log')
        .insert({
          email_cliente: normalizedEmail,
          operation_type: 'auto_corrections',
          result_message: `Aplicadas ${appliedCorrections.filter(c => c.status === 'success').length}/${appliedCorrections.length} correções. Cliente na base: ${clienteExists ? 'Sim' : 'Não'}`
        })
    } catch (logError) {
      console.error('⚠️ [FixClientAuth] Erro ao salvar log (não crítico):', logError)
      warnings.push('Erro ao salvar log da operação')
    }

    const successfulCorrections = appliedCorrections.filter(c => c.status === 'success').length
    const result: FixResult = {
      email: normalizedEmail,
      corrections: appliedCorrections,
      success: successfulCorrections > 0,
      totalCorrections: corrections.length,
      successfulCorrections,
      warnings: warnings.length > 0 ? warnings : undefined
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
