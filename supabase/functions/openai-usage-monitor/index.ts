import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

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
    console.log('🔍 Iniciando monitoramento OpenAI - verificação de chave API...')
    
    if (!openAIApiKey) {
      console.log('❌ OPENAI_API_KEY não encontrada')
      const fallbackResponse = {
        custo_mes: 0,
        custo_total: 0,
        limite_maximo: 100,
        disponivel: 100,
        tem_metodo_pagamento: false,
        usando_fallback: true,
        ultima_atualizacao: new Date().toISOString().split('T')[0],
        status_api: 'erro',
        erro: 'OPENAI_API_KEY não configurada'
      }
      
      return new Response(JSON.stringify(fallbackResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ OPENAI_API_KEY encontrada, buscando dados...')

    // Calcular datas
    const now = new Date()
    const hoje = now.toISOString().split('T')[0]
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)
    const inicioMesStr = inicioMes.toISOString().split('T')[0]

    console.log(`📅 Período de busca: ${inicioMesStr} até ${hoje}`)

    // Tentar buscar informações de subscription (limites)
    let limiteMaximo = 100 // fallback padrão
    let metodoPagamento = false
    
    try {
      console.log('🔄 Tentando buscar dados de billing...')
      const billingResponse = await fetch('https://api.openai.com/v1/organization/billing/subscription', {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
      })
      
      console.log(`📊 Status billing response: ${billingResponse.status}`)
      
      if (billingResponse.ok) {
        const billingData = await billingResponse.json()
        limiteMaximo = billingData.hard_limit_usd || 100
        metodoPagamento = billingData.has_payment_method || false
        console.log('✅ Dados de billing obtidos:', { limiteMaximo, metodoPagamento })
      } else {
        console.log('⚠️ Billing response não OK, usando valores padrão')
      }
    } catch (e) {
      console.log('⚠️ Erro ao buscar billing:', e.message)
    }

    // Tentar buscar uso atual do mês
    let custoMes = 0
    let custoTotal = 0
    
    try {
      console.log('🔄 Tentando buscar dados de uso...')
      const usageResponse = await fetch(
        `https://api.openai.com/v1/organization/billing/usage?start_date=${inicioMesStr}&end_date=${hoje}`,
        {
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )
      
      console.log(`📊 Status usage response: ${usageResponse.status}`)
      
      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        custoMes = (usageData.total_usage || 0) / 100 // Converter de centavos
        custoTotal = custoMes
        console.log('✅ Dados de uso obtidos:', { 
          total_usage: usageData.total_usage, 
          custoMes,
          raw_data: usageData 
        })
      } else {
        console.log('⚠️ Usage response não OK, usando valores padrão')
        const errorText = await usageResponse.text()
        console.log('📝 Error response text:', errorText)
      }
    } catch (e) {
      console.log('⚠️ Erro ao buscar usage:', e.message)
    }

    // Determinar se está usando fallback (se não conseguiu dados reais)
    const usandoFallback = custoMes === 0 && limiteMaximo <= 100
    const statusApi = custoMes > 0 || limiteMaximo > 100 ? 'conectada' : 
                     openAIApiKey.startsWith('sk-') ? 'limitada' : 'erro'

    // Montar resposta final
    const response = {
      custo_mes: custoMes,
      custo_total: custoTotal,
      limite_maximo: limiteMaximo,
      disponivel: Math.max(limiteMaximo - custoMes, 0),
      tem_metodo_pagamento: metodoPagamento,
      usando_fallback: usandoFallback,
      ultima_atualizacao: hoje,
      status_api: statusApi
    }

    console.log('✅ Resposta final montada:', response)

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Erro crítico na function openai-usage-monitor:', error)
    
    // Retornar resposta de fallback em caso de erro total
    const errorResponse = {
      custo_mes: 0,
      custo_total: 0,
      limite_maximo: 100,
      disponivel: 100,
      tem_metodo_pagamento: false,
      usando_fallback: true,
      ultima_atualizacao: new Date().toISOString().split('T')[0],
      status_api: 'erro',
      erro: error.message
    }
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})