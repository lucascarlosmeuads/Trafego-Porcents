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
        temperature: 0.1,
        messages: [
          { role: "system", content: "Você formata planejamentos em Markdown sem alterar conteúdo. Regras: 1) NUNCA reduzir, resumir, cortar ou substituir números/valores; 2) Não criar novas seções; 3) Apenas organizar títulos (H1/H2/H3), listas e espaçamento; 4) Converter marcadores (•, –, —, ·) em '- ' alinhados; 5) Tom pessoal em primeira pessoa do plural, propositivo (Lucas), sem tom didático. Responda somente com o Markdown final." },
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

  return `REGRAS DE FORMATAÇÃO (NÃO ALTERE O CONTEÚDO):
- Não reduzir, resumir ou remover nada do texto. Mantenha cada frase, parágrafo, número, valor, prazo e porcentagem exatamente como estão.
- Não adicionar novas seções nem mudar a ordem. Apenas organize visualmente.
- Ajustes permitidos: 
  1) Hierarquia de títulos: aplique # H1 para o título principal, ## H2 para seções, ### H3 para subseções (quando fizer sentido).
  2) Listas: converta marcadores soltos como •, –, —, · em "- " e alinhe corretamente (list-outside).
  3) Espaçamento: padronize quebras de linha e insira linhas em branco apenas para melhorar a leitura, sem apagar conteúdo.
  4) Tabelas ou blocos de citação: mantenha o conteúdo, apenas formate em Markdown se já estiver indicado.
- Tom de voz: primeira pessoa do plural e pessoal/propositivo, assinatura e autoria de Lucas (sem parecer tutorial ou "como fazer"). Evite tom didático; escreva como proposta já decidida.

Metadados para contexto (não reescrever, só usar para título se couber):
- Marca/Produto: ${nome_marca || nome_produto || "n/d"}
- Descrição: ${descricao_resumida || "n/d"}
- Público-alvo: ${publico_alvo || "n/d"}
- Diferenciais: ${diferencial || "n/d"}
- Investimento diário: ${investimento_diario || "n/d"}
- Observações do vendedor: ${resumo_conversa_vendedor || "n/d"}

Agora, reentregue o conteúdo abaixo, apenas FORMATADO em Markdown dentro dessas regras. Retorne somente o Markdown final.
---
${planejamento_estrategico}`;
}
