
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

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
  
  const [config, setConfig] = useState<ClienteMetaAdsConfig>({
    appId: '',
    appSecret: '',
    accessToken: '',
    adAccountId: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<InsightData[]>([])
  const [lastError, setLastError] = useState<string>('')
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)

  // Função de carregamento de configuração com controle de estado
  const loadConfig = useCallback(async () => {
    if (!clienteId || isLoadingConfig) {
      console.log('❌ [useClienteMetaAdsSimplified] Cliente ID não fornecido ou já carregando')
      setLoading(false)
      return
    }

    console.log('🔍 [META ADS CONFIG] === INÍCIO CARREGAMENTO ===')
    console.log('🔍 [META ADS CONFIG] Cliente ID:', clienteId)
    console.log('🔍 [META ADS CONFIG] Usuário autenticado:', user?.email)
    
    setIsLoadingConfig(true)
    
    try {
      const clienteIdNumber = parseInt(clienteId)
      console.log('🔍 [META ADS CONFIG] Buscando configuração específica...')
      
      // Primeiro tentar buscar configuração específica do cliente
      let { data: specificConfig, error: specificError } = await supabase
        .from('meta_ads_configs')
        .select('*')
        .eq('cliente_id', clienteIdNumber)
        .maybeSingle()

      console.log('🔍 [META ADS CONFIG] Config específica:', { 
        specificConfig, 
        specificError 
      })

      let configData = specificConfig

      // Se não encontrou config específica, buscar config global do gestor
      if (!configData && !specificError) {
        console.log('🔍 [META ADS CONFIG] Buscando config global do gestor...')
        
        // Buscar email do gestor
        const { data: clienteData, error: clienteError } = await supabase
          .from('todos_clientes')
          .select('email_gestor')
          .eq('id', clienteIdNumber)
          .maybeSingle()

        console.log('🔍 [META ADS CONFIG] Cliente data:', { 
          clienteData, 
          clienteError 
        })

        if (clienteData?.email_gestor) {
          const { data: globalConfig, error: globalError } = await supabase
            .from('meta_ads_configs')
            .select('*')
            .eq('email_usuario', clienteData.email_gestor)
            .is('cliente_id', null)
            .maybeSingle()

          console.log('🔍 [META ADS CONFIG] Config global:', { 
            globalConfig, 
            globalError 
          })

          if (globalConfig && !globalError) {
            configData = globalConfig
          }
        }
      }

      if (configData) {
        const newConfig = {
          appId: configData.api_id || '',
          appSecret: configData.app_secret || '',
          accessToken: configData.access_token || '',
          adAccountId: configData.ad_account_id || ''
        }
        
        const configured = !!(newConfig.appId && newConfig.appSecret && newConfig.accessToken && newConfig.adAccountId)
        
        console.log('✅ [META ADS CONFIG] Config processada:', {
          hasAppId: !!newConfig.appId,
          hasAppSecret: !!newConfig.appSecret,
          hasAccessToken: !!newConfig.accessToken,
          hasAdAccountId: !!newConfig.adAccountId,
          configured
        })
        
        setConfig(newConfig)
        setIsConfigured(configured)
        setLastError('')
        
        console.log('✅ [META ADS CONFIG] Config carregada com sucesso!')
        return newConfig
      } else {
        console.log('❌ [META ADS CONFIG] Nenhuma configuração encontrada')
        setIsConfigured(false)
        setLastError('Configuração Meta Ads não encontrada')
      }

    } catch (error) {
      console.error('❌ [META ADS CONFIG] Erro ao carregar config:', error)
      setLastError('Erro ao carregar configuração Meta Ads')
      setIsConfigured(false)
    } finally {
      setIsLoadingConfig(false)
      setLoading(false)
    }
  }, [clienteId, user?.email])

  // Effect principal - apenas uma vez por mudança de clienteId/user
  useEffect(() => {
    console.log('🔄 [META ADS CONFIG] Hook useEffect disparado:', { clienteId, userEmail: user?.email })
    loadConfig()
  }, [clienteId, user?.email])

  // Função de carregamento de métricas
  const loadMetricsWithPeriod = async (period: string, startDate?: string, endDate?: string) => {
    console.log('📊 [META ADS METRICS] === INÍCIO CARREGAMENTO MÉTRICAS ===')
    console.log('📊 [META ADS METRICS] Parâmetros:', { period, startDate, endDate, isConfigured })
    
    if (!isConfigured) {
      console.log('⚠️ [META ADS METRICS] Tentativa de carregar métricas sem config')
      return { success: false, message: 'Configuração Meta Ads necessária' }
    }

    try {
      const payload = {
        action: 'get_insights',
        config: config,
        date_preset: period,
        startDate,
        endDate
      }

      console.log('📤 [META ADS METRICS] Enviando payload para Edge Function:', { 
        ...payload, 
        config: { ...payload.config, accessToken: '[HIDDEN]' } 
      })

      const { data: insightResult, error } = await supabase.functions.invoke('meta-ads-api', {
        body: payload
      })

      console.log('📥 [META ADS METRICS] Resposta da Edge Function:', { 
        success: insightResult?.success,
        hasInsights: !!insightResult?.insights,
        insightsLength: insightResult?.insights?.length || 0,
        error: error || insightResult?.error || null
      })

      if (error) {
        console.error('❌ [META ADS METRICS] Erro na edge function:', error)
        setLastError('Erro na conexão com o servidor Meta Ads')
        return { success: false, message: 'Erro na conexão com o servidor' }
      }

      if (insightResult?.success && insightResult.insights?.length > 0) {
        console.log('✅ [META ADS METRICS] Métricas carregadas com sucesso')
        setInsights(insightResult.insights)
        setLastError('')
        return { 
          success: true, 
          insights: insightResult.insights,
          period_used: insightResult.period_used,
          campaigns_count: insightResult.campaigns_count
        }
      } else {
        console.log('⚠️ [META ADS METRICS] Sem dados para período:', period)
        
        // Retry automático para "ontem" se "hoje" não tiver dados
        if (period === 'today') {
          console.log('🔄 [META ADS METRICS] Tentando fallback para yesterday...')
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
      console.error('❌ [META ADS METRICS] Erro inesperado:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao carregar métricas Meta Ads'
      setLastError(errorMessage)
      return { success: false, message: errorMessage }
    }
  }

  // Função para recarregar configuração
  const refreshConfig = useCallback(async () => {
    console.log('🔄 [META ADS CONFIG] Refreshing config...')
    setLoading(true)
    setLastError('')
    await loadConfig()
  }, [loadConfig])

  return {
    config,
    loading,
    insights,
    lastError,
    isConfigured,
    loadMetricsWithPeriod,
    refreshConfig,
    // Dados de diagnóstico aprimorados
    diagnosticInfo: {
      clienteId,
      userEmail: user?.email,
      configLoaded: !!config.appId,
      hasInsights: insights.length > 0,
      lastConfigCheck: new Date().toISOString()
    }
  }
}
