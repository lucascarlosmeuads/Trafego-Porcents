// deno-lint-ignore-file no-explicit-any
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!OPENAI_API_KEY) {
  console.warn('[generate-gamified-funnel] OPENAI_API_KEY não configurada');
}

// Transcreve um áudio a partir de uma URL usando o OpenAI Whisper
async function transcribeAudioFromUrl(audioUrl: string): Promise<string | null> {
  try {
    if (!audioUrl) return null;
    const res = await fetch(audioUrl);
    if (!res.ok) {
      console.warn('[generate-gamified-funnel] Falha ao baixar áudio para transcrição:', audioUrl, res.status);
      return null;
    }

    const contentType = res.headers.get('content-type') || 'audio/mpeg';
    const arrayBuffer = await res.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: contentType });

    const form = new FormData();
    const ext = (contentType.split('/')[1] || 'mp3').split(';')[0];
    form.append('file', blob, `visao-futuro.${ext}`);
    form.append('model', 'whisper-1');
    form.append('language', 'pt');

    const whisper = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });

    if (!whisper.ok) {
      const txt = await whisper.text();
      console.error('[generate-gamified-funnel] Erro na transcrição OpenAI:', txt);
      return null;
    }

    const json = await whisper.json();
    const text = json?.text as string | undefined;
    return text?.trim() ? text.trim() : null;
  } catch (e) {
    console.error('[generate-gamified-funnel] Exceção na transcrição:', e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId } = await req.json();
    if (!leadId) {
      return new Response(JSON.stringify({ success: false, error: 'leadId é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Buscar dados do lead
    const { data: lead, error: leadError } = await supabase
      .from('formularios_parceria')
      .select('id, email_usuario, respostas, tipo_negocio, audio_visao_futuro, visao_futuro_texto, planejamento_estrategico, created_at')
      .eq('id', leadId)
      .maybeSingle();

    if (leadError || !lead) {
      console.error('[generate-gamified-funnel] Lead não encontrado:', leadError);
      return new Response(JSON.stringify({ success: false, error: 'Lead não encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

// Extrair informações do cliente
const respostas = (lead as any).respostas || {};
const dados = respostas.dadosPersonais || respostas || {};
const nome = dados.nome || respostas.nome || 'Cliente';
const email = (lead as any).email_usuario || dados.email || 'Não informado';
const whatsapp = dados.whatsapp || dados.telefone || respostas.telefone || 'Não informado';
const tipoNegocio = (lead as any).tipo_negocio || respostas.tipo_negocio || 'não informado';
const valorMedio = respostas.valorMedioProduto || respostas.valor_medio_produto || 'não informado';
const jaTeveVendas = respostas.jaTeveVendas ?? respostas.ja_teve_vendas ?? 'não informado';
const visaoFuturoTexto = (lead as any).visao_futuro_texto || respostas.visaoFuturo?.texto || '';
const audioVisaoFuturo = (lead as any).audio_visao_futuro || respostas.visaoFuturo?.audio || '';

let visaoFuturoTextoFinal = visaoFuturoTexto || '';

if (audioVisaoFuturo) {
  console.log('[generate-gamified-funnel] Áudio detectado para visão de futuro. Iniciando transcrição...');
  const transcricao = await transcribeAudioFromUrl(audioVisaoFuturo);
  if (transcricao) {
    visaoFuturoTextoFinal = visaoFuturoTextoFinal
      ? `${visaoFuturoTextoFinal}\n\n[Transcrição do áudio]\n${transcricao}`
      : transcricao;

    // Tentar salvar a transcrição no lead (best-effort)
    try {
      const { error: vfErr } = await supabase
        .from('formularios_parceria')
        .update({ visao_futuro_texto: visaoFuturoTextoFinal, updated_at: new Date().toISOString() })
        .eq('id', leadId);
      if (vfErr) {
        console.warn('[generate-gamified-funnel] Falha ao salvar transcrição (não crítico):', vfErr);
      }
    } catch (e) {
      console.warn('[generate-gamified-funnel] Exceção ao salvar transcrição (não crítico):', e);
    }
  } else {
    console.warn('[generate-gamified-funnel] Transcrição não obtida, seguindo sem ela.');
  }
}

const informacoesCliente = `
Nome: ${nome}
Email: ${email}
WhatsApp: ${whatsapp}
Tipo de Negócio: ${tipoNegocio}
Valor Médio do Produto/Serviço: ${valorMedio}
Já Teve Vendas: ${jaTeveVendas}
Data do Lead: ${lead.created_at}
Visão de Futuro (texto): ${visaoFuturoTextoFinal || '—'}
Visão de Futuro (áudio/link): ${audioVisaoFuturo || '—'}
`;

    const tituloDocumento = `Consultoria Estratégica - Funil Interativo - ${nome}`;

    const userPrompt = `Você é um estrategista especializado em funis interativos para o mercado brasileiro (produtos físicos, serviços locais, infoprodutos, consultorias, SaaS e autônomos). Sua missão é criar um FUNIL INTERATIVO prático e altamente conversivo, com linguagem emocional e gatilhos mentais adequados à cultura brasileira.

Siga EXATAMENTE esta estrutura em Markdown, com títulos e subtítulos muito bem organizados e espaçamentos claros:

1) TÍTULO PRINCIPAL (H1)
# Consultoria Estratégica – Funil Interativo – ${nome}

2) OBJETIVO DO FUNIL (H2)
Explique claramente o foco do funil: gerar muitos leads qualificados, conduzir o cliente a perceber conscientemente que está caminhando para uma compra, e – quando fizer sentido – vender um produto de entrada (ticket menor) para depois realizar um upsell para um produto de maior valor.

3) CONCEITO E ESTRATÉGIA DO FUNIL INTERATIVO (H2)
Descreva a lógica central do funil como uma jornada/diagnóstico interativo personalizado. Foque em gerar curiosidade, comprometimento progressivo e percepção de valor.

4) ESTRUTURA DO FUNIL – ETAPA POR ETAPA (H2)
- Anúncio (copy e ideia visual)
- Página de entrada (mensagem e sugestão visual)
- Etapas interativas (com lógica condicional quando necessário)
- Tela de resultado (recompensa, urgência ou revelação personalizada)
- Redirecionamento (WhatsApp, checkout, Calendly etc.)

5) COPYS PRONTAS (H2)
- Anúncio para redes sociais (Facebook/Instagram)
- Página (mensagem inicial e CTA)
- WhatsApp (mensagem de entrada automatizada)

6) INSTRUÇÕES DE TRÁFEGO (H2)
- Sugestão de investimento diário
- Público-alvo sugerido
- Objetivo da campanha no Gerenciador de Anúncios

7) MÉTRICAS ESPERADAS (H2)
- CTR médio
- Custo por lead estimado
- Conversão ideal da página

8) PLANEJAMENTO DE CUSTOS (H2)
Sempre incluir um custo fixo total de R$ 1.500, sendo:
- R$ 500 para baterias de criativos (vídeo e imagem)
- R$ 800 para montagem do funil
- R$ 200 para configuração da Business Manager e trackeamento
TOTAL: R$ 1.500 (SEM MENSALIDADE)

---

INFORMAÇÕES DO CLIENTE (H2)
${informacoesCliente}`;

    // Chamada OpenAI
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `Responda sempre em português (Brasil). Seja estratégico, direto e prático.

DIRETRIZES OBRIGATÓRIAS:
- NUNCA use a palavra "quiz"; utilize SEMPRE "funil interativo"
- Não liste tecnologias ou ferramentas específicas; nós cuidaremos disso internamente
- Use linguagem estratégica, direta e prática. Sem promessas milagrosas
- Considere a realidade brasileira atual
- Ao final do documento, inclua obrigatoriamente a frase: "Sem mensalidade fixa; trabalhamos por % sobre vendas."

Estas diretrizes são instruções internas para você seguir, NÃO devem aparecer no documento final.`
          },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    const completionJson = await completion.json();
    const planejamento = completionJson?.choices?.[0]?.message?.content as string;

    if (!planejamento) {
      console.error('[generate-gamified-funnel] Falha ao obter resposta do modelo:', completionJson);
      return new Response(JSON.stringify({ success: false, error: 'Falha ao gerar planejamento' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Atualizar lead com planejamento e status
    const { error: updateError } = await supabase
      .from('formularios_parceria')
      .update({ planejamento_estrategico: planejamento, status_negociacao: 'planejamento_entregue', updated_at: new Date().toISOString() })
      .eq('id', leadId);

    if (updateError) {
      console.warn('[generate-gamified-funnel] Erro ao atualizar lead (não crítico):', updateError);
    }

    return new Response(JSON.stringify({ success: true, planejamento }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[generate-gamified-funnel] Erro geral:', error);
    return new Response(JSON.stringify({ success: false, error: error?.message || 'Erro interno' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});