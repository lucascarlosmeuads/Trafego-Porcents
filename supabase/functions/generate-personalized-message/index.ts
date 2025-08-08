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
      `Oi, ${firstName}! Lucas aqui.

Acabei de finalizar o seu planejamento estratégico com base no que você preencheu no formulário e no que conversamos. Este documento é a base para alinharmos a direção. Na hora de construir o funil, vou passar um pente fino em cada detalhe (copy, oferta, páginas, anúncios e métricas) para garantir máxima chance de conversão — sem perdermos tempo nem investimento.

A proposta é um funil interativo (magnético):
- Anúncios diferenciados para chamar atenção de um jeito que foge do padrão do mercado.
- Jornada que conduz naturalmente até a conversão, filtrando curiosos e deixando só quem tem interesse real.
- Quando fizer sentido, uma oferta de entrada de baixo ticket para aquecer e facilitar a venda do principal.

Pesquisei o seu mercado e identifiquei padrões claros${tipoTexto}${produtoTexto}

Se você topar, em até 15 dias corridos colocamos a campanha no ar com tudo pronto.

Sobre o modelo: trabalho com comissão de 10% sobre cada venda realizada. Se esse formato fizer sentido para você, me confirma por aqui. Se preferir outro modelo, me fala para alinharmos.

Fico à disposição para dúvidas. Assim que ler, me chama para alinharmos os próximos passos.`;


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
