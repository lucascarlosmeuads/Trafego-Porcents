
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

type WasellerConfig = {
  id: string;
  enabled: boolean;
  base_url: string;
  endpoint_path: string;
  campaign_id: string | null;
  default_country_code: string;
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

function normalizePhone(raw: string, defaultCountryCode: string): string | null {
  const countryDigits = toDigits(defaultCountryCode);
  let digits = toDigits(raw);
  if (!digits) return null;
  digits = digits.replace(/^0+/, "");
  if (countryDigits && digits.startsWith(countryDigits)) return `+${digits}`;
  if (countryDigits) return `+${countryDigits}${digits}`;
  return `+${digits}`;
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

async function fetchConfig(supabase: ReturnType<typeof getSupabaseAdmin>): Promise<WasellerConfig | null> {
  const { data, error } = await supabase
    .from("waseller_dispatch_config")
    .select("*")
    .eq("enabled", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error loading waseller_dispatch_config:", error);
    return null;
  }
  if (!data) return null;

  return {
    id: (data as any).id,
    enabled: (data as any).enabled,
    base_url: (data as any).base_url,
    endpoint_path: (data as any).endpoint_path,
    campaign_id: (data as any).campaign_id ?? null,
    default_country_code: (data as any).default_country_code || "+55",
  };
}

async function logDispatch(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  payload: {
    lead_id: string;
    email?: string | null;
    phone?: string | null;
    status: string;
    success: boolean;
    error_message?: string | null;
    request_payload: Record<string, unknown>;
    response_body?: unknown;
  }
) {
  const { error } = await supabase.from("waseller_dispatch_logs").insert({
    lead_id: payload.lead_id,
    email: payload.email ?? null,
    phone: payload.phone ?? null,
    status: payload.status,
    success: payload.success,
    attempts: 1,
    error_message: payload.error_message ?? null,
    request_payload: payload.request_payload,
    response_body: payload.response_body ?? null,
  } as any);
  if (error) {
    console.error("Failed to insert waseller log:", error);
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
    const token = Deno.env.get("WASELLER_API_TOKEN");
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing WASELLER_API_TOKEN secret" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cfg = await fetchConfig(supabase);
    if (!cfg || !(cfg as any).enabled) {
      return new Response(JSON.stringify({ error: "Waseller dispatch disabled or not configured" }), {
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
      return new Response(JSON.stringify({ error: "Lead not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const typedLead = lead as unknown as LeadRecord;
    const rawPhone = extractPhone(typedLead);
    const email = typedLead.email_usuario ?? undefined;
    const name = extractName(typedLead.respostas) || undefined;

    if (!rawPhone) {
      await logDispatch(supabase, {
        lead_id: typedLead.id,
        email,
        phone: null,
        status: "skipped",
        success: false,
        error_message: "No phone found for lead",
        request_payload: {},
      });
      return new Response(JSON.stringify({ error: "No phone found for lead" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalized = normalizePhone(rawPhone, cfg.default_country_code);
    if (!normalized) {
      await logDispatch(supabase, {
        lead_id: typedLead.id,
        email,
        phone: rawPhone,
        status: "skipped",
        success: false,
        error_message: "Phone normalization failed",
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

    const payload: Record<string, unknown> = {
      phone: normalized,
      name,
      email,
      message: finalMessage,
    };
    if (cfg.campaign_id) payload["campaign_id"] = cfg.campaign_id;

    const url = `${cfg.base_url}${cfg.endpoint_path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };

    let respBody: unknown = null;
    let httpStatus = 0;
    let ok = false;

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      httpStatus = resp.status;
      const text = await resp.text();
      try {
        respBody = text ? JSON.parse(text) : null;
      } catch {
        respBody = text || null;
      }
      ok = resp.ok;
    } catch (e) {
      await logDispatch(supabase, {
        lead_id: typedLead.id,
        email,
        phone: normalized,
        status: "failed",
        success: false,
        error_message: `Network error: ${e instanceof Error ? e.message : String(e)}`,
        request_payload: payload,
        response_body: null,
      });
      return new Response(
        JSON.stringify({ success: false, status: "failed", error: "Network error", details: String(e) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await logDispatch(supabase, {
      lead_id: typedLead.id,
      email,
      phone: normalized,
      status: ok ? "sent" : "failed",
      success: ok,
      error_message: ok ? null : `HTTP ${httpStatus}`,
      request_payload: payload,
      response_body: respBody,
    });

    if (ok) {
      await markLeadContacted(supabase, typedLead.id);
      return new Response(JSON.stringify({ success: true, status: "sent" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: false, status: "failed", httpStatus, response: respBody }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unhandled error on waseller-send-message:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
