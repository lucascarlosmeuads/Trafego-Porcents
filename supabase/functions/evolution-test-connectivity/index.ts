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
    id: data.id,
    enabled: data.enabled,
    server_url: data.server_url,
    instance_name: data.instance_name,
    default_country_code: data.default_country_code
  }
}

async function testServerConnectivity(serverUrl: string): Promise<{ reachable: boolean, responseTime?: number, status?: number, error?: string }> {
  try {
    console.log(`🌐 Testando conectividade para: ${serverUrl}`)
    
    // Primeiro tentar endpoint /health (padrão da Evolution API)
    let testUrl = `${serverUrl.replace(/\/$/, '')}/health`;
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const start = Date.now()
    let response;
    
    try {
      response = await fetch(testUrl, {
        method: 'GET',
        signal: controller.signal
      });
    } catch (healthError) {
      console.log(`💡 /health falhou, tentando endpoint raiz: ${serverUrl}`)
      // Fallback para endpoint raiz
      response = await fetch(serverUrl, {
        method: 'HEAD',
        signal: controller.signal
      });
    }
    
    const responseTime = Date.now() - start
    clearTimeout(timeoutId)
    
    return {
      reachable: true,
      responseTime,
      status: response.status
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        reachable: false,
        error: 'Timeout: Servidor não responde em 10 segundos'
      }
    }
    return {
      reachable: false,
      error: error.message || String(error)
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = getSupabaseAdmin()
    
    // Buscar configuração ativa da Evolution API
    const config = await fetchEvolutionConfig(supabase)
    
    if (!config) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuração Evolution API não encontrada ou não está ativa' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('🌐 Testando conectividade para:', config.server_url)
    
    // Testar conectividade básica
    const connectivityTest = await testServerConnectivity(config.server_url)
    
    // Testar se é HTTP vs HTTPS
    let protocolSuggestion = null
    if (!connectivityTest.reachable && config.server_url.startsWith('http://')) {
      const httpsUrl = config.server_url.replace('http://', 'https://')
      console.log('🔒 Testando HTTPS alternativo:', httpsUrl)
      const httpsTest = await testServerConnectivity(httpsUrl)
      
      if (httpsTest.reachable) {
        protocolSuggestion = {
          suggested_url: httpsUrl,
          message: 'Servidor responde via HTTPS. Considere alterar a URL para HTTPS.'
        }
      }
    }

    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')
    let apiKeyStatus = 'not_configured'
    if (evolutionApiKey) {
      apiKeyStatus = evolutionApiKey.length > 10 ? 'configured' : 'too_short'
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        server_url: config.server_url,
        instance_name: config.instance_name,
        connectivity: connectivityTest,
        protocol_suggestion: protocolSuggestion,
        api_key_status: apiKeyStatus,
        recommendations: [
          ...(connectivityTest.reachable ? [] : [
            'Servidor não está respondendo. Verifique se está online.',
            'Verifique se a porta está correta (padrão Evolution: 8080).',
            'Confirme se não há firewall bloqueando a conexão.'
          ]),
          ...(protocolSuggestion ? [protocolSuggestion.message] : []),
          ...(apiKeyStatus !== 'configured' ? ['Configure a EVOLUTION_API_KEY nas variáveis de ambiente.'] : [])
        ]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erro geral no teste de conectividade:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Erro interno: ${error.message}`
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})