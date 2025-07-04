
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

  // Carregar configuração (apenas visualização - salva pelo gestor)
  const loadConfig = useCallback(async () => {
    if (!clienteId) {
      setLoading(false)
      return
    }

    console.log('🔍 [useClienteMetaAdsSimplified] Carregando config do cliente:', clienteId)
    
    try {
      // Buscar configuração específica do cliente
      let { data: configData, error } = await supabase
        .from('meta_ads_configs')
        .select('*')
        .eq('cliente_id', parseInt(clienteId))
        .maybeSingle()

      console.log('🔍 [useClienteMetaAdsSimplified] Config específica resultado:', { configData, error })

      // Se não encontrou configuração específica, buscar configuração global do gestor
      if (!configData && !error) {
        console.log('🔍 [useClienteMetaAdsSimplified] Buscando config global do gestor...')
        
        // Buscar o email do gestor do cliente
        const { data: clienteData } = await supabase
          .from('todos_clientes')
          .select('email_gestor')
          .eq('id', parseInt(clienteId))
          .single()

        console.log('👤 [useClienteMetaAdsSimplified] Cliente data:', clienteData)

        if (clienteData?.email_gestor) {
          const { data: globalConfig, error: globalError } = await supabase
            .from('meta_ads_configs')
            .select('*')
            .eq('email_usuario', clienteData.email_gestor)
            .is('cliente_id', null)
            .maybeSingle()

          console.log('🌐 [useClienteMetaAdsSimplified] Config global:', { globalConfig, globalError })

          if (!globalError && globalConfig) {
            configData = globalConfig
            console.log('✅ [useClienteMetaAdsSimplified] Config global encontrada:', globalConfig)
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
        setConfig(newConfig)
        const configured = !!(newConfig.appId && newConfig.appSecret && newConfig.accessToken && newConfig.adAccountId)
        setIsConfigured(configured)
        console.log('✅ [useClienteMetaAdsSimplified] Config carregada:', { ...newConfig, accessToken: '[HIDDEN]', configured })
      } else {
        console.log('📝 [useClienteMetaAdsSimplified] Nenhuma config encontrada')
        setIsConfigured(false)
      }
    } catch (error) {
      console.error('❌ [useClienteMetaAdsSimplified] Erro ao carregar config:', error)
      setLastError('Erro ao carregar configuração')
    } finally {
      setLoading(false)
    }
  }, [clienteId])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  // Carregar métricas com fallback inteligente - CORRIGIDO para usar date_preset
  const loadMetricsWithPeriod = async (period: string, startDate?: string, endDate?: string) => {
    if (!isConfigured) {
      console.log('⚠️ [useClienteMetaAdsSimplified] Tentativa de carregar métricas sem config')
      return { success: false, message: 'Configuração necessária' }
    }

    console.log('📊 [useClienteMetaAdsSimplified] Carregando métricas, período:', period, { startDate, endDate })
    
    try {
      // CORREÇÃO: Enviar date_preset em vez de period para compatibilidade com Edge Function
      const payload = {
        action: 'get_insights',
        config: config,
        date_preset: period, // MUDANÇA AQUI
        startDate,
        endDate
      }

      console.log('📤 [useClienteMetaAdsSimplified] Enviando payload:', { ...payload, config: { ...payload.config, accessToken: '[HIDDEN]' } })

      const { data: insightResult, error } = await supabase.functions.invoke('meta-ads-api', {
        body: payload
      })

      console.log('📥 [useClienteMetaAdsSimplified] Resposta da Edge Function:', { insightResult, error })

      if (error) {
        console.error('❌ [useClienteMetaAdsSimplified] Erro na edge function:', error)
        setLastError('Erro na conexão com o servidor')
        return { success: false, message: 'Erro na conexão com o servidor' }
      }

      if (insightResult?.success && insightResult.insights?.length > 0) {
        console.log('✅ [useClienteMetaAdsSimplified] Métricas carregadas com sucesso:', insightResult.insights)
        setInsights(insightResult.insights)
        setLastError('')
        return { 
          success: true, 
          insights: insightResult.insights,
          period_used: insightResult.period_used,
          campaigns_count: insightResult.campaigns_count
        }
      } else {
        console.log('⚠️ [useClienteMetaAdsSimplified] Sem dados para período:', period)
        
        // Se não há dados para "hoje", tentar "ontem" automaticamente
        if (period === 'today') {
          console.log('🔄 [useClienteMetaAdsSimplified] Tentando fallback para yesterday...')
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
      console.error('❌ [useClienteMetaAdsSimplified] Erro inesperado ao carregar métricas:', error)
      setLastError('Erro inesperado ao carregar métricas')
      return { success: false, message: 'Erro inesperado ao carregar métricas' }
    }
  }

  return {
    config,
    loading,
    insights,
    lastError,
    isConfigured,
    loadMetricsWithPeriod,
    refreshConfig: loadConfig
  }
}
