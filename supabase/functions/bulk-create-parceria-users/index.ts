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

    // Buscar base de emails a processar de duas fontes: clientes_parceria e leads pagos
    console.log('📊 [bulk-create-parceria-users] Buscando clientes parceria...')
    const { data: clientesParceria, error: clientesError } = await supabase
      .from('clientes_parceria')
      .select('email_cliente, nome_cliente, lead_id, dados_formulario')
      .eq('ativo', true)

    if (clientesError) {
      throw new Error(`Erro ao buscar clientes: ${clientesError.message}`)
    }

    console.log('📊 [bulk-create-parceria-users] Buscando leads pagos...')
    const { data: leadsPagos, error: leadsError } = await supabase
      .from('formularios_parceria')
      .select('id, email_usuario, respostas, status_negociacao, cliente_pago')
      .eq('cliente_pago', true)
      .eq('status_negociacao', 'comprou')

    if (leadsError) {
      throw new Error(`Erro ao buscar leads pagos: ${leadsError.message}`)
    }

    // Unificar e normalizar emails
    type Item = { email: string; nome?: string; lead_id?: string | null; respostas?: any }
    const map = new Map<string, Item>()

    for (const c of clientesParceria || []) {
      const email = (c.email_cliente || '').toLowerCase().trim()
      if (email) map.set(email, { email, nome: c.nome_cliente || undefined, lead_id: c.lead_id || null, respostas: c.dados_formulario })
    }

    for (const l of leadsPagos || []) {
      const email = (l.email_usuario || '').toLowerCase().trim()
      if (!email) continue
      if (!map.has(email)) {
        const nome = l.respostas?.nome || l.respostas?.['nome'] || 'Cliente Parceria'
        map.set(email, { email, nome, lead_id: l.id, respostas: l.respostas })
      }
    }

    const toProcess = Array.from(map.values())
    console.log(`👥 [bulk-create-parceria-users] Total para processar: ${toProcess.length}`)

    const results: ProcessResult[] = []
    let sucessos = 0
    let falhas = 0

    // Processar cada item
    for (const item of toProcess) {
      try {
        console.log(`🔄 [bulk-create-parceria-users] Processando: ${item.email}`)

        // Garantir registro em clientes_parceria
        try {
          const { data: existsCp } = await supabase
            .from('clientes_parceria')
            .select('id')
            .eq('email_cliente', item.email)
            .maybeSingle()
          if (!existsCp) {
            await supabase.from('clientes_parceria').insert({
              email_cliente: item.email,
              nome_cliente: item.nome || 'Cliente Parceria',
              lead_id: item.lead_id || null,
              dados_formulario: item.respostas || null,
              ativo: true,
            })
            console.log('👤 [bulk-create-parceria-users] clientes_parceria garantido para', item.email)
          }
        } catch (cpErr) {
          console.warn('⚠️ [bulk-create-parceria-users] Erro ao garantir clientes_parceria (ignorado):', cpErr)
        }

        // Tentar criar usuário diretamente (se já existir, capturar erro)
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: item.email,
          password: 'soumilionario',
          email_confirm: true,
          user_metadata: {
            created_by: 'bulk_parceria_creation',
            created_at: new Date().toISOString(),
            nome_cliente: item.nome || null
          }
        })

        if (createError) {
          // Se erro for "usuário já existe", considerar como sucesso
          if (createError.message?.includes('already exists') || 
              createError.message?.includes('already registered') ||
              createError.message?.includes('User already registered')) {
            console.log(`✅ [bulk-create-parceria-users] Usuário já existe: ${item.email}`)
            
            // Log da operação de usuário existente
            try {
              await supabase.from('client_user_creation_log').insert({
                email_cliente: item.email,
                operation_type: 'bulk_create_parceria_users',
                result_message: 'Usuário já existia - considerado sucesso'
              })
            } catch (logError) {
              console.warn('⚠️ [bulk-create-parceria-users] Erro ao inserir log (não crítico):', logError)
            }
            
            results.push({ email: item.email, success: true, message: 'Usuário já existe' })
            sucessos++
            continue
          } else {
            console.error(`❌ [bulk-create-parceria-users] Erro ao criar usuário ${item.email}:`, createError)
            results.push({ email: item.email, success: false, message: `Falha: ${createError.message}` })
            falhas++
            continue
          }
        }

        console.log(`✅ [bulk-create-parceria-users] Usuário criado: ${item.email} - ID: ${newUser.user?.id}`)

        // Log da criação
        try {
          await supabase.from('client_user_creation_log').insert({
            email_cliente: item.email,
            operation_type: 'bulk_create_parceria_users',
            result_message: `Usuário criado em massa. ID: ${newUser.user?.id}`
          })
        } catch (logError) {
          console.warn('⚠️ [bulk-create-parceria-users] Erro ao inserir log (não crítico):', logError)
        }

        results.push({ email: item.email, success: true, message: 'Usuário criado com sucesso', user_id: newUser.user?.id })
        sucessos++

      } catch (error) {
        console.error(`❌ [bulk-create-parceria-users] Erro ao processar ${item.email}:`, error)
        results.push({ email: item.email, success: false, message: `Erro: ${error.message}` })
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