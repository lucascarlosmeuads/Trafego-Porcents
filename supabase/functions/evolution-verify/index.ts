
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
  const { data, error } = await supabase
    .from("waseller_dispatch_config")
    .select("*")
    .eq("api_type", "evolution")
    .eq("enabled", true)
    .maybeSingle();

  if (error) {
    console.warn("⚠️ Não foi possível ler waseller_dispatch_config:", error.message);
  }
  return data || null;
}

function withSlash(base: string) {
  return base.replace(/\/$/, "");
}

async function timedFetch(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 10000) {
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

  const supabase = getSupabaseAdmin();
  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const cfg = await getActiveEvolutionConfig(supabase);

    const apiKey = Deno.env.get("EVOLUTION_API_KEY") || body.api_key;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "EVOLUTION_API_KEY não configurada" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const baseUrl = withSlash(
      body.base_url || cfg?.server_url || "http://72.60.7.194:8081",
    );

    const instance = body.instance || cfg?.instance_name || "lucas";
    const testNumber = body.number || body.test_number || "554892095244";

    // 1) Healthcheck
    const healthUrl = `${baseUrl}/`;
    const health = await timedFetch(healthUrl, {
      method: "GET",
      headers: { apikey: apiKey, "Content-Type": "application/json" },
    });
    let healthBody: any = null;
    try {
      healthBody = await health.res.json();
    } catch {
      healthBody = await health.res.text();
    }

    // 2) Estado da conexão (com polling até 20s se necessário)
    const stateUrl = `${baseUrl}/instance/connectionState/${instance}`;
    const pollStart = Date.now();
    let stateBody: any = null;
    let stateElapsed = 0;
    let stateStatus = 0;
    let stateStr = "unknown";

    for (;;) {
      const st = await timedFetch(stateUrl, {
        method: "GET",
        headers: { apikey: apiKey, "Content-Type": "application/json" },
      });
      stateElapsed = st.elapsed;
      stateStatus = st.res.status;

      try {
        stateBody = await st.res.json();
      } catch {
        stateBody = await st.res.text();
      }

      // Normalmente esperamos "connected". Algumas implementações usam "open".
      stateStr = (stateBody?.state || stateBody?.connection || "").toString().toLowerCase();
      if (stateStr === "connected" || stateStr === "open") break;

      if (Date.now() - pollStart > 20000) break; // 20s
      await new Promise((r) => setTimeout(r, 1500));
    }

    // 3) Envio de mensagem de teste
    const sendUrl = `${baseUrl}/message/sendText/${instance}`;
    const sendBody = { number: testNumber, text: "Teste via Evolution ✅" };
    const send = await timedFetch(sendUrl, {
      method: "POST",
      headers: { apikey: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(sendBody),
    });
    let sendResp: any = null;
    try {
      sendResp = await send.res.json();
    } catch {
      sendResp = await send.res.text();
    }

    const out = {
      success: true,
      config_used: { baseUrl, instance, testNumber },
      steps: {
        healthcheck: {
          url: healthUrl,
          status: health.res.status,
          responseTimeMs: health.elapsed,
          body: healthBody,
        },
        connectionState: {
          url: stateUrl,
          status: stateStatus,
          lastResponseTimeMs: stateElapsed,
          body: stateBody,
          consideredConnected: stateStr === "connected" || stateStr === "open",
          finalState: stateStr,
        },
        sendText: {
          url: sendUrl,
          status: send.res.status,
          responseTimeMs: send.elapsed,
          requestBody: sendBody,
          body: sendResp,
        },
      },
    };

    return new Response(JSON.stringify(out), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("❌ evolution-verify error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e?.message || "unknown error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
