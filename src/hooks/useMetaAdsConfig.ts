import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface MetaAdsConfig {
  appId: string
  appSecret: string
  accessToken: string
  adAccountId: string
}

interface CampaignData {
  id: string
  name: string
  status: string
  objective: string
  created_time: string
}

interface InsightData {
  impressions: string
  clicks: string
  spend: string
  cpm: string
  cpc: string
  ctr: string
}

export function useMetaAdsConfig() {
  const { user } = useAuth()
  const [config, setConfig] = useState<MetaAdsConfig>({
    appId: '',
    appSecret: '',
    accessToken: '',
    adAccountId: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [campaigns, setCampaigns] = useState<CampaignData[]>([])
  const [insights, setInsights] = useState<InsightData[]>([])

  // Carregar configuração existente
  useEffect(() => {
    const loadConfig = async () => {
      if (!user?.email) return

      console.log('🔍 [useMetaAdsConfig] Carregando configuração para:', user.email)
      
      try {
        const { data, error } = await supabase
          .from('meta_ads_configs')
          .select('*')
          .eq('email_usuario', user.email)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('❌ [useMetaAdsConfig] Erro ao carregar configuração:', error)
        } else if (data) {
          console.log('✅ [useMetaAdsConfig] Configuração carregada:', data)
          setConfig({
            appId: data.api_id || '',
            appSecret: data.app_secret || '',
            accessToken: data.access_token || '',
            adAccountId: data.ad_account_id || ''
          })
        } else {
          console.log('📝 [useMetaAdsConfig] Nenhuma configuração encontrada')
        }
      } catch (error) {
        console.error('❌ [useMetaAdsConfig] Erro inesperado:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [user?.email])

  const saveConfig = async (newConfig: MetaAdsConfig) => {
    if (!user?.email) return { success: false, error: 'Usuário não autenticado' }

    setSaving(true)
    console.log('💾 [useMetaAdsConfig] Salvando configuração...')

    try {
      const { error } = await supabase
        .from('meta_ads_configs')
        .upsert({
          email_usuario: user.email,
          api_id: newConfig.appId,
          app_secret: newConfig.appSecret,
          access_token: newConfig.accessToken,
          ad_account_id: newConfig.adAccountId,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('❌ [useMetaAdsConfig] Erro ao salvar:', error)
        return { success: false, error: error.message }
      }

      setConfig(newConfig)
      console.log('✅ [useMetaAdsConfig] Configuração salva com sucesso')
      return { success: true }
    } catch (error) {
      console.error('❌ [useMetaAdsConfig] Erro inesperado ao salvar:', error)
      return { success: false, error: 'Erro inesperado' }
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    console.log('🔗 [useMetaAdsConfig] Testando conexão real com Meta Ads...')
    
    try {
      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'test_connection',
          config: config
        }
      })

      if (error) {
        console.error('❌ [useMetaAdsConfig] Erro na edge function:', error)
        return { success: false, message: 'Erro na conexão com o servidor' }
      }

      console.log('✅ [useMetaAdsConfig] Resposta da API:', data)
      return data
    } catch (error) {
      console.error('❌ [useMetaAdsConfig] Erro inesperado:', error)
      return { success: false, message: 'Erro inesperado na conexão' }
    }
  }

  const fetchCampaigns = async () => {
    console.log('📊 [useMetaAdsConfig] Buscando campanhas...')
    
    try {
      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'get_campaigns',
          config: config
        }
      })

      if (error) {
        console.error('❌ [useMetaAdsConfig] Erro ao buscar campanhas:', error)
        return { success: false, message: 'Erro ao buscar campanhas' }
      }

      if (data.success) {
        setCampaigns(data.campaigns)
        console.log('✅ [useMetaAdsConfig] Campanhas carregadas:', data.campaigns.length)
      }

      return data
    } catch (error) {
      console.error('❌ [useMetaAdsConfig] Erro inesperado:', error)
      return { success: false, message: 'Erro inesperado ao buscar campanhas' }
    }
  }

  const fetchInsights = async () => {
    console.log('📈 [useMetaAdsConfig] Buscando insights...')
    
    try {
      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'get_insights',
          config: config
        }
      })

      if (error) {
        console.error('❌ [useMetaAdsConfig] Erro ao buscar insights:', error)
        return { success: false, message: 'Erro ao buscar insights' }
      }

      if (data.success) {
        setInsights(data.insights)
        console.log('✅ [useMetaAdsConfig] Insights carregados:', data.insights.length)
      }

      return data
    } catch (error) {
      console.error('❌ [useMetaAdsConfig] Erro inesperado:', error)
      return { success: false, message: 'Erro inesperado ao buscar insights' }
    }
  }

  const isConfigured = config.appId && config.appSecret && config.accessToken && config.adAccountId

  return {
    config,
    setConfig,
    loading,
    saving,
    saveConfig,
    testConnection,
    fetchCampaigns,
    fetchInsights,
    campaigns,
    insights,
    isConfigured
  }
}
