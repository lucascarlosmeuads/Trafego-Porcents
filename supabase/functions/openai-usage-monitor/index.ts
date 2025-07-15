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

    console.log('🔍 Buscando dados de uso da OpenAI...')

    // Buscar informações de billing da OpenAI
    const billingResponse = await fetch('https://api.openai.com/v1/organization/billing/subscription', {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!billingResponse.ok) {
      const errorText = await billingResponse.text()
      console.error('❌ Erro na resposta de billing:', errorText)
      throw new Error(`Erro ao buscar dados de billing: ${billingResponse.status}`)
    }

    const billingData = await billingResponse.json()
    console.log('💰 Dados de billing recebidos:', billingData)

    // Buscar uso atual do mês
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const usageResponse = await fetch(
      `https://api.openai.com/v1/organization/billing/usage?start_date=${startOfMonth.toISOString().split('T')[0]}&end_date=${endOfMonth.toISOString().split('T')[0]}`,
      {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!usageResponse.ok) {
      const errorText = await usageResponse.text()
      console.error('❌ Erro na resposta de usage:', errorText)
      throw new Error(`Erro ao buscar dados de uso: ${usageResponse.status}`)
    }

    const usageData = await usageResponse.json()
    console.log('📊 Dados de uso recebidos:', usageData)

    // Montar resposta
    const response = {
      total_usage: usageData.total_usage / 100, // OpenAI retorna em centavos
      hard_limit_usd: billingData.hard_limit_usd || 0,
      has_payment_method: billingData.has_payment_method || false,
      current_usage_usd: usageData.total_usage / 100, // Uso atual em USD
      daily_cost_since_start: usageData.daily_costs || {},
      plan: billingData.plan || {},
      access_until: billingData.access_until,
      soft_limit_usd: billingData.soft_limit_usd || 0,
    }

    console.log('✅ Resposta final montada:', response)

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Erro na function openai-usage-monitor:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Verifique se a OPENAI_API_KEY está configurada corretamente'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})