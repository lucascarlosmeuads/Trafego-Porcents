import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 [create-parceria-user] Edge Function iniciada')

    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Processar requisição
    const { email } = await req.json()
    
    if (!email) {
      throw new Error('Email é obrigatório')
    }

    console.log('📧 [create-parceria-user] Processando email:', email)

    // Verificar se usuário já existe no Supabase Auth
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email)
    
    if (existingUser.user) {
      console.log('✅ [create-parceria-user] Usuário já existe no Supabase Auth:', email)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Usuário já existe',
          user_exists: true 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Criar usuário no Supabase Auth com senha padrão
    console.log('🔐 [create-parceria-user] Criando usuário com senha padrão...')
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: 'soumilionario',
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        created_by: 'parceria_system',
        created_at: new Date().toISOString()
      }
    })

    if (createError) {
      console.error('❌ [create-parceria-user] Erro ao criar usuário:', createError)
      throw new Error(`Falha ao criar usuário: ${createError.message}`)
    }

    console.log('✅ [create-parceria-user] Usuário criado com sucesso:', newUser.user?.email)
    console.log('🔑 [create-parceria-user] ID do usuário:', newUser.user?.id)

    // Log da operação
    console.log('📝 [create-parceria-user] Registrando criação no log...')

    // Inserir no log de criação (se existir a tabela)
    try {
      await supabase
        .from('client_user_creation_log')
        .insert({
          email_cliente: email,
          operation_type: 'create_parceria_user',
          result_message: `Usuário criado com sucesso para parceria. ID: ${newUser.user?.id}`
        })
    } catch (logError) {
      console.warn('⚠️ [create-parceria-user] Erro ao inserir log (não crítico):', logError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário criado com sucesso',
        user_id: newUser.user?.id,
        email: newUser.user?.email
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ [create-parceria-user] Erro na função:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})