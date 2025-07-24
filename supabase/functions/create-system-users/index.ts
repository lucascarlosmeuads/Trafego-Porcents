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
    console.log('🚀 Iniciando criação de usuários do sistema...')

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

    // System users to create
    const systemUsers = [
      {
        email: 'clientenovo@trafegoporcents.com',
        password: 'clientenovo',
        user_metadata: {
          name: 'Cliente Novo Sistema',
          tipo_usuario: 'clientenovo'
        }
      }
    ]

    const results = []

    for (const user of systemUsers) {
      console.log(`📧 Criando usuário: ${user.email}`)
      
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(user.email)
      
      if (existingUser.user) {
        console.log(`✅ Usuário ${user.email} já existe`)
        results.push({
          email: user.email,
          status: 'already_exists',
          message: 'Usuário já existe'
        })
        continue
      }

      // Create user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.user_metadata
      })

      if (createError) {
        console.error(`❌ Erro ao criar usuário ${user.email}:`, createError)
        results.push({
          email: user.email,
          status: 'error',
          error: createError.message
        })
        continue
      }

      console.log(`✅ Usuário ${user.email} criado com sucesso`)
      results.push({
        email: user.email,
        status: 'created',
        user_id: newUser.user?.id,
        message: 'Usuário criado com sucesso'
      })
    }

    console.log('🎉 Processo concluído:', results)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Processo de criação de usuários concluído',
        results
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