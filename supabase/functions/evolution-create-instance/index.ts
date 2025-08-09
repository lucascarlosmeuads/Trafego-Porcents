import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvolutionConfig {
  id: string;
  enabled: boolean;
  server_url: string;
  instance_name: string;
  default_country_code: string;
  api_type: string;
}

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceKey);
}

async function fetchEvolutionConfig(supabase: ReturnType<typeof getSupabaseAdmin>): Promise<EvolutionConfig | null> {
  const { data, error } = await supabase
    .from("waseller_dispatch_config")
    .select("*")
    .eq("enabled", true)
    .eq("api_type", "evolution")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("❌ Error loading evolution config:", error);
    return null;
  }
  if (!data) return null;

  return {
    id: (data as any).id,
    enabled: (data as any).enabled,
    server_url: (data as any).server_url,
    instance_name: (data as any).instance_name || "default",
    default_country_code: (data as any).default_country_code || "+55",
    api_type: (data as any).api_type,
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseAdmin();
    
    console.log("🏗️ [evolution-create-instance] Iniciando criação de instância...");

    // Fetch Evolution API configuration
    const config = await fetchEvolutionConfig(supabase);
    if (!config || !config.enabled) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Evolution API não configurada ou desabilitada" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("📋 [evolution-create-instance] Configuração encontrada:", {
      server_url: config.server_url,
      instance_name: config.instance_name
    });

    const apiKey = Deno.env.get("EVOLUTION_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "EVOLUTION_API_KEY não configurada" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Create instance using Evolution API
    const createUrl = `${config.server_url.replace(/\/$/, '')}/instance/create`;
    console.log("🔌 [evolution-create-instance] URL de criação:", createUrl);

    const createPayload = {
      instanceName: config.instance_name
    };

    console.log("📤 [evolution-create-instance] Payload:", createPayload);

    // Add timeout of 15 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let response;
    try {
      response = await fetch(createUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": apiKey,
        },
        body: JSON.stringify(createPayload),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("⏰ [evolution-create-instance] Timeout ao criar instância");
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Timeout: Servidor Evolution API não está respondendo (15s). Verifique se o servidor está online."
          }),
          { 
            status: 408, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      console.error("🌐 [evolution-create-instance] Erro de rede:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erro de rede: ${error instanceof Error ? error.message : String(error)}`
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    clearTimeout(timeoutId);

    const statusCode = response.status;
    let responseBody;
    
    try {
      const text = await response.text();
      responseBody = text ? JSON.parse(text) : null;
    } catch {
      responseBody = await response.text();
    }

    console.log(`📥 [evolution-create-instance] Response ${statusCode}:`, responseBody);

    if (response.ok) {
      console.log("✅ [evolution-create-instance] Instância criada com sucesso!");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Instância criada com sucesso",
          data: responseBody
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else {
      console.error("❌ [evolution-create-instance] Falha ao criar instância:", statusCode, responseBody);
      
      // Check if instance already exists
      if (statusCode === 409 || statusCode === 400) {
        if (typeof responseBody === 'object' && responseBody?.message?.includes?.('already exists')) {
          console.log("ℹ️ [evolution-create-instance] Instância já existe - considerando sucesso");
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "Instância já existe",
              data: responseBody
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }
      }

      // Fallback: tentar criar via GET /instance/create/{instance}
      try {
        const fallbackUrl = `${config.server_url.replace(/\/$/, '')}/instance/create/${config.instance_name}`;
        console.log("🧪 [evolution-create-instance] Tentando fallback GET:", fallbackUrl);
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 10000);
        const fallbackResp = await fetch(fallbackUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "apikey": apiKey,
          },
          signal: controller2.signal,
        });
        clearTimeout(timeoutId2);

        let fbText = await fallbackResp.text();
        let fbBody: any = null;
        try {
          fbBody = fbText ? JSON.parse(fbText) : null;
        } catch {
          fbBody = fbText;
        }

        console.log(`📥 [evolution-create-instance] Fallback response ${fallbackResp.status}:`, fbBody);

        if (fallbackResp.ok) {
          console.log("✅ [evolution-create-instance] Instância criada com sucesso via fallback GET!");
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "Instância criada com sucesso (fallback)",
              data: fbBody
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }
      } catch (fbErr) {
        console.warn("⚠️ [evolution-create-instance] Erro no fallback GET:", fbErr);
      }

      // Check for specific server errors
      let errorMessage = `Falha ao criar instância: HTTP ${statusCode}`;
      if (statusCode === 500) {
        if (typeof responseBody === 'object' && responseBody?.response?.message?.some?.((msg: string) => msg.includes('findMany'))) {
          errorMessage = "Erro interno no servidor Evolution API. O servidor pode estar com problemas de banco de dados. Verifique se o Evolution API está funcionando corretamente.";
        } else {
          errorMessage = "Erro interno no servidor Evolution API (HTTP 500). Verifique se o servidor Evolution está online e funcionando.";
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: responseBody,
          suggestion: statusCode === 500 ? "Tente reiniciar o servidor Evolution API ou verifique os logs do servidor." : undefined
        }),
        { 
          status: statusCode >= 500 ? 500 : 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

  } catch (error) {
    console.error("💥 [evolution-create-instance] Erro inesperado:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});