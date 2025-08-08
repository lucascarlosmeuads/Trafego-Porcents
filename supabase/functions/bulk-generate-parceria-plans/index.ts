import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const { size }: { size?: number } = await req.json().catch(() => ({ }));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar leads de parceria sem planejamento ainda e elegíveis (compraram)
    let query = supabase
      .from('formularios_parceria')
      .select('*')
      .is('planejamento_estrategico', null)
      .in('status_negociacao', ['comprou','planejando','planejamento_entregue','upsell_pago'])
      .order('created_at', { ascending: true });

    if (size && size > 0) {
      query = query.limit(size);
    }

    const { data: leads, error: fetchError } = await query;
    if (fetchError) throw fetchError;

    const detalhes: any[] = [];
    let processados = 0;
    let gerados = 0;
    let marcadosInsuficiente = 0;

    for (const lead of leads || []) {
      processados++;

      const visaoTexto = (lead.visao_futuro_texto || '').toString().trim();
      const temAudio = !!lead.audio_visao_futuro;
      const infoSuficiente = (visaoTexto.length >= 40) || temAudio; // regra simples

      if (!infoSuficiente) {
        // Marcar como precisa mais info
        const { error: updErr } = await supabase
          .from('formularios_parceria')
          .update({ precisa_mais_info: true })
          .eq('id', lead.id);
        if (updErr) {
          detalhes.push({ id: lead.id, email: lead.email_usuario, status: 'erro_marcar', erro: updErr.message });
        } else {
          marcadosInsuficiente++;
          detalhes.push({ id: lead.id, email: lead.email_usuario, status: 'precisa_mais_info' });
        }
        continue;
      }

      // Montar prompt baseado nas respostas do lead
      const prompt = buildPromptFromLead(lead);

      // Chamada OpenAI
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'Você é um estrategista de marketing da Tráfego Porcents. Gere um planejamento estratégico completo em Markdown, totalmente personalizado com base nos dados do lead.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!resp.ok) {
        detalhes.push({ id: lead.id, email: lead.email_usuario, status: 'erro_openai', code: resp.status });
        continue;
      }

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || '';

      // Gravar no lead
      const { error: saveErr } = await supabase
        .from('formularios_parceria')
        .update({ planejamento_estrategico: content, precisa_mais_info: false })
        .eq('id', lead.id);

      if (saveErr) {
        detalhes.push({ id: lead.id, email: lead.email_usuario, status: 'erro_salvar', erro: saveErr.message });
      } else {
        gerados++;
        detalhes.push({ id: lead.id, email: lead.email_usuario, status: 'gerado' });
      }

      // Pausa leve pra evitar rate limit
      await new Promise((r) => setTimeout(r, 400));
    }

    return new Response(JSON.stringify({
      success: true,
      processados,
      gerados,
      marcadosInsuficiente,
      restantes: ((leads || []).length - gerados - marcadosInsuficiente),
      detalhes,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('bulk-generate-parceria-plans error:', e);
    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

function buildPromptFromLead(lead: any) {
  const r = lead.respostas || {};
  const nome = r?.dadosPersonais?.nome || r.nome || 'Cliente';
  const produto = lead.produto_descricao || r.produto || 'Produto/Serviço';
  const tipo = lead.tipo_negocio || r.tipo_negocio || 'não informado';
  const visao = (lead.visao_futuro_texto || '').toString();
  const teveVendas = lead.ja_teve_vendas ? 'Sim' : 'Não';
  const valorMedio = lead.valor_medio_produto ? `R$ ${lead.valor_medio_produto}` : 'Não informado';

  return `Crie um planejamento estratégico completo em Markdown, personalizado para o cliente ${nome}.
Dados principais:
- Tipo de negócio: ${tipo}
- Produto/Serviço: ${produto}
- Já teve vendas antes? ${teveVendas}
- Ticket/valor médio: ${valorMedio}
- Visão de futuro (texto): \n${visao}\n
Estrutura esperada:
1) Introdução personalizada ao cliente e ao produto
2) Público-alvo, subgrupos, dores e desejos (bem específicos)
3) Propostas de criativos (3 variações) com: Headline (30-40 chars), Conceito Visual (<=80 chars), Descrição persuasiva (<=150 chars) e CTA
4) Estratégia de campanha (segmentação, orçamento, canais, cronograma)
5) Métricas e próximos passos (KPIs e rotina de otimização)
Use linguagem clara, prática e orientada à execução.`;
}
