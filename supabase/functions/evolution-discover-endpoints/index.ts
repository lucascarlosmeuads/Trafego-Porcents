import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EvolutionConfig {
  enabled: boolean;
  server_url: string;
  instance_name: string;
  default_country_code: string;
}

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

async function getActiveEvolutionConfig(supabase: any): Promise<EvolutionConfig | null> {
  const { data, error } = await supabase
    .from('waseller_dispatch_config')
    .select('*')
    .eq('config_type', 'evolution')
    .eq('enabled', true)
    .single()

  if (error || !data) return null
  
  return {
    enabled: data.enabled,
    server_url: data.server_url,
    instance_name: data.instance_name,
    default_country_code: data.default_country_code || '55'
  }
}

function withoutTrailingSlash(base: string): string {
  return base.replace(/\/$/, '')
}

async function timedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = 5000
): Promise<{ success: boolean; status: number; data: any; time: number; error?: string }> {
  const startTime = Date.now()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    const time = Date.now() - startTime
    
    let data: any
    try {
      const text = await response.text()
      data = text ? JSON.parse(text) : {}
    } catch {
      data = response.statusText
    }

    return {
      success: response.ok,
      status: response.status,
      data,
      time
    }
  } catch (error) {
    clearTimeout(timeoutId)
    const time = Date.now() - startTime
    
    return {
      success: false,
      status: 0,
      data: null,
      time,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Known endpoint patterns for different Evolution API versions and forks
const ENDPOINT_PATTERNS = [
  // Evolution API v1
  { pattern: '/message/sendText/{instance}', method: 'POST', type: 'evolution-v1', priority: 1 },
  { pattern: '/message/sendText', method: 'POST', type: 'evolution-v1-alt', priority: 2 },
  
  // Evolution API v2
  { pattern: '/chat/sendText/{instance}', method: 'POST', type: 'evolution-v2', priority: 1 },
  { pattern: '/chat/sendText', method: 'POST', type: 'evolution-v2-alt', priority: 2 },
  
  // CodeChat/Wppconnect style
  { pattern: '/api/{instance}/send-text', method: 'POST', type: 'codechat', priority: 3 },
  { pattern: '/api/sendText', method: 'POST', type: 'wppconnect', priority: 3 },
  
  // Baileys style
  { pattern: '/sendMessage', method: 'POST', type: 'baileys', priority: 4 },
  { pattern: '/{instance}/sendMessage', method: 'POST', type: 'baileys-instance', priority: 4 },
  
  // WhatsApp Web.js style
  { pattern: '/client/sendMessage', method: 'POST', type: 'whatsapp-web-js', priority: 5 },
  
  // Generic patterns
  { pattern: '/send', method: 'POST', type: 'generic', priority: 6 },
  { pattern: '/message', method: 'POST', type: 'generic-message', priority: 6 },
]

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = getSupabaseAdmin()
    
    // Get Evolution API configuration
    const config = await getActiveEvolutionConfig(supabase)
    if (!config || !config.enabled) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Evolution API not configured or disabled' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const API_KEY = Deno.env.get('EVOLUTION_API_KEY')
    if (!API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'Evolution API key not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const baseUrl = withoutTrailingSlash(config.server_url)
    const instance = config.instance_name

    console.log(`[evolution-discover] Starting endpoint discovery for: ${baseUrl}`)

    // Step 1: Check if server has documentation endpoint
    const docEndpoints = ['/', '/docs', '/api-docs', '/swagger', '/health', '/status']
    const docResults = []
    
    for (const endpoint of docEndpoints) {
      const result = await timedFetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: { apikey: API_KEY }
      })
      docResults.push({ endpoint, ...result })
    }

    // Step 2: Test known message sending endpoints
    const endpointResults = []
    const testPayload = { number: '5511999999999', text: 'test' }

    for (const pattern of ENDPOINT_PATTERNS) {
      const url = `${baseUrl}${pattern.pattern.replace('{instance}', instance)}`
      
      console.log(`[evolution-discover] Testing ${pattern.method} ${url}`)
      
      const result = await timedFetch(url, {
        method: pattern.method,
        headers: {
          'Content-Type': 'application/json',
          apikey: API_KEY
        },
        body: JSON.stringify(testPayload)
      }, 3000)

      endpointResults.push({
        url,
        pattern: pattern.pattern,
        method: pattern.method,
        type: pattern.type,
        priority: pattern.priority,
        ...result
      })
    }

    // Step 3: Analyze results and identify working endpoints
    const workingEndpoints = endpointResults.filter(result => 
      result.success || 
      result.status === 400 || // Bad request might mean endpoint exists but wrong payload
      result.status === 401 || // Unauthorized means endpoint exists
      result.status === 422    // Validation error means endpoint exists
    ).sort((a, b) => a.priority - b.priority)

    const recommendations = []
    
    if (workingEndpoints.length > 0) {
      const best = workingEndpoints[0]
      recommendations.push({
        type: 'primary',
        endpoint: best.pattern,
        method: best.method,
        apiType: best.type,
        reason: `Endpoint responded with status ${best.status}`,
        testUrl: best.url
      })
    }

    // Check for alternative working endpoints
    const alternatives = workingEndpoints.slice(1, 3)
    alternatives.forEach(alt => {
      recommendations.push({
        type: 'alternative',
        endpoint: alt.pattern,
        method: alt.method,
        apiType: alt.type,
        reason: `Alternative endpoint (status ${alt.status})`,
        testUrl: alt.url
      })
    })

    // Step 4: Generate diagnostic information
    const diagnostic = {
      serverInfo: {
        baseUrl,
        instance,
        serverResponsive: docResults.some(r => r.success),
        documentationEndpoints: docResults.filter(r => r.success)
      },
      endpointTesting: {
        totalTested: endpointResults.length,
        workingCount: workingEndpoints.length,
        results: endpointResults
      },
      recommendations,
      suggestedPayload: {
        number: "5511999999999",
        text: "Test message"
      }
    }

    console.log(`[evolution-discover] Discovery complete. Found ${workingEndpoints.length} working endpoints`)

    return new Response(
      JSON.stringify({
        success: true,
        diagnostic,
        workingEndpoints: workingEndpoints.slice(0, 5), // Top 5 results
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('[evolution-discover] Error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})