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
  const [lastError, setLastError] = useState<string>('')
  const [lastErrorType, setLastErrorType] = useState<string>('')
  const [connectionSteps, setConnectionSteps] = useState<any>(null)

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
    console.log('🔗 [useMetaAdsConfig] === INICIANDO TESTE DE CONEXÃO ===')
    setLastError('')
    setLastErrorType('')
    setConnectionSteps(null)
    
    try {
      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'test_connection',
          config: config
        }
      })

      if (error) {
        console.error('❌ [useMetaAdsConfig] Erro na edge function:', error)
        const errorMsg = 'Erro na conexão com o servidor'
        setLastError(errorMsg)
        setLastErrorType('SERVER_ERROR')
        return { success: false, message: errorMsg }
      }

      console.log('✅ [useMetaAdsConfig] Resposta da API:', data)
      
      if (!data.success) {
        setLastError(data.message)
        setLastErrorType(data.errorType || 'UNKNOWN_ERROR')
        console.error('❌ [useMetaAdsConfig] Teste falhou:', data.message)
        
        // Se o Ad Account ID foi corrigido, sugerir atualização
        if (data.suggestedAdAccountId && data.suggestedAdAccountId !== config.adAccountId) {
          return { 
            success: false, 
            message: data.message,
            suggestUpdate: true,
            correctedAdAccountId: data.suggestedAdAccountId
          }
        }
      } else {
        setConnectionSteps(data.steps)
        
        // Se o Ad Account ID foi corrigido automaticamente, sugerir salvar
        if (data.correctedAdAccountId && data.correctedAdAccountId !== config.adAccountId) {
          return { 
            success: true, 
            message: data.message,
            suggestUpdate: true,
            correctedAdAccountId: data.correctedAdAccountId
          }
        }
      }
      
      return data
    } catch (error) {
      console.error('❌ [useMetaAdsConfig] Erro inesperado:', error)
      const errorMsg = 'Erro inesperado na conexão'
      setLastError(errorMsg)
      setLastErrorType('NETWORK_ERROR')
      return { success: false, message: errorMsg }
    }
  }

  const fetchCampaigns = async () => {
    console.log('📊 [useMetaAdsConfig] === BUSCANDO CAMPANHAS ===')
    setLastError('')
    setLastErrorType('')
    
    try {
      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'get_campaigns',
          config: config
        }
      })

      if (error) {
        console.error('❌ [useMetaAdsConfig] Erro ao buscar campanhas:', error)
        const errorMsg = 'Erro ao buscar campanhas'
        setLastError(errorMsg)
        setLastErrorType('SERVER_ERROR')
        return { success: false, message: errorMsg }
      }

      if (data.success) {
        setCampaigns(data.campaigns)
        console.log('✅ [useMetaAdsConfig] Campanhas carregadas:', data.campaigns.length)
      } else {
        setLastError(data.message)
        setLastErrorType('API_ERROR')
        console.error('❌ [useMetaAdsConfig] Erro nas campanhas:', data.message)
      }

      return data
    } catch (error) {
      console.error('❌ [useMetaAdsConfig] Erro inesperado:', error)
      const errorMsg = 'Erro inesperado ao buscar campanhas'
      setLastError(errorMsg)
      setLastErrorType('NETWORK_ERROR')
      return { success: false, message: errorMsg }
    }
  }

  const fetchInsights = async () => {
    console.log('📈 [useMetaAdsConfig] === BUSCANDO INSIGHTS ===')
    setLastError('')
    setLastErrorType('')
    
    try {
      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'get_insights',
          config: config
        }
      })

      if (error) {
        console.error('❌ [useMetaAdsConfig] Erro ao buscar insights:', error)
        const errorMsg = 'Erro ao buscar insights'
        setLastError(errorMsg)
        setLastErrorType('SERVER_ERROR')
        return { success: false, message: errorMsg }
      }

      if (data.success) {
        setInsights(data.insights)
        console.log('✅ [useMetaAdsConfig] Insights carregados:', data.insights.length)
      } else {
        setLastError(data.message)
        setLastErrorType('API_ERROR')
        console.error('❌ [useMetaAdsConfig] Erro nos insights:', data.message)
      }

      return data
    } catch (error) {
      console.error('❌ [useMetaAdsConfig] Erro inesperado:', error)
      const errorMsg = 'Erro inesperado ao buscar insights'
      setLastError(errorMsg)
      setLastErrorType('NETWORK_ERROR')
      return { success: false, message: errorMsg }
    }
  }

  const updateAdAccountId = async (newAdAccountId: string) => {
    const newConfig = { ...config, adAccountId: newAdAccountId }
    setConfig(newConfig)
    return await saveConfig(newConfig)
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
    isConfigured,
    lastError,
    lastErrorType,
    connectionSteps,
    updateAdAccountId
  }
}
