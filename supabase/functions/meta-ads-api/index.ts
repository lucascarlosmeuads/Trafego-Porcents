
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MetaAdsConfig {
  appId: string
  appSecret: string
  accessToken: string
  adAccountId: string
}

interface RequestBody {
  action: 'test_connection' | 'get_insights'
  config: MetaAdsConfig
  date_preset?: string
  startDate?: string
  endDate?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: RequestBody = await req.json()
    console.log('📥 [meta-ads-api] Requisição recebida:', {
      action: body.action,
      hasConfig: !!body.config,
      configFields: body.config ? Object.keys(body.config) : []
    })

    const { action, config } = body

    // Validação relaxada da configuração
    if (!config) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Configuração Meta Ads não fornecida',
          errorType: 'MISSING_CONFIG'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Validação básica dos campos (relaxada)
    const requiredFields = ['appId', 'appSecret', 'accessToken', 'adAccountId']
    const missingFields = requiredFields.filter(field => !config[field as keyof MetaAdsConfig]?.trim())
    
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Campos obrigatórios faltando: ${missingFields.join(', ')}`,
          errorType: 'MISSING_FIELDS',
          missingFields
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Validação relaxada do App ID (aceitar IDs menores)
    if (config.appId.trim().length < 3) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'App ID deve ter pelo menos 3 caracteres',
          errorType: 'INVALID_APP_ID'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Garantir que Ad Account ID tenha prefixo act_
    let adAccountId = config.adAccountId.trim()
    if (!adAccountId.startsWith('act_')) {
      adAccountId = `act_${adAccountId}`
    }

    console.log('✅ [meta-ads-api] Configuração validada:', {
      appId: config.appId.substring(0, 5) + '...',
      hasAppSecret: !!config.appSecret,
      hasAccessToken: !!config.accessToken,
      adAccountId: adAccountId
    })

    if (action === 'test_connection') {
      return await testConnection({
        ...config,
        adAccountId
      })
    } else if (action === 'get_insights') {
      return await getInsights({
        ...config,
        adAccountId
      }, body.date_preset, body.startDate, body.endDate)
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Ação não reconhecida',
          errorType: 'INVALID_ACTION'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

  } catch (error) {
    console.error('❌ [meta-ads-api] Erro inesperado:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Erro interno do servidor',
        errorType: 'SERVER_ERROR',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function testConnection(config: MetaAdsConfig) {
  console.log('🔗 [meta-ads-api] Iniciando teste de conexão')
  
  const steps = {
    validation: 'PENDING',
    basic_connection: 'PENDING', 
    ad_account_access: 'PENDING',
    campaigns_access: 'PENDING'
  }

  try {
    // Etapa 1: Validação básica
    console.log('1️⃣ [meta-ads-api] Validando configuração...')
    steps.validation = 'OK'

    // Etapa 2: Teste de conexão básica com API
    console.log('2️⃣ [meta-ads-api] Testando conexão básica...')
    const basicTestUrl = `https://graph.facebook.com/v18.0/me?access_token=${config.accessToken}`
    const basicResponse = await fetch(basicTestUrl)
    const basicData = await basicResponse.json()

    if (!basicResponse.ok || basicData.error) {
      console.error('❌ [meta-ads-api] Erro na conexão básica:', basicData)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Erro na conexão: ${basicData.error?.message || 'Token de acesso inválido'}`,
          errorType: 'CONNECTION_ERROR',
          steps
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    steps.basic_connection = 'OK'
    console.log('✅ [meta-ads-api] Conexão básica OK')

    // Etapa 3: Teste de acesso à conta de anúncios
    console.log('3️⃣ [meta-ads-api] Testando acesso à conta de anúncios...')
    const adAccountUrl = `https://graph.facebook.com/v18.0/${config.adAccountId}?fields=name,account_status&access_token=${config.accessToken}`
    const adAccountResponse = await fetch(adAccountUrl)
    const adAccountData = await adAccountResponse.json()

    if (!adAccountResponse.ok || adAccountData.error) {
      console.error('❌ [meta-ads-api] Erro no acesso à conta:', adAccountData)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Erro no acesso à conta: ${adAccountData.error?.message || 'Conta de anúncios inacessível'}`,
          errorType: 'AD_ACCOUNT_ERROR',
          steps
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    steps.ad_account_access = 'OK'
    console.log('✅ [meta-ads-api] Acesso à conta OK')

    // Etapa 4: Teste de acesso às campanhas
    console.log('4️⃣ [meta-ads-api] Testando acesso às campanhas...')
    const campaignsUrl = `https://graph.facebook.com/v18.0/${config.adAccountId}/campaigns?fields=name,status&limit=5&access_token=${config.accessToken}`
    const campaignsResponse = await fetch(campaignsUrl)
    const campaignsData = await campaignsResponse.json()

    if (!campaignsResponse.ok || campaignsData.error) {
      console.error('❌ [meta-ads-api] Erro no acesso às campanhas:', campaignsData)
      steps.campaigns_access = 'ERROR'
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Erro no acesso às campanhas: ${campaignsData.error?.message || 'Campanhas inacessíveis'}`,
          errorType: 'CAMPAIGNS_ERROR',
          steps
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!campaignsData.data || campaignsData.data.length === 0) {
      steps.campaigns_access = 'WARNING'
      console.log('⚠️ [meta-ads-api] Nenhuma campanha encontrada')
    } else {
      steps.campaigns_access = 'OK'
      console.log('✅ [meta-ads-api] Acesso às campanhas OK')
    }

    console.log('🎉 [meta-ads-api] Teste de conexão concluído com sucesso')
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Conexão testada com sucesso',
        steps,
        account_info: {
          name: adAccountData.name,
          status: adAccountData.account_status
        },
        campaigns_count: campaignsData.data?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ [meta-ads-api] Erro inesperado no teste:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Erro inesperado: ${error.message}`,
        errorType: 'NETWORK_ERROR',
        steps
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function getInsights(config: MetaAdsConfig, datePreset: string = 'today', startDate?: string, endDate?: string) {
  console.log('📊 [meta-ads-api] Buscando insights:', { datePreset, startDate, endDate })
  
  try {
    // Definir parâmetros de data
    let dateParams = ''
    if (datePreset === 'custom' && startDate && endDate) {
      dateParams = `&time_range={'since':'${startDate}','until':'${endDate}'}`
    } else {
      dateParams = `&date_preset=${datePreset}`
    }

    const insightsUrl = `https://graph.facebook.com/v18.0/${config.adAccountId}/insights?fields=impressions,clicks,spend,cpm,cpc,ctr&level=account${dateParams}&access_token=${config.accessToken}`
    
    console.log('🔗 [meta-ads-api] URL da requisição:', insightsUrl.replace(config.accessToken, '[TOKEN]'))
    
    const response = await fetch(insightsUrl)
    const data = await response.json()

    if (!response.ok || data.error) {
      console.error('❌ [meta-ads-api] Erro na API de insights:', data)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: data.error?.message || 'Erro ao buscar dados de insights',
          errorType: 'INSIGHTS_ERROR'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!data.data || data.data.length === 0) {
      console.log('⚠️ [meta-ads-api] Nenhum insight encontrado para o período')
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Nenhum dado encontrado para o período selecionado',
          errorType: 'NO_DATA',
          period_used: datePreset
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ [meta-ads-api] Insights encontrados:', data.data.length)
    return new Response(
      JSON.stringify({ 
        success: true, 
        insights: data.data,
        period_used: datePreset,
        campaigns_count: data.data.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ [meta-ads-api] Erro inesperado ao buscar insights:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Erro inesperado: ${error.message}`,
        errorType: 'NETWORK_ERROR'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}
