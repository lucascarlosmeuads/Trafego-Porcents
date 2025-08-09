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

    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')
    if (!evolutionApiKey) {
      console.error('❌ EVOLUTION_API_KEY não configurada')
      return new Response(
        JSON.stringify({ success: false, error: 'API Key Evolution não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar status da conexão - GET /instance/connectionState/{instance}
    const statusUrl = `${config.server_url.replace(/\/$/, '')}/instance/connectionState/${config.instance_name}`
    console.log('📶 Verificando status da instância:', statusUrl)

    const statusResponse = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
      }
    })

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text()
      console.error('❌ Erro ao verificar status:', errorText)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erro ao verificar status: ${statusResponse.status} - ${errorText}`,
          status: 'error'
        }),
        { 
          status: statusResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const statusData = await statusResponse.json()
    console.log('📱 Status da instância:', statusData)

    // Mapear status para valores padronizados
    let connectionStatus = 'disconnected'
    if (statusData.state === 'open') {
      connectionStatus = 'connected'
    } else if (statusData.state === 'connecting') {
      connectionStatus = 'connecting'
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: connectionStatus,
        state: statusData.state,
        instance_name: config.instance_name,
        server_url: config.server_url,
        raw_data: statusData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erro geral na verificação de status:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Erro interno: ${error.message}`,
        status: 'error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})