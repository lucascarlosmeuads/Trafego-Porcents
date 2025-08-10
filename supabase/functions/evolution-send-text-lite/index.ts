// Evolution Send Text Lite - minimal, public, compact
// Performs a single known Evolution API call with 10s timeout and compact response

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function withoutTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

async function timedFetch(url: string, init: RequestInit & { timeoutMs?: number }) {
  const { timeoutMs = 10000, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const t0 = performance.now();
  try {
    const res = await fetch(url, { ...rest, signal: controller.signal });
    const text = await res.text();
    let body: any = text;
    try { body = JSON.parse(text); } catch { /* keep text */ }
    return { ok: res.ok, status: res.status, body, ms: Math.round(performance.now() - t0) };
  } finally {
    clearTimeout(timer);
  }
}

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase admin env not set");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function fetchEvolutionConfig() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("waseller_dispatch_config")
    .select("server_url, instance_name, enabled")
    .eq("enabled", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data || !data.server_url || !data.instance_name) return null;
  return { serverUrl: data.server_url as string, instance: data.instance_name as string };
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();

  try {
    const apiKey = Deno.env.get("EVOLUTION_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: "EVOLUTION_API_KEY não configurada", requestId }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const config = await fetchEvolutionConfig();
    if (!config) {
      return new Response(JSON.stringify({ success: false, error: "Configuração Evolution ausente", requestId }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { number, phone, text, message } = await req.json().catch(() => ({ })) as any;
    const target = (number || phone || "").toString().replace(/\D/g, "");
    const content = typeof text === "string" ? text : (typeof message === "string" ? message : (message?.text ?? ""));

    if (!/^\d{8,15}$/.test(target)) {
      return new Response(JSON.stringify({ success: false, error: "Número inválido (use apenas dígitos com DDI/DDD)", requestId }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!content || typeof content !== "string") {
      return new Response(JSON.stringify({ success: false, error: "Texto da mensagem ausente", requestId }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const base = withoutTrailingSlash(config.serverUrl);
    const endpoint = `${base}/message/sendText/${encodeURIComponent(config.instance)}`;

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "apikey": apiKey,
    } as Record<string, string>;

    // Two compact attempts with different payload shapes
    const attempts: Array<{ payload: any } > = [
      { payload: { number: target, text: content } },
      { payload: { phone: target, message: content } },
    ];

    let last: any = null;
    for (let i = 0; i < attempts.length; i++) {
      const a = attempts[i];
      const res = await timedFetch(endpoint, { method: "POST", headers, body: JSON.stringify(a.payload), timeoutMs: 10000 });
      last = res;
      if (res.ok) {
        return new Response(JSON.stringify({
          success: true,
          status: res.status,
          endpoint,
          attemptUsed: i + 1,
          responseTimeMs: res.ms,
          evolution: res.body,
          requestId,
        }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      // Continue to next payload shape if not ok
    }

    return new Response(JSON.stringify({
      success: false,
      status: last?.status ?? 0,
      endpoint,
      responseTimeMs: last?.ms,
      evolution: last?.body,
      requestId,
      error: typeof last?.body === "object" ? (last?.body?.error || last?.body?.message || "Falha no envio") : "Falha no envio",
    }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e?.message || String(e), requestId }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
