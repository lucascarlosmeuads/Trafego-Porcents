import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing Supabase credentials" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { emailCliente } = await req.json();
    if (!emailCliente) {
      return new Response(JSON.stringify({ success: false, error: "emailCliente é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Buscar briefing principal por email
    const { data: briefing, error: briefingError } = await supabase
      .from("briefings_cliente")
      .select("id, planejamento_estrategico, nome_produto, descricao_resumida, publico_alvo, diferencial, investimento_diario, comissao_aceita, observacoes_finais, nome_marca, resumo_conversa_vendedor")
      .eq("email_cliente", emailCliente)
      .maybeSingle();

    if (briefingError) console.log("[reformat-single-plan] briefingError:", briefingError);

    let existingContent: string | null = briefing?.planejamento_estrategico || null;
    let origem: "briefings_cliente" | "formularios_parceria" | null = briefing ? "briefings_cliente" : null;
    let origemId: string | null = briefing?.id ?? null;

    if (!existingContent) {
      const { data: form, error: formError } = await supabase
        .from("formularios_parceria")
        .select("id, planejamento_estrategico, respostas, tipo_negocio, produto_descricao, valor_medio_produto")
        .eq("email_usuario", emailCliente)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (formError) console.log("[reformat-single-plan] formError:", formError);
      if (form?.planejamento_estrategico) {
        existingContent = form.planejamento_estrategico as string;
        origem = "formularios_parceria";
        origemId = form.id as unknown as string;
      }
    }

    if (!existingContent) {
      return new Response(JSON.stringify({ success: false, error: "Nenhum planejamento encontrado para este cliente." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt({
      nome_marca: briefing?.nome_marca,
      nome_produto: briefing?.nome_produto,
      descricao_resumida: briefing?.descricao_resumida,
      publico_alvo: briefing?.publico_alvo,
      diferencial: briefing?.diferencial,
      investimento_diario: briefing?.investimento_diario,
      resumo_conversa_vendedor: briefing?.resumo_conversa_vendedor,
      planejamento_estrategico: existingContent,
    });

    const completionResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.2,
        messages: [
          { role: "system", content: "Você é um estrategista de marketing que reescreve planejamentos em Markdown claro, bonito e organizado." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!completionResp.ok) {
      const errText = await completionResp.text();
      console.error("[reformat-single-plan] OpenAI error:", errText);
      return new Response(JSON.stringify({ success: false, error: "Falha ao gerar formatação com a IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const completion = await completionResp.json();
    const formatted = completion?.choices?.[0]?.message?.content?.trim();

    if (!formatted) {
      return new Response(JSON.stringify({ success: false, error: "Resposta vazia da IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Atualizar na origem detectada (preferir briefings_cliente quando existir)
    if (origem === "briefings_cliente" && origemId) {
      const { error: upErr } = await supabase
        .from("briefings_cliente")
        .update({ planejamento_estrategico: formatted, updated_at: new Date().toISOString() })
        .eq("id", origemId);
      if (upErr) console.error("[reformat-single-plan] update briefing error:", upErr);
    } else if (origem === "formularios_parceria" && origemId) {
      const { error: upErr } = await supabase
        .from("formularios_parceria")
        .update({ planejamento_estrategico: formatted, updated_at: new Date().toISOString() })
        .eq("id", origemId);
      if (upErr) console.error("[reformat-single-plan] update form error:", upErr);
    }

    return new Response(JSON.stringify({ success: true, planejamento: formatted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[reformat-single-plan] Unexpected error:", e);
    return new Response(JSON.stringify({ success: false, error: e?.message || "Erro inesperado" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildPrompt(data: Record<string, unknown>) {
  const { nome_marca, nome_produto, descricao_resumida, publico_alvo, diferencial, investimento_diario, resumo_conversa_vendedor, planejamento_estrategico } = data as any;

  return `Reescreva e formate lindamente o planejamento estratégico abaixo em Markdown, seguindo esta estrutura:

# Planejamento Estratégico – ${nome_marca || nome_produto || "Marca/Produto"}

## Visão Geral
- Produto/Serviço: ${nome_produto || "n/d"}
- Público-alvo: ${publico_alvo || "n/d"}
- Diferenciais: ${diferencial || "n/d"}
- Investimento diário sugerido: ${investimento_diario || "n/d"}

## Objetivos de Marketing
(3–5 bullets claros)

## Estratégia de Aquisição
- Canais, funil, jornada resumida

## Criativos & Mensagens
- 2–4 variações com headline, subheadline e CTA

## Estrutura de Campanhas
- Campanhas, conjuntos, segmentações, orçamento

## KPIs & Métricas
- Principais indicadores e metas

## Próximos Passos
- Itens práticos para iniciar

---

Conteúdo original a ser reformatado:

${planejamento_estrategico}`;
}
