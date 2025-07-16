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

    // Criar prompt para anúncio estruturado completo
    const imagePrompt = `
Create a complete, professional social media advertisement with this EXACT STRUCTURE:

MANDATORY LAYOUT (top to bottom):
1. HEADLINE at top: "${selectedCopy.headline}"
2. CENTRAL IMAGE: Eye-catching visual related to the offer
3. DESCRIPTION below: "${selectedCopy.copy.substring(0, 120)}..."
4. CTA at bottom: "${selectedCopy.cta}"

COMMERCIAL CONTEXT:
- Product/Service: ${contextData.nome_oferta}
- Value Proposition: ${contextData.proposta_central}
- Target Audience: ${contextData.publico_alvo}
- Tone: ${contextData.tom_voz}

VISUAL SPECIFICATIONS:
- Format: Instagram/Facebook post (square 1:1)
- Design: Professional "sponsored post" layout
- Typography: Headline prominently displayed, readable text
- Colors: Professional color palette that builds trust
- Elements: Icons or illustrations that reinforce the message
- Clear visual hierarchy: HEADLINE → IMAGE → TEXT → CTA

CRITICAL REQUIREMENTS:
- ALL copy text must be VISIBLE in the image
- Create a complete advertisement, not just abstract art
- Include the actual copy text within the image design
- Professional "paid ad" appearance
- Layout that works for paid social media campaigns
- High resolution, ready-to-use advertising creative

Result: A complete, professional advertising post ready for social media campaigns.
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