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
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não configurada')
    }

    console.log('🔍 Buscando dados simplificados de uso da OpenAI...')

    // Calcular datas
    const now = new Date()
    const hoje = now.toISOString().split('T')[0]
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)
    const inicioMesStr = inicioMes.toISOString().split('T')[0]

    // Tentar buscar informações de subscription (limites)
    let limiteMaximo = 0
    let metodoPagamento = false
    
    try {
      const billingResponse = await fetch('https://api.openai.com/v1/organization/billing/subscription', {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (billingResponse.ok) {
        const billingData = await billingResponse.json()
        limiteMaximo = billingData.hard_limit_usd || 0
        metodoPagamento = billingData.has_payment_method || false
        console.log('✅ Dados de billing obtidos:', { limiteMaximo, metodoPagamento })
      }
    } catch (e) {
      console.log('⚠️ Não foi possível buscar dados de billing, usando fallback')
    }

    // Tentar buscar uso atual do mês
    let custoMes = 0
    let custoTotal = 0
    
    try {
      const usageResponse = await fetch(
        `https://api.openai.com/v1/organization/billing/usage?start_date=${inicioMesStr}&end_date=${hoje}`,
        {
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )
      
      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        custoMes = (usageData.total_usage || 0) / 100 // Converter de centavos
        custoTotal = custoMes
        console.log('✅ Dados de uso obtidos:', { custoMes })
      }
    } catch (e) {
      console.log('⚠️ Não foi possível buscar dados de uso, usando fallback')
    }

    // Se não conseguiu dados reais, usar estimativas baseadas nos formulários
    const fallbackResponse = {
      // Dados simplificados
      custo_mes: custoMes,
      custo_total: custoTotal,
      limite_maximo: limiteMaximo || 100, // Limite padrão se não conseguir buscar
      disponivel: (limiteMaximo || 100) - custoMes,
      tem_metodo_pagamento: metodoPagamento,
      
      // Metadados
      usando_fallback: custoMes === 0 && limiteMaximo === 0,
      ultima_atualizacao: hoje,
      status_api: custoMes > 0 || limiteMaximo > 0 ? 'conectada' : 'limitada'
    }

    console.log('✅ Resposta simplificada montada:', fallbackResponse)

    return new Response(JSON.stringify(fallbackResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Erro na function openai-usage-monitor:', error)
    
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