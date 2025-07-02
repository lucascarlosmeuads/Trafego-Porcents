import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface MetaAdsConfig {
  id: string
  api_id: string
  app_secret: string
  access_token: string
  ad_account_id: string
  email_usuario: string
  created_at: string
  updated_at: string
}

interface MetaAdsInsights {
  spend: number
  impressions: number
  clicks: number
  cpc: number
  cpm: number
  ctr: number
  cost_per_message?: number
}

interface ConnectionSteps {
  validation: 'OK' | 'ERROR'
  basic_connection: 'OK' | 'ERROR'
  ad_account_access: 'OK' | 'ERROR'
  campaigns_access: 'OK' | 'ERROR' | 'WARNING'
}

export function useAdminMetaAds() {
  const [config, setConfig] = useState<MetaAdsConfig | null>(null)
  const [insights, setInsights] = useState<MetaAdsInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [fetchingInsights, setFetchingInsights] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const [connectionSteps, setConnectionSteps] = useState<ConnectionSteps | null>(null)
  const { toast } = useToast()

  // Buscar configuração global (sem cliente_id)
  const fetchConfig = async () => {
    try {
      console.log('🔍 [useAdminMetaAds] Buscando configuração global...')
      
      // Primeiro verificar dados do usuário atual
      const { data: userData } = await supabase.auth.getUser()
      console.log('👤 [useAdminMetaAds] Usuário atual:', {
        email: userData.user?.email,
        uid: userData.user?.id
      })

      // CORREÇÃO: Buscar apenas a configuração global mais recente
      const { data, error } = await supabase
        .from('meta_ads_configs')
        .select('*')
        .is('cliente_id', null) // Configuração global
        .order('created_at', { ascending: false }) // Mais recente primeiro
        .limit(1) // Apenas uma linha
        .maybeSingle() // Pode não ter nenhuma

      if (error) {
        console.error('❌ [useAdminMetaAds] Erro ao buscar config:', error)
        throw error
      }

      if (data) {
        console.log('✅ [useAdminMetaAds] Configuração encontrada:', {
          id: data.id,
          email_usuario: data.email_usuario,
          api_id: data.api_id?.substring(0, 10) + '...'
        })
        setConfig(data)
      } else {
        console.log('ℹ️ [useAdminMetaAds] Nenhuma configuração global encontrada')
        setConfig(null)
      }
    } catch (error: any) {
      console.error('💥 [useAdminMetaAds] Erro:', error)
      setLastError('Erro ao carregar configuração: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Salvar configuração global
  const saveConfig = async (configData: Omit<MetaAdsConfig, 'id' | 'created_at' | 'updated_at'>) => {
    setSaving(true)
    setLastError(null)
    
    try {
      console.log('💾 [useAdminMetaAds] Salvando configuração global...')
      
      // Verificar dados do usuário atual
      const { data: userData } = await supabase.auth.getUser()
      const userEmail = userData.user?.email || ''
      
      console.log('👤 [useAdminMetaAds] Salvando com email:', userEmail)
      
      const payload = {
        ...configData,
        email_usuario: userEmail,
        cliente_id: null // Marca como configuração global
      }

      console.log('📦 [useAdminMetaAds] Payload para salvar:', {
        ...payload,
        app_secret: '***HIDDEN***',
        access_token: '***HIDDEN***'
      })

      let result
      if (config?.id) {
        // Atualizar existente
        console.log('📝 [useAdminMetaAds] Atualizando configuração existente ID:', config.id)
        result = await supabase
          .from('meta_ads_configs')
          .update(payload)
          .eq('id', config.id)
          .select()
          .single()
      } else {
        // CORREÇÃO: Verificar se já existe uma configuração global antes de criar
        const { data: existingConfig } = await supabase
          .from('meta_ads_configs')
          .select('id')
          .is('cliente_id', null)
          .limit(1)
          .maybeSingle()

        if (existingConfig) {
          // Se já existe, atualizar
          console.log('📝 [useAdminMetaAds] Atualizando configuração global existente:', existingConfig.id)
          result = await supabase
            .from('meta_ads_configs')
            .update(payload)
            .eq('id', existingConfig.id)
            .select()
            .single()
        } else {
          // Criar nova apenas se não existir nenhuma
          console.log('🆕 [useAdminMetaAds] Criando nova configuração global...')
          result = await supabase
            .from('meta_ads_configs')
            .insert([payload])
            .select()
            .single()
        }
      }

      if (result.error) {
        console.error('❌ [useAdminMetaAds] Erro no banco:', result.error)
        throw result.error
      }

      console.log('✅ [useAdminMetaAds] Configuração salva com sucesso:', {
        id: result.data.id,
        email_usuario: result.data.email_usuario
      })
      
      setConfig(result.data)
      toast({
        title: "Sucesso",
        description: "Configuração Meta Ads Global salva com sucesso!",
      })
      
      return { success: true }
    } catch (error: any) {
      console.error('❌ [useAdminMetaAds] Erro ao salvar:', error)
      let errorMessage = 'Erro ao salvar configuração'
      
      if (error.message?.includes('permission denied')) {
        errorMessage = 'Sem permissão para salvar. Verifique se você é um administrador.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setLastError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
      return { success: false, error: errorMessage }
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    if (!config) {
      toast({
        title: "Erro",
        description: "Configure primeiro as credenciais Meta Ads",
        variant: "destructive"
      })
      return { success: false, message: "Configuração necessária" }
    }

    setTestingConnection(true)
    setLastError(null)
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
        console.error('❌ [useAdminMetaAds] Erro na função edge:', error)
        throw error
      }

      console.log('📊 [useAdminMetaAds] Resposta da função edge:', data)

      if (data.success) {
        console.log('✅ [useAdminMetaAds] Conexão testada com sucesso')
        const steps = data.connection_steps || data.steps
        if (steps) {
          setConnectionSteps(steps)
        }
        
        toast({
          title: "Sucesso",
          description: "Conexão Meta Ads estabelecida com sucesso!",
        })
        
        return { success: true, message: data.message }
      } else {
        console.error('❌ [useAdminMetaAds] Falha no teste:', data.error || data.message)
        const errorMsg = data.error || data.message || 'Erro desconhecido'
        setLastError(errorMsg)
        
        toast({
          title: "Erro na Conexão",
          description: errorMsg,
          variant: "destructive"
        })
        
        return { success: false, message: errorMsg }
      }
    } catch (error: any) {
      console.error('💥 [useAdminMetaAds] Erro no teste:', error)
      const errorMessage = error.message || 'Erro ao testar conexão'
      setLastError(errorMessage)
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
      
      return { success: false, message: errorMessage }
    } finally {
      setTestingConnection(false)
    }
  }

  // CORREÇÃO: Buscar insights sem fallback automático
  const fetchInsightsWithPeriod = async (
    period: 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'custom' = 'today',
    customStartDate?: string,
    customEndDate?: string
  ) => {
    if (!config) {
      console.log('⚠️ [useAdminMetaAds] Sem configuração para buscar insights')
      setLastError('Configure primeiro as credenciais Meta Ads')
      return
    }

    setFetchingInsights(true)
    setLastError(null)

    try {
      console.log(`📊 [useAdminMetaAds] Buscando insights - período: ${period}`)
      
      let requestBody: any = {
        action: 'get_insights',
        config: {
          appId: config.api_id,
          appSecret: config.app_secret,
          accessToken: config.access_token,
          adAccountId: config.ad_account_id
        }
      }

      // Definir período baseado no parâmetro
      if (period === 'today') {
        requestBody.date_preset = 'today'
      } else if (period === 'yesterday') {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        requestBody.startDate = yesterday
        requestBody.endDate = yesterday
      } else if (period === 'last_7_days') {
        const today = new Date().toISOString().split('T')[0]
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        requestBody.startDate = lastWeek
        requestBody.endDate = today
      } else if (period === 'last_30_days') {
        const today = new Date().toISOString().split('T')[0]
        const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        requestBody.startDate = lastMonth
        requestBody.endDate = today
      } else if (period === 'custom' && customStartDate && customEndDate) {
        requestBody.startDate = customStartDate
        requestBody.endDate = customEndDate
      }

      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: requestBody
      })

      if (error) {
        throw error
      }

      if (data.success && data.insights && data.insights.length > 0) {
        console.log(`✅ [useAdminMetaAds] Insights recebidos para ${period}:`, {
          quantidade: data.insights.length,
          periodo_usado: data.period_used || period,
          amostra: data.insights[0]
        })
        
        const todayInsights = data.insights[0]
        
        // CORREÇÃO: Log dos dados originais da API
        console.log('🔍 [useAdminMetaAds] Dados ORIGINAIS da API Meta:', {
          spend: todayInsights.spend,
          clicks: todayInsights.clicks,
          impressions: todayInsights.impressions,
          cpc: todayInsights.cpc,
          cpm: todayInsights.cpm,
          ctr: todayInsights.ctr
        })
        
        // Calcular custo por mensagem (assumindo que mensagens = clicks)
        const costPerMessage = todayInsights.clicks > 0 
          ? (parseFloat(todayInsights.spend) / todayInsights.clicks)
          : 0

        console.log('💰 [useAdminMetaAds] Cálculo custo por mensagem:', {
          spend: parseFloat(todayInsights.spend),
          clicks: todayInsights.clicks,
          resultado: costPerMessage
        })

        const processedInsights = {
          spend: parseFloat(todayInsights.spend) || 0,
          impressions: todayInsights.impressions || 0,
          clicks: todayInsights.clicks || 0,
          cpc: parseFloat(todayInsights.cpc) || 0,
          cpm: parseFloat(todayInsights.cpm) || 0,
          ctr: parseFloat(todayInsights.ctr) || 0,
          cost_per_message: costPerMessage
        }

        console.log('📊 [useAdminMetaAds] Insights PROCESSADOS:', processedInsights)

        setInsights(processedInsights)

        // Salvar no histórico
        await saveInsightsToHistory(todayInsights)
        
        const periodNames = {
          today: 'hoje',
          yesterday: 'ontem', 
          last_7_days: 'últimos 7 dias',
          last_30_days: 'últimos 30 dias',
          custom: 'período personalizado'
        }
        
        toast({
          title: "Sucesso",
          description: `Dados Meta Ads encontrados para ${data.period_used || periodNames[period]}!`,
        })
        
        return { success: true, period_used: data.period_used || period }
      } else {
        console.log(`ℹ️ [useAdminMetaAds] Nenhum insight disponível para ${period}`)
        
        // CORREÇÃO: Para período "today", retornar valores zerados em vez de erro
        if (period === 'today') {
          const emptyInsights = {
            spend: 0,
            impressions: 0,
            clicks: 0,
            cpc: 0,
            cpm: 0,
            ctr: 0,
            cost_per_message: 0
          }
          
          setInsights(emptyInsights)
          
          console.log('📊 [useAdminMetaAds] Exibindo valores zerados para hoje')
          
          return { 
            success: true, 
            period_used: 'hoje',
            message: 'Nenhum gasto registrado para hoje até o momento'
          }
        }
        
        // Para outros períodos, mostrar mensagem de erro
        const message = data.message || `Nenhum dado encontrado para ${period}`
        
        if (data.campaigns_info) {
          console.log('📊 [useAdminMetaAds] Info das campanhas:', data.campaigns_info)
        }
        
        return { 
          success: false, 
          message, 
          campaigns_info: data.campaigns_info,
          periods_tested: data.periods_tested 
        }
      }
    } catch (error: any) {
      console.error('❌ [useAdminMetaAds] Erro ao buscar insights:', error)
      const errorMessage = error.message || `Erro ao buscar dados de ${period}`
      setLastError(errorMessage)
      
      return { success: false, message: errorMessage }
    } finally {
      setFetchingInsights(false)
    }
  }

  // CORREÇÃO: Função simplificada que busca apenas dados de hoje
  const fetchTodayInsights = async () => {
    console.log('📊 [useAdminMetaAds] Buscando dados apenas para hoje...')
    
    const result = await fetchInsightsWithPeriod('today')
    
    if (result.success) {
      return result
    }
    
    // Se não encontrou dados para hoje, não fazer fallback automático
    console.log('ℹ️ [useAdminMetaAds] Sem dados para hoje - exibindo valores zerados')
    
    // Definir insights zerados
    const emptyInsights = {
      spend: 0,
      impressions: 0,
      clicks: 0,
      cpc: 0,
      cpm: 0,
      ctr: 0,
      cost_per_message: 0
    }
    
    setInsights(emptyInsights)
    setLastError(null) // Limpar erro anterior
    
    return {
      success: true,
      period_used: 'hoje',
      message: 'Nenhum gasto registrado para hoje até o momento'
    }
  }

  // Função com fallback manual - mantida para uso via seletor de datas
  const fetchWithManualFallback = async () => {
    // Primeiro tentar hoje
    const todayResult = await fetchInsightsWithPeriod('today')
    
    if (todayResult.success) {
      return todayResult
    }
    
    console.log('🔄 [useAdminMetaAds] Não encontrou dados para hoje, tentando ontem...')
    
    // Se não encontrou hoje, tentar ontem
    const yesterdayResult = await fetchInsightsWithPeriod('yesterday')
    
    if (yesterdayResult.success) {
      return yesterdayResult
    }
    
    console.log('🔄 [useAdminMetaAds] Não encontrou dados para ontem, tentando últimos 7 dias...')
    
    // Se não encontrou ontem, tentar últimos 7 dias
    const weekResult = await fetchInsightsWithPeriod('last_7_days')
    
    if (weekResult.success) {
      return weekResult
    }
    
    // Se chegou até aqui, mostrar erro mais específico
    setInsights(null)
    const finalMessage = weekResult.message || 'Nenhum dado encontrado nos últimos períodos testados'
    setLastError(finalMessage)
    
    toast({
      title: "Nenhum dado encontrado",
      description: finalMessage,
      variant: "destructive"
    })
    
    return weekResult
  }

  const saveInsightsToHistory = async (insightsData: any) => {
    try {
      const { error } = await supabase
        .from('meta_ads_reports')
        .upsert({
          email_usuario: config?.email_usuario || '',
          ad_account_id: config?.ad_account_id || '',
          report_date: new Date().toISOString().split('T')[0],
          spend: parseFloat(insightsData.spend) || 0,
          impressions: insightsData.impressions || 0,
          clicks: insightsData.clicks || 0,
          cpc: parseFloat(insightsData.cpc) || 0,
          cpm: parseFloat(insightsData.cpm) || 0,
          ctr: parseFloat(insightsData.ctr) || 0
        }, {
          onConflict: 'email_usuario,ad_account_id,report_date'
        })

      if (error) {
        console.error('❌ [useAdminMetaAds] Erro ao salvar histórico:', error)
      } else {
        console.log('✅ [useAdminMetaAds] Histórico salvo com sucesso')
      }
    } catch (error) {
      console.error('💥 [useAdminMetaAds] Erro ao salvar histórico:', error)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  return {
    config,
    insights,
    loading,
    saving,
    testingConnection,
    fetchingInsights,
    lastError,
    connectionSteps,
    isConfigured: !!config,
    saveConfig,
    testConnection,
    fetchTodayInsights, // Versão sem fallback automático
    fetchInsightsWithPeriod, // Função para períodos específicos
    fetchWithManualFallback, // Função com fallback manual (opcional)
    refetchConfig: fetchConfig
  }
}
