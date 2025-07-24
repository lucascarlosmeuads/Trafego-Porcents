import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Criando usuário clientenovo diretamente...')

    // Create admin supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const email = 'clientenovo@trafegoporcents.com'
    const password = 'clientenovo'

    console.log(`📧 Verificando se usuário ${email} já existe...`)
    
    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email)
    
    if (existingUser.user) {
      console.log(`✅ Usuário ${email} já existe`)
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Usuário já existe',
          user_id: existingUser.user.id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log(`📧 Criando usuário ${email}...`)

    // Create user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: 'Cliente Novo Sistema',
        tipo_usuario: 'clientenovo'
      }
    })

    if (createError) {
      console.error(`❌ Erro ao criar usuário ${email}:`, createError)
      return new Response(
        JSON.stringify({
          success: false,
          error: createError.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    console.log(`✅ Usuário ${email} criado com sucesso! ID: ${newUser.user?.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuário clientenovo criado com sucesso',
        user_id: newUser.user?.id,
        email: email
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Erro crítico:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})