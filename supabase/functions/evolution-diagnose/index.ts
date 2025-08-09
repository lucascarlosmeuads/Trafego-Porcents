import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvolutionConfig {
  enabled: boolean;
  server_url: string;
  instance_name: string;
}

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return createClient(url, service);
}

async function fetchEvolutionConfig(supabase: ReturnType<typeof getSupabaseAdmin>): Promise<EvolutionConfig | null> {
  const { data, error } = await supabase
    .from("waseller_dispatch_config")
    .select("enabled, server_url, instance_name")
    .eq("api_type", "evolution")
    .eq("enabled", true)
    .maybeSingle();

  if (error) {
    console.error("❌ [evolution-diagnose] Erro ao buscar config:", error);
    return null;
  }
  if (!data) return null;

  return {
    enabled: (data as any).enabled,
    server_url: (data as any).server_url,
    instance_name: (data as any).instance_name,
  };
}

async function timedFetch(url: string, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = 10000, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const started = Date.now();
  let ok = false;
  let status = 0;
  let body: any = null;
  let error: string | undefined;

  try {
    const resp = await fetch(url, { ...rest, signal: controller.signal });
    status = resp.status;
    const txt = await resp.text();
    try { body = txt ? JSON.parse(txt) : null } catch { body = txt }
    ok = resp.ok;
  } catch (e: any) {
    error = e?.name === 'AbortError' ? `Timeout after ${timeoutMs}ms` : (e?.message || String(e));
  } finally {
    clearTimeout(timer);
  }

  return {
    url,
    method: (rest.method || 'GET') as string,
    ok,
    status,
    durationMs: Date.now() - started,
    body,
    error,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    console.log('🩺 [evolution-diagnose] Iniciando diagnóstico...');
    const supabase = getSupabaseAdmin();
    const cfg = await fetchEvolutionConfig(supabase);

    if (!cfg || !cfg.enabled) {
      return new Response(
        JSON.stringify({ success: false, error: 'Evolution API não configurada ou desabilitada' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('EVOLUTION_API_KEY');
    const base = cfg.server_url.replace(/\/$/, '');
    const instance = cfg.instance_name;

    const headers = { 'Content-Type': 'application/json', 'apikey': apiKey || '' };

    // Run checks in parallel
    const [root, connState, connectPost, connectGet, createPost, createGet] = await Promise.all([
      timedFetch(`${base}`, { method: 'GET', headers, timeoutMs: 8000 }),
      timedFetch(`${base}/instance/connectionState/${instance}`, { method: 'GET', headers, timeoutMs: 10000 }),
      timedFetch(`${base}/instance/connect/${instance}`, { method: 'POST', headers, timeoutMs: 15000 }),
      timedFetch(`${base}/instance/connect/${instance}`, { method: 'GET', headers, timeoutMs: 10000 }),
      timedFetch(`${base}/instance/create`, { method: 'POST', headers, body: JSON.stringify({ instanceName: instance }), timeoutMs: 15000 }),
      timedFetch(`${base}/instance/create/${instance}`, { method: 'GET', headers, timeoutMs: 12000 }),
    ]);

    const suggestions: string[] = [];

    if (connectPost.status === 404 || connectPost.status === 405 || (typeof connectPost.body === 'string' && connectPost.body.includes('Cannot POST'))) {
      suggestions.push('Seu servidor pode esperar GET em vez de POST para /instance/connect. Tente usar o fallback GET.');
    }
    if (createPost.status === 500 && JSON.stringify(createPost.body || '').includes('findMany')) {
      suggestions.push('O servidor Evolution API retornou erro 500 (findMany). Verifique o banco de dados/ORM e reinicie o servidor.');
    }
    if (!apiKey) {
      suggestions.push('Configure a variável EVOLUTION_API_KEY nas Secrets das Edge Functions.');
    }

    return new Response(
      JSON.stringify({
        success: true,
        config: { base_url: base, instance, api_key_present: !!apiKey },
        results: { root, connectionState: connState, connectPost, connectGet, createPost, createGet },
        suggestions,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    console.error('💥 [evolution-diagnose] Erro inesperado:', e);
    return new Response(
      JSON.stringify({ success: false, error: e?.message || String(e) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});