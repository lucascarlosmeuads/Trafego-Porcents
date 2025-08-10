
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

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const supabase = getSupabaseAdmin();

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
    const number = body.number || body.test_number || "554892095244";

    const logoutUrl = `${baseUrl}/instance/logout/${instance}`;
    const connectUrl = `${baseUrl}/instance/connect/${instance}?number=${encodeURIComponent(number)}`;

    const logout = await timedFetch(logoutUrl, {
      method: "DELETE",
      headers: { apikey: apiKey, "Content-Type": "application/json" },
    });
    let logoutBody: any = null;
    try {
      logoutBody = await logout.res.json();
    } catch {
      logoutBody = await logout.res.text();
    }

    const connect = await timedFetch(connectUrl, {
      method: "GET",
      headers: { apikey: apiKey, "Content-Type": "application/json" },
    });
    let connectBody: any = null;
    try {
      connectBody = await connect.res.json();
    } catch {
      connectBody = await connect.res.text();
    }

    return new Response(
      JSON.stringify({
        success: true,
        steps: {
          logout: {
            url: logoutUrl,
            status: logout.res.status,
            responseTimeMs: logout.elapsed,
            body: logoutBody,
          },
          connect: {
            url: connectUrl,
            status: connect.res.status,
            responseTimeMs: connect.elapsed,
            body: connectBody,
          },
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("❌ evolution-recover-connection error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e?.message || "unknown error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
