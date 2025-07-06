
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

export function useClienteMetaAdsFixed(clienteId: string) {
  const { user } = useAuth()
  const [config, setConfig] = useState<ClienteMetaAdsConfig>({
    appId: '',
    appSecret: '',
    accessToken: '',
    adAccountId: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [insights, setInsights] = useState<InsightData[]>([])
  const [lastError, setLastError] = useState<string>('')
  const [connectionSteps, setConnectionSteps] = useState<any>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  const [onConfigurationSuccess, setOnConfigurationSuccess] = useState<(() => void) | null>(null)

  // Função melhorada para carregar configuração
  const loadConfig = useCallback(async () => {
    if (!clienteId) {
      setLoading(false)
      return
    }

    console.log('🔍 [useClienteMetaAdsFixed] Carregando config do cliente:', clienteId)
    
    try {
      const clienteIdNumber = parseInt(clienteId)
      
      // Primeiro tentar buscar configuração específica do cliente
      let { data: configData, error } = await supabase
        .from('meta_ads_configs')
        .select('*')
        .eq('cliente_id', clienteIdNumber)
        .maybeSingle()

      console.log('🔍 [useClienteMetaAdsFixed] Config específica:', { configData, error })

      // Se não encontrou configuração específica, buscar configuração global do gestor
      if (!configData && !error) {
        console.log('🔍 [useClienteMetaAdsFixed] Buscando config global do gestor...')
        
        // Buscar o email do gestor do cliente
        const { data: clienteData } = await supabase
          .from('todos_clientes')
          .select('email_gestor')
          .eq('id', clienteIdNumber)
          .single()

        if (clienteData?.email_gestor) {
          const { data: globalConfig, error: globalError } = await supabase
            .from('meta_ads_configs')
            .select('*')
            .eq('email_usuario', clienteData.email_gestor)
            .is('cliente_id', null)
            .maybeSingle()

          console.log('🔍 [useClienteMetaAdsFixed] Config global:', { globalConfig, globalError })

          if (!globalError && globalConfig) {
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
        
        setConfig(newConfig)
        const configured = !!(newConfig.appId && newConfig.appSecret && newConfig.accessToken && newConfig.adAccountId)
        setIsConfigured(configured)
        
        console.log('✅ [useClienteMetaAdsFixed] Config carregada:', { configured })
      } else {
        console.log('📝 [useClienteMetaAdsFixed] Nenhuma config encontrada')
        setIsConfigured(false)
      }

    } catch (error) {
      console.error('❌ [useClienteMetaAdsFixed] Erro ao carregar config:', error)
      setLastError('Erro ao carregar configuração')
      setIsConfigured(false)
    } finally {
      setLoading(false)
    }
  }, [clienteId])

  // Carregar configuração quando o clienteId mudar
  useEffect(() => {
    loadConfig()
  }, [clienteId])

  // Função melhorada para salvar configuração
  const saveConfig = async (newConfig: ClienteMetaAdsConfig) => {
    if (!clienteId) return { success: false, error: 'Cliente ID necessário' }

    setSaving(true)
    setLastError('')
    console.log('💾 [useClienteMetaAdsFixed] Salvando config do cliente:', clienteId)

    try {
      const clienteIdNumber = parseInt(clienteId)
      
      // Primeiro verificar se já existe configuração específica para este cliente
      const { data: existingConfig } = await supabase
        .from('meta_ads_configs')
        .select('id')
        .eq('cliente_id', clienteIdNumber)
        .maybeSingle()

      const configData = {
        cliente_id: clienteIdNumber,
        email_usuario: user?.email || '',
        api_id: newConfig.appId.trim(),
        app_secret: newConfig.appSecret.trim(),
        access_token: newConfig.accessToken.trim(),
        ad_account_id: newConfig.adAccountId.trim(),
        updated_at: new Date().toISOString()
      }

      let result
      if (existingConfig) {
        // Atualizar configuração existente
        console.log('🔄 [useClienteMetaAdsFixed] Atualizando config existente')
        result = await supabase
          .from('meta_ads_configs')
          .update(configData)
          .eq('id', existingConfig.id)
      } else {
        // Inserir nova configuração
        console.log('➕ [useClienteMetaAdsFixed] Inserindo nova config')
        result = await supabase
          .from('meta_ads_configs')
          .insert({
            ...configData,
            created_at: new Date().toISOString()
          })
      }

      if (result.error) {
        console.error('❌ [useClienteMetaAdsFixed] Erro ao salvar:', result.error)
        setLastError(result.error.message)
        return { success: false, error: result.error.message }
      }

      // Atualizar estado local
      setConfig(newConfig)
      setIsConfigured(true)
      setLastError('')
      
      console.log('✅ [useClienteMetaAdsFixed] Config salva com sucesso')
      
      // Executar callback de sucesso se definido
      if (onConfigurationSuccess) {
        setTimeout(() => {
          onConfigurationSuccess()
        }, 500)
      }
      
      return { success: true }
    } catch (error) {
      console.error('❌ [useClienteMetaAdsFixed] Erro inesperado ao salvar:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado'
      setLastError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setSaving(false)
    }
  }

  // Função melhorada para testar conexão
  const testConnection = async (configToTest?: ClienteMetaAdsConfig) => {
    const testConfig = configToTest || config
    console.log('🔗 [useClienteMetaAdsFixed] Testando conexão do cliente:', clienteId)
    
    setLastError('')
    setConnectionSteps(null)
    
    try {
      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'test_connection',
          config: {
            appId: testConfig.appId,
            appSecret: testConfig.appSecret,
            accessToken: testConfig.accessToken,
            adAccountId: testConfig.adAccountId
          }
        }
      })

      if (error) {
        console.error('❌ [useClienteMetaAdsFixed] Erro na edge function:', error)
        const errorMsg = 'Erro na conexão com o servidor'
        setLastError(errorMsg)
        return { success: false, message: errorMsg }
      }

      console.log('✅ [useClienteMetaAdsFixed] Resposta da API:', data)
      
      if (!data.success) {
        setLastError(data.message)
        console.error('❌ [useClienteMetaAdsFixed] Teste falhou:', data.message)
      } else {
        setConnectionSteps(data.steps)
        setLastError('')
        
        // Se teste bem-sucedido e callback definido, executar
        if (onConfigurationSuccess) {
          setTimeout(() => {
            onConfigurationSuccess()
          }, 1000)
        }
      }
      
      return data
    } catch (error) {
      console.error('❌ [useClienteMetaAdsFixed] Erro inesperado:', error)
      const errorMsg = 'Erro inesperado na conexão'
      setLastError(errorMsg)
      return { success: false, message: errorMsg }
    }
  }

  // Função para buscar insights
  const loadInsights = async (period: string = 'today') => {
    if (!isConfigured) {
      console.log('⚠️ [useClienteMetaAdsFixed] Config não configurada para buscar insights')
      return { success: false, message: 'Configuração necessária' }
    }

    try {
      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'get_insights',
          config: config,
          date_preset: period
        }
      })

      if (error) {
        throw new Error('Erro ao buscar insights')
      }

      if (data.success && data.insights?.length > 0) {
        setInsights(data.insights)
        setLastError('')
        return { success: true, insights: data.insights }
      } else {
        setInsights([])
        const message = data.message || 'Nenhum dado encontrado'
        setLastError(message)
        return { success: false, message }
      }

    } catch (error) {
      console.error('❌ [useClienteMetaAdsFixed] Erro ao buscar insights:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado'
      setLastError(errorMessage)
      return { success: false, message: errorMessage }
    }
  }

  return {
    config,
    loading,
    saving,
    insights,
    lastError,
    connectionSteps,
    isConfigured,
    saveConfig,
    testConnection,
    loadInsights,
    setOnConfigurationSuccess,
    refreshConfig: loadConfig
  }
}
