
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
      console.log('🔗 [meta-ads-api] Testando conexão com Meta Ads...')
      
      // Test basic API connection
      const testUrl = `https://graph.facebook.com/v18.0/me?access_token=${config.accessToken}`
      
      const response = await fetch(testUrl)
      const data = await response.json()
      
      if (response.ok && data.id) {
        console.log('✅ [meta-ads-api] Conexão bem-sucedida:', data)
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Conexão com Meta Ads realizada com sucesso!',
            user: data
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        console.error('❌ [meta-ads-api] Erro na conexão:', data)
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: data.error?.message || 'Erro ao conectar com Meta Ads'
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    if (action === 'get_campaigns') {
      console.log('📊 [meta-ads-api] Buscando campanhas...')
      
      const campaignsUrl = `https://graph.facebook.com/v18.0/${config.adAccountId}/campaigns?fields=id,name,status,objective,created_time&access_token=${config.accessToken}`
      
      const response = await fetch(campaignsUrl)
      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ [meta-ads-api] Campanhas encontradas:', data.data?.length || 0)
        return new Response(
          JSON.stringify({ 
            success: true, 
            campaigns: data.data || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        console.error('❌ [meta-ads-api] Erro ao buscar campanhas:', data)
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: data.error?.message || 'Erro ao buscar campanhas'
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    if (action === 'get_insights') {
      console.log('📈 [meta-ads-api] Buscando insights...')
      
      const insightsUrl = `https://graph.facebook.com/v18.0/${config.adAccountId}/insights?fields=impressions,clicks,spend,cpm,cpc,ctr&date_preset=last_7d&access_token=${config.accessToken}`
      
      const response = await fetch(insightsUrl)
      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ [meta-ads-api] Insights encontrados:', data.data?.length || 0)
        return new Response(
          JSON.stringify({ 
            success: true, 
            insights: data.data || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        console.error('❌ [meta-ads-api] Erro ao buscar insights:', data)
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: data.error?.message || 'Erro ao buscar insights'
          }),
          { 
            status: 400,
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
