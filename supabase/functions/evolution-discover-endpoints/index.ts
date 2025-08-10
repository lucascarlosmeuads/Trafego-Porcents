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
    .eq('api_type', 'evolution')
    .eq('enabled', true)
    .maybeSingle()

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
  { pattern: '/message/sendText/{instance}', method: 'POST', type: 'evolution-v1', priority: 2 },
  { pattern: '/message/sendText', method: 'POST', type: 'evolution-v1-alt', priority: 3 },
  
  // Evolution API v2
  { pattern: '/chat/sendText/{instance}', method: 'POST', type: 'evolution-v2', priority: 2 },
  { pattern: '/chat/sendText', method: 'POST', type: 'evolution-v2-alt', priority: 3 },
  
  // WPPConnect/CodeChat style (very common in forks)
  { pattern: '/api/{instance}/send-message', method: 'POST', type: 'wppconnect-send-message', priority: 1 },
  { pattern: '/api/{instance}/send-text', method: 'POST', type: 'codechat', priority: 2 },
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

    // Parse optional options from request body
    let body: any = {}
    try {
      if (req.method !== 'GET') body = await req.json()
    } catch {}

const rawPrefix = (body?.prefix ?? '').toString().trim()
const normalizePrefix = (p: string) => {
  if (!p) return ''
  let s = p.startsWith('/') ? p : `/${p}`
  s = s.replace(/\/$/, '')
  const allowed = new Set(['', '/api', '/api/v1', '/v1', '/v1/api', '/evolution', '/evolution/api'])
  return allowed.has(s) ? s : ''
}
const prefixOverride = normalizePrefix(rawPrefix)
const perAttemptTimeout = Math.min(Math.max(Number(body?.timeoutMs) || 1200, 400), 5000)
const globalBudgetMs = Math.min(Math.max(Number(body?.budgetMs) || 12000, 3000), 25000)
const maxConcurrency = Math.min(Math.max(Number(body?.concurrency) || 6, 2), 10)

    // Get Evolution API configuration
    const config = await getActiveEvolutionConfig(supabase)
    if (!config || !config.enabled) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Evolution API não configurada ou desabilitada' 
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
        JSON.stringify({ success: false, error: 'EVOLUTION_API_KEY não configurada' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const baseUrl = withoutTrailingSlash(config.server_url)
    const instance = config.instance_name

    console.log(`[evolution-discover] init base=${baseUrl} instance=${instance} perAttempt=${perAttemptTimeout}ms budget=${globalBudgetMs}ms`)

    const startTime = Date.now()
    const spent = () => Date.now() - startTime

    // Step 1: Probe documentation/health endpoints concurrently (short timeouts)
    const docEndpoints = ['/', '/docs', '/swagger', '/api-docs', '/health', '/status']
    const docPromises = docEndpoints.map((endpoint) =>
      timedFetch(`${baseUrl}${endpoint}`, { method: 'GET', headers: { apikey: API_KEY } }, Math.min(perAttemptTimeout, 800))
        .then(r => ({ endpoint, ...r }))
    )
    const docResults = await Promise.allSettled(docPromises).then(all => all.map((r, i) => r.status === 'fulfilled' ? r.value : { endpoint: docEndpoints[i], success: false, status: 0, data: null, time: 0, error: (r as any).reason?.message || 'failed' }))

    // Step 2: Build candidate endpoints matrix
    const prefixes = prefixOverride ? [prefixOverride] : ['', '/api', '/api/v1', '/v1', '/v1/api', '/evolution', '/evolution/api']

    type Candidate = { url: string; pattern: string; method: string; type: string; priority: number; prefix: string }
    const candidates: Candidate[] = []

    for (const prefix of prefixes) {
      for (const pattern of ENDPOINT_PATTERNS) {
        const fullPattern = `${prefix}${pattern.pattern}`
        const url = `${baseUrl}${fullPattern.replace('{instance}', instance)}`
        candidates.push({ url, pattern: fullPattern, method: pattern.method, type: pattern.type, priority: pattern.priority, prefix })
      }
    }

    // Sort by priority then by prefix order
    const prefixOrder = new Map(prefixes.map((p, i) => [p, i] as const))
    candidates.sort((a, b) => a.priority - b.priority || (prefixOrder.get(a.prefix)! - prefixOrder.get(b.prefix)!))

    const testPayload = { number: '5511999999999', text: 'test' }

    // Concurrency runner with global time budget
    const results: any[] = []
    let cursor = 0

    async function worker() {
      while (cursor < candidates.length && spent() < globalBudgetMs) {
        const idx = cursor++
        const c = candidates[idx]
        console.log(`[evolution-discover] test ${c.method} ${c.url}`)
        const res = await timedFetch(c.url, {
          method: c.method as any,
          headers: { 'Content-Type': 'application/json', apikey: API_KEY },
          body: JSON.stringify(testPayload)
        }, perAttemptTimeout)
        results.push({ ...c, ...res })
      }
    }

    const workers = Array.from({ length: maxConcurrency }, () => worker())
    await Promise.race([
      Promise.all(workers),
      new Promise((resolve) => setTimeout(resolve, globalBudgetMs))
    ])

    // Step 3: Analyze results
    const workingEndpoints = results.filter(r => r.success || [400,401,422].includes(r.status))
      .sort((a, b) => a.priority - b.priority)

    const recommendations: any[] = []
    if (workingEndpoints.length > 0) {
      const best = workingEndpoints[0]
      recommendations.push({
        type: 'primary',
        endpoint: best.pattern,
        method: best.method,
        apiType: best.type,
        reason: `Endpoint respondeu com status ${best.status}`,
        testUrl: best.url
      })
    }

    const alternatives = workingEndpoints.slice(1, 3)
    alternatives.forEach(alt => {
      recommendations.push({
        type: 'alternative',
        endpoint: alt.pattern,
        method: alt.method,
        apiType: alt.type,
        reason: `Alternativo (status ${alt.status})`,
        testUrl: alt.url
      })
    })

    const diagnostic = {
      serverInfo: {
        baseUrl,
        instance,
        serverResponsive: docResults.some((r: any) => r.success),
        documentationEndpoints: docResults.filter((r: any) => r.success),
        spentMs: spent(),
        budgetMs: globalBudgetMs,
        prefixOverride: prefixOverride || null
      },
      endpointTesting: {
        totalTested: results.length,
        workingCount: workingEndpoints.length,
        results
      },
      recommendations,
      suggestedPayload: testPayload
    }

    const responsePayload: any = {
      success: workingEndpoints.length > 0,
      diagnostic,
      workingEndpoints: workingEndpoints.slice(0, 5),
      timestamp: new Date().toISOString()
    }

    if (workingEndpoints.length === 0) {
      responsePayload.error = spent() >= globalBudgetMs 
        ? 'Tempo limite atingido antes de encontrar um endpoint compatível' 
        : 'Nenhum endpoint conhecido respondeu de forma compatível'
    }

    console.log(`[evolution-discover] done working=${workingEndpoints.length} tested=${results.length} spent=${spent()}ms`)

    return new Response(JSON.stringify(responsePayload), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('[evolution-discover] Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})