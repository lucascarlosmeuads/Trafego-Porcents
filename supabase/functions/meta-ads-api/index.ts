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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { action, config, startDate, endDate } = await req.json()

    if (action === 'test_connection') {
      console.log('🔗 [meta-ads-api] === TESTE DE CONEXÃO DETALHADO ===')
      
      // STEP 1: Validações básicas de formato
      console.log('🔍 [meta-ads-api] PASSO 1: Validando formato das credenciais...')
      
      if (!config.appId || config.appId.length < 10) {
        console.error('❌ [meta-ads-api] App ID inválido')
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'App ID inválido. Deve ter pelo menos 10 caracteres. Verifique o App ID no Facebook Developers.',
            errorType: 'INVALID_APP_ID',
            step: 'validation'
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (!config.accessToken || config.accessToken.length < 100) {
        console.error('❌ [meta-ads-api] Access Token muito curto')
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Access Token inválido (muito curto). Um token válido tem centenas de caracteres. Gere um novo token no Facebook Developers.',
            errorType: 'INVALID_TOKEN_LENGTH',
            step: 'validation'
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (!config.adAccountId) {
        console.error('❌ [meta-ads-api] Ad Account ID não fornecido')
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Ad Account ID é obrigatório. Encontre seu Ad Account ID no Facebook Ads Manager.',
            errorType: 'MISSING_AD_ACCOUNT_ID',
            step: 'validation'
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Auto-corrigir Ad Account ID se não tiver act_ prefix
      let adAccountId = config.adAccountId.trim()
      if (!adAccountId.startsWith('act_')) {
        console.log('🔧 [meta-ads-api] Corrigindo formato do Ad Account ID...')
        adAccountId = `act_${adAccountId}`
        console.log(`🔧 [meta-ads-api] Ad Account ID corrigido para: ${adAccountId}`)
      }

      console.log('✅ [meta-ads-api] PASSO 1: Validações básicas OK')

      // STEP 2: Testar conexão básica com API
      console.log('🔗 [meta-ads-api] PASSO 2: Testando conexão básica com Meta API...')
      
      const testUrl = `https://graph.facebook.com/v18.0/me?access_token=${config.accessToken}`
      
      try {
        const response = await fetch(testUrl)
        const data = await response.json()
        
        if (!response.ok) {
          console.error('❌ [meta-ads-api] Erro no teste básico:', data)
          
          let errorMessage = 'Erro ao conectar com Meta API'
          let errorType = 'API_ERROR'
          
          if (data.error) {
            switch (data.error.code) {
              case 190:
                errorMessage = 'Access Token inválido ou expirado. Gere um novo token no Facebook Developers com as permissões ads_read e ads_management.'
                errorType = 'INVALID_TOKEN'
                break
              case 102:
                errorMessage = 'Sessão expirada. Gere um novo Access Token no Facebook Developers.'
                errorType = 'SESSION_EXPIRED'
                break
              case 4:
                errorMessage = 'Limite de API atingido. Aguarde alguns minutos e tente novamente.'
                errorType = 'RATE_LIMIT'
                break
              default:
                errorMessage = `Erro da Meta API: ${data.error.message}`
                errorType = 'API_ERROR'
            }
          }
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: errorMessage,
              errorType: errorType,
              step: 'basic_connection',
              details: data
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        console.log('✅ [meta-ads-api] PASSO 2: Conexão básica OK - Usuário:', data.name || data.id)

        // STEP 3: Testar acesso ao Ad Account
        console.log('🔗 [meta-ads-api] PASSO 3: Testando acesso ao Ad Account...')
        console.log(`🔍 [meta-ads-api] Tentando acessar Ad Account: ${adAccountId}`)

        const adAccountUrl = `https://graph.facebook.com/v18.0/${adAccountId}?fields=id,name,account_status,currency&access_token=${config.accessToken}`
        
        const adAccountResponse = await fetch(adAccountUrl)
        const adAccountData = await adAccountResponse.json()
        
        if (!adAccountResponse.ok) {
          console.error('❌ [meta-ads-api] Erro no acesso ao Ad Account:', adAccountData)
          
          let errorMessage = 'Erro ao acessar Ad Account'
          let errorType = 'AD_ACCOUNT_ERROR'
          
          if (adAccountData.error) {
            switch (adAccountData.error.code) {
              case 100:
                if (adAccountData.error.error_subcode === 33) {
                  errorMessage = `Ad Account "${adAccountId}" não encontrado ou você não tem permissão.`
                  errorType = 'AD_ACCOUNT_NOT_FOUND'
                } else {
                  errorMessage = `Ad Account não acessível: ${adAccountData.error.message}`
                  errorType = 'AD_ACCOUNT_ACCESS_DENIED'
                }
                break
              case 190:
                errorMessage = 'Token não tem permissão para acessar este Ad Account.'
                errorType = 'INSUFFICIENT_PERMISSIONS'
                break
              default:
                errorMessage = `Erro da Meta API: ${adAccountData.error.message}`
                errorType = 'API_ERROR'
            }
          }
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: errorMessage,
              errorType: errorType,
              step: 'ad_account_access',
              suggestedAdAccountId: adAccountId !== config.adAccountId ? adAccountId : null,
              details: adAccountData
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        console.log('✅ [meta-ads-api] PASSO 3: Ad Account acessível:', adAccountData)

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: '🎉 Conexão com Meta Ads realizada com sucesso!',
            user: data,
            adAccount: adAccountData,
            correctedAdAccountId: adAccountId !== config.adAccountId ? adAccountId : null,
            steps: {
              validation: 'OK',
              basic_connection: 'OK',
              ad_account_access: 'OK'
            }
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
            step: 'basic_connection'
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    if (action === 'get_campaigns') {
      console.log('📊 [meta-ads-api] === BUSCANDO CAMPANHAS ===')
      
      let adAccountId = config.adAccountId.trim()
      if (!adAccountId.startsWith('act_')) {
        adAccountId = `act_${adAccountId}`
      }
      
      let campaignsUrl = `https://graph.facebook.com/v18.0/${adAccountId}/campaigns?fields=id,name,status,objective,created_time&access_token=${config.accessToken}`
      
      // Adicionar filtros de data se fornecidos
      if (startDate && endDate) {
        campaignsUrl += `&time_range={"since":"${startDate}","until":"${endDate}"}`
        console.log('📅 [meta-ads-api] Aplicando filtro de data:', { startDate, endDate })
      }
      
      const response = await fetch(campaignsUrl)
      const data = await response.json()
      
      if (!response.ok) {
        console.error('❌ [meta-ads-api] Erro ao buscar campanhas:', data)
        
        let errorMessage = 'Erro ao buscar campanhas'
        if (data.error) {
          switch (data.error.code) {
            case 100:
              errorMessage = 'Ad Account não encontrado ou sem permissão.'
              break
            case 190:
              errorMessage = 'Token inválido ou sem permissão para campanhas.'
              break
            default:
              errorMessage = `Erro da API: ${data.error.message}`
          }
        }
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: errorMessage,
            details: data
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('✅ [meta-ads-api] Campanhas encontradas:', data.data?.length || 0)
      return new Response(
        JSON.stringify({ 
          success: true, 
          campaigns: data.data || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_insights') {
      console.log('📈 [meta-ads-api] === BUSCANDO INSIGHTS ===')
      
      let adAccountId = config.adAccountId.trim()
      if (!adAccountId.startsWith('act_')) {
        adAccountId = `act_${adAccountId}`
      }
      
      let insightsUrl = `https://graph.facebook.com/v18.0/${adAccountId}/insights?fields=impressions,clicks,spend,cpm,cpc,ctr&access_token=${config.accessToken}`
      
      // Aplicar filtro de data
      if (startDate && endDate) {
        insightsUrl += `&time_range={"since":"${startDate}","until":"${endDate}"}`
        console.log('📅 [meta-ads-api] Aplicando filtro de data:', { startDate, endDate })
      } else {
        // Padrão: últimos 7 dias
        insightsUrl += `&date_preset=last_7d`
      }
      
      const response = await fetch(insightsUrl)
      const data = await response.json()
      
      if (!response.ok) {
        console.error('❌ [meta-ads-api] Erro ao buscar insights:', data)
        
        let errorMessage = 'Erro ao buscar insights'
        if (data.error) {
          switch (data.error.code) {
            case 100:
              errorMessage = 'Ad Account não encontrado ou sem permissão para insights.'
              break
            case 190:
              errorMessage = 'Token sem permissão para acessar insights.'
              break
            default:
              errorMessage = `Erro da API: ${data.error.message}`
          }
        }
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: errorMessage,
            details: data
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('✅ [meta-ads-api] Insights encontrados:', data.data?.length || 0)
      return new Response(
        JSON.stringify({ 
          success: true, 
          insights: data.data || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Ação não reconhecida' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ [meta-ads-api] Erro geral:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
