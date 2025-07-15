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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
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
        total_criativos: 6,
        status: 'gerando',
        configuracao: {
          imagens: 3,
          videos: 3,
          estilo: 'moderno'
        }
      })
      .select()
      .single();

    if (sessionError) {
      throw new Error(`Erro ao criar sessão: ${sessionError.message}`);
    }

    console.log('🚀 [creative-generator] Sessão criada, gerando criativos...');

    const criativos = [];

    // Gerar 3 criativos de imagem com DALL-E
    for (let i = 1; i <= 3; i++) {
      console.log(`🖼️ [creative-generator] Gerando imagem ${i}/3...`);
      
      const promptImagem = `Crie uma imagem promocional moderna e impactante para "${analise.nome_oferta}". 
      Público-alvo: ${analise.publico_alvo}. 
      Proposta: ${analise.proposta_central}. 
      Tom: ${analise.tom_voz}. 
      Estilo: design moderno, cores vibrantes, alta qualidade, formato quadrado para redes sociais.
      Variação ${i}: ${i === 1 ? 'foco no produto' : i === 2 ? 'foco nos benefícios' : 'foco na transformação'}`;

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
      const imageUrl = dalleData.data[0].url;

      console.log(`✅ [creative-generator] Imagem ${i} gerada:`, imageUrl);

      criativos.push({
        tipo: 'imagem',
        titulo: `Criativo Imagem ${i}`,
        url: imageUrl,
        prompt: promptImagem,
        variacao: i === 1 ? 'produto' : i === 2 ? 'beneficios' : 'transformacao'
      });
    }

    // Gerar 3 criativos de vídeo (scripts)
    for (let i = 1; i <= 3; i++) {
      console.log(`🎬 [creative-generator] Gerando script de vídeo ${i}/3...`);
      
      const scriptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: `Você é um roteirista especializado em vídeos promocionais para redes sociais. 
              Crie scripts de 30-60 segundos que convertem vendas.`
            },
            {
              role: 'user',
              content: `Crie um script de vídeo promocional para "${analise.nome_oferta}".
              Público: ${analise.publico_alvo}
              Proposta: ${analise.proposta_central}
              CTA: ${analise.cta}
              Tom: ${analise.tom_voz}
              
              Variação ${i}: ${i === 1 ? 'hook emocional' : i === 2 ? 'demonstração de benefícios' : 'storytelling com transformação'}
              
              Formato: Título do vídeo + Script detalhado com indicações visuais`
            }
          ],
          temperature: 0.7,
        }),
      });

      const scriptData = await scriptResponse.json();
      const script = scriptData.choices[0].message.content;

      console.log(`✅ [creative-generator] Script ${i} gerado`);

      criativos.push({
        tipo: 'video',
        titulo: `Script Vídeo ${i}`,
        conteudo: script,
        duracao: 45,
        variacao: i === 1 ? 'emocional' : i === 2 ? 'beneficios' : 'storytelling'
      });
    }

    // Salvar criativos no banco
    const { data: criativosGerados, error: saveError } = await supabase
      .from('criativos_gerados')
      .insert({
        caminho_pdf: analise.caminho_arquivo,
        nome_arquivo_pdf: analise.nome_arquivo,
        email_gestor: emailGestor,
        email_cliente: 'mock@cliente.com', // Em produção seria do cliente real
        generation_id: sessao.id,
        criativos: criativos,
        dados_extraidos: analise.dados_extraidos,
        status: 'concluido',
        custo_processamento: 2.50,
        api_utilizada: 'DALL-E 3 + GPT-4'
      })
      .select()
      .single();

    if (saveError) {
      throw new Error(`Erro ao salvar criativos: ${saveError.message}`);
    }

    // Atualizar sessão como concluída
    await supabase
      .from('creative_generations')
      .update({
        status: 'concluido',
        criativos_concluidos: 6,
        custo_total: 2.50,
        tempo_total: 45000 // 45 segundos
      })
      .eq('id', sessao.id);

    console.log('🎉 [creative-generator] Geração concluída com sucesso!');

    return new Response(JSON.stringify({
      success: true,
      generationId: sessao.id,
      criativos: criativos,
      criativosId: criativosGerados.id,
      custo: 2.50,
      message: '6 criativos gerados com sucesso'
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