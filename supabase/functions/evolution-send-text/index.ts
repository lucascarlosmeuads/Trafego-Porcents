
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

    type Attempt = { method: "GET" | "POST"; path: string };
    const steps: Attempt[] = [
      { method: "POST", path: "/message/sendText" },
      { method: "GET", path: "/message/sendText" },
      { method: "POST", path: "/message/send" },
      { method: "GET", path: "/message/send" },
    ];

    const attempts: any[] = [];
    let final: any = null;
    let success = false;

    for (let round = 0; round < 2 && !success; round++) {
      for (const step of steps) {
        const url = `${baseUrl}${step.path}/${encodeURIComponent(instance)}` +
          (step.method === "GET" ? `?number=${normalized}&text=${encodeURIComponent(text)}` : "");

        try {
          const init: RequestInit = step.method === "POST"
            ? { method: "POST", headers: { apikey: apiKey, "Content-Type": "application/json" }, body: JSON.stringify({ number: normalized, text }) }
            : { method: "GET", headers: { apikey: apiKey } };

          const { res, elapsed } = await timedFetch(url, init, 45000);
          let bodyOut: any = null;
          try {
            bodyOut = await res.json();
          } catch {
            bodyOut = await res.text();
          }

          const record = { round: round + 1, method: step.method, url, status: res.status, ok: res.ok, elapsed, body: bodyOut };
          attempts.push(record);

          if (res.ok && !success) {
            success = true;
            final = record;
            break;
          }
        } catch (err: any) {
          attempts.push({ round: round + 1, method: step.method, url, status: null, ok: false, elapsed: null, error: err?.message || String(err) });
        }
      }

      if (!success && round === 0) {
        // pequeno backoff antes da segunda rodada
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    // Additional common endpoint variants when previous attempts failed
    if (!success) {
      const altVariants = [
        { method: "POST" as const, url: `${baseUrl}/message/sendText`, body: { session: instance, number: normalized, text }, headers: { apikey: apiKey, "Content-Type": "application/json" } },
        { method: "POST" as const, url: `${baseUrl}/message/send`, body: { session: instance, number: normalized, text }, headers: { apikey: apiKey, "Content-Type": "application/json" } },
        { method: "GET" as const, url: `${baseUrl}/message/sendText?session=${encodeURIComponent(instance)}&number=${normalized}&text=${encodeURIComponent(text)}`, headers: { apikey: apiKey } },
      ];
      for (const v of altVariants) {
        try {
          const init: RequestInit = v.method === "POST"
            ? { method: "POST", headers: v.headers, body: JSON.stringify(v.body) }
            : { method: "GET", headers: v.headers };
          const { res, elapsed } = await timedFetch(v.url, init, 45000);
          let bodyOut: any = null;
          try {
            bodyOut = await res.json();
          } catch {
            bodyOut = await res.text();
          }
          const record = { round: "alt", method: v.method, url: v.url, status: res.status, ok: res.ok, elapsed, body: bodyOut };
          attempts.push(record);
          if (res.ok && !success) {
            success = true;
            final = record;
            break;
          }
        } catch (err: any) {
          attempts.push({ round: "alt", method: v.method, url: v.url, status: null, ok: false, elapsed: null, error: err?.message || String(err) });
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
