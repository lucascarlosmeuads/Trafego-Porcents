
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FixResult {
  email: string
  action: 'password_reset' | 'user_created' | 'email_confirmed' | 'no_action_needed'
  success: boolean
  message: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔧 [FixClientAuth] Iniciando correção de autenticação')

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
    console.log('🔧 [FixClientAuth] Processando email:', normalizedEmail)

    // 1. Verificar se cliente existe na base de dados
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
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Cliente não encontrado na base de dados. Cadastre o cliente primeiro.',
          email: normalizedEmail,
          action: 'no_action_needed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    console.log('✅ [FixClientAuth] Cliente encontrado:', cliente.nome_cliente)

    // 2. Verificar se usuário existe no Supabase Auth
    const { data: existingUsers, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ [FixClientAuth] Erro ao buscar usuários:', usersError)
      throw usersError
    }

    const existingUser = existingUsers.users.find(u => u.email?.toLowerCase() === normalizedEmail)
    console.log('🔍 [FixClientAuth] Usuário existente:', existingUser ? 'SIM' : 'NÃO')

    let result: FixResult

    if (existingUser) {
      // Usuário existe - resetar senha para padrão
      console.log('🔧 [FixClientAuth] Resetando senha do usuário existente')
      
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        { 
          password: 'parceriadesucesso',
          email_confirm: true  // Confirmar email automaticamente
        }
      )

      if (updateError) {
        console.error('❌ [FixClientAuth] Erro ao resetar senha:', updateError)
        result = {
          email: normalizedEmail,
          action: 'password_reset',
          success: false,
          message: `Erro ao resetar senha: ${updateError.message}`
        }
      } else {
        console.log('✅ [FixClientAuth] Senha resetada com sucesso')
        result = {
          email: normalizedEmail,
          action: 'password_reset',
          success: true,
          message: 'Senha resetada para "parceriadesucesso" e email confirmado automaticamente'
        }
      }
    } else {
      // Usuário não existe - criar novo
      console.log('🔧 [FixClientAuth] Criando novo usuário')
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: 'parceriadesucesso',
        email_confirm: true, // Confirmar email automaticamente
        user_metadata: {
          user_type: 'cliente',
          created_by_fix_function: true,
          created_at: new Date().toISOString()
        }
      })

      if (createError) {
        console.error('❌ [FixClientAuth] Erro ao criar usuário:', createError)
        result = {
          email: normalizedEmail,
          action: 'user_created',
          success: false,
          message: `Erro ao criar usuário: ${createError.message}`
        }
      } else {
        console.log('✅ [FixClientAuth] Usuário criado com sucesso')
        result = {
          email: normalizedEmail,
          action: 'user_created',
          success: true,
          message: 'Usuário criado com senha "parceriadesucesso" e email confirmado automaticamente'
        }
      }
    }

    // Log da operação no banco
    await supabaseAdmin
      .from('client_user_creation_log')
      .insert({
        email_cliente: normalizedEmail,
        operation_type: 'fix_auth',
        result_message: result.message
      })

    console.log('📝 [FixClientAuth] Resultado:', result)

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 400,
      },
    )

  } catch (error) {
    console.error('💥 [FixClientAuth] Erro fatal:', error)
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
