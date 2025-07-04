
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

interface ClienteMetaAdsConfig {
  appId: string
  appSecret: string
  accessToken: string
  adAccountId: string
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

export function useClienteMetaAdsSimplified(clienteId: string) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [config, setConfig] = useState<ClienteMetaAdsConfig>({
    appId: '',
    appSecret: '',
    accessToken: '',
    adAccountId: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [insights, setInsights] = useState<InsightData[]>([])
  const [lastError, setLastError] = useState<string>('')
  const [connectionSteps, setConnectionSteps] = useState<any>(null)
  const [isConfigured, setIsConfigured] = useState(false)

  // Carregar configuração
  const loadConfig = useCallback(async () => {
    if (!clienteId) {
      setLoading(false)
      return
    }

    console.log('🔍 Carregando config do cliente:', clienteId)
    
    try {
      const { data: configData, error } = await supabase
        .from('meta_ads_configs')
        .select('*')
        .eq('cliente_id', parseInt(clienteId))
        .eq('email_usuario', user?.email || '')
        .maybeSingle()

      if (error) {
        console.error('❌ Erro ao carregar config:', error)
        setLastError('Erro ao carregar configuração')
      } else if (configData) {
        const newConfig = {
          appId: configData.api_id || '',
          appSecret: configData.app_secret || '',
          accessToken: configData.access_token || '',
          adAccountId: configData.ad_account_id || ''
        }
        setConfig(newConfig)
        setIsConfigured(newConfig.appId && newConfig.appSecret && newConfig.accessToken && newConfig.adAccountId)
        console.log('✅ Config carregada:', newConfig)
      } else {
        console.log('📝 Nenhuma config encontrada')
        setIsConfigured(false)
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error)
      setLastError('Erro inesperado ao carregar configuração')
    } finally {
      setLoading(false)
    }
  }, [clienteId, user?.email])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  // Salvar e testar configuração
  const saveAndTestConfig = async (newConfig: ClienteMetaAdsConfig) => {
    if (!clienteId || !user?.email) {
      toast({
        title: "Erro",
        description: "Cliente ID ou usuário necessário",
        variant: "destructive",
      })
      return { success: false }
    }

    setSaving(true)
    setTesting(true)
    setLastError('')
    
    try {
      console.log('💾 Salvando config via upsert...')
      const { error: saveError } = await supabase
        .from('meta_ads_configs')
        .upsert({
          cliente_id: parseInt(clienteId),
          email_usuario: user.email,
          api_id: newConfig.appId,
          app_secret: newConfig.appSecret,
          access_token: newConfig.accessToken,
          ad_account_id: newConfig.adAccountId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'cliente_id,email_usuario'
        })

      if (saveError) {
        console.error('❌ Erro ao salvar:', saveError)
        toast({
          title: "Erro",
          description: `Falha ao salvar configuração: ${saveError.message}`,
          variant: "destructive",
        })
        return { success: false }
      }

      console.log('🔗 Testando conexão...')
      const { data: testData, error: testError } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'test_connection',
          config: newConfig
        }
      })

      if (testError || !testData?.success) {
        const errorMsg = testData?.message || 'Erro na conexão'
        setLastError(errorMsg)
        toast({
          title: "Erro na Conexão",
          description: errorMsg,
          variant: "destructive",
        })
        return { success: false }
      }

      setConfig(newConfig)
      setIsConfigured(true)
      setConnectionSteps(testData.steps)
      
      toast({
        title: "Sucesso!",
        description: "Configuração Meta Ads salva e testada com sucesso",
      })

      console.log('✅ Config salva e testada com sucesso')
      return { success: true }

    } catch (error) {
      console.error('❌ Erro inesperado:', error)
      const errorMsg = 'Erro inesperado'
      setLastError(errorMsg)
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      })
      return { success: false }
    } finally {
      setSaving(false)
      setTesting(false)
    }
  }

  // Carregar métricas com fallback inteligente
  const loadMetricsWithPeriod = async (period: string, startDate?: string, endDate?: string) => {
    if (!isConfigured) return { success: false, message: 'Configuração necessária' }

    console.log('📊 Carregando métricas, período:', period)
    
    try {
      const { data: insightResult, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'get_insights',
          config: config,
          period,
          startDate,
          endDate
        }
      })

      if (error) {
        console.error('❌ Erro na edge function:', error)
        return { success: false, message: 'Erro na conexão com o servidor' }
      }

      if (insightResult?.success && insightResult.insights?.length > 0) {
        setInsights(insightResult.insights)
        setLastError('')
        return { 
          success: true, 
          insights: insightResult.insights,
          period_used: insightResult.period_used
        }
      } else {
        // Se não há dados para "hoje", tentar "ontem" automaticamente
        if (period === 'today') {
          console.log('📊 Sem dados para hoje, tentando ontem...')
          const yesterdayResult = await loadMetricsWithPeriod('yesterday')
          if (yesterdayResult.success) {
            return {
              ...yesterdayResult,
              fallback_used: 'yesterday',
              message: 'Sem dados para hoje. Mostrando dados de ontem.'
            }
          }
        }

        setInsights([])
        const message = insightResult?.message || 'Nenhum dado encontrado para o período selecionado'
        setLastError(message)
        return { 
          success: false, 
          message,
          period_used: insightResult?.period_used,
          suggestions: period === 'today' ? ['Tente "Ontem" ou "Últimos 7 dias"'] : []
        }
      }

    } catch (error) {
      console.error('❌ Erro ao carregar métricas:', error)
      return { success: false, message: 'Erro inesperado ao carregar métricas' }
    }
  }

  return {
    config,
    setConfig,
    loading,
    saving,
    testing,
    insights,
    lastError,
    connectionSteps,
    isConfigured,
    saveAndTestConfig,
    loadMetricsWithPeriod,
    refreshConfig: loadConfig
  }
}
