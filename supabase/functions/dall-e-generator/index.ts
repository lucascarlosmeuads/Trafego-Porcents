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

    console.log('🎨 [dall-e-generator] Iniciando geração para copy:', selectedCopy.id || selectedCopy.headline)

    // Buscar dados da análise para contexto adicional (se disponível)
    let analysisData = null
    if (analysisId && analysisId !== 'undefined') {
      const { data, error: analysisError } = await supabase
        .from('pdf_analysis')
        .select('*')
        .eq('id', analysisId)
        .single()

      if (analysisError) {
        console.warn('⚠️ [dall-e-generator] Aviso ao buscar análise:', analysisError.message)
      } else {
        analysisData = data
      }
    }

    // Usar dados padrão se não houver análise disponível
    const contextData = analysisData || {
      nome_oferta: 'Professional Service',
      proposta_central: 'Premium solution',
      publico_alvo: 'Business professionals',
      tom_voz: 'Professional and confident',
      nome_arquivo: 'planejamento-estrategico.txt',
      caminho_arquivo: '/planejamento',
      dados_extraidos: { fonte: 'planejamento' }
    }

    // Usar conceito visual se disponível
    const visualConcept = selectedCopy.visualConcept || 'Professional advertising visual related to the offer';
    const copyText = selectedCopy.copy || selectedCopy.description || 'Premium solution for your needs';
    
    // Criar prompt otimizado com conceito contraintuitivo
    const imagePrompt = `
Create a high-converting social media advertisement using this COUNTER-INTUITIVE VISUAL CONCEPT:

PRIMARY VISUAL CONCEPT:
"${visualConcept}"

TEXT OVERLAY REQUIREMENTS:
1. Bold headline at top: "${selectedCopy.headline}"
2. Persuasive description: "${copyText}"
3. Strong CTA button: "${selectedCopy.cta}"

COMMERCIAL CONTEXT:
- Product/Service: ${contextData.nome_oferta}
- Value Proposition: ${contextData.proposta_central}
- Target Audience: ${contextData.publico_alvo}
- Advertising Style: ${selectedCopy.style || contextData.tom_voz}

DESIGN SPECIFICATIONS:
- Format: Square 1:1 (Instagram/Facebook optimal)
- Style: Modern, professional, attention-grabbing
- Colors: Vibrant but professional palette that builds trust
- Typography: Bold, highly readable fonts with strong contrast
- Layout: Clean with clear visual hierarchy
- Mobile-optimized text sizes

COUNTER-INTUITIVE APPROACH:
- Use the specified visual concept that breaks expectations
- Surprise the viewer with unconventional imagery
- Create immediate curiosity through visual contrast
- Avoid obvious or cliché representations
- Make people stop scrolling with unexpected visuals

CRITICAL REQUIREMENTS:
- The visual concept MUST be the primary focus of the image
- Include ALL text elements as readable overlays
- Ensure perfect readability on mobile devices
- Create immediate emotional impact and curiosity
- Design for maximum engagement and conversion
- Professional advertising quality with commercial appeal
- Text must be large enough to read on small screens

Result: A scroll-stopping advertisement that uses unexpected visuals while maintaining commercial effectiveness and perfect readability.
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
      visualConcept: visualConcept,
      description: copyText,
      cta: selectedCopy.cta,
      copyType: selectedCopy.style || 'Contraintuitivo',
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
        nome_arquivo_pdf: contextData.nome_arquivo,
        caminho_pdf: contextData.caminho_arquivo,
        dados_extraidos: contextData.dados_extraidos,
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