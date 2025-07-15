import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Usar service role para operações administrativas e bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const { analysisId, emailGestor } = await req.json();
    
    console.log('🎨 [creative-generator] Iniciando geração de criativos para análise:', analysisId);

    // Buscar dados da análise
    const { data: analise, error: fetchError } = await supabase
      .from('pdf_analysis')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (fetchError || !analise) {
      throw new Error('Análise não encontrada');
    }

    console.log('📋 [creative-generator] Dados da análise carregados:', analise.nome_oferta);

    // Criar sessão de geração
    const { data: sessao, error: sessionError } = await supabase
      .from('creative_generations')
      .insert({
        pdf_analysis_id: analysisId,
        email_gestor: emailGestor,
        total_criativos: 1,
        status: 'gerando',
        configuracao: {
          tipo: 'anuncio_completo',
          estilo: 'incongruencia_criativa'
        }
      })
      .select()
      .single();

    if (sessionError) {
      throw new Error(`Erro ao criar sessão: ${sessionError.message}`);
    }

    console.log('🚀 [creative-generator] Sessão criada, gerando 1 criativo completo...');

    // Gerar 1 criativo completo (anúncio com headline + imagem + copy)
    console.log('🎨 [creative-generator] Gerando criativo completo...');
    
    // 1. Primeiro gerar a imagem com incongruência criativa
    const promptImagem = `Crie uma imagem publicitária criativa e impactante para "${analise.nome_oferta}".
    
ESTILO REQUERIDO: Incongruência criativa - combine elementos inesperados que chamem atenção.

DETALHES DO PRODUTO:
- Oferta: ${analise.nome_oferta}
- Público-alvo: ${analise.publico_alvo}
- Proposta: ${analise.proposta_central}
- Tom: ${analise.tom_voz}

DIRETRIZES VISUAIS:
- Use elementos visuais surpreendentes e contrastantes
- Combine o produto/serviço com situações inesperadas
- Cores vibrantes e composição que para o scroll
- Foque na emoção e curiosidade, não apenas no produto
- Formato quadrado otimizado para feed de redes sociais

EXEMPLO DE INCONGRUÊNCIA: 
Se é um curso de vendas, mostre uma pessoa vendendo para aliens.
Se é um produto de beleza, mostre em cenário totalmente inesperado.
Seja criativo e surpreendente!`;

    const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: promptImagem,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        style: 'vivid'
      }),
    });

    const dalleData = await dalleResponse.json();
    
    if (!dalleData.data || !dalleData.data[0]) {
      throw new Error('Erro na geração da imagem pelo DALL-E');
    }
    
    const imageUrl = dalleData.data[0].url;
    console.log('✅ [creative-generator] Imagem com incongruência criativa gerada');

    // 2. Gerar o copy completo do anúncio
    const copyResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Você é um copywriter especialista em anúncios que convertem. 
            Crie copys agressivos, persuasivos e que param o scroll das pessoas.`
          },
          {
            role: 'user',
            content: `Crie um anúncio completo para "${analise.nome_oferta}".

DADOS DO PRODUTO:
- Oferta: ${analise.nome_oferta}
- Público: ${analise.publico_alvo}
- Proposta: ${analise.proposta_central}
- Benefícios: ${analise.beneficios?.join(', ') || 'N/A'}
- CTA: ${analise.cta}
- Tom: ${analise.tom_voz}

FORMATO EXIGIDO (responda EXATAMENTE neste formato JSON):
{
  "headline": "Headline principal super impactante (máx 80 caracteres)",
  "subheadline": "Subheadline explicativa que gera curiosidade (máx 120 caracteres)", 
  "copy": "Copy agressiva e persuasiva com 3-4 parágrafos curtos que convencem e geram urgência",
  "cta_final": "Call-to-action final irresistível"
}

REGRAS:
- Headline deve parar o scroll instantaneamente
- Copy deve ser agressiva, usar gatilhos mentais e gerar urgência
- Subheadline explica o benefício principal
- Use linguagem direta e persuasiva
- Foque na transformação e resultado
- RESPONDA APENAS O JSON, sem explicações`
          }
        ],
        temperature: 0.8,
      }),
    });

    const copyData = await copyResponse.json();
    let copyContent = copyData.choices[0].message.content;
    
    // Limpar markdown se houver
    copyContent = copyContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let anuncioCompleto;
    try {
      anuncioCompleto = JSON.parse(copyContent);
    } catch (error) {
      // Fallback se o JSON não vier formatado corretamente
      anuncioCompleto = {
        headline: analise.headline_principal || `Transforme Sua Vida Com ${analise.nome_oferta}`,
        subheadline: `Para ${analise.publico_alvo} que querem ${analise.proposta_central}`,
        copy: `${analise.proposta_central}\n\nBenefícios garantidos:\n${analise.beneficios?.join('\n') || ''}\n\nNão perca essa oportunidade!`,
        cta_final: analise.cta || 'QUERO COMEÇAR AGORA'
      };
    }

    console.log('✅ [creative-generator] Copy agressiva gerada');

    const criativoCompleto = {
      tipo: 'anuncio_completo',
      titulo: 'Anúncio Completo Gerado',
      imageUrl: imageUrl,
      headline: anuncioCompleto.headline,
      subheadline: anuncioCompleto.subheadline,
      copy: anuncioCompleto.copy,
      cta: anuncioCompleto.cta_final,
      prompt_imagem: promptImagem,
      estilo: 'incongruencia_criativa'
    };

    // Salvar criativo no banco
    const { data: criativosGerados, error: saveError } = await supabase
      .from('criativos_gerados')
      .insert({
        caminho_pdf: analise.caminho_arquivo,
        nome_arquivo_pdf: analise.nome_arquivo,
        email_gestor: emailGestor,
        email_cliente: 'mock@cliente.com', // Em produção seria do cliente real
        generation_id: sessao.id,
        criativos: [criativoCompleto],
        dados_extraidos: analise.dados_extraidos,
        status: 'concluido',
        custo_processamento: 0.15, // Custo reduzido para 1 criativo
        api_utilizada: 'DALL-E 3 + GPT-4o'
      })
      .select()
      .single();

    if (saveError) {
      throw new Error(`Erro ao salvar criativo: ${saveError.message}`);
    }

    // Atualizar sessão como concluída
    await supabase
      .from('creative_generations')
      .update({
        status: 'concluido',
        criativos_concluidos: 1,
        custo_total: 0.15,
        tempo_total: 15000 // 15 segundos
      })
      .eq('id', sessao.id);

    console.log('🎉 [creative-generator] Criativo completo gerado com sucesso!');

    return new Response(JSON.stringify({
      success: true,
      generationId: sessao.id,
      criativo: criativoCompleto,
      criativosId: criativosGerados.id,
      custo: 0.15,
      message: '1 criativo completo gerado com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ [creative-generator] Erro:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});