
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
    console.log('🚀 [CREATE-CAROL-GESTOR] Cadastrando Carol na tabela gestores...')
    
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

    console.log('🔍 [CREATE-CAROL-GESTOR] Verificando se Carol já existe...')

    // Verificar se Carol já existe na tabela gestores
    const { data: existingCarol, error: checkError } = await supabaseAdmin
      .from('gestores')
      .select('email')
      .eq('email', 'carol@trafegoporcents.com')
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = não encontrado
      console.error('❌ [CREATE-CAROL-GESTOR] Erro ao verificar Carol existente:', checkError)
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar Carol existente' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (existingCarol) {
      console.log('⚠️ [CREATE-CAROL-GESTOR] Carol já existe na tabela gestores')
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Carol já está cadastrada como gestora',
          gestor: existingCarol
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ [CREATE-CAROL-GESTOR] Carol não existe, criando registro...')

    // Criar registro da Carol na tabela gestores
    const { data: gestorData, error: gestorError } = await supabaseAdmin
      .from('gestores')
      .insert([{
        nome: 'Carol',
        email: 'carol@trafegoporcents.com',
        pode_adicionar_cliente: true,
        ativo: true
      }])
      .select()
      .single()

    if (gestorError) {
      console.error('❌ [CREATE-CAROL-GESTOR] Erro ao criar Carol na tabela:', gestorError)
      return new Response(
        JSON.stringify({ error: `Erro ao criar Carol como gestora: ${gestorError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ [CREATE-CAROL-GESTOR] Carol criada como gestora:', gestorData.id)
    console.log('🎉 [CREATE-CAROL-GESTOR] Carol agora aparecerá na lista de gestores!')

    return new Response(
      JSON.stringify({ 
        success: true,
        gestor: gestorData,
        message: 'Carol cadastrada com sucesso como gestora e agora aparecerá na lista de filtros'
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 [CREATE-CAROL-GESTOR] Erro geral:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
