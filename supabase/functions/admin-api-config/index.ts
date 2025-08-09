
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SavePayload = {
  server_url: string;
  instance_name: string;
  default_country_code?: string;
  enabled?: boolean;
};

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceKey);
}

function isEmailAdminLike(email?: string | null): boolean {
  const e = (email || "").toLowerCase();
  return e.includes("@admin") || e === "lucas@admin.com" || e === "andreza@trafegoporcents.com";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseAdmin();

    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");
    const { data: userRes } = await supabase.auth.getUser(jwt);
    const requesterEmail = userRes?.user?.email ?? null;

    if (!requesterEmail || !isEmailAdminLike(requesterEmail)) {
      return new Response(JSON.stringify({ success: false, error: "Acesso negado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action as string | undefined;

    if (action === "get_evolution_config") {
      const { data, error } = await supabase
        .from("waseller_dispatch_config")
        .select("*")
        .eq("api_type", "evolution")
        .maybeSingle();

      if (error) {
        console.error("[admin-api-config] Erro ao buscar config:", error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Responder com defaults mínimos se não houver linha
      const payload = data ?? {
        api_type: "evolution",
        enabled: true,
        server_url: "",
        instance_name: "",
        default_country_code: "+55",
      };

      return new Response(
        JSON.stringify({
          success: true,
          config: {
            ...payload,
            // Campos de compatibilidade com UI, sem exigir que existam no DB
            base_url: payload.server_url,
            endpoint_path: "/message/sendText",
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "save_evolution_config") {
      const p: SavePayload = {
        server_url: body?.server_url,
        instance_name: body?.instance_name,
        default_country_code: body?.default_country_code ?? "+55",
        enabled: body?.enabled ?? true,
      };

      if (!p.server_url || !p.instance_name) {
        return new Response(JSON.stringify({ success: false, error: "Campos obrigatórios ausentes" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Upsert por api_type (índice único já criado)
      const { error } = await supabase
        .from("waseller_dispatch_config")
        .upsert(
          {
            api_type: "evolution",
            enabled: p.enabled ?? true,
            server_url: p.server_url,
            instance_name: p.instance_name,
            default_country_code: p.default_country_code ?? "+55",
            updated_at: new Date().toISOString(),
          } as any,
          { onConflict: "api_type" },
        );

      if (error) {
        console.error("[admin-api-config] Erro ao salvar config:", error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Ação inválida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[admin-api-config] Erro inesperado:", err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
