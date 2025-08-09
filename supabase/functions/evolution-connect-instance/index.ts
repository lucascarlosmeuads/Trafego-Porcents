
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EvolutionConfig {
  id?: string
  enabled: boolean
  server_url: string
  instance_name: string
  default_country_code: string
}

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

async function fetchEvolutionConfig(supabase: ReturnType<typeof getSupabaseAdmin>): Promise<EvolutionConfig | null> {
  const { data, error } = await supabase
    .from('waseller_dispatch_config')
    .select('*')
    .eq('api_type', 'evolution')
    .eq('enabled', true)
    .maybeSingle()

  if (error) {
    console.error('❌ Erro ao buscar config Evolution:', error)
    return null
  }

  if (!data) {
    console.log('⚠️ Nenhuma configuração Evolution ativa encontrada')
    return null
  }

  return {
    id: (data as any).id,
    enabled: (data as any).enabled,
    server_url: (data as any).server_url,
    instance_name: (data as any).instance_name,
    default_country_code: (data as any).default_country_code
  }
}

async function tryCreateInstance(baseUrl: string, instance: string, apikey: string) {
  // Tentar POST /instance/create { instanceName }
  const createJsonUrl = `${baseUrl.replace(/\/$/, '')}/instance/create`
  console.log('🧪 Tentando criar instância (POST):', createJsonUrl)
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)
  
  const postResp = await fetch(createJsonUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apikey
    },
    body: JSON.stringify({ instanceName: instance }),
    signal: controller.signal
  }).catch((e) => {
    clearTimeout(timeoutId)
    console.warn('⚠️ Falha na tentativa POST create:', e)
    return null
  })
  
  clearTimeout(timeoutId)

  if (postResp && postResp.ok) {
    try {
      const body = await postResp.json()
      console.log('✅ Instância criada (POST):', body)
      return body
    } catch {
      console.log('✅ Instância criada (POST) sem JSON legível')
      return { success: true }
    }
  }

  // Fallback GET /instance/create/{instance}
  const createPathUrl = `${baseUrl.replace(/\/$/, '')}/instance/create/${instance}`
  console.log('🧪 Tentando criar instância (GET):', createPathUrl)
  
  const controller2 = new AbortController()
  const timeoutId2 = setTimeout(() => controller2.abort(), 10000)
  
  const getResp = await fetch(createPathUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apikey
    },
    signal: controller2.signal
  }).catch((e) => {
    clearTimeout(timeoutId2)
    console.warn('⚠️ Falha na tentativa GET create:', e)
    return null
  })
  
  clearTimeout(timeoutId2)

  if (getResp && getResp.ok) {
    try {
      const body = await getResp.json()
      console.log('✅ Instância criada (GET):', body)
      return body
    } catch {
      console.log('✅ Instância criada (GET) sem JSON legível')
      return { success: true }
    }
  }

  console.error('❌ Não foi possível criar a instância via POST nem GET')
  return null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("📋 [evolution-connect-instance] Iniciando processo de conexão...");
    
    const supabase = getSupabaseAdmin()
    const config = await fetchEvolutionConfig(supabase)
    
    console.log("🔧 [evolution-connect-instance] Config obtida:", {
      server_url: config?.server_url,
      instance_name: config?.instance_name,
      enabled: config?.enabled
    });
    
    if (!config) {
      console.error("❌ [evolution-connect-instance] Config não encontrada");
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração Evolution API não encontrada ou não está ativa' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')
    if (!evolutionApiKey) {
      console.error('❌ [evolution-connect-instance] EVOLUTION_API_KEY não configurada')
      return new Response(
        JSON.stringify({ success: false, error: 'API Key Evolution não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log("🔑 [evolution-connect-instance] API Key encontrada:", evolutionApiKey ? "✅" : "❌");

    // 1) Tentar conectar usando método POST correto
    const connectUrl = `${config.server_url.replace(/\/$/, '')}/instance/connect/${config.instance_name}`
    console.log('🔌 [evolution-connect-instance] Conectando instância (POST):', connectUrl)

    // Adicionar timeout de 20 segundos para conexão (pode ser mais lenta)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20000)

    let connectResponse
    try {
      connectResponse = await fetch(connectUrl, {
        method: 'POST', // Método correto para Evolution API
        headers: { 
          'Content-Type': 'application/json', 
          'apikey': evolutionApiKey 
        },
        signal: controller.signal
      })
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        console.error('⏰ Timeout ao conectar instância')
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Timeout: Servidor Evolution API não está respondendo (20s). Verifique se o servidor está online e acessível.'
          }),
          { 
            status: 408, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      throw error
    }
    clearTimeout(timeoutId)

    let connectOk = connectResponse.ok
    let connectText = await connectResponse.text()
    let connectData: any = null
    try {
      connectData = connectText ? JSON.parse(connectText) : null
    } catch {
      // se veio HTML (WordPress etc), connectData fica null
    }

    if (!connectOk) {
      console.error('❌ Erro ao conectar (primeira tentativa):', connectText)

      // 2) Se falhou, tentar criar a instância e reconectar
      const created = await tryCreateInstance(config.server_url, config.instance_name, evolutionApiKey)

      if (!created) {
        const is500 = connectResponse.status >= 500
        const isFindMany = typeof connectText === 'string' && connectText.includes('findMany')
        const friendlyMsg = is500 && isFindMany
          ? 'Erro interno no servidor Evolution API (banco de dados). Verifique o servidor e os logs.'
          : `Falha ao conectar e criar instância: ${connectResponse.status}`
        const suggestion = is500
          ? 'Tente reiniciar o servidor Evolution API e conferir a conexão com o banco de dados.'
          : undefined
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: friendlyMsg,
            raw_connect: connectText,
            suggestion
          }),
          { status: is500 ? 500 : 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 3) Re-tentar conectar após criar
      console.log('🔁 Re-tentando conexão após criar a instância...')
      const controller2 = new AbortController()
      const timeoutId2 = setTimeout(() => controller2.abort(), 20000)

      try {
        connectResponse = await fetch(connectUrl, {
          method: 'POST', // Usar POST também na reconexão
          headers: { 
            'Content-Type': 'application/json', 
            'apikey': evolutionApiKey 
          },
          signal: controller2.signal
        })
      } catch (error: any) {
        clearTimeout(timeoutId2)
        if (error.name === 'AbortError') {
          console.error('⏰ Timeout na reconexão após criar instância')
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Timeout na reconexão: Servidor Evolution API não está respondendo (20s)'
            }),
            { 
              status: 408, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        throw error
      }
      clearTimeout(timeoutId2)
      connectOk = connectResponse.ok
      connectText = await connectResponse.text()
      try {
        connectData = connectText ? JSON.parse(connectText) : null
      } catch {
        connectData = null
      }

      if (!connectOk) {
        console.error('❌ Erro ao conectar (segunda tentativa):', connectText)
        const is500 = connectResponse.status >= 500
        const isFindMany = typeof connectText === 'string' && connectText.includes('findMany')
        const friendlyMsg = is500 && isFindMany
          ? 'Erro interno no servidor Evolution API (banco de dados). Verifique o servidor e os logs.'
          : `Erro ao conectar instância: ${connectResponse.status}`
        const suggestion = is500
          ? 'Tente reiniciar o servidor Evolution API e conferir a conexão com o banco de dados.'
          : undefined
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: friendlyMsg,
            raw_connect: connectText,
            suggestion
          }),
          { status: connectResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    console.log('✅ Resposta da conexão:', connectData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: connectData,
        instance_name: config.instance_name,
        server_url: config.server_url
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('❌ Erro geral na função de conexão:', error)
    return new Response(
      JSON.stringify({ success: false, error: `Erro interno: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
