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

    console.log('🔍 Buscando dados detalhados de uso da OpenAI...')

    // Calcular datas para diferentes períodos
    const now = new Date()
    const hoje = now.toISOString().split('T')[0]
    
    // Início da semana (domingo)
    const inicioSemana = new Date(now)
    inicioSemana.setDate(now.getDate() - now.getDay())
    const inicioSemanaStr = inicioSemana.toISOString().split('T')[0]
    
    // Início do mês
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)
    const inicioMesStr = inicioMes.toISOString().split('T')[0]

    // Buscar informações de billing/subscription
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

    // Buscar uso detalhado do mês atual
    const usageResponse = await fetch(
      `https://api.openai.com/v1/dashboard/billing/usage?start_date=${inicioMesStr}&end_date=${hoje}`,
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
    console.log('📊 Dados de uso detalhados recebidos:', usageData)

    // Processar dados diários para calcular custos por período
    const dailyCosts = usageData.daily_costs || []
    
    // Calcular custos por período
    const custoHoje = dailyCosts
      .filter(day => day.timestamp.startsWith(hoje))
      .reduce((total, day) => total + (day.line_items?.[0]?.cost || 0), 0) / 100

    const custoSemana = dailyCosts
      .filter(day => day.timestamp >= inicioSemanaStr)
      .reduce((total, day) => total + (day.line_items?.[0]?.cost || 0), 0) / 100

    const custoMes = dailyCosts
      .reduce((total, day) => total + (day.line_items?.[0]?.cost || 0), 0) / 100

    // Calcular total de tokens usados
    const totalTokens = dailyCosts
      .reduce((total, day) => {
        const lineItems = day.line_items || []
        return total + lineItems.reduce((dayTotal, item) => dayTotal + (item.n_usage || 0), 0)
      }, 0)

    // Montar resposta detalhada
    const response = {
      // Dados financeiros
      total_usage: usageData.total_usage / 100, // OpenAI retorna em centavos
      hard_limit_usd: billingData.hard_limit_usd || 0,
      soft_limit_usd: billingData.soft_limit_usd || 0,
      has_payment_method: billingData.has_payment_method || false,
      
      // Custos por período
      custo_hoje: custoHoje,
      custo_semana: custoSemana,
      custo_mes: custoMes,
      
      // Dados de uso
      total_tokens: totalTokens,
      daily_costs: dailyCosts,
      
      // Metadados
      plan: billingData.plan || {},
      access_until: billingData.access_until,
      periodo_consultado: {
        inicio_mes: inicioMesStr,
        inicio_semana: inicioSemanaStr,
        hoje: hoje
      }
    }

    console.log('✅ Resposta detalhada montada:', response)

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