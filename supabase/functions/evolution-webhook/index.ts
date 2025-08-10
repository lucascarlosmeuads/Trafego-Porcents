
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

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = getSupabaseAdmin();

  try {
    const urlObj = new URL(req.url);
    const query: Record<string, string> = {};
    urlObj.searchParams.forEach((v, k) => (query[k] = v));

    let rawBody: string | null = null;
    let payload: any = null;

    try {
      rawBody = await req.text();
      try {
        payload = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        payload = { raw: rawBody };
      }
    } catch {
      payload = {};
    }

    const headers: Record<string, string> = {};
    req.headers.forEach((v, k) => (headers[k] = v));

    // Tenta identificar tipo de evento e instância a partir do payload
    const eventType =
      payload?.event ||
      payload?.type ||
      headers["x-evolution-event"] ||
      "unknown";

    const instanceName =
      payload?.instanceName ||
      payload?.instance ||
      query["instance"] ||
      null;

    const { error } = await supabase.from("evolution_webhook_events").insert({
      event_type: eventType,
      instance_name: instanceName,
      status: "received",
      headers,
      query,
      payload: payload ?? {},
    });

    if (error) {
      console.error("❌ Erro ao inserir evento do webhook:", error);
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("✅ Webhook recebido e registrado:", { eventType, instanceName });

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("❌ Erro no evolution-webhook:", e);
    return new Response(
      JSON.stringify({ ok: false, error: e?.message || "unknown error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
