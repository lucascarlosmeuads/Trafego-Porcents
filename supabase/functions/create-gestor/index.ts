
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
    console.log('🚀 [CREATE-GESTOR] Iniciando criação de gestor...')
    
    const { nome, email, senha, pode_adicionar_cliente } = await req.json()
    console.log('📥 [CREATE-GESTOR] Dados recebidos:', { nome, email, pode_adicionar_cliente })

    // Validações básicas
    if (!nome || !email || !senha) {
      console.error('❌ [CREATE-GESTOR] Dados obrigatórios não fornecidos')
      return new Response(
        JSON.stringify({ error: 'Nome, email e senha são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!email.endsWith('@trafegoporcents.com')) {
      console.error('❌ [CREATE-GESTOR] Email inválido:', email)
      return new Response(
        JSON.stringify({ error: 'Email deve terminar com @trafegoporcents.com' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar cliente Supabase com permissões de admin
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

    console.log('🔍 [CREATE-GESTOR] Verificando se usuário já existe...')

    // Verificar se o usuário já existe no Auth
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ [CREATE-GESTOR] Erro ao verificar usuários existentes:', listError)
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar usuários existentes' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userExists = existingUsers.users.some(user => user.email === email)
    
    if (userExists) {
      console.error('❌ [CREATE-GESTOR] Usuário já existe no Auth:', email)
      return new Response(
        JSON.stringify({ error: 'Usuário já existe no sistema' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se gestor já existe na tabela gestores
    const { data: existingGestor, error: checkError } = await supabaseAdmin
      .from('gestores')
      .select('email')
      .eq('email', email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = não encontrado
      console.error('❌ [CREATE-GESTOR] Erro ao verificar gestor existente:', checkError)
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar gestor existente' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (existingGestor) {
      console.error('❌ [CREATE-GESTOR] Gestor já existe na tabela:', email)
      return new Response(
        JSON.stringify({ error: 'Gestor já cadastrado no sistema' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ [CREATE-GESTOR] Verificações concluídas, criando usuário...')

    // 1. Criar usuário no Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: senha,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        nome: nome,
        role: 'gestor'
      }
    })

    if (authError) {
      console.error('❌ [CREATE-GESTOR] Erro ao criar usuário no Auth:', authError)
      return new Response(
        JSON.stringify({ error: `Erro ao criar usuário: ${authError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ [CREATE-GESTOR] Usuário criado no Auth:', authUser.user.id)

    // 2. Criar registro na tabela gestores
    const { data: gestorData, error: gestorError } = await supabaseAdmin
      .from('gestores')
      .insert([{
        user_id: authUser.user.id,
        nome: nome,
        email: email,
        pode_adicionar_cliente: pode_adicionar_cliente || false,
        ativo: true
      }])
      .select()
      .single()

    if (gestorError) {
      console.error('❌ [CREATE-GESTOR] Erro ao criar gestor na tabela:', gestorError)
      
      // Rollback: deletar usuário do Auth se falhou ao criar na tabela
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
        console.log('🔄 [CREATE-GESTOR] Rollback: usuário removido do Auth')
      } catch (rollbackError) {
        console.error('💥 [CREATE-GESTOR] Erro no rollback:', rollbackError)
      }
      
      return new Response(
        JSON.stringify({ error: `Erro ao criar gestor: ${gestorError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ [CREATE-GESTOR] Gestor criado na tabela:', gestorData.id)
    console.log('🎉 [CREATE-GESTOR] Sincronização completa!')

    return new Response(
      JSON.stringify({ 
        success: true,
        user: authUser.user,
        gestor: gestorData,
        message: 'Gestor criado com sucesso no Auth e na tabela'
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 [CREATE-GESTOR] Erro geral:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
