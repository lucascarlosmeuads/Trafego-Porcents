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

// CORREÇÃO: Função para obter data no timezone brasileiro
const getBrazilianDate = (offsetDays: number = 0): string => {
  const now = new Date()
  // Aplicar offset de -3 horas (UTC-3 = Brasil)
  const brazilTime = new Date(now.getTime() - (3 * 60 * 60 * 1000))
  
  if (offsetDays !== 0) {
    brazilTime.setDate(brazilTime.getDate() + offsetDays)
  }
  
  return brazilTime.toISOString().split('T')[0]
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

    const { action, config, startDate, endDate, date_preset } = await req.json()

    console.log('🔍 [meta-ads-api] Requisição recebida:', { action, date_preset, startDate, endDate, user_email: user.email })

    if (action === 'test_connection') {
      console.log('🔗 [meta-ads-api] === TESTE DE CONEXÃO DETALHADO ===')
      console.log('🔍 [meta-ads-api] Config recebida:', { 
        appId: config.appId, 
        adAccountId: config.adAccountId 
        // Não loggar tokens por segurança
      })
      
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

        // CORREÇÃO: Retornar a estrutura correta esperada pelo frontend
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: '🎉 Conexão com Meta Ads realizada com sucesso!',
            user: data,
            adAccount: adAccountData,
            correctedAdAccountId: adAccountId !== config.adAccountId ? adAccountId : null,
            connection_steps: {
              validation: 'OK',
              basic_connection: 'OK',
              ad_account_access: 'OK',
              campaigns_access: 'OK'
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

    if (action === 'get_insights') {
      console.log('📈 [meta-ads-api] === BUSCANDO INSIGHTS ===')
      console.log('📅 [meta-ads-api] Parâmetros recebidos:', { date_preset, startDate, endDate })
      
      let adAccountId = config.adAccountId.trim()
      if (!adAccountId.startsWith('act_')) {
        adAccountId = `act_${adAccountId}`
      }
      
      // CORREÇÃO: Lógica com timezone brasileiro correto
      let timeRange = ''
      let periodName = ''
      
      if (startDate && endDate) {
        // Período customizado
        timeRange = `{"since":"${startDate}","until":"${endDate}"}`
        periodName = `${startDate} até ${endDate}`
        console.log('📅 [meta-ads-api] Usando período customizado:', periodName)
      } else if (date_preset) {
        // CORREÇÃO: Usar timezone brasileiro para cálculo das datas
        const hoje = getBrazilianDate(0) // Hoje no Brasil
        const ontem = getBrazilianDate(-1) // Ontem no Brasil
        
        console.log('🇧🇷 [meta-ads-api] Datas brasileiras calculadas:', { hoje, ontem })
        
        switch (date_preset) {
          case 'today':
            timeRange = `{"since":"${hoje}","until":"${hoje}"}`
            periodName = `hoje (${hoje})`
            break
          case 'yesterday':
            timeRange = `{"since":"${ontem}","until":"${ontem}"}`
            periodName = `ontem (${ontem})`
            break
          case 'last_7_days':
            const seteDiasAtras = getBrazilianDate(-7)
            timeRange = `{"since":"${seteDiasAtras}","until":"${hoje}"}`
            periodName = `últimos 7 dias (${seteDiasAtras} até ${hoje})`
            break
          case 'last_30_days':
            const trintaDiasAtras = getBrazilianDate(-30)
            timeRange = `{"since":"${trintaDiasAtras}","until":"${hoje}"}`
            periodName = `últimos 30 dias (${trintaDiasAtras} até ${hoje})`
            break
          default:
            timeRange = `{"since":"${hoje}","until":"${hoje}"}`
            periodName = `hoje (${hoje})`
        }
        console.log('📅 [meta-ads-api] Período brasileiro calculado:', periodName)
      } else {
        // Fallback para hoje (horário brasileiro)
        const hoje = getBrazilianDate(0)
        timeRange = `{"since":"${hoje}","until":"${hoje}"}`
        periodName = `hoje (${hoje})`
        console.log('📅 [meta-ads-api] Fallback para hoje (Brasil):', periodName)
      }

      console.log('🔍 [meta-ads-api] Buscando dados para período:', periodName)
      
      const insightsUrl = `https://graph.facebook.com/v18.0/${adAccountId}/insights?fields=impressions,clicks,spend,cpm,cpc,ctr&access_token=${config.accessToken}&time_range=${timeRange}`
      
      console.log('🌐 [meta-ads-api] Fazendo chamada para Meta API:', insightsUrl.replace(config.accessToken, '[TOKEN_HIDDEN]'))

      try {
        const response = await fetch(insightsUrl)
        const data = await response.json()
        
        console.log('📊 [meta-ads-api] Resposta da Meta API:', {
          ok: response.ok,
          status: response.status,
          data_length: data?.data?.length || 0,
          error: data?.error || null
        })
        
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
              details: data,
              period_used: periodName
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        if (data.data && data.data.length > 0) {
          // Processar e somar os insights
          const totalInsights = data.data.reduce((acc: any, insight: any) => {
            console.log(`💰 [meta-ads-api] Processando insight: spend=${insight.spend}, impressions=${insight.impressions}, clicks=${insight.clicks}`)
            
            return {
              impressions: (parseInt(acc.impressions || '0') + parseInt(insight.impressions || '0')).toString(),
              clicks: (parseInt(acc.clicks || '0') + parseInt(insight.clicks || '0')).toString(),
              spend: (parseFloat(acc.spend || '0') + parseFloat(insight.spend || '0')).toFixed(2),
              cpm: '0',
              cpc: '0', 
              ctr: '0'
            }
          }, {
            impressions: '0',
            clicks: '0',
            spend: '0',
            cpm: '0',
            cpc: '0',
            ctr: '0'
          })

          // Recalcular métricas derivadas
          const impressions = parseInt(totalInsights.impressions)
          const clicks = parseInt(totalInsights.clicks)
          const spend = parseFloat(totalInsights.spend)

          if (impressions > 0) {
            totalInsights.cpm = (spend / impressions * 1000).toFixed(2)
            totalInsights.ctr = (clicks / impressions * 100).toFixed(2)
          }
          if (clicks > 0) {
            totalInsights.cpc = (spend / clicks).toFixed(2)
          }

          console.log('✅ [meta-ads-api] Insights processados com sucesso:', {
            period: periodName,
            campaigns_count: data.data.length,
            total_spend: totalInsights.spend,
            total_impressions: totalInsights.impressions,
            total_clicks: totalInsights.clicks
          })

          return new Response(
            JSON.stringify({ 
              success: true, 
              insights: [totalInsights], // Retornar como array para compatibilidade
              period_used: periodName,
              campaigns_count: data.data.length,
              raw_campaigns: data.data.length // Para transparência
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          console.log('⚠️ [meta-ads-api] Nenhum insight encontrado para o período:', periodName)
          
          // Verificar se há campanhas ativas para dar contexto
          const campaignsUrl = `https://graph.facebook.com/v18.0/${adAccountId}/campaigns?fields=id,name,status&limit=5&access_token=${config.accessToken}`
          
          try {
            const campaignsResponse = await fetch(campaignsUrl)
            const campaignsData = await campaignsResponse.json()
            
            console.log('🔍 [meta-ads-api] Verificação de campanhas:', {
              ok: campaignsResponse.ok,
              campaigns_count: campaignsData?.data?.length || 0
            })
            
            let suggestion = `Nenhum dado encontrado para ${periodName}`
            if (campaignsData.data && campaignsData.data.length > 0) {
              const activeCampaigns = campaignsData.data.filter(c => c.status === 'ACTIVE')
              if (activeCampaigns.length === 0) {
                suggestion = `Sem dados para ${periodName}. Você tem campanhas criadas, mas nenhuma está ativa. Ative suas campanhas no Facebook Ads Manager.`
              } else {
                suggestion = `Sem dados para ${periodName}. Você tem ${activeCampaigns.length} campanha(s) ativa(s), mas sem gastos no período solicitado.`
              }
            } else {
              suggestion = `Sem dados para ${periodName}. Não há campanhas criadas neste Ad Account.`
            }

            return new Response(
              JSON.stringify({ 
                success: false, 
                message: suggestion,
                insights: [],
                period_used: periodName,
                campaigns_info: {
                  total: campaignsData.data?.length || 0,
                  active: campaignsData.data?.filter(c => c.status === 'ACTIVE')?.length || 0
                }
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          } catch (error) {
            console.error('❌ [meta-ads-api] Erro ao verificar campanhas:', error)
            return new Response(
              JSON.stringify({ 
                success: false, 
                message: `Nenhum dado encontrado para ${periodName}. Verifique se há campanhas ativas no Facebook Ads Manager.`,
                insights: [],
                period_used: periodName
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }

      } catch (error) {
        console.error('❌ [meta-ads-api] Erro inesperado ao buscar insights:', error)
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Erro inesperado: ${error.message}`,
            period_used: periodName
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
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
