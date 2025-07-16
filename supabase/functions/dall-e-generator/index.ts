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

    // Usar o ID único baseado no conteúdo da copy (passado pelo frontend)
    const copyUniqueId = selectedCopy.copyUniqueId || selectedCopy.id || `copy-${selectedCopy.headline?.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`

    console.log('🎨 [dall-e-generator] Iniciando geração para copy:', copyUniqueId)
    console.log('📧 [dall-e-generator] Cliente:', emailCliente, 'Gestor:', emailGestor)
    console.log('🆔 [dall-e-generator] Copy ID único (baseado no conteúdo):', copyUniqueId)

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
    
    // Criar prompt em português brasileiro para gerar criativos brasileiros
    const imagePrompt = `
Crie um anúncio profissional para redes sociais que execute EXATAMENTE este CONCEITO VISUAL CONTRAINTUITIVO:

🎯 CONCEITO VISUAL PARA EXECUTAR (MAIS IMPORTANTE):
"${visualConcept}"

📝 TEXTO ESSENCIAL PARA INCLUIR (APENAS O MÍNIMO):
- HEADLINE PRINCIPAL: "${headline}"
- CHAMADA PARA AÇÃO: "${cta}"

⚠️ INSTRUÇÕES CRÍTICAS PARA TEXTO MÍNIMO:
- APENAS mostrar o HEADLINE PRINCIPAL e CTA
- NÃO incluir a descrição longa na imagem
- Máximo 10 palavras visíveis na imagem total
- Texto deve ser GRANDE, LEGÍVEL e em PORTUGUÊS
- Zero erros de português - revisar ortografia cuidadosamente

🎨 PADRÃO VISUAL BRASILEIRO:
- Formato: Quadrado perfeito 1024x1024 (Instagram/Facebook)
- Fundo: Limpo, profissional, alto contraste
- Tipografia: Negrito, sem serifa, extremamente legível no celular
- Cores: Paleta profissional que transmite confiança
- Layout: Hierarquia visual clara com muito espaço em branco

🧠 EXECUÇÃO CONTRAINTUITIVA (CRÍTICO):
- Execute o conceito visual EXATAMENTE como escrito
- O conceito visual já contém o elemento contraintuitivo
- Foque em tornar o conceito inesperado altamente realista e profissional
- Crie dissonância cognitiva através da contradição visual específica
- Torne o elemento contraintuitivo o PONTO FOCAL principal da imagem

🇧🇷 PADRÃO PUBLICITÁRIO BRASILEIRO:
- Visual que para o scroll imediatamente
- Cria dissonância cognitiva (inesperado = atenção)
- Texto em português brasileiro perfeito
- Qualidade profissional que constrói credibilidade instantânea
- Otimizado para visualização mobile

📱 DESIGN MOBILE-FIRST:
- Tamanho do texto: Grande o suficiente para ler em telas de celular
- Alto contraste entre texto e fundo
- Composição simples e descomplicada
- Mensagem principal visível em 2 segundos

🚀 EFETIVIDADE COMERCIAL:
- Qualidade publicitária profissional brasileira
- Constrói confiança e autoridade
- Proposta de valor clara
- Call-to-action bem visível
- Projetado para máxima conversão

Resultado: Um anúncio que para o scroll com visuais inesperados, mantém credibilidade profissional e perfeita legibilidade mobile, com TEXTO MÍNIMO em português brasileiro perfeito.
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
        copy_id: copyUniqueId,
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