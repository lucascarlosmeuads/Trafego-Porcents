
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

interface AdminMetaAdsConfig {
  api_id: string
  app_secret: string
  access_token: string
  ad_account_id: string
  email_usuario: string
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

export function useAdminMetaAds() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [config, setConfig] = useState<AdminMetaAdsConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [fetchingInsights, setFetchingInsights] = useState(false)
  const [insights, setInsights] = useState<InsightData | null>(null)
  const [lastError, setLastError] = useState<string>('')
  const [connectionSteps, setConnectionSteps] = useState<any>(null)

  // Carregar configuração GLOBAL do admin
  const loadConfig = useCallback(async () => {
    if (!user?.email) {
      setLoading(false)
      return
    }

    console.log('🔍 [useAdminMetaAds] Carregando config GLOBAL do admin:', user.email)
    
    try {
      // Buscar APENAS configuração global (cliente_id = NULL)
      const { data: configData, error } = await supabase
        .from('meta_ads_configs')
        .select('*')
        .eq('email_usuario', user.email)
        .is('cliente_id', null)  // IMPORTANTE: Apenas configs globais
        .maybeSingle()

      if (error) {
        console.error('❌ [useAdminMetaAds] Erro ao carregar config:', error)
        setLastError('Erro ao carregar configuração')
      } else if (configData) {
        setConfig({
          api_id: configData.api_id,
          app_secret: configData.app_secret,
          access_token: configData.access_token,
          ad_account_id: configData.ad_account_id,
          email_usuario: configData.email_usuario
        })
        console.log('✅ [useAdminMetaAds] Config global carregada')
      } else {
        console.log('📝 [useAdminMetaAds] Nenhuma config global encontrada')
        setConfig(null)
      }
    } catch (error) {
      console.error('❌ [useAdminMetaAds] Erro inesperado:', error)
      setLastError('Erro inesperado ao carregar configuração')
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  const refetchConfig = useCallback(() => {
    setLoading(true)
    loadConfig()
  }, [loadConfig])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  // Salvar configuração GLOBAL
  const saveConfig = async (newConfig: Omit<AdminMetaAdsConfig, 'email_usuario'>) => {
    if (!user?.email) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      })
      return { success: false }
    }

    setSaving(true)
    setLastError('')
    
    try {
      console.log('💾 [useAdminMetaAds] Salvando config GLOBAL...')
      
      // Upsert com cliente_id = NULL (configuração global)
      const { error } = await supabase
        .from('meta_ads_configs')
        .upsert({
          email_usuario: user.email,
          cliente_id: null, // IMPORTANTE: Config global
          api_id: newConfig.api_id,
          app_secret: newConfig.app_secret,
          access_token: newConfig.access_token,
          ad_account_id: newConfig.ad_account_id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email_usuario',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('❌ [useAdminMetaAds] Erro ao salvar:', error)
        toast({
          title: "Erro",
          description: "Falha ao salvar configuração",
          variant: "destructive",
        })
        return { success: false }
      }

      setConfig({
        ...newConfig,
        email_usuario: user.email
      })

      toast({
        title: "Sucesso!",
        description: "Configuração Meta Ads global salva com sucesso",
      })

      console.log('✅ [useAdminMetaAds] Config global salva com sucesso')
      return { success: true }

    } catch (error) {
      console.error('❌ [useAdminMetaAds] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar configuração",
        variant: "destructive",
      })
      return { success: false }
    } finally {
      setSaving(false)
    }
  }

  // Testar conexão
  const testConnection = async () => {
    if (!config) return { success: false, message: 'Configuração necessária' }

    setTestingConnection(true)
    setLastError('')
    setConnectionSteps(null)
    
    try {
      console.log('🔗 [useAdminMetaAds] Testando conexão...')
      
      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'test_connection',
          config: {
            appId: config.api_id,
            appSecret: config.app_secret,
            accessToken: config.access_token,
            adAccountId: config.ad_account_id
          }
        }
      })

      if (error) {
        console.error('❌ [useAdminMetaAds] Erro na edge function:', error)
        const errorMsg = 'Erro na conexão com o servidor'
        setLastError(errorMsg)
        return { success: false, message: errorMsg }
      }

      if (!data?.success) {
        setLastError(data?.message || 'Erro na conexão')
        console.error('❌ [useAdminMetaAds] Teste falhou:', data?.message)
      } else {
        setConnectionSteps(data.steps)
        console.log('✅ [useAdminMetaAds] Conexão testada com sucesso')
      }
      
      return data
    } catch (error) {
      console.error('❌ [useAdminMetaAds] Erro inesperado:', error)
      const errorMsg = 'Erro inesperado na conexão'
      setLastError(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setTestingConnection(false)
    }
  }

  // Buscar insights hoje
  const fetchTodayInsights = async () => {
    if (!config) return { success: false, message: 'Configuração necessária' }

    setFetchingInsights(true)
    setLastError('')
    
    try {
      console.log('📊 [useAdminMetaAds] Buscando insights de hoje...')
      
      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'get_insights',
          config: {
            appId: config.api_id,
            appSecret: config.app_secret,
            accessToken: config.access_token,
            adAccountId: config.ad_account_id
          },
          period: 'today'
        }
      })

      if (error) {
        console.error('❌ [useAdminMetaAds] Erro ao buscar insights:', error)
        const errorMsg = 'Erro ao buscar insights'
        setLastError(errorMsg)
        return { success: false, message: errorMsg }
      }

      if (data?.success && data.insights?.length > 0) {
        // Somar todos os insights do dia
        const totalInsights = data.insights.reduce((acc: any, insight: any) => ({
          impressions: (parseInt(acc.impressions || '0') + parseInt(insight.impressions || '0')).toString(),
          clicks: (parseInt(acc.clicks || '0') + parseInt(insight.clicks || '0')).toString(),
          spend: (parseFloat(acc.spend || '0') + parseFloat(insight.spend || '0')).toFixed(2),
          cpm: '0', // Será recalculado
          cpc: '0', // Será recalculado
          ctr: '0'  // Será recalculado
        }), {
          impressions: '0',
          clicks: '0',
          spend: '0',
          cpm: '0',
          cpc: '0',
          ctr: '0'
        })

        // Recalcular métricas
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

        setInsights(totalInsights)
        console.log('✅ [useAdminMetaAds] Insights carregados:', totalInsights)
      } else {
        setLastError(data?.message || 'Nenhum insight encontrado')
        console.log('📊 [useAdminMetaAds] Nenhum insight encontrado')
      }

      return data
    } catch (error) {
      console.error('❌ [useAdminMetaAds] Erro inesperado:', error)
      const errorMsg = 'Erro inesperado ao buscar insights'
      setLastError(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setFetchingInsights(false)
    }
  }

  // Buscar insights com período
  const fetchInsightsWithPeriod = async (period: 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'custom', startDate?: string, endDate?: string) => {
    if (!config) return { success: false, message: 'Configuração necessária' }

    setFetchingInsights(true)
    setLastError('')
    
    try {
      console.log('📊 [useAdminMetaAds] Buscando insights, período:', period)
      
      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'get_insights',
          config: {
            appId: config.api_id,
            appSecret: config.app_secret,
            accessToken: config.access_token,
            adAccountId: config.ad_account_id
          },
          period,
          startDate,
          endDate
        }
      })

      if (error) {
        console.error('❌ [useAdminMetaAds] Erro ao buscar insights:', error)
        const errorMsg = 'Erro ao buscar insights'
        setLastError(errorMsg)
        return { success: false, message: errorMsg }
      }

      if (data?.success && data.insights?.length > 0) {
        // Somar todos os insights do período
        const totalInsights = data.insights.reduce((acc: any, insight: any) => ({
          impressions: (parseInt(acc.impressions || '0') + parseInt(insight.impressions || '0')).toString(),
          clicks: (parseInt(acc.clicks || '0') + parseInt(insight.clicks || '0')).toString(),
          spend: (parseFloat(acc.spend || '0') + parseFloat(insight.spend || '0')).toFixed(2),
          cpm: '0',
          cpc: '0',
          ctr: '0'
        }), {
          impressions: '0',
          clicks: '0',
          spend: '0',
          cpm: '0',
          cpc: '0',
          ctr: '0'
        })

        // Recalcular métricas
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

        setInsights(totalInsights)
        console.log('✅ [useAdminMetaAds] Insights carregados:', totalInsights)
      } else {
        setInsights(null)
        setLastError(data?.message || 'Nenhum insight encontrado para o período')
        console.log('📊 [useAdminMetaAds] Nenhum insight encontrado')
      }

      return data
    } catch (error) {
      console.error('❌ [useAdminMetaAds] Erro inesperado:', error)
      const errorMsg = 'Erro inesperado ao buscar insights'
      setLastError(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setFetchingInsights(false)
    }
  }

  const isConfigured = config && config.api_id && config.app_secret && config.access_token && config.ad_account_id

  return {
    config,
    loading,
    saving,
    testingConnection,
    fetchingInsights,
    insights,
    lastError,
    connectionSteps,
    isConfigured,
    saveConfig,
    testConnection,
    fetchTodayInsights,
    fetchInsightsWithPeriod,
    refetchConfig
  }
}
