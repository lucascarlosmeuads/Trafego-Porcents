import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key não configurado')
    }

    const { selectedCopy, analysisId, emailGestor } = await req.json()

    console.log('🎨 [dall-e-generator] Iniciando geração para copy:', selectedCopy.id)

    // Buscar dados da análise para contexto adicional
    const { data: analysisData, error: analysisError } = await supabase
      .from('pdf_analysis')
      .select('*')
      .eq('id', analysisId)
      .single()

    if (analysisError) {
      throw new Error(`Erro ao buscar análise: ${analysisError.message}`)
    }

    // Criar prompt otimizado para incongruência criativa
    const imagePrompt = `
Create a high-quality, professional advertising image with creative incongruity that challenges expectations.

Campaign Context:
- Offer: ${analysisData.nome_oferta || 'Premium Solution'}
- Target Audience: ${analysisData.publico_alvo || 'Professionals'}
- Tone: ${analysisData.tom_voz || 'Confident and motivational'}

Visual Requirements:
- Style: Modern, premium, eye-catching
- Creative Incongruity: Use unexpected visual elements that create cognitive surprise
- Composition: Clean, professional layout suitable for social media ads
- Colors: Bold, contrasting colors that grab attention
- Quality: Ultra high-resolution, crisp details
- Format: Square aspect ratio (1:1) optimized for social media

Creative Direction:
Use visual metaphors and unexpected combinations that make viewers stop and think. The image should be professionally designed but with an element of surprise that breaks conventional advertising patterns.

No text overlays needed - image only.
Ultra high resolution.
    `.trim()

    console.log('🖼️ [dall-e-generator] Prompt criado para DALL-E 3')

    // Chamar DALL-E 3 para gerar imagem
    const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: imagePrompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        style: 'vivid'
      }),
    })

    if (!dalleResponse.ok) {
      const errorText = await dalleResponse.text()
      throw new Error(`Erro na geração da imagem pelo DALL-E: ${errorText}`)
    }

    const dalleData = await dalleResponse.json()
    const imageUrl = dalleData.data[0].url

    console.log('✅ [dall-e-generator] Imagem gerada com sucesso!')

    // Calcular custo (DALL-E 3 HD custa ~$0.08)
    const custo = 0.08 * 5.5 // Conversão USD para BRL aproximada

    // Criar objeto do criativo completo
    const criativoCompleto = {
      id: `creative-${Date.now()}`,
      imageUrl: imageUrl,
      headline: selectedCopy.headline,
      subheadline: selectedCopy.subheadline,
      copy: selectedCopy.copy,
      cta: selectedCopy.cta,
      style: 'Incongruência Criativa - DALL-E 3',
      geradoEm: new Date().toISOString(),
      promptUsado: imagePrompt
    }

    // Salvar no banco de dados
    const { error: saveError } = await supabase
      .from('criativos_gerados')
      .insert({
        email_gestor: emailGestor,
        email_cliente: '', // Pode ser adicionado depois
        nome_arquivo_pdf: analysisData.nome_arquivo,
        caminho_pdf: analysisData.caminho_arquivo,
        dados_extraidos: analysisData.dados_extraidos,
        criativos: criativoCompleto,
        status: 'concluido',
        arquivo_url: imageUrl,
        prompt_usado: imagePrompt,
        api_utilizada: 'DALL-E 3',
        custo_processamento: custo,
        tipo_criativo: 'anuncio_completo',
        estilo_visual: 'Incongruência Criativa',
        processado_em: new Date().toISOString()
      })

    if (saveError) {
      console.error('⚠️ [dall-e-generator] Erro ao salvar no banco:', saveError)
      // Não falhar por causa do banco - continuar com a resposta
    }

    console.log('🎉 [dall-e-generator] Criativo completo salvo com sucesso!')

    return new Response(JSON.stringify({
      success: true,
      criativo: criativoCompleto,
      custo: custo,
      message: 'Anúncio completo gerado com incongruência criativa!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ [dall-e-generator] Erro:', error)
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})