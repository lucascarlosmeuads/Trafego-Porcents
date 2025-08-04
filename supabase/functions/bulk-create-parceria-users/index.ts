import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessResult {
  email: string
  success: boolean
  message: string
  user_id?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 [bulk-create-parceria-users] Iniciando criação em massa de usuários')

    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Buscar todos os clientes parceria que precisam de usuários Auth
    console.log('📊 [bulk-create-parceria-users] Buscando clientes parceria...')
    const { data: clientesParceria, error: queryError } = await supabase
      .from('clientes_parceria')
      .select('email_cliente, nome_cliente')
      .eq('ativo', true)

    if (queryError) {
      throw new Error(`Erro ao buscar clientes: ${queryError.message}`)
    }

    console.log(`👥 [bulk-create-parceria-users] Encontrados ${clientesParceria?.length || 0} clientes para processar`)

    const results: ProcessResult[] = []
    let sucessos = 0
    let falhas = 0

    // Processar cada cliente
    for (const cliente of clientesParceria || []) {
      try {
        console.log(`🔄 [bulk-create-parceria-users] Processando: ${cliente.email_cliente}`)

        // Verificar se usuário já existe usando listUsers
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
        
        if (listError) {
          console.error(`❌ [bulk-create-parceria-users] Erro ao buscar usuários: ${listError.message}`)
          results.push({
            email: cliente.email_cliente,
            success: false,
            message: `Erro ao verificar usuário: ${listError.message}`
          })
          falhas++
          continue
        }
        
        const existingUser = existingUsers.users?.find(user => user.email === cliente.email_cliente)
        
        if (existingUser) {
          console.log(`✅ [bulk-create-parceria-users] Usuário já existe: ${cliente.email_cliente}`)
          results.push({
            email: cliente.email_cliente,
            success: true,
            message: 'Usuário já existe',
            user_id: existingUser.id
          })
          sucessos++
          continue
        }

        // Criar usuário no Supabase Auth
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: cliente.email_cliente,
          password: 'soumilionario',
          email_confirm: true, // Confirmar email automaticamente
          user_metadata: {
            created_by: 'bulk_parceria_creation',
            created_at: new Date().toISOString(),
            nome_cliente: cliente.nome_cliente
          }
        })

        if (createError) {
          console.error(`❌ [bulk-create-parceria-users] Erro ao criar usuário ${cliente.email_cliente}:`, createError)
          results.push({
            email: cliente.email_cliente,
            success: false,
            message: `Falha: ${createError.message}`
          })
          falhas++
          continue
        }

        console.log(`✅ [bulk-create-parceria-users] Usuário criado: ${cliente.email_cliente} - ID: ${newUser.user?.id}`)
        
        // Log da criação
        try {
          await supabase
            .from('client_user_creation_log')
            .insert({
              email_cliente: cliente.email_cliente,
              operation_type: 'bulk_create_parceria_users',
              result_message: `Usuário criado em massa. ID: ${newUser.user?.id}`
            })
        } catch (logError) {
          console.warn('⚠️ [bulk-create-parceria-users] Erro ao inserir log (não crítico):', logError)
        }

        results.push({
          email: cliente.email_cliente,
          success: true,
          message: 'Usuário criado com sucesso',
          user_id: newUser.user?.id
        })
        sucessos++

      } catch (error) {
        console.error(`❌ [bulk-create-parceria-users] Erro ao processar ${cliente.email_cliente}:`, error)
        results.push({
          email: cliente.email_cliente,
          success: false,
          message: `Erro: ${error.message}`
        })
        falhas++
      }
    }

    const summary = {
      total_processados: results.length,
      sucessos,
      falhas,
      results
    }

    console.log('📊 [bulk-create-parceria-users] Resumo final:', summary)

    return new Response(
      JSON.stringify(summary),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ [bulk-create-parceria-users] Erro geral:', error)
    
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