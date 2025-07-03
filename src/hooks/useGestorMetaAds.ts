
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

interface GestorMetaAdsConfig {
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

export function useGestorMetaAds() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [config, setConfig] = useState<GestorMetaAdsConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [fetchingInsights, setFetchingInsights] = useState(false)
  const [insights, setInsights] = useState<InsightData | null>(null)
  const [lastError, setLastError] = useState<string>('')
  const [connectionSteps, setConnectionSteps] = useState<any>(null)

  const userEmail = user?.email || ''

  // Carregar configuração do gestor
  useEffect(() => {
    const loadConfig = async () => {
      if (!userEmail) {
        setLoading(false)
        return
      }

      console.log('🔍 [useGestorMetaAds] Carregando config do gestor:', userEmail)
      
      try {
        const { data, error } = await supabase
          .from('meta_ads_configs')
          .select('*')
          .eq('email_usuario', userEmail)
          .is('cliente_id', null)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('❌ [useGestorMetaAds] Erro ao carregar config:', error)
        } else if (data) {
          console.log('✅ [useGestorMetaAds] Config carregada:', data)
          setConfig({
            api_id: data.api_id || '',
            app_secret: data.app_secret || '',
            access_token: data.access_token || '',
            ad_account_id: data.ad_account_id || '',
            email_usuario: data.email_usuario || ''
          })
        } else {
          console.log('📝 [useGestorMetaAds] Nenhuma config encontrada')
        }
      } catch (error) {
        console.error('❌ [useGestorMetaAds] Erro inesperado:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [userEmail])

  const saveConfig = async (newConfig: Omit<GestorMetaAdsConfig, 'email_usuario'>) => {
    if (!userEmail) return { success: false, error: 'Usuário não autenticado' }

    setSaving(true)
    console.log('💾 [useGestorMetaAds] Salvando config do gestor...')

    try {
      const configToSave = {
        email_usuario: userEmail,
        api_id: newConfig.api_id,
        app_secret: newConfig.app_secret,
        access_token: newConfig.access_token,
        ad_account_id: newConfig.ad_account_id,
        cliente_id: null, // Config global do gestor
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('meta_ads_configs')
        .upsert(configToSave)

      if (error) {
        console.error('❌ [useGestorMetaAds] Erro ao salvar:', error)
        toast({
          title: "Erro",
          description: "Falha ao salvar configuração",
          variant: "destructive",
        })
        return { success: false, error: error.message }
      }

      setConfig({ ...newConfig, email_usuario: userEmail })
      console.log('✅ [useGestorMetaAds] Config salva com sucesso')
      
      toast({
        title: "Sucesso",
        description: "Configuração Meta Ads salva com sucesso",
      })
      
      return { success: true }
    } catch (error) {
      console.error('❌ [useGestorMetaAds] Erro inesperado ao salvar:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar configuração",
        variant: "destructive",
      })
      return { success: false, error: 'Erro inesperado' }
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    if (!config) return { success: false, message: 'Configuração não encontrada' }

    console.log('🔗 [useGestorMetaAds] Testando conexão...')
    setTestingConnection(true)
    setLastError('')
    setConnectionSteps(null)
    
    try {
      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'test_connection',
          config: config
        }
      })

      if (error) {
        console.error('❌ [useGestorMetaAds] Erro na edge function:', error)
        const errorMsg = 'Erro na conexão com o servidor'
        setLastError(errorMsg)
        toast({
          title: "Erro",
          description: errorMsg,
          variant: "destructive",
        })
        return { success: false, message: errorMsg }
      }

      console.log('✅ [useGestorMetaAds] Resposta da API:', data)
      
      if (!data.success) {
        setLastError(data.message)
        console.error('❌ [useGestorMetaAds] Teste falhou:', data.message)
        toast({
          title: "Erro na Conexão",
          description: data.message,
          variant: "destructive",
        })
      } else {
        setConnectionSteps(data.steps)
        toast({
          title: "Sucesso",
          description: "Conexão Meta Ads estabelecida com sucesso!",
        })
      }
      
      return data
    } catch (error) {
      console.error('❌ [useGestorMetaAds] Erro inesperado:', error)
      const errorMsg = 'Erro inesperado na conexão'
      setLastError(errorMsg)
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      })
      return { success: false, message: errorMsg }
    } finally {
      setTestingConnection(false)
    }
  }

  const fetchInsightsWithPeriod = async (period: string, startDate?: string, endDate?: string) => {
    if (!config) return { success: false, message: 'Configuração não encontrada' }

    console.log('📈 [useGestorMetaAds] Buscando insights, período:', period)
    setFetchingInsights(true)
    setLastError('')
    
    try {
      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'get_insights',
          config: config,
          period: period,
          startDate: startDate,
          endDate: endDate
        }
      })

      if (error) {
        console.error('❌ [useGestorMetaAds] Erro ao buscar insights:', error)
        const errorMsg = 'Erro ao buscar insights'
        setLastError(errorMsg)
        return { success: false, message: errorMsg }
      }

      if (data.success && data.insights) {
        // Somar todos os insights se houver múltiplos
        const totalInsights = data.insights.reduce((acc: any, insight: any) => ({
          impressions: (parseInt(acc.impressions || '0') + parseInt(insight.impressions || '0')).toString(),
          clicks: (parseInt(acc.clicks || '0') + parseInt(insight.clicks || '0')).toString(),
          spend: (parseFloat(acc.spend || '0') + parseFloat(insight.spend || '0')).toFixed(2),
          cpm: insight.cpm || '0',
          cpc: insight.cpc || '0',
          ctr: insight.ctr || '0',
        }), {
          impressions: '0',
          clicks: '0',
          spend: '0',
          cpm: '0',
          cpc: '0',
          ctr: '0'
        })

        setInsights(totalInsights)
        console.log('✅ [useGestorMetaAds] Insights carregados:', totalInsights)
        return { success: true, period_used: data.period_used }
      } else {
        setLastError(data.message || 'Erro desconhecido')
        console.error('❌ [useGestorMetaAds] Erro nos insights:', data.message)
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('❌ [useGestorMetaAds] Erro inesperado:', error)
      const errorMsg = 'Erro inesperado ao buscar insights'
      setLastError(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setFetchingInsights(false)
    }
  }

  const fetchTodayInsights = async () => {
    return await fetchInsightsWithPeriod('today')
  }

  const refetchConfig = async () => {
    setLoading(true)
    // Recarregar configuração
    if (userEmail) {
      try {
        const { data } = await supabase
          .from('meta_ads_configs')
          .select('*')
          .eq('email_usuario', userEmail)
          .is('cliente_id', null)
          .single()

        if (data) {
          setConfig({
            api_id: data.api_id || '',
            app_secret: data.app_secret || '',
            access_token: data.access_token || '',
            ad_account_id: data.ad_account_id || '',
            email_usuario: data.email_usuario || ''
          })
        }
      } catch (error) {
        console.error('❌ [useGestorMetaAds] Erro ao recarregar config:', error)
      }
    }
    setLoading(false)
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
    fetchInsightsWithPeriod,
    fetchTodayInsights,
    refetchConfig
  }
}
