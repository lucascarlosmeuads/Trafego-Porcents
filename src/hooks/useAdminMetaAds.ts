
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
      
      const { data, error } = await supabase
        .from('meta_ads_configs')
        .select('*')
        .is('cliente_id', null) // Configuração global
        .maybeSingle() // CORREÇÃO: Usar maybeSingle para evitar erro quando não há dados

      if (error) {
        console.error('❌ [useAdminMetaAds] Erro ao buscar config:', error)
        throw error
      }

      if (data) {
        console.log('✅ [useAdminMetaAds] Configuração encontrada:', data)
        setConfig(data)
      } else {
        console.log('ℹ️ [useAdminMetaAds] Nenhuma configuração global encontrada')
        setConfig(null)
      }
    } catch (error) {
      console.error('💥 [useAdminMetaAds] Erro:', error)
      setLastError('Erro ao carregar configuração')
    } finally {
      setLoading(false)
    }
  }

  // Salvar configuração global
  const saveConfig = async (configData: Omit<MetaAdsConfig, 'id' | 'created_at' | 'updated_at'>) => {
    setSaving(true)
    setLastError(null)
    
    try {
      console.log('💾 [useAdminMetaAds] Salvando configuração global...', configData)
      
      // CORREÇÃO: Usar o email do usuário atual para compatibilidade com RLS
      const { data: userData } = await supabase.auth.getUser()
      const userEmail = userData.user?.email || ''
      
      console.log('👤 [useAdminMetaAds] Email do usuário atual:', userEmail)
      
      const payload = {
        ...configData,
        email_usuario: userEmail, // CORREÇÃO: Usar email real do usuário
        cliente_id: null // Marca como configuração global
      }

      let result
      if (config?.id) {
        // Atualizar existente
        console.log('📝 [useAdminMetaAds] Atualizando configuração existente...')
        result = await supabase
          .from('meta_ads_configs')
          .update(payload)
          .eq('id', config.id)
          .select()
          .single()
      } else {
        // Criar nova
        console.log('🆕 [useAdminMetaAds] Criando nova configuração...')
        result = await supabase
          .from('meta_ads_configs')
          .insert([payload])
          .select()
          .single()
      }

      if (result.error) {
        console.error('❌ [useAdminMetaAds] Erro no banco:', result.error)
        throw result.error
      }

      console.log('✅ [useAdminMetaAds] Configuração salva com sucesso:', result.data)
      setConfig(result.data)
      toast({
        title: "Sucesso",
        description: "Configuração Meta Ads salva com sucesso",
      })
      
      return { success: true }
    } catch (error: any) {
      console.error('❌ [useAdminMetaAds] Erro ao salvar:', error)
      const errorMessage = error.message || 'Erro ao salvar configuração'
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

  // Testar conexão
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
      console.log('🔗 [useAdminMetaAds] Testando conexão com config:', {
        api_id: config.api_id,
        ad_account_id: config.ad_account_id,
        // Não loggar tokens por segurança
      })
      
      // Mapear os campos corretamente para a função edge
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
        // Verificar ambos os possíveis locais da resposta
        const steps = data.connection_steps || data.steps
        if (steps) {
          setConnectionSteps(steps)
        }
        return { success: true, message: data.message }
      } else {
        console.error('❌ [useAdminMetaAds] Falha no teste:', data.error || data.message)
        const errorMsg = data.error || data.message || 'Erro desconhecido'
        setLastError(errorMsg)
        return { success: false, message: errorMsg }
      }
    } catch (error: any) {
      console.error('💥 [useAdminMetaAds] Erro no teste:', error)
      const errorMessage = error.message || 'Erro ao testar conexão'
      setLastError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setTestingConnection(false)
    }
  }

  // Buscar insights do dia atual
  const fetchTodayInsights = async () => {
    if (!config) {
      console.log('⚠️ [useAdminMetaAds] Sem configuração para buscar insights')
      return
    }

    setFetchingInsights(true)
    setLastError(null)

    try {
      console.log('📊 [useAdminMetaAds] Buscando insights do dia...')
      
      // Usar os campos mapeados corretamente
      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'get_insights',
          config: {
            appId: config.api_id,
            appSecret: config.app_secret,
            accessToken: config.access_token,
            adAccountId: config.ad_account_id
          },
          date_preset: 'today'
        }
      })

      if (error) {
        throw error
      }

      if (data.success && data.insights && data.insights.length > 0) {
        console.log('✅ [useAdminMetaAds] Insights recebidos:', data.insights[0])
        const todayInsights = data.insights[0]
        
        // Calcular custo por mensagem (assumindo que mensagens = clicks)
        const costPerMessage = todayInsights.clicks > 0 
          ? (parseFloat(todayInsights.spend) / todayInsights.clicks).toFixed(2)
          : '0'

        setInsights({
          spend: parseFloat(todayInsights.spend) || 0,
          impressions: todayInsights.impressions || 0,
          clicks: todayInsights.clicks || 0,
          cpc: parseFloat(todayInsights.cpc) || 0,
          cpm: parseFloat(todayInsights.cpm) || 0,
          ctr: parseFloat(todayInsights.ctr) || 0,
          cost_per_message: parseFloat(costPerMessage)
        })

        // Salvar no histórico
        await saveInsightsToHistory(todayInsights)
      } else {
        console.log('ℹ️ [useAdminMetaAds] Nenhum insight disponível para hoje')
        setInsights(null)
      }
    } catch (error: any) {
      console.error('❌ [useAdminMetaAds] Erro ao buscar insights:', error)
      setLastError(error.message || 'Erro ao buscar dados de hoje')
    } finally {
      setFetchingInsights(false)
    }
  }

  // Salvar insights no histórico
  const saveInsightsToHistory = async (insightsData: any) => {
    try {
      const { error } = await supabase
        .from('meta_ads_reports')
        .upsert({
          email_usuario: config?.email_usuario || 'admin-global',
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
    fetchTodayInsights,
    refetchConfig: fetchConfig
  }
}
