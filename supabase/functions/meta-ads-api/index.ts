
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

    const { action, config } = await req.json()

    if (action === 'test_connection') {
      console.log('🔗 [meta-ads-api] === TESTE DE CONEXÃO DETALHADO ===')
      console.log('🔍 [meta-ads-api] Validando credenciais...')
      
      // Validar formato do Ad Account ID
      if (!config.adAccountId.startsWith('act_')) {
        console.error('❌ [meta-ads-api] Ad Account ID deve começar com "act_"')
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Ad Account ID deve começar com "act_". Exemplo: act_1234567890',
            errorType: 'INVALID_AD_ACCOUNT_FORMAT'
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Validar comprimento do token
      if (config.accessToken.length < 100) {
        console.error('❌ [meta-ads-api] Access Token parece muito curto')
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Access Token parece inválido (muito curto). Verifique se copiou o token completo.',
            errorType: 'INVALID_TOKEN_LENGTH'
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('✅ [meta-ads-api] Validações básicas OK')
      console.log('🔗 [meta-ads-api] Testando conexão com /me endpoint...')
      
      // Test 1: Basic API connection
      const testUrl = `https://graph.facebook.com/v18.0/me?access_token=${config.accessToken}`
      
      const response = await fetch(testUrl)
      const data = await response.json()
      
      if (!response.ok) {
        console.error('❌ [meta-ads-api] Erro no teste /me:', data)
        
        let errorMessage = 'Erro ao conectar com Meta Ads'
        let errorType = 'UNKNOWN_ERROR'
        
        if (data.error) {
          switch (data.error.code) {
            case 190:
              errorMessage = 'Access Token inválido ou expirado. Gere um novo token no Facebook Developers.'
              errorType = 'INVALID_TOKEN'
              break
            case 102:
              errorMessage = 'Sessão expirada. Gere um novo Access Token.'
              errorType = 'SESSION_EXPIRED'
              break
            default:
              errorMessage = `Erro da API Meta: ${data.error.message}`
              errorType = 'API_ERROR'
          }
        }
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: errorMessage,
            errorType: errorType,
            details: data
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('✅ [meta-ads-api] Teste /me OK:', data)
      console.log('🔗 [meta-ads-api] Testando acesso ao Ad Account...')

      // Test 2: Ad Account access
      const adAccountUrl = `https://graph.facebook.com/v18.0/${config.adAccountId}?fields=id,name,account_status&access_token=${config.accessToken}`
      
      const adAccountResponse = await fetch(adAccountUrl)
      const adAccountData = await adAccountResponse.json()
      
      if (!adAccountResponse.ok) {
        console.error('❌ [meta-ads-api] Erro no teste Ad Account:', adAccountData)
        
        let errorMessage = 'Erro ao acessar Ad Account'
        let errorType = 'AD_ACCOUNT_ERROR'
        
        if (adAccountData.error) {
          switch (adAccountData.error.code) {
            case 100:
              if (adAccountData.error.error_subcode === 33) {
                errorMessage = `Ad Account ID "${config.adAccountId}" não existe ou você não tem permissão para acessá-lo. Verifique o ID e as permissões do token.`
                errorType = 'AD_ACCOUNT_NOT_FOUND'
              } else {
                errorMessage = `Ad Account não encontrado: ${adAccountData.error.message}`
                errorType = 'AD_ACCOUNT_ACCESS_DENIED'
              }
              break
            case 190:
              errorMessage = 'Token não tem permissão para acessar este Ad Account. Verifique as permissões do token.'
              errorType = 'INSUFFICIENT_PERMISSIONS'
              break
            default:
              errorMessage = `Erro da API Meta: ${adAccountData.error.message}`
              errorType = 'API_ERROR'
          }
        }
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: errorMessage,
            errorType: errorType,
            details: adAccountData
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('✅ [meta-ads-api] Ad Account acessível:', adAccountData)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Conexão com Meta Ads realizada com sucesso!',
          user: data,
          adAccount: adAccountData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_campaigns') {
      console.log('📊 [meta-ads-api] === BUSCANDO CAMPANHAS ===')
      console.log('🔍 [meta-ads-api] Ad Account ID:', config.adAccountId)
      
      const campaignsUrl = `https://graph.facebook.com/v18.0/${config.adAccountId}/campaigns?fields=id,name,status,objective,created_time&access_token=${config.accessToken}`
      
      const response = await fetch(campaignsUrl)
      const data = await response.json()
      
      if (!response.ok) {
        console.error('❌ [meta-ads-api] Erro ao buscar campanhas:', data)
        
        let errorMessage = 'Erro ao buscar campanhas'
        if (data.error) {
          switch (data.error.code) {
            case 100:
              errorMessage = 'Ad Account não encontrado ou sem permissão. Verifique o ID e permissões.'
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
      console.log('🔍 [meta-ads-api] Ad Account ID:', config.adAccountId)
      
      const insightsUrl = `https://graph.facebook.com/v18.0/${config.adAccountId}/insights?fields=impressions,clicks,spend,cpm,cpc,ctr&date_preset=last_7d&access_token=${config.accessToken}`
      
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
