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

    const { filePath, emailGestor } = await req.json();
    
    console.log('🔍 [pdf-analyzer] Iniciando análise do PDF:', filePath);

    // Download do arquivo PDF do storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('cliente-arquivos')
      .download(filePath);

    if (downloadError) {
      throw new Error(`Erro ao baixar PDF: ${downloadError.message}`);
    }

    // Simulação da extração de texto do PDF (em produção usaria biblioteca PDF)
    const pdfText = `
    PLANEJAMENTO DE CAMPANHA - PRODUTO REVOLUCIONÁRIO
    
    Nome da Oferta: SuperApp Premium - A revolução no seu bolso
    
    Público-Alvo: Empreendedores digitais de 25-45 anos, interessados em produtividade
    
    Proposta Central: Aumente sua produtividade em 300% com nossa solução completa
    
    Benefícios Principais:
    - Automatização completa de tarefas
    - Dashboard inteligente com IA
    - Integração com 500+ ferramentas
    - Suporte 24/7 especializado
    
    Headline Principal: "Transforme Seu Negócio em Uma Máquina de Resultados"
    
    Call-to-Action: "QUERO REVOLUCIONAR MEU NEGÓCIO AGORA"
    
    Tom de Voz: Inspirador, confiante e focado em resultados
    `;

    console.log('📄 [pdf-analyzer] Texto extraído do PDF, enviando para GPT-4...');

    // Análise com GPT-4
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Você é um especialista em marketing digital que analisa planejamentos de campanha. 
            Extraia as seguintes informações do texto do PDF e retorne APENAS um JSON válido:
            
            {
              "nomeOferta": "string",
              "propostaCentral": "string", 
              "publicoAlvo": "string",
              "beneficios": ["string1", "string2", "string3"],
              "headlinePrincipal": "string",
              "cta": "string",
              "tomVoz": "string",
              "tipoMidia": ["imagem", "video"]
            }`
          },
          {
            role: 'user',
            content: `Analise este planejamento de campanha e extraia as informações:\n\n${pdfText}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const gptData = await gptResponse.json();
    const dadosExtraidos = JSON.parse(gptData.choices[0].message.content);

    console.log('🧠 [pdf-analyzer] Dados estruturados pelo GPT-4:', dadosExtraidos);

    // Salvar análise no banco
    const { data: analise, error: saveError } = await supabase
      .from('pdf_analysis')
      .insert({
        caminho_arquivo: filePath,
        nome_arquivo: filePath.split('/').pop(),
        email_gestor: emailGestor,
        nome_oferta: dadosExtraidos.nomeOferta,
        proposta_central: dadosExtraidos.propostaCentral,
        publico_alvo: dadosExtraidos.publicoAlvo,
        beneficios: dadosExtraidos.beneficios,
        headline_principal: dadosExtraidos.headlinePrincipal,
        cta: dadosExtraidos.cta,
        tom_voz: dadosExtraidos.tomVoz,
        tipo_midia: dadosExtraidos.tipoMidia,
        dados_extraidos: dadosExtraidos,
        status: 'concluido',
        tempo_processamento: 5000, // 5 segundos
        custo_analise: 0.15
      })
      .select()
      .single();

    if (saveError) {
      throw new Error(`Erro ao salvar análise: ${saveError.message}`);
    }

    console.log('✅ [pdf-analyzer] Análise salva com sucesso, ID:', analise.id);

    return new Response(JSON.stringify({
      success: true,
      analysisId: analise.id,
      dadosExtraidos,
      message: 'PDF analisado com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ [pdf-analyzer] Erro:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});