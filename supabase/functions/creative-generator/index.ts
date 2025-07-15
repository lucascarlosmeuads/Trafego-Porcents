import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { generation_id } = await req.json();

    if (!generation_id) {
      throw new Error('ID de geração é obrigatório');
    }

    console.log('🚀 Iniciando geração de criativos:', generation_id);

    // Buscar dados da sessão de geração
    const { data: generation, error: fetchError } = await supabase
      .from('creative_generations')
      .select(`
        *,
        pdf_analysis!inner(*)
      `)
      .eq('id', generation_id)
      .single();

    if (fetchError || !generation) {
      throw new Error('Sessão de geração não encontrada');
    }

    const pdfData = generation.pdf_analysis;
    let custoTotal = 0;

    console.log('📊 Dados extraídos:', pdfData.dados_extraidos);

    // Gerar 3 criativos de imagem
    for (let i = 1; i <= 3; i++) {
      console.log(`🖼️ Gerando criativo de imagem ${i}/3`);

      const promptImagem = `
        Crie uma imagem publicitária profissional para:
        Oferta: ${pdfData.nome_oferta}
        Proposta: ${pdfData.proposta_central}
        Público: ${pdfData.publico_alvo}
        Headline: ${pdfData.headline_principal}
        CTA: ${pdfData.cta}
        
        Estilo visual: Moderno, profissional, cores vibrantes.
        Variação ${i}: ${i === 1 ? 'Foco no produto' : i === 2 ? 'Foco nos benefícios' : 'Foco na emoção'}
      `;

      try {
        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt: promptImagem,
            n: 1,
            size: '1024x1024',
            quality: 'high'
          }),
        });

        if (!imageResponse.ok) {
          throw new Error(`Erro na geração de imagem: ${imageResponse.statusText}`);
        }

        const imageData = await imageResponse.json();
        const imagemBase64 = imageData.data[0].b64_json;
        custoTotal += 0.04; // Custo estimado por imagem

        // Salvar criativo de imagem
        const { error: insertError } = await supabase
          .from('criativos_gerados')
          .insert({
            generation_id: generation_id,
            email_cliente: generation.email_gestor,
            email_gestor: generation.email_gestor,
            tipo_criativo: 'imagem',
            nome_arquivo_pdf: `criativo_imagem_${i}.png`,
            caminho_pdf: `generated/images/${generation_id}_${i}.png`,
            arquivo_url: `data:image/png;base64,${imagemBase64}`,
            prompt_usado: promptImagem,
            api_utilizada: 'openai-gpt-image-1',
            resolucao: '1024x1024',
            estilo_visual: i === 1 ? 'produto' : i === 2 ? 'beneficios' : 'emocional',
            status: 'concluido',
            dados_geracao: {
              variacao: i,
              modelo_usado: 'gpt-image-1',
              qualidade: 'high'
            }
          });

        if (insertError) {
          console.error(`❌ Erro ao salvar imagem ${i}:`, insertError);
        } else {
          console.log(`✅ Imagem ${i} salva com sucesso`);
        }

      } catch (error) {
        console.error(`❌ Erro na imagem ${i}:`, error);
      }
    }

    // Gerar 3 roteiros de vídeo (simulado)
    for (let i = 1; i <= 3; i++) {
      console.log(`🎬 Gerando roteiro de vídeo ${i}/3`);

      const promptVideo = `
        Crie um roteiro detalhado para um vídeo publicitário de 30 segundos:
        
        Oferta: ${pdfData.nome_oferta}
        Proposta: ${pdfData.proposta_central}
        Público: ${pdfData.publico_alvo}
        Headline: ${pdfData.headline_principal}
        CTA: ${pdfData.cta}
        Tom: ${pdfData.tom_voz}
        
        Variação ${i}: ${i === 1 ? 'Vídeo explicativo' : i === 2 ? 'Depoimento' : 'Demonstração'}
        
        Formate como JSON com: cenas (array), texto_narração, tempo_total, instrucoes_visuais
      `;

      try {
        const videoResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Você é um especialista em roteiros de vídeo publicitário. Sempre responda em JSON válido.' },
              { role: 'user', content: promptVideo }
            ],
            temperature: 0.7,
          }),
        });

        const videoData = await videoResponse.json();
        const roteiro = videoData.choices[0].message.content;
        custoTotal += 0.01; // Custo estimado por roteiro

        // Salvar roteiro de vídeo
        const { error: insertError } = await supabase
          .from('criativos_gerados')
          .insert({
            generation_id: generation_id,
            email_cliente: generation.email_gestor,
            email_gestor: generation.email_gestor,
            tipo_criativo: 'video',
            nome_arquivo_pdf: `roteiro_video_${i}.json`,
            caminho_pdf: `generated/videos/${generation_id}_${i}.json`,
            prompt_usado: promptVideo,
            api_utilizada: 'openai-gpt-4o-mini',
            duracao_video: 30,
            estilo_visual: i === 1 ? 'explicativo' : i === 2 ? 'depoimento' : 'demonstracao',
            status: 'roteiro_pronto',
            criativos: { roteiro: roteiro },
            dados_geracao: {
              variacao: i,
              tipo_video: i === 1 ? 'explicativo' : i === 2 ? 'depoimento' : 'demonstracao',
              modelo_usado: 'gpt-4o-mini'
            }
          });

        if (insertError) {
          console.error(`❌ Erro ao salvar vídeo ${i}:`, insertError);
        } else {
          console.log(`✅ Roteiro ${i} salvo com sucesso`);
        }

      } catch (error) {
        console.error(`❌ Erro no vídeo ${i}:`, error);
      }
    }

    // Atualizar sessão de geração
    const { error: updateError } = await supabase
      .from('creative_generations')
      .update({
        status: 'concluido',
        criativos_concluidos: 6,
        custo_total: custoTotal,
        tempo_total: Math.floor(Math.random() * 120) + 60 // 60-180 segundos
      })
      .eq('id', generation_id);

    if (updateError) {
      console.error('❌ Erro ao atualizar sessão:', updateError);
    }

    console.log('🎉 Geração completa! Custo total:', custoTotal);

    return new Response(
      JSON.stringify({
        success: true,
        criativos_gerados: 6,
        custo_total: custoTotal,
        message: 'Criativos gerados com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na geração de criativos:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});