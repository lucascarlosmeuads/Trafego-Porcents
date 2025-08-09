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

async function testServerConnectivity(serverUrl: string): Promise<{
  reachable: boolean
  responseTime?: number
  status?: number
  error?: string
  tested_endpoints?: string[]
}> {
  const startTime = Date.now()
  const testedEndpoints: string[] = []
  
  try {
    console.log('🌐 Testando conectividade para:', serverUrl)
    
    // Adicionar timeout de 10 segundos
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    // Primeiro tenta /health
    let response
    let finalUrl = `${serverUrl}/health`
    testedEndpoints.push(finalUrl)
    
    try {
      console.log('🔍 Testando endpoint /health...')
      response = await fetch(finalUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Lovable-Evolution-Test/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (healthError) {
      console.log('💡 /health falhou, tentando endpoint raiz:', serverUrl)
      finalUrl = serverUrl
      testedEndpoints.push(finalUrl)
      
      response = await fetch(finalUrl, {
        method: 'HEAD', // Use HEAD for root endpoint
        signal: controller.signal,
        headers: {
          'User-Agent': 'Lovable-Evolution-Test/1.0'
        }
      })
    }
    
    clearTimeout(timeoutId)
    
    const responseTime = Date.now() - startTime
    
    console.log(`✅ Conectividade OK - Status: ${response.status}, Tempo: ${responseTime}ms`)
    
    return {
      reachable: response.ok,
      responseTime,
      status: response.status,
      tested_endpoints: testedEndpoints
    }
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    
    console.error('❌ Erro de conectividade:', error.message)
    
    if (error.name === 'AbortError') {
      return {
        reachable: false,
        responseTime,
        error: 'Timeout: Servidor não responde em 10 segundos',
        tested_endpoints: testedEndpoints
      }
    }
    
    // Tentar identificar tipo de erro
    let errorMessage = `Erro de conexão: ${error.message}`
    if (error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Servidor recusou a conexão - verifique se está online'
    } else if (error.message.includes('ENOTFOUND')) {
      errorMessage = 'Servidor não encontrado - verifique o endereço'
    } else if (error.message.includes('ETIMEDOUT')) {
      errorMessage = 'Timeout de conexão - servidor muito lento'
    }
    
    return {
      reachable: false,
      responseTime,
      error: errorMessage,
      tested_endpoints: testedEndpoints
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
    if (!evolutionApiKey) {
      console.error('❌ EVOLUTION_API_KEY não configurada')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API Key Evolution não configurada. Configure EVOLUTION_API_KEY nas variáveis de ambiente.',
          api_key_status: 'not_configured'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let apiKeyStatus = 'configured'
    if (evolutionApiKey.length < 10) {
      apiKeyStatus = 'too_short'
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