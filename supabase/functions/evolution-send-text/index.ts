
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return createClient(url, key);
}

async function getActiveEvolutionConfig(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data } = await supabase
    .from("waseller_dispatch_config")
    .select("*")
    .eq("api_type", "evolution")
    .eq("enabled", true)
    .maybeSingle();
  return data || null;
}

function withoutTrailingSlash(base: string) {
  return base.replace(/\/$/, "");
}

async function timedFetch(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 45000) {
  const start = Date.now();
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(input, { ...(init || {}), signal: controller.signal });
    const elapsed = Date.now() - start;
    return { res, elapsed };
  } finally {
    clearTimeout(t);
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  try {
    const supabase = getSupabaseAdmin();
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};

    const cfg = await getActiveEvolutionConfig(supabase);

    const apiKey = Deno.env.get("EVOLUTION_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "EVOLUTION_API_KEY não configurada", requestId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const rawNumber: string | undefined = body?.number ?? body?.telefone ?? body?.to;
    const text: string | undefined = body?.text ?? body?.message ?? body?.mensagem;

    if (!rawNumber || !text || typeof rawNumber !== "string" || typeof text !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Parâmetros inválidos: forneça { number, text }.", requestId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const normalized = rawNumber.replace(/\D/g, "");
    if (!/^\d{8,15}$/.test(normalized)) {
      return new Response(
        JSON.stringify({ success: false, error: "Número inválido. Use apenas dígitos com DDI/DDD.", requestId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const baseUrl = withoutTrailingSlash(cfg?.server_url || body.base_url || "http://72.60.7.194:8081");
    const instance = body.instance || cfg?.instance_name || "lucas";
const userPrefixRaw = (body && ((body as any).prefix ?? (body as any).base_path_prefix)) as string | undefined;
const rawPrefix = userPrefixRaw && typeof userPrefixRaw === 'string' 
  ? (userPrefixRaw.startsWith('/') ? userPrefixRaw.replace(/\/$/, '') : `/${userPrefixRaw.replace(/\/$/, '')}`)
  : '';
const allowedPrefixes = new Set(['', '/api', '/api/v1', '/v1', '/v1/api', '/evolution', '/evolution/api']);
const userPrefix = allowedPrefixes.has(rawPrefix) ? rawPrefix : '';

    // Step 1: Check server health and instance status
    console.log(`[evolution-send-text] Checking server health: ${baseUrl}`);
    const healthCheck = await timedFetch(`${baseUrl}`, { method: 'GET', headers: { apikey: apiKey } }, 10000);
    
    console.log(`[evolution-send-text] Checking instance status: ${instance}`);
    const statusCheck = await timedFetch(`${baseUrl}/instance/connectionState/${instance}`, { 
      method: 'GET', 
      headers: { apikey: apiKey, 'Content-Type': 'application/json' }
    }, 10000);

    let instanceState = 'unknown';
    let instanceReady = false;
    try {
      const statusData = await statusCheck.res.json();
      instanceState = statusData?.instance?.state || 'unknown';
      instanceReady = instanceState === 'open';
      console.log(`[evolution-send-text] Instance '${instance}' state: ${instanceState}, ready: ${instanceReady}`);
    } catch (e) {
      console.log(`[evolution-send-text] Could not parse instance status:`, e);
    }

    // Step 2: Check for previously discovered endpoints
    console.log(`[evolution-send-text] Checking for discovered endpoints for ${baseUrl}/${instance}`);
    const { data: discoveredEndpoints } = await supabase
      .from('evolution_discovered_endpoints')
      .select('*')
      .eq('server_url', baseUrl)
      .eq('instance_name', instance)
      .eq('is_working', true)
      .order('priority', { ascending: true })
      .limit(3);

    console.log(`[evolution-send-text] Found ${discoveredEndpoints?.length || 0} discovered endpoints`);
    
    const attempts: any[] = [];
    let final: any = null;
    let success = false;

    // Try discovered endpoints first with multiple payload formats
    if (discoveredEndpoints && discoveredEndpoints.length > 0) {
      console.log(`[evolution-send-text] Trying discovered endpoints first`);
      
      const payloadFormats = [
        { number: normalized, text },
        { phone: normalized, message: text },
        { number: normalized, textMessage: { text } },
        { remoteJid: `${normalized}@s.whatsapp.net`, message: { text } },
        { session: instance, number: normalized, text },
      ];

      for (const endpoint of discoveredEndpoints) {
        if (success) break;
        
        const fullUrl = `${baseUrl}${endpoint.endpoint_path.replace('{instance}', instance)}`;
        
        for (const payload of payloadFormats) {
          if (success) break;
          
          try {
            console.log(`[evolution-send-text] Testing discovered endpoint: ${endpoint.method} ${fullUrl} with payload style: ${Object.keys(payload).join('+')}`);
            
            const { res, elapsed } = await timedFetch(fullUrl, {
              method: endpoint.method,
              headers: { apikey: apiKey, "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            }, 15000);

            let bodyOut: any = null;
            try { bodyOut = await res.json(); } catch { bodyOut = await res.text(); }

            const record = { 
              round: 0, 
              method: endpoint.method, 
              url: fullUrl, 
              status: res.status, 
              ok: res.ok, 
              elapsed, 
              body: bodyOut, 
              payloadStyle: Object.keys(payload).join('+'),
              source: 'discovered'
            };
            attempts.push(record);

            if (res.ok || res.status === 201) {
              success = true;
              final = record;
              console.log(`[evolution-send-text] SUCCESS on discovered endpoint: ${fullUrl}`);
              break;
            }
          } catch (err: any) {
            const record = { 
              round: 0, 
              method: endpoint.method, 
              url: fullUrl, 
              status: null, 
              ok: false, 
              elapsed: null, 
              error: err?.message || String(err), 
              payloadStyle: Object.keys(payload).join('+'),
              source: 'discovered'
            };
            attempts.push(record);
          }
        }
      }
    }

    // Quick WPPConnect-style route tests (fallback if no discovered endpoints worked)
    if (!success) {
      console.log(`[evolution-send-text] Trying quick WPPConnect-style routes`);
      const quickCandidates = Array.from(new Set([
        `${baseUrl}${userPrefix}/api/${instance}/send-message`,
        `${baseUrl}/api/${instance}/send-message`,
        `${baseUrl}/api/v1/${instance}/send-message`,
        `${baseUrl}/v1/api/${instance}/send-message`,
      ]));

      const quickPayloads = [
        { phone: normalized, message: text },
        { number: normalized, text },
      ];

      for (const url of quickCandidates) {
        if (success) break;
        for (const bodyVariant of quickPayloads) {
          try {
            console.log(`[evolution-send-text] Quick test: POST ${url}`);
            const { res, elapsed } = await timedFetch(url, {
              method: "POST",
              headers: { apikey: apiKey, "Content-Type": "application/json" },
              body: JSON.stringify(bodyVariant)
            }, 15000);

            let bodyOut: any = null;
            try { bodyOut = await res.json(); } catch { bodyOut = await res.text(); }

            const record = { round: 1, method: "POST", url, status: res.status, ok: res.ok, elapsed, body: bodyOut, payloadStyle: Object.keys(bodyVariant).join('+'), source: 'quick' };
            attempts.push(record);

            if (res.ok || res.status === 201) {
              success = true;
              final = record;
              console.log(`[evolution-send-text] SUCCESS on quick route: ${url}`);
              break;
            }
          } catch (err: any) {
            const record = { round: 1, method: "POST", url, status: null, ok: false, elapsed: null, error: err?.message || String(err), payloadStyle: Object.keys(bodyVariant).join('+'), source: 'quick' };
            attempts.push(record);
          }
        }
      }
    }
    
    // Primary documented endpoint - try with extended timeout if quick scan didn't succeed
    const primaryEndpoint = `${baseUrl}/message/sendText/${instance}`;
    const payload = { number: normalized, text };
    
    if (!success) {
      try {
        console.log(`[evolution-send-text] Trying primary endpoint: POST ${primaryEndpoint}`);
        const { res, elapsed } = await timedFetch(primaryEndpoint, {
          method: "POST",
          headers: { apikey: apiKey, "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }, 60000); // 60 second timeout for primary endpoint

        let bodyOut: any = null;
        try {
          bodyOut = await res.json();
        } catch {
          bodyOut = await res.text();
        }

        const record = { round: 2, method: "POST", url: primaryEndpoint, status: res.status, ok: res.ok, elapsed, body: bodyOut, source: 'primary' };
        attempts.push(record);

        if (res.ok) {
          success = true;
          final = record;
          console.log(`[evolution-send-text] SUCCESS on primary endpoint: ${primaryEndpoint}`);
        }
      } catch (err: any) {
        const record = { round: 2, method: "POST", url: primaryEndpoint, status: null, ok: false, elapsed: null, error: err?.message || String(err), source: 'primary' };
        attempts.push(record);
        console.log(`[evolution-send-text] Primary endpoint failed:`, err?.message);
      }
    }

    // If primary failed, try alternative endpoints
    if (!success) {
      console.log(`[evolution-send-text] Primary failed, trying alternatives...`);
      
      // Build a wider matrix of endpoint variations (prefixes, paths, methods, payload styles)
const prefixes = Array.from(new Set([
  userPrefix || '',
  '',
  '/api',
  '/evolution',
  '/evolution/api',
  '/v1',
  '/api/v1',
  '/v1/api'
]));

      const routes = [
        // By instance in path
        (p: string) => ({ method: "POST" as const, url: `${baseUrl}${p}/message/sendText/${instance}`, body: { number: normalized, text } }),
        (p: string) => ({ method: "GET"  as const, url: `${baseUrl}${p}/message/sendText/${instance}?number=${normalized}&text=${encodeURIComponent(text)}` }),
        (p: string) => ({ method: "POST" as const, url: `${baseUrl}${p}/message/send/${instance}`, body: { number: normalized, text } }),
        (p: string) => ({ method: "GET"  as const, url: `${baseUrl}${p}/message/send/${instance}?number=${normalized}&text=${encodeURIComponent(text)}` }),
        // With session in body/query
        (p: string) => ({ method: "POST" as const, url: `${baseUrl}${p}/message/sendText`, body: { session: instance, number: normalized, text } }),
        (p: string) => ({ method: "POST" as const, url: `${baseUrl}${p}/message/send`, body: { session: instance, number: normalized, text } }),
        (p: string) => ({ method: "GET"  as const, url: `${baseUrl}${p}/message/sendText?session=${encodeURIComponent(instance)}&number=${normalized}&text=${encodeURIComponent(text)}` }),
        // Plural variants
        (p: string) => ({ method: "POST" as const, url: `${baseUrl}${p}/messages/sendText/${instance}`, body: { number: normalized, text } }),
        (p: string) => ({ method: "POST" as const, url: `${baseUrl}${p}/messages/send/${instance}`, body: { number: normalized, text } }),
        (p: string) => ({ method: "POST" as const, url: `${baseUrl}${p}/messages/sendText`, body: { session: instance, number: normalized, text } }),
        (p: string) => ({ method: "POST" as const, url: `${baseUrl}${p}/messages/send`, body: { session: instance, number: normalized, text } }),
        // Kebab-case variants seen in some forks
        (p: string) => ({ method: "POST" as const, url: `${baseUrl}${p}/message/send-text/${instance}`, body: { number: normalized, text } }),
        (p: string) => ({ method: "POST" as const, url: `${baseUrl}${p}/message/send-text`, body: { session: instance, number: normalized, text } }),
        // Generic chat/send
        (p: string) => ({ method: "POST" as const, url: `${baseUrl}${p}/chat/send`, body: { session: instance, number: normalized, text } }),
      ];

      // Generate attempts with JSON and x-www-form-urlencoded payloads
      const alternativeEndpoints: Array<{ method: 'GET'|'POST'; url: string; body?: Record<string, any>; contentType?: string }> = [];
      for (const prefix of prefixes) {
        for (const build of routes) {
          const attempt = build(prefix);
          alternativeEndpoints.push(attempt); // JSON default
          if (attempt.method === 'POST' && attempt.body) {
            alternativeEndpoints.push({ ...attempt, contentType: 'application/x-www-form-urlencoded' });
          }
        }
      }

      for (const endpoint of alternativeEndpoints) {
        if (success) break;
        try {
          const headers: Record<string, string> = { apikey: apiKey } as const;
          let init: RequestInit;

          if (endpoint.method === 'POST') {
            const isForm = endpoint.contentType === 'application/x-www-form-urlencoded';
            headers['Content-Type'] = isForm ? 'application/x-www-form-urlencoded' : 'application/json';
            const bodyStr = isForm
              ? new URLSearchParams(Object.entries(endpoint.body || {}).map(([k, v]) => [k, String(v)])).toString()
              : JSON.stringify(endpoint.body);
            init = { method: 'POST', headers, body: bodyStr };
          } else {
            headers['Content-Type'] = 'application/json';
            init = { method: 'GET', headers };
          }

          const { res, elapsed } = await timedFetch(endpoint.url, init, 30000);

          let bodyOut: any = null;
          try {
            bodyOut = await res.json();
          } catch {
            bodyOut = await res.text();
          }

          const record = { round: 3, method: endpoint.method, url: endpoint.url, status: res.status, ok: res.ok, elapsed, body: bodyOut, contentTypeTried: headers['Content-Type'], source: 'alternative' };
          attempts.push(record);

          if (res.ok && !success) {
            success = true;
            final = record;
            console.log(`[evolution-send-text] SUCCESS on alternative: ${endpoint.method} ${endpoint.url}`);
            break;
          }
        } catch (err: any) {
          const record = { round: 3, method: endpoint.method, url: endpoint.url, status: null, ok: false, elapsed: null, error: err?.message || String(err), source: 'alternative' };
          attempts.push(record);
        }
      }
    }

    const last = attempts[attempts.length - 1] || null;
    const chosen = final || last;

    const result = {
      success: Boolean(final?.ok),
      status: chosen?.status ?? 0,
      responseTimeMs: chosen?.elapsed ?? null,
      requestId,
      endpoint: chosen?.url ?? null,
      body: chosen?.body ?? null,
      attempts,
      // Diagnostics info
      diagnostics: {
        serverHealth: healthCheck.res?.status || null,
        instanceState,
        instanceReady,
        discoveredEndpointsFound: discoveredEndpoints?.length || 0,
        discoveredEndpointsUsed: attempts.filter(a => a.source === 'discovered').length,
        recommendations: !instanceReady ? ['Instance is not in "open" state. Try reconnecting first.'] : []
      }
    };

    console.log("[evolution-send-text]", JSON.stringify({ requestId, success: result.success, totalAttempts: attempts.length, endpoint: result.endpoint, status: result.status }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("❌ evolution-send-text error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e?.message || "unknown error", requestId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
