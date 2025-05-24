import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase admin client
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

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '')
    const { data: user, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Parse the request body
    const { gestorId, email } = await req.json()

    if (!gestorId || !email) {
      throw new Error('gestorId and email are required')
    }

    console.log('🗑️ Iniciando exclusão do gestor:', email, 'ID:', gestorId)

    // Step 1: Get the user_id from gestores table
    const { data: gestorData, error: gestorError } = await supabaseAdmin
      .from('gestores')
      .select('user_id')
      .eq('id', gestorId)
      .single()

    if (gestorError) {
      console.error('❌ Erro ao buscar gestor:', gestorError)
      throw new Error(`Erro ao buscar gestor: ${gestorError.message}`)
    }

    const userId = gestorData?.user_id

    // Step 2: Delete from gestores table
    const { error: deleteGestorError } = await supabaseAdmin
      .from('gestores')
      .delete()
      .eq('id', gestorId)

    if (deleteGestorError) {
      console.error('❌ Erro ao excluir da tabela gestores:', deleteGestorError)
      throw new Error(`Erro ao excluir da tabela gestores: ${deleteGestorError.message}`)
    }

    console.log('✅ Gestor removido da tabela gestores')

    // Step 3: Delete user from auth.users if user_id exists
    if (userId) {
      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      
      if (deleteUserError) {
        console.error('❌ Erro ao excluir usuário da autenticação:', deleteUserError)
        // Don't throw here as the gestor record is already deleted
        console.log('⚠️ Gestor foi removido da tabela, mas usuário da auth pode ainda existir')
      } else {
        console.log('✅ Usuário removido da autenticação')
      }
    } else {
      console.log('⚠️ user_id não encontrado, pulando exclusão da auth')
    }

    // Step 4: Optionally, you could update todos_clientes to remove the email_gestor reference
    // but based on requirements, we keep the clients intact
    console.log('✅ Exclusão do gestor concluída com sucesso')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Gestor excluído com sucesso',
        gestorId,
        email
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('💥 Erro na exclusão do gestor:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
