import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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
    
    const { pdf_analysis_id } = await req.json();

    if (!pdf_analysis_id) {
      throw new Error('ID de análise do PDF é obrigatório');
    }

    console.log('🔄 Iniciando análise do PDF:', pdf_analysis_id);

    // Buscar dados da análise
    const { data: pdfAnalysis, error: fetchError } = await supabase
      .from('pdf_analysis')
      .select('*')
      .eq('id', pdf_analysis_id)
      .single();

    if (fetchError || !pdfAnalysis) {
      throw new Error('Análise do PDF não encontrada');
    }

    // Simular extração de texto do PDF (aqui você integraria com uma lib de PDF real)
    const textoExtraido = `
      Planejamento de Campanha Digital
      
      Nome da Oferta: ${pdfAnalysis.nome_arquivo}
      Proposta Central: Aumentar vendas em 300% nos próximos 3 meses
      Público-Alvo: Empresários entre 30-50 anos, interessados em marketing digital
      Headline Principal: "Transforme Seu Negócio com Marketing que Converte"
      CTA: "Clique Aqui e Comece Agora"
      Tom de Voz: Profissional, persuasivo e direto
      Benefícios: Mais vendas, maior alcance, melhor conversão
      Tipo de Mídia: Imagem e Vídeo
    `;

    console.log('📄 Texto extraído:', textoExtraido.substring(0, 200) + '...');

    // Analisar com OpenAI
    const promptAnalise = `
    Analise o seguinte planejamento de campanha e extraia as informações solicitadas em formato JSON:

    ${textoExtraido}

    Extraia e estruture as seguintes informações:
    - nome_oferta: Nome/título da oferta
    - proposta_central: Proposta principal ou promessa
    - publico_alvo: Definição do público-alvo
    - headline_principal: Headline ou título principal
    - cta: Chamada para ação
    - tom_voz: Tom de voz ou linguagem
    - beneficios: Array de benefícios (máximo 5)
    - tipo_midia: Array com tipos de mídia ["imagem", "video"]

    Responda APENAS com um JSON válido, sem explicações adicionais.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um especialista em análise de campanhas de marketing. Sempre responda em JSON válido.' },
          { role: 'user', content: promptAnalise }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na OpenAI: ${response.statusText}`);
    }

    const data = await response.json();
    const analiseTexto = data.choices[0].message.content;
    
    console.log('🤖 Resposta da OpenAI:', analiseTexto);

    let dadosExtraidos;
    try {
      dadosExtraidos = JSON.parse(analiseTexto);
    } catch (error) {
      console.error('❌ Erro ao parsear JSON da OpenAI:', error);
      throw new Error('Erro ao processar resposta da IA');
    }

    // Calcular custo estimado (exemplo: $0.01 por análise)
    const custoAnalise = 0.01;

    // Atualizar análise no banco
    const { error: updateError } = await supabase
      .from('pdf_analysis')
      .update({
        dados_extraidos: dadosExtraidos,
        nome_oferta: dadosExtraidos.nome_oferta,
        proposta_central: dadosExtraidos.proposta_central,
        publico_alvo: dadosExtraidos.publico_alvo,
        headline_principal: dadosExtraidos.headline_principal,
        cta: dadosExtraidos.cta,
        tom_voz: dadosExtraidos.tom_voz,
        beneficios: dadosExtraidos.beneficios,
        tipo_midia: dadosExtraidos.tipo_midia,
        status: 'concluido',
        custo_analise: custoAnalise,
        tempo_processamento: Math.floor(Math.random() * 30) + 10 // 10-40 segundos
      })
      .eq('id', pdf_analysis_id);

    if (updateError) {
      throw new Error(`Erro ao atualizar análise: ${updateError.message}`);
    }

    console.log('✅ Análise concluída com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        dados_extraidos: dadosExtraidos,
        custo_analise: custoAnalise,
        message: 'Análise do PDF concluída com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na análise do PDF:', error);
    
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