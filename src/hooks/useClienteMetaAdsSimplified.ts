
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

  // FASE 1: Diagnóstico detalhado com logs específicos
  const loadConfig = useCallback(async () => {
    if (!clienteId) {
      console.log('❌ [useClienteMetaAdsSimplified] Cliente ID não fornecido')
      setLoading(false)
      return
    }

    console.log('🔍 [DIAGNÓSTICO FASE 1] === INÍCIO CARREGAMENTO CONFIG ===')
    console.log('🔍 [DIAGNÓSTICO] Cliente ID:', clienteId)
    console.log('🔍 [DIAGNÓSTICO] Usuário autenticado:', user?.email)
    
    try {
      // DIAGNÓSTICO: Verificar configuração específica do cliente primeiro
      const clienteIdNumber = parseInt(clienteId)
      console.log('🔍 [DIAGNÓSTICO] Buscando config específica para cliente ID:', clienteIdNumber)
      
      let { data: configData, error } = await supabase
        .from('meta_ads_configs')
        .select('*')
        .eq('cliente_id', clienteIdNumber)
        .maybeSingle()

      console.log('🔍 [DIAGNÓSTICO] Resultado config específica:', { configData, error, clienteIdNumber })

      // Se não encontrou configuração específica, buscar configuração global do gestor
      if (!configData && !error) {
        console.log('🔍 [DIAGNÓSTICO] Config específica não encontrada, buscando global do gestor...')
        
        // Buscar o email do gestor do cliente com diagnóstico detalhado
        const { data: clienteData, error: clienteError } = await supabase
          .from('todos_clientes')
          .select('email_gestor, nome_cliente')
          .eq('id', clienteIdNumber)
          .single()

        console.log('👤 [DIAGNÓSTICO] Cliente data:', { clienteData, clienteError, clienteId: clienteIdNumber })

        if (clienteData?.email_gestor) {
          console.log('🔍 [DIAGNÓSTICO] Buscando config global do gestor:', clienteData.email_gestor)
          
          const { data: globalConfig, error: globalError } = await supabase
            .from('meta_ads_configs')
            .select('*')
            .eq('email_usuario', clienteData.email_gestor)
            .is('cliente_id', null)
            .maybeSingle()

          console.log('🌐 [DIAGNÓSTICO] Config global do gestor:', { 
            globalConfig, 
            globalError, 
            gestorEmail: clienteData.email_gestor 
          })

          if (!globalError && globalConfig) {
            configData = globalConfig
            console.log('✅ [DIAGNÓSTICO] Usando config global do gestor')
          }
        } else {
          console.log('❌ [DIAGNÓSTICO] Email do gestor não encontrado para o cliente')
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
        
        console.log('✅ [DIAGNÓSTICO] Config encontrada e processada:', {
          hasAppId: !!newConfig.appId,
          hasAppSecret: !!newConfig.appSecret,
          hasAccessToken: !!newConfig.accessToken,
          hasAdAccountId: !!newConfig.adAccountId,
          configured
        })
        
        setConfig(newConfig)
        setIsConfigured(configured)
        setLastError('')
      } else {
        console.log('❌ [DIAGNÓSTICO] Nenhuma configuração encontrada (nem específica nem global)')
        setIsConfigured(false)
        setLastError('Configuração Meta Ads não encontrada')
      }
    } catch (error) {
      console.error('❌ [DIAGNÓSTICO] Erro crítico ao carregar config:', error)
      setLastError('Erro ao carregar configuração Meta Ads')
      setIsConfigured(false)
    } finally {
      setLoading(false)
      console.log('🔍 [DIAGNÓSTICO FASE 1] === FIM CARREGAMENTO CONFIG ===')
    }
  }, [clienteId, user?.email])

  useEffect(() => {
    console.log('🔄 [DIAGNÓSTICO] Hook useEffect disparado:', { clienteId, userEmail: user?.email })
    loadConfig()
  }, [loadConfig])

  // FASE 3: Carregamento de métricas com retry e melhor tratamento de erros
  const loadMetricsWithPeriod = async (period: string, startDate?: string, endDate?: string) => {
    console.log('📊 [DIAGNÓSTICO MÉTRICA] === INÍCIO CARREGAMENTO MÉTRICAS ===')
    console.log('📊 [DIAGNÓSTICO MÉTRICA] Parâmetros:', { period, startDate, endDate, isConfigured })
    
    if (!isConfigured) {
      console.log('⚠️ [DIAGNÓSTICO MÉTRICA] Tentativa de carregar métricas sem config')
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

      console.log('📤 [DIAGNÓSTICO MÉTRICA] Enviando payload para Edge Function:', { 
        ...payload, 
        config: { ...payload.config, accessToken: '[HIDDEN]' } 
      })

      const { data: insightResult, error } = await supabase.functions.invoke('meta-ads-api', {
        body: payload
      })

      console.log('📥 [DIAGNÓSTICO MÉTRICA] Resposta da Edge Function:', { 
        success: insightResult?.success,
        hasInsights: !!insightResult?.insights,
        insightsLength: insightResult?.insights?.length || 0,
        error: error || insightResult?.error || null
      })

      if (error) {
        console.error('❌ [DIAGNÓSTICO MÉTRICA] Erro na edge function:', error)
        setLastError('Erro na conexão com o servidor Meta Ads')
        return { success: false, message: 'Erro na conexão com o servidor' }
      }

      if (insightResult?.success && insightResult.insights?.length > 0) {
        console.log('✅ [DIAGNÓSTICO MÉTRICA] Métricas carregadas com sucesso')
        setInsights(insightResult.insights)
        setLastError('')
        return { 
          success: true, 
          insights: insightResult.insights,
          period_used: insightResult.period_used,
          campaigns_count: insightResult.campaigns_count
        }
      } else {
        console.log('⚠️ [DIAGNÓSTICO MÉTRICA] Sem dados para período:', period)
        
        // Retry automático para "ontem" se "hoje" não tiver dados
        if (period === 'today') {
          console.log('🔄 [DIAGNÓSTICO MÉTRICA] Tentando fallback para yesterday...')
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
      console.error('❌ [DIAGNÓSTICO MÉTRICA] Erro inesperado:', error)
      setLastError('Erro inesperado ao carregar métricas Meta Ads')
      return { success: false, message: 'Erro inesperado ao carregar métricas' }
    } finally {
      console.log('📊 [DIAGNÓSTICO MÉTRICA] === FIM CARREGAMENTO MÉTRICAS ===')
    }
  }

  return {
    config,
    loading,
    insights,
    lastError,
    isConfigured,
    loadMetricsWithPeriod,
    refreshConfig: loadConfig,
    // FASE 4: Exposer dados de diagnóstico para debugging
    diagnosticInfo: {
      clienteId,
      userEmail: user?.email,
      configLoaded: !!config.appId,
      hasInsights: insights.length > 0
    }
  }
}
