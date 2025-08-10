
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

async function timedFetch(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 15000) {
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

    const url = `${baseUrl}/message/sendText/${encodeURIComponent(instance)}`;

    const { res, elapsed } = await timedFetch(url, {
      method: "POST",
      headers: { apikey: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ number: normalized, text }),
    });

    let responseBody: any = null;
    try {
      responseBody = await res.json();
    } catch {
      responseBody = await res.text();
    }

    const result = {
      success: res.ok,
      status: res.status,
      responseTimeMs: elapsed,
      requestId,
      endpoint: url,
      body: responseBody,
    };

    console.log("[evolution-send-text]", JSON.stringify(result));

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
