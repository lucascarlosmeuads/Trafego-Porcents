import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 [generate-personalized-message] start')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const body = await req.json().catch(() => ({}))
    const { leadId, email } = body as { leadId?: string; email?: string }

    if (!leadId && !email) {
      return new Response(JSON.stringify({ success: false, error: 'leadId ou email é obrigatório' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Buscar lead
    let lead: any = null
    if (leadId) {
      const { data, error } = await supabase
        .from('formularios_parceria')
        .select('*')
        .eq('id', leadId)
        .maybeSingle()
      if (error) throw error
      lead = data
    } else if (email) {
      const { data, error } = await supabase
        .from('formularios_parceria')
        .select('*')
        .eq('email_usuario', email)
        .order('created_at', { ascending: false })
        .limit(1)
      if (error) throw error
      lead = data?.[0]
    }

    if (!lead) {
      throw new Error('Lead não encontrado')
    }

    const emailCliente = lead.email_usuario as string

    // Buscar dados do cliente parceria (nome/telefone)
    const { data: clienteParceria } = await supabase
      .from('clientes_parceria')
      .select('nome_cliente, telefone')
      .eq('email_cliente', emailCliente)
      .maybeSingle()

    const respostas = lead.respostas || {}
    const tipoNegocio = lead.tipo_negocio || respostas.tipo_negocio || ''
    const produtoDescricao = lead.produto_descricao || respostas.produtoDescricao || respostas.produto_descricao || ''

    const nomeLead =
      clienteParceria?.nome_cliente ||
      respostas?.dadosPersonais?.nome ||
      respostas?.nome ||
      'Cliente'

    // extrair primeiro nome
    const firstName = String(nomeLead).trim().split(' ')[0] || 'Cliente'

    // telefone prioritário
    const telefone =
      clienteParceria?.telefone ||
      respostas?.dadosPersonais?.whatsapp ||
      respostas?.whatsapp ||
      respostas?.telefone ||
      null

    // Montar mensagem personalizada no estilo solicitado
    const tipoTexto = tipoNegocio
      ? ` do seu nicho (${tipoNegocio}).`
      : '.'

    const produtoTexto = produtoDescricao
      ? ` Vi também que você trabalha com: ${produtoDescricao}.`
      : ''

    const mensagem =
      `E aí, tudo bem? ${firstName}, Lucas aqui. E aí, tudo bem? Lucas aqui.
Já finalizei aqui o seu planejamento estratégico, baseado no que você preencheu lá no formulário e me falou aqui também. Esse planejamento tem como objetivo você entender o que a gente vai fazer para vender. Porque eu não posso perder tempo. Eu tenho que rodar uma oferta que realmente vende e depois eu vou ganhar só na comissão.

Então, o que a gente vai fazer vai ser um funil interativo. Esse funil interativo, eu chamo ele de magnético também, porque ele, desde o anúncio, vai chamar muita atenção de uma forma diferente do que o seu mercado está fazendo. Porque eu pesquisei aqui o seu nicho e percebi padrões claros${tipoTexto}${produtoTexto}

Além do anúncio ser diferente e chamar muita atenção, o funil vai fazer com que o cliente não perceba que ele vai fazer uma compra e vai chegar lá no final do funil de forma mais fácil. Então você vai ter um lead mais qualificado, que passou e mostrou interesse. Você não vai ficar falando com gente curiosa — esse ponto é bem importante.

Dependendo do caso, a gente pode até vender uma coisa baratinha ali no final do funil, para depois você vender o seu produto principal.

Esse planejamento aí é apenas uma base para você entender. Caso você prossiga para a construção do funil, que envolve criar uma página de venda e o funil gamificado (que é a parte da página para onde a gente manda o tráfego), precisamos ter os dois: a página de venda e o funil gamificado — igual ao funil que você passou por mim. Você passou pelo meu funil, mas eu tenho minha página de venda também: lucascarles.com.br. E o funil: funilmagnetico.traficoporcentos.com.

A ideia é fazer a mesma coisa no seu negócio para vender bem. Como eu falei, eu preciso que venda, senão eu não vou ganhar porcentagem sobre as vendas. Para construir esse funil, existe um custo inicial (detalhei no documento). Não é obrigatório fazer comigo: você pode fazer com a equipe que escolher, e eu posso orientar. Mas, se quiser fazer comigo, a gente já faz isso sempre aqui e entrega resultado (dá uma olhada nos destaques com depoimentos dos clientes).

Se você topar, em até 15 dias corridos no máximo a campanha já está no ar com o funil todo pronto.

Estou aqui para tirar qualquer dúvida. Assim que ler, me chama para a gente conversar.`;

    console.log('✅ [generate-personalized-message] message composed for', emailCliente)

    return new Response(
      JSON.stringify({ success: true, message: mensagem, client_name: nomeLead, phone: telefone }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error: any) {
    console.error('❌ [generate-personalized-message] error', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erro interno' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})
