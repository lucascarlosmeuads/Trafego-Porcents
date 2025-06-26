
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface ClienteMetaAdsConfig {
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
  date_start?: string
  date_stop?: string
}

export function useClienteMetaAds(clienteId: string) {
  const { user } = useAuth()
  const [config, setConfig] = useState<ClienteMetaAdsConfig>({
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
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })

  // Carregar configuração do cliente específico
  useEffect(() => {
    const loadConfig = async () => {
      if (!clienteId) {
        setLoading(false)
        return
      }

      console.log('🔍 [useClienteMetaAds] Carregando config do cliente:', { clienteId })
      
      try {
        // Primeiro, tentar buscar configuração específica do cliente
        let { data: configData, error } = await supabase
          .from('meta_ads_configs')
          .select('*')
          .eq('cliente_id', parseInt(clienteId))
          .single()

        // Se não encontrou configuração específica, buscar configuração global do gestor
        if (error || !configData) {
          console.log('🔍 [useClienteMetaAds] Buscando config global do gestor...')
          
          // Buscar o email do gestor do cliente
          const { data: clienteData } = await supabase
            .from('todos_clientes')
            .select('email_gestor')
            .eq('id', parseInt(clienteId))
            .single()

          if (clienteData?.email_gestor) {
            const { data: globalConfig, error: globalError } = await supabase
              .from('meta_ads_configs')
              .select('*')
              .eq('email_usuario', clienteData.email_gestor)
              .is('cliente_id', null)
              .single()

            if (!globalError && globalConfig) {
              configData = globalConfig
              console.log('✅ [useClienteMetaAds] Config global encontrada:', globalConfig)
            }
          }
        } else {
          console.log('✅ [useClienteMetaAds] Config específica encontrada:', configData)
        }

        if (configData) {
          setConfig({
            appId: configData.api_id || '',
            appSecret: configData.app_secret || '',
            accessToken: configData.access_token || '',
            adAccountId: configData.ad_account_id || ''
          })
        } else {
          console.log('📝 [useClienteMetaAds] Nenhuma config encontrada')
        }
      } catch (error) {
        console.error('❌ [useClienteMetaAds] Erro inesperado:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [clienteId])

  const saveConfig = async (newConfig: ClienteMetaAdsConfig) => {
    if (!clienteId) return { success: false, error: 'Cliente ID necessário' }

    setSaving(true)
    console.log('💾 [useClienteMetaAds] Salvando config do cliente:', clienteId)

    try {
      const { error } = await supabase
        .from('meta_ads_configs')
        .upsert({
          cliente_id: parseInt(clienteId),
          email_usuario: user?.email || '',
          api_id: newConfig.appId,
          app_secret: newConfig.appSecret,
          access_token: newConfig.accessToken,
          ad_account_id: newConfig.adAccountId,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('❌ [useClienteMetaAds] Erro ao salvar:', error)
        return { success: false, error: error.message }
      }

      setConfig(newConfig)
      console.log('✅ [useClienteMetaAds] Config salva com sucesso')
      return { success: true }
    } catch (error) {
      console.error('❌ [useClienteMetaAds] Erro inesperado ao salvar:', error)
      return { success: false, error: 'Erro inesperado' }
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    console.log('🔗 [useClienteMetaAds] Testando conexão do cliente:', clienteId)
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
        console.error('❌ [useClienteMetaAds] Erro na edge function:', error)
        const errorMsg = 'Erro na conexão com o servidor'
        setLastError(errorMsg)
        setLastErrorType('SERVER_ERROR')
        return { success: false, message: errorMsg }
      }

      console.log('✅ [useClienteMetaAds] Resposta da API:', data)
      
      if (!data.success) {
        setLastError(data.message)
        setLastErrorType(data.errorType || 'UNKNOWN_ERROR')
        console.error('❌ [useClienteMetaAds] Teste falhou:', data.message)
      } else {
        setConnectionSteps(data.steps)
      }
      
      return data
    } catch (error) {
      console.error('❌ [useClienteMetaAds] Erro inesperado:', error)
      const errorMsg = 'Erro inesperado na conexão'
      setLastError(errorMsg)
      setLastErrorType('NETWORK_ERROR')
      return { success: false, message: errorMsg }
    }
  }

  const fetchCampaigns = async (startDate?: string, endDate?: string) => {
    console.log('📊 [useClienteMetaAds] Buscando campanhas do cliente:', clienteId)
    setLastError('')
    setLastErrorType('')
    
    try {
      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'get_campaigns',
          config: config,
          startDate,
          endDate
        }
      })

      if (error) {
        console.error('❌ [useClienteMetaAds] Erro ao buscar campanhas:', error)
        const errorMsg = 'Erro ao buscar campanhas'
        setLastError(errorMsg)
        setLastErrorType('SERVER_ERROR')
        return { success: false, message: errorMsg }
      }

      if (data.success) {
        setCampaigns(data.campaigns)
        console.log('✅ [useClienteMetaAds] Campanhas carregadas:', data.campaigns.length)
      } else {
        setLastError(data.message)
        setLastErrorType('API_ERROR')
        console.error('❌ [useClienteMetaAds] Erro nas campanhas:', data.message)
      }

      return data
    } catch (error) {
      console.error('❌ [useClienteMetaAds] Erro inesperado:', error)
      const errorMsg = 'Erro inesperado ao buscar campanhas'
      setLastError(errorMsg)
      setLastErrorType('NETWORK_ERROR')
      return { success: false, message: errorMsg }
    }
  }

  const fetchInsights = async (startDate?: string, endDate?: string) => {
    console.log('📈 [useClienteMetaAds] Buscando insights do cliente:', clienteId)
    setLastError('')
    setLastErrorType('')
    
    try {
      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'get_insights',
          config: config,
          startDate,
          endDate
        }
      })

      if (error) {
        console.error('❌ [useClienteMetaAds] Erro ao buscar insights:', error)
        const errorMsg = 'Erro ao buscar insights'
        setLastError(errorMsg)
        setLastErrorType('SERVER_ERROR')
        return { success: false, message: errorMsg }
      }

      if (data.success) {
        setInsights(data.insights)
        console.log('✅ [useClienteMetaAds] Insights carregados:', data.insights.length)
      } else {
        setLastError(data.message)
        setLastErrorType('API_ERROR')
        console.error('❌ [useClienteMetaAds] Erro nos insights:', data.message)
      }

      return data
    } catch (error) {
      console.error('❌ [useClienteMetaAds] Erro inesperado:', error)
      const errorMsg = 'Erro inesperado ao buscar insights'
      setLastError(errorMsg)
      setLastErrorType('NETWORK_ERROR')
      return { success: false, message: errorMsg }
    }
  }

  const fetchDataWithDateRange = async (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate })
    await Promise.all([
      fetchCampaigns(startDate, endDate),
      fetchInsights(startDate, endDate)
    ])
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
    fetchDataWithDateRange,
    campaigns,
    insights,
    isConfigured,
    lastError,
    lastErrorType,
    connectionSteps,
    updateAdAccountId,
    dateRange
  }
}
