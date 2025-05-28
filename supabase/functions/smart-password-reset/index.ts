
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResetResult {
  email: string
  success: boolean
  message: string
  action_taken: 'password_reset' | 'user_created' | 'email_confirmed' | 'no_action_needed'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔐 [SmartPasswordReset] Iniciando reset inteligente de senha')

    const { email } = await req.json()
    
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
    console.log('🔐 [SmartPasswordReset] Processando email:', normalizedEmail)

    // 1. Verificar se cliente existe na base de dados
    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from('todos_clientes')
      .select('id, nome_cliente, email_cliente')
      .eq('email_cliente', normalizedEmail)
      .single()

    if (clienteError && clienteError.code !== 'PGRST116') {
      console.error('❌ [SmartPasswordReset] Erro ao buscar cliente:', clienteError)
      throw new Error(`Erro ao verificar cliente: ${clienteError.message}`)
    }

    if (!cliente) {
      console.log('❌ [SmartPasswordReset] Cliente não encontrado na base de dados')
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Email não encontrado no sistema. Verifique se o email está correto ou entre em contato com o suporte.',
          email: normalizedEmail,
          action_taken: 'no_action_needed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    console.log('✅ [SmartPasswordReset] Cliente encontrado:', cliente.nome_cliente)

    // 2. Buscar usuário no Supabase Auth
    const { data: listResponse, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ [SmartPasswordReset] Erro ao buscar usuários:', listError)
      throw listError
    }

    const existingUser = listResponse.users.find(u => u.email?.toLowerCase() === normalizedEmail)
    console.log('🔍 [SmartPasswordReset] Usuário existente encontrado:', existingUser ? 'SIM' : 'NÃO')

    let result: ResetResult

    if (existingUser) {
      // Usuário existe - resetar senha e confirmar email
      console.log('🔐 [SmartPasswordReset] Resetando senha do usuário existente:', existingUser.id)
      
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        { 
          password: 'parceriadesucesso',
          email_confirm: true
        }
      )

      if (updateError) {
        console.error('❌ [SmartPasswordReset] Erro ao resetar senha:', updateError)
        result = {
          email: normalizedEmail,
          action_taken: 'password_reset',
          success: false,
          message: `Erro interno. Tente novamente ou entre em contato com o suporte.`
        }
      } else {
        console.log('✅ [SmartPasswordReset] Senha resetada com sucesso')
        result = {
          email: normalizedEmail,
          action_taken: 'password_reset',
          success: true,
          message: 'Senha resetada com sucesso! Use a senha padrão "parceriadesucesso" para fazer login.'
        }
      }
    } else {
      // Usuário não existe - criar novo
      console.log('🔐 [SmartPasswordReset] Criando novo usuário')
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: 'parceriadesucesso',
        email_confirm: true,
        user_metadata: {
          user_type: 'cliente',
          created_by_password_reset: true,
          created_at: new Date().toISOString()
        }
      })

      if (createError) {
        console.error('❌ [SmartPasswordReset] Erro ao criar usuário:', createError)
        
        // Se o erro é que o usuário já existe, tentar resetar senha
        if (createError.message.includes('already been registered')) {
          console.log('🔄 [SmartPasswordReset] Usuário já existe, tentando reset direto')
          
          // Buscar novamente o usuário (pode ter sido criado recentemente)
          const { data: retryListResponse } = await supabaseAdmin.auth.admin.listUsers()
          const retryUser = retryListResponse?.users.find(u => u.email?.toLowerCase() === normalizedEmail)
          
          if (retryUser) {
            const { error: retryUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
              retryUser.id,
              { 
                password: 'parceriadesucesso',
                email_confirm: true
              }
            )
            
            if (!retryUpdateError) {
              result = {
                email: normalizedEmail,
                action_taken: 'password_reset',
                success: true,
                message: 'Senha resetada com sucesso! Use a senha padrão "parceriadesucesso" para fazer login.'
              }
            } else {
              result = {
                email: normalizedEmail,
                action_taken: 'user_created',
                success: false,
                message: 'Erro interno. Tente novamente ou entre em contato com o suporte.'
              }
            }
          } else {
            result = {
              email: normalizedEmail,
              action_taken: 'user_created',
              success: false,
              message: 'Erro interno. Tente novamente ou entre em contato com o suporte.'
            }
          }
        } else {
          result = {
            email: normalizedEmail,
            action_taken: 'user_created',
            success: false,
            message: 'Erro interno. Tente novamente ou entre em contato com o suporte.'
          }
        }
      } else {
        console.log('✅ [SmartPasswordReset] Usuário criado com sucesso:', newUser.user?.id)
        result = {
          email: normalizedEmail,
          action_taken: 'user_created',
          success: true,
          message: 'Conta criada e senha definida! Use a senha padrão "parceriadesucesso" para fazer login.'
        }
      }
    }

    // Log da operação
    try {
      await supabaseAdmin
        .from('client_user_creation_log')
        .insert({
          email_cliente: normalizedEmail,
          operation_type: 'smart_password_reset',
          result_message: result.message
        })
    } catch (logError) {
      console.warn('⚠️ [SmartPasswordReset] Erro ao salvar log:', logError)
    }

    console.log('📝 [SmartPasswordReset] Resultado final:', result)

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 400,
      },
    )

  } catch (error) {
    console.error('💥 [SmartPasswordReset] Erro fatal:', error)
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
