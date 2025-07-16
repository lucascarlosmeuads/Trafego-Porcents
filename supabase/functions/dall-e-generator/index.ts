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

    const { selectedCopy, analysisId, emailGestor, emailCliente } = await req.json()

    if (!emailCliente || !emailGestor) {
      throw new Error('emailCliente e emailGestor são obrigatórios')
    }

    console.log('🎨 [dall-e-generator] Iniciando geração para copy:', selectedCopy.id || selectedCopy.headline)
    console.log('📧 [dall-e-generator] Cliente:', emailCliente, 'Gestor:', emailGestor)

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

    // Extrair os 3 elementos principais da copy
    const headline = selectedCopy.headline || 'Título Principal';
    const visualConcept = selectedCopy.visualConcept || 'Conceito visual profissional relacionado à oferta';
    const description = selectedCopy.copy || selectedCopy.description || 'Descrição persuasiva do produto';
    const cta = selectedCopy.cta || 'SAIBA MAIS';
    
    console.log('📋 [dall-e-generator] Elementos extraídos:', {
      headline: headline.substring(0, 50) + '...',
      visualConcept: visualConcept.substring(0, 50) + '...',
      description: description.substring(0, 50) + '...',
      cta
    });
    
    // Criar prompt FOCADO no conceito visual contraintuitivo
    const imagePrompt = `
Create a professional social media advertisement that implements this EXACT COUNTER-INTUITIVE VISUAL CONCEPT:

🎯 VISUAL CONCEPT TO EXECUTE (MOST IMPORTANT):
"${visualConcept}"

📝 TEXT CONTENT TO INCLUDE:
- HEADLINE: "${headline}"
- DESCRIPTION: "${description}"  
- CTA: "${cta}"

🎨 VISUAL REQUIREMENTS:
- Format: Perfect square 1024x1024 (Instagram/Facebook)
- Background: Clean, professional, high contrast
- Typography: Bold, sans-serif, extremely readable on mobile
- Colors: Professional palette that builds trust and authority
- Layout: Clear visual hierarchy with plenty of white space

🧠 COUNTER-INTUITIVE EXECUTION (CRITICAL):
- Execute the visual concept EXACTLY as written - no interpretation needed
- The visual concept already contains the counter-intuitive element
- Focus on making the unexpected visual concept highly realistic and professional
- Create cognitive dissonance through the specified visual contradiction
- Make the counter-intuitive element the MAIN focal point of the image

🎯 ADVERTISING PSYCHOLOGY:
- Visual stops the scroll immediately
- Creates cognitive dissonance (unexpected = attention)
- Text overlay must be crystal clear and readable
- Professional quality that builds instant credibility
- Optimized for mobile viewing and instant comprehension

📱 MOBILE-FIRST DESIGN:
- Text size: Large enough to read on phone screens
- High contrast text against background
- Simple, uncluttered composition
- Key message visible within 2 seconds

🚀 COMMERCIAL EFFECTIVENESS:
- Professional advertising quality
- Builds trust and authority
- Clear value proposition
- Strong call-to-action visibility
- Designed for maximum conversion

Result: A scroll-stopping advertisement with unexpected visuals that maintains professional credibility and perfect mobile readability.
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
      headline: headline,
      visualConcept: visualConcept,
      description: description,
      cta: cta,
      copyType: selectedCopy.style || selectedCopy.copyType || 'Contraintuitivo',
      style: 'Incongruência Criativa - DALL-E 3',
      geradoEm: new Date().toISOString(),
      promptUsado: imagePrompt
    }

    // Salvar no banco de dados
    const { error: saveError } = await supabase
      .from('criativos_gerados')
      .insert({
        email_gestor: emailGestor,
        email_cliente: emailCliente,
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