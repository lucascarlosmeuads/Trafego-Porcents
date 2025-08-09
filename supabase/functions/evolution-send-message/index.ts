import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

type EvolutionConfig = {
  id: string;
  enabled: boolean;
  server_url: string;
  instance_name: string;
  default_country_code: string;
  api_type: string;
};

type LeadRecord = {
  id: string;
  email_usuario: string | null;
  telefone?: string | null;
  status_negociacao?: string | null;
  cliente_pago: boolean;
  vendedor_responsavel?: string | null;
  created_at: string;
  contatado_whatsapp?: boolean | null;
  respostas?: Record<string, unknown> | null;
  tipo_negocio?: string | null;
};

const DEFAULT_RECOVERY_TEMPLATE =
  "Olá {{primeiro_nome}}! Tudo bem? Vi que você demonstrou interesse em melhorar suas vendas. Posso te enviar agora um plano rapidinho para você avaliar?";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceKey);
}

function toDigits(value?: string | null): string {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

function normalizePhoneEvolution(raw: string, defaultCountryCode: string): string | null {
  const countryDigits = toDigits(defaultCountryCode);
  let digits = toDigits(raw);
  if (!digits) return null;
  
  // Remove leading zeros
  digits = digits.replace(/^0+/, "");
  
  // For Evolution API, we need format without + (e.g., 5511999999999)
  if (countryDigits && digits.startsWith(countryDigits)) return digits;
  if (countryDigits) return `${countryDigits}${digits}`;
  return digits;
}

function extractName(respostas?: Record<string, unknown> | null): string | undefined {
  if (!respostas) return undefined;
  const candidates = [
    (respostas as any)?.dadosPersonais?.nome,
    (respostas as any)?.nome,
    (respostas as any)?.nome_completo,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return undefined;
}

function extractPhone(lead: LeadRecord): string | null {
  const r: any = lead.respostas || {};
  const candidates: (string | null | undefined)[] = [
    lead.telefone,
    r?.dadosPersonais?.whatsapp,
    r?.whatsapp,
    r?.telefone,
    r?.celular,
    r?.phone,
  ];
  for (const c of candidates) {
    if (c && c.trim()) return c;
  }
  return null;
}

function getFirstName(name?: string) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return parts[0] || "";
}

function translateTipoNegocio(tipo?: string | null) {
  if (!tipo) return "";
  if (tipo === "physical") return "físico";
  if (tipo === "digital") return "digital";
  if (tipo === "service") return "serviço";
  return tipo;
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyTemplate(template: string, vars: Record<string, string | undefined | null>) {
  let result = template || "";
  Object.entries(vars).forEach(([key, value]) => {
    const val = (value ?? "").toString();
    const re = new RegExp(`{{\\s*${escapeRegExp(key)}\\s*}}`, "gi");
    result = result.replace(re, val);
  });
  return result;
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
    console.error("Error loading evolution config:", error);
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

async function logDispatch(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  payload: {
    lead_id: string;
    phone?: string | null;
    recipient_name?: string | null;
    message_preview?: string | null;
    status: "sent" | "failed" | "skipped" | string;
    status_code?: number | null;
    error_message?: string | null;
    trigger_type?: "manual" | "auto" | string;
    requester_email?: string | null;
    request_payload?: Record<string, unknown>;
    response_body?: unknown;
    evolution_message_id?: string | null;
  }
) {
  const { error } = await supabase.from("waseller_dispatch_logs").insert({
    lead_id: payload.lead_id,
    phone: payload.phone ?? null,
    recipient_name: payload.recipient_name ?? null,
    message_preview: payload.message_preview ?? null,
    status: payload.status,
    status_code: payload.status_code ?? null,
    error_message: payload.error_message ?? null,
    trigger_type: payload.trigger_type ?? "manual",
    requester_email: payload.requester_email ?? null,
    request_payload: payload.request_payload ?? {},
    response_body: payload.response_body ?? null,
    waseller_message_id: payload.evolution_message_id ?? null,
  } as any);
  if (error) {
    console.error("Failed to insert evolution log:", error);
  }
}

async function markLeadContacted(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  leadId: string
) {
  const { error } = await supabase
    .from("formularios_parceria")
    .update({ contatado_whatsapp: true, updated_at: new Date().toISOString() })
    .eq("id", leadId);
  if (error) {
    console.warn("Failed to mark lead as contacted:", error);
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseAdmin();
    const apiKey = Deno.env.get("EVOLUTION_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing EVOLUTION_API_KEY secret" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cfg = await fetchEvolutionConfig(supabase);
    if (!cfg || !cfg.enabled) {
      return new Response(JSON.stringify({ error: "Evolution API dispatch disabled or not configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { leadId } = await req.json();
    if (!leadId || typeof leadId !== "string") {
      return new Response(JSON.stringify({ error: "leadId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Evolution API: Processing lead ${leadId}`);

    // Identify requesting user (for template ownership)
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");
    const { data: userRes, error: authErr } = await supabase.auth.getUser(jwt);
    const requesterEmail = authErr ? null : userRes?.user?.email ?? null;

    // Load lead
    const { data: lead, error: leadErr } = await supabase
      .from("formularios_parceria")
      .select("id,email_usuario,telefone,status_negociacao,cliente_pago,vendedor_responsavel,created_at,contatado_whatsapp,respostas,tipo_negocio")
      .eq("id", leadId)
      .maybeSingle();

    if (leadErr || !lead) {
      console.error("Evolution API: Lead not found:", leadErr);
      return new Response(JSON.stringify({ error: "Lead not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const typedLead = lead as unknown as LeadRecord;
    const rawPhone = extractPhone(typedLead);
    const name = extractName(typedLead.respostas) || undefined;

    if (!rawPhone) {
      await logDispatch(supabase, {
        lead_id: typedLead.id,
        phone: null,
        recipient_name: name ?? null,
        message_preview: null,
        status: "skipped",
        status_code: null,
        error_message: "No phone found for lead",
        requester_email: requesterEmail,
        request_payload: {},
      });
      return new Response(JSON.stringify({ error: "No phone found for lead" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalized = normalizePhoneEvolution(rawPhone, cfg.default_country_code);
    if (!normalized) {
      await logDispatch(supabase, {
        lead_id: typedLead.id,
        phone: rawPhone,
        recipient_name: name ?? null,
        status: "skipped",
        status_code: null,
        error_message: "Phone normalization failed",
        requester_email: requesterEmail,
        request_payload: {},
      });
      return new Response(JSON.stringify({ error: "Phone normalization failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load template for requester
    let template = DEFAULT_RECOVERY_TEMPLATE;
    if (requesterEmail) {
      const { data: tpl, error: tplErr } = await supabase
        .from("waseller_manual_templates" as any)
        .select("template_text")
        .eq("email_usuario", requesterEmail)
        .eq("context", "leads_parceria")
        .maybeSingle();
      if (!tplErr && tpl?.template_text && typeof (tpl as any).template_text === "string") {
        template = (tpl as any).template_text as string;
      }
    }

    const vars = {
      nome: name ?? "",
      primeiro_nome: getFirstName(name || ""),
      tipo_negocio: translateTipoNegocio(typedLead.tipo_negocio || ""),
    };
    const finalMessage = applyTemplate(template, vars);

    // Evolution API endpoint
    const evolutionUrl = `${cfg.server_url}/message/sendText/${cfg.instance_name}`;
    
    // Evolution API payload
    const evolutionPayload = {
      number: normalized,
      text: finalMessage,
      delay: 1200
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "apikey": apiKey,
    };

    console.log(`Evolution API: Sending to ${evolutionUrl} with payload:`, evolutionPayload);

    let respBody: unknown = null;
    let httpStatus = 0;
    let ok = false;
    let evolutionMessageId: string | null = null;

    try {
      const resp = await fetch(evolutionUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(evolutionPayload),
      });
      
      httpStatus = resp.status;
      const text = await resp.text();
      
      try {
        respBody = text ? JSON.parse(text) : null;
        // Extract message ID if available
        if (respBody && typeof respBody === 'object' && (respBody as any).key?.id) {
          evolutionMessageId = (respBody as any).key.id;
        }
      } catch {
        respBody = text || null;
      }
      
      ok = resp.ok;
      
      console.log(`Evolution API: Response status ${httpStatus}, ok: ${ok}`, respBody);

    } catch (e) {
      console.error("Evolution API: Network error:", e);
      await logDispatch(supabase, {
        lead_id: typedLead.id,
        phone: normalized,
        recipient_name: name ?? null,
        message_preview: finalMessage.slice(0, 200),
        status: "failed",
        status_code: null,
        error_message: `Network error: ${e instanceof Error ? e.message : String(e)}`,
        requester_email: requesterEmail,
        request_payload: evolutionPayload,
        response_body: null,
      });
      return new Response(
        JSON.stringify({ success: false, status: "failed", error: "Network error", details: String(e) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await logDispatch(supabase, {
      lead_id: typedLead.id,
      phone: normalized,
      recipient_name: name ?? null,
      message_preview: finalMessage.slice(0, 200),
      status: ok ? "sent" : "failed",
      status_code: httpStatus,
      error_message: ok ? null : `HTTP ${httpStatus}`,
      requester_email: requesterEmail,
      request_payload: evolutionPayload,
      response_body: respBody,
      evolution_message_id: evolutionMessageId,
    });

    if (ok) {
      await markLeadContacted(supabase, typedLead.id);
      console.log(`Evolution API: Message sent successfully to ${normalized}`);
      return new Response(JSON.stringify({ success: true, status: "sent", messageId: evolutionMessageId }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.error(`Evolution API: Failed to send message. Status: ${httpStatus}`, respBody);
    return new Response(
      JSON.stringify({ success: false, status: "failed", httpStatus, response: respBody }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Evolution API: Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});