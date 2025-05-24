
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
    console.log('🗑️ [DELETE-GESTOR] Iniciando exclusão de gestor...')
    
    const { gestorId, email } = await req.json()
    console.log('📥 [DELETE-GESTOR] Dados recebidos:', { gestorId, email })

    // Validações básicas
    if (!gestorId || !email) {
      console.error('❌ [DELETE-GESTOR] ID do gestor e email são obrigatórios')
      return new Response(
        JSON.stringify({ error: 'ID do gestor e email são obrigatórios' }),
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

    console.log('🔍 [DELETE-GESTOR] Verificando se gestor existe...')

    // Verificar se o gestor existe na tabela
    const { data: gestorData, error: checkError } = await supabaseAdmin
      .from('gestores')
      .select('id, user_id, email, nome')
      .eq('id', gestorId)
      .single()

    if (checkError) {
      console.error('❌ [DELETE-GESTOR] Erro ao verificar gestor:', checkError)
      return new Response(
        JSON.stringify({ error: 'Gestor não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ [DELETE-GESTOR] Gestor encontrado:', gestorData.nome)

    // Verificar se existe usuário no Auth com este email
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ [DELETE-GESTOR] Erro ao listar usuários do Auth:', listError)
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar usuários do Auth' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const authUser = authUsers.users.find(user => user.email === email)
    
    if (authUser) {
      console.log('🔍 [DELETE-GESTOR] Usuário encontrado no Auth:', authUser.id)
      
      // 1. Deletar usuário do Supabase Auth
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id)
      
      if (deleteAuthError) {
        console.error('❌ [DELETE-GESTOR] Erro ao deletar usuário do Auth:', deleteAuthError)
        return new Response(
          JSON.stringify({ error: `Erro ao deletar usuário do Auth: ${deleteAuthError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.log('✅ [DELETE-GESTOR] Usuário removido do Auth')
    } else {
      console.log('⚠️ [DELETE-GESTOR] Usuário não encontrado no Auth (pode já ter sido removido)')
    }

    // 2. Deletar da tabela gestores
    const { error: deleteGestorError } = await supabaseAdmin
      .from('gestores')
      .delete()
      .eq('id', gestorId)

    if (deleteGestorError) {
      console.error('❌ [DELETE-GESTOR] Erro ao deletar gestor da tabela:', deleteGestorError)
      
      // Se falhou ao deletar da tabela mas deletou do Auth, isso é um problema
      // Mas não podemos fazer rollback do Auth facilmente
      console.error('⚠️ [DELETE-GESTOR] INCONSISTÊNCIA: usuário removido do Auth mas não da tabela')
      
      return new Response(
        JSON.stringify({ error: `Erro ao deletar gestor: ${deleteGestorError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ [DELETE-GESTOR] Gestor removido da tabela')
    console.log('🎉 [DELETE-GESTOR] Exclusão completa realizada!')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Gestor excluído com sucesso do Auth e da tabela',
        deletedGestor: gestorData,
        deletedFromAuth: !!authUser
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 [DELETE-GESTOR] Erro geral:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
