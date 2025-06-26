
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

  // Carregar configuração do cliente específico
  useEffect(() => {
    const loadConfig = async () => {
      if (!user?.email) return

      console.log('🔍 [useClienteMetaAds] Carregando config do cliente:', { clienteId, email: user.email })
      
      try {
        // Primeiro, tentar buscar por cliente_id (configuração do gestor)
        let query = supabase
          .from('meta_ads_configs')
          .select('*')

        if (clienteId) {
          query = query.eq('cliente_id', clienteId)
        }

        const { data: configByClienteId, error: errorByClienteId } = await query.single()

        if (configByClienteId && !errorByClienteId) {
          console.log('✅ [useClienteMetaAds] Config encontrada por cliente_id:', configByClienteId)
          setConfig({
            appId: configByClienteId.api_id || '',
            appSecret: configByClienteId.app_secret || '',
            accessToken: configByClienteId.access_token || '',
            adAccountId: configByClienteId.ad_account_id || ''
          })
        } else {
          // Se não encontrou por cliente_id, tentar buscar por email_usuario (configuração do admin)
          console.log('🔍 [useClienteMetaAds] Não encontrou por cliente_id, tentando por email...')
          
          const { data: configByEmail, error: errorByEmail } = await supabase
            .from('meta_ads_configs')
            .select('*')
            .eq('email_usuario', user.email)
            .single()

          if (configByEmail && !errorByEmail) {
            console.log('✅ [useClienteMetaAds] Config encontrada por email:', configByEmail)
            setConfig({
              appId: configByEmail.api_id || '',
              appSecret: configByEmail.app_secret || '',
              accessToken: configByEmail.access_token || '',
              adAccountId: configByEmail.ad_account_id || ''
            })
          } else {
            console.log('📝 [useClienteMetaAds] Nenhuma config encontrada')
          }
        }
      } catch (error) {
        console.error('❌ [useClienteMetaAds] Erro inesperado:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [user?.email, clienteId])

  const saveConfig = async (newConfig: ClienteMetaAdsConfig) => {
    if (!user?.email) return { success: false, error: 'Dados insuficientes' }

    setSaving(true)
    console.log('💾 [useClienteMetaAds] Salvando config do cliente:', clienteId)

    try {
      const { error } = await supabase
        .from('meta_ads_configs')
        .upsert({
          email_usuario: user.email,
          cliente_id: clienteId ? parseInt(clienteId) : null,
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
      console.error('❌ [useClienteMetaAds] Erro inesperado:', error)
      const errorMsg = 'Erro inesperado na conexão'
      setLastError(errorMsg)
      setLastErrorType('NETWORK_ERROR')
      return { success: false, message: errorMsg }
    }
  }

  const fetchCampaigns = async () => {
    console.log('📊 [useClienteMetaAds] Buscando campanhas do cliente:', clienteId)
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

  const fetchInsights = async () => {
    console.log('📈 [useClienteMetaAds] Buscando insights do cliente:', clienteId)
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
