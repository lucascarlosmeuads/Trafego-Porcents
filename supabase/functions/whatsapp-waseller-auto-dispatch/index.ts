import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

type WasellerConfig = {
  id: string
  enabled: boolean
  base_url: string
  endpoint_path: string
  campaign_id: string | null
  default_country_code: string
  min_lead_age_minutes: number
  max_per_minute: number
  target_statuses: string[] // ex.: ['pendente']
  require_null_vendedor: boolean
};

type LeadRecord = {
  id: string
  email_usuario: string | null
  telefone?: string | null
  status_negociacao?: string | null
  cliente_pago: boolean
  vendedor_responsavel?: string | null
  created_at: string
  contatado_whatsapp?: boolean | null
  respostas?: Record<string, unknown> | null
};

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

  // Remove leading zeros
  digits = digits.replace(/^0+/, "");

  // If already has country code at start, keep it
  if (countryDigits && digits.startsWith(countryDigits)) {
    return `+${digits}`;
  }

  // If missing country code, prepend
  if (countryDigits) {
    return `+${countryDigits}${digits}`;
  }

  // Fallback: add plus
  return `+${digits}`;
}

function extractName(respostas?: Record<string, unknown> | null): string | undefined {
  if (!respostas) return undefined;
  // Common keys that might contain the name
  const keys = ["nome", "name", "nome_completo"];
  for (const k of keys) {
    const v = respostas[k];
    if (typeof v === "string" && v.trim().length > 0) {
      return v.trim();
    }
  }
  return undefined;
}

function extractPhone(lead: LeadRecord): string | null {
  // Try dedicated phone field first
  const candidates: (string | null | undefined)[] = [
    lead.telefone,
    lead.respostas && (lead.respostas["whatsapp"] as string | undefined),
    lead.respostas && (lead.respostas["telefone"] as string | undefined),
    lead.respostas && (lead.respostas["celular"] as string | undefined),
    lead.respostas && (lead.respostas["phone"] as string | undefined),
  ];
  for (const c of candidates) {
    if (c && c.trim()) return c;
  }
  return null;
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

  // Cast safely
  return {
    id: data.id,
    enabled: data.enabled,
    base_url: data.base_url,
    endpoint_path: data.endpoint_path,
    campaign_id: data.campaign_id,
    default_country_code: data.default_country_code || "+55",
    min_lead_age_minutes: data.min_lead_age_minutes ?? 15,
    max_per_minute: data.max_per_minute ?? 2,
    target_statuses: Array.isArray(data.target_statuses) ? data.target_statuses : ["pendente"],
    require_null_vendedor: !!data.require_null_vendedor,
  } as WasellerConfig;
}

async function getEligibleLeads(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  cfg: WasellerConfig,
): Promise<LeadRecord[]> {
  const now = Date.now();
  const minAgeMs = (cfg.min_lead_age_minutes ?? 15) * 60_000;
  const createdBefore = new Date(now - minAgeMs).toISOString();

  // Build OR filters:
  // - status_negociacao is null OR in (target_statuses)
  const orStatusParts: string[] = ["status_negociacao.is.null"];
  if (cfg.target_statuses && cfg.target_statuses.length > 0) {
    const inList = cfg.target_statuses.map((s) => `"${s}"`).join(",");
    orStatusParts.push(`status_negociacao.in.(${inList})`);
  }
  const statusOr = orStatusParts.join(",");

  // - contatado_whatsapp is null or false
  const contactOr = "contatado_whatsapp.is.null,contatado_whatsapp.eq.false";

  let query = supabase
    .from("formularios_parceria")
    .select("id, email_usuario, telefone, status_negociacao, cliente_pago, vendedor_responsavel, created_at, contatado_whatsapp, respostas")
    .eq("cliente_pago", false)
    .or(statusOr)
    .or(contactOr)
    .lte("created_at", createdBefore)
    .order("created_at", { ascending: true });

  if (cfg.require_null_vendedor) {
    // Only if specified
    query = query.is("vendedor_responsavel", null);
  }

  const { data, error } = await query.limit(cfg.max_per_minute);

  if (error) {
    console.error("Error fetching eligible leads:", error);
    return [];
  }

  const leads = (data || []) as LeadRecord[];
  if (!leads.length) return [];

  // Exclude leads already successfully dispatched
  const ids = leads.map((l) => l.id);
  const { data: sentOk, error: logErr } = await supabase
    .from("waseller_dispatch_logs")
    .select("lead_id")
    .in("lead_id", ids)
    .eq("success", true);

  if (logErr) {
    console.warn("Warning: could not query logs for idempotency:", logErr);
    return leads;
  }

  const alreadySent = new Set((sentOk || []).map((r: any) => r.lead_id as string));
  const filtered = leads.filter((l) => !alreadySent.has(l.id));
  return filtered.slice(0, cfg.max_per_minute);
}

async function logDispatch(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  payload: {
    lead_id: string
    email?: string | null
    phone?: string | null
    status: string
    success: boolean
    error_message?: string | null
    request_payload: Record<string, unknown>
    response_body?: unknown
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
  });
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

async function dispatchLeadToWaseller(
  cfg: WasellerConfig,
  token: string,
  lead: LeadRecord
) {
  const name = extractName(lead.respostas) || undefined;
  const rawPhone = extractPhone(lead);
  const email = lead.email_usuario ?? undefined;

  if (!rawPhone) {
    return {
      ok: false,
      status: "skipped",
      error: "No phone found for lead",
      request: { email, name },
      response: null,
      normalizedPhone: null,
    };
  }

  const normalized = normalizePhone(rawPhone, cfg.default_country_code);
  if (!normalized) {
    return {
      ok: false,
      status: "skipped",
      error: "Phone normalization failed",
      request: { email, name, phone: rawPhone },
      response: null,
      normalizedPhone: null,
    };
  }

  // Payload flexível conforme docs; ajuste se necessário
  const payload: Record<string, unknown> = {
    phone: normalized,
    name,
    email,
  };
  if (cfg.campaign_id) {
    payload["campaign_id"] = cfg.campaign_id;
  }

  const url = `${cfg.base_url}${cfg.endpoint_path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  let respBody: unknown = null;
  let ok = false;
  let httpStatus = 0;
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
    return {
      ok: false,
      status: "failed",
      error: `Network error: ${e instanceof Error ? e.message : String(e)}`,
      request: payload,
      response: respBody,
      normalizedPhone: normalized,
    };
  }

  return {
    ok,
    status: ok ? "sent" : "failed",
    error: ok ? null : `HTTP ${httpStatus}`,
    request: payload,
    response: respBody,
    normalizedPhone: normalized,
  };
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Waseller auto-dispatch invoked at", new Date().toISOString());

  try {
    const token = Deno.env.get("WASELLER_API_TOKEN");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing WASELLER_API_TOKEN secret" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = getSupabaseAdmin();
    const cfg = await fetchConfig(supabase);

    if (!cfg || !cfg.enabled) {
      return new Response(JSON.stringify({ message: "Waseller dispatch disabled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const leads = await getEligibleLeads(supabase, cfg);
    console.log(`Eligible leads fetched: ${leads.length}`);

    let processed = 0;
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const lead of leads) {
      if (processed >= cfg.max_per_minute) break;
      processed += 1;

      const result = await dispatchLeadToWaseller(cfg, token, lead);

      await logDispatch(supabase, {
        lead_id: lead.id,
        email: lead.email_usuario,
        phone: result.normalizedPhone,
        status: result.status,
        success: result.ok,
        error_message: result.error,
        request_payload: (result.request ?? {}) as Record<string, unknown>,
        response_body: result.response,
      });

      if (result.ok) {
        sent += 1;
        await markLeadContacted(supabase, lead.id);
      } else if (result.status === "skipped") {
        skipped += 1;
      } else {
        failed += 1;
      }
    }

    const summary = { processed, sent, skipped, failed, max_per_minute: cfg.max_per_minute };
    console.log("Dispatch summary:", summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unhandled error on Waseller dispatch:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
