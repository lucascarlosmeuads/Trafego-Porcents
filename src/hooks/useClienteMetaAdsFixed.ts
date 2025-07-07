import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useClienteProgresso } from '@/hooks/useClienteProgresso'
import { toast } from '@/hooks/use-toast'

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

interface ConnectionSteps {
  validation: string
  basic_connection: string
  ad_account_access: string
  campaigns_access: string
}

export function useClienteMetaAdsFixed(clienteId: string) {
  const { user } = useAuth()
  const { marcarPasso } = useClienteProgresso(user?.email || '')
  
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
  const [isConfigured, setIsConfigured] = useState(false)
  const [connectionSteps, setConnectionSteps] = useState<ConnectionSteps | null>(null)

  // Função de carregamento de configuração
  const loadConfig = useCallback(async () => {
    if (!clienteId || !user?.email) {
      console.log('❌ [useClienteMetaAdsFixed] Cliente ID ou usuário não fornecido')
      setLoading(false)
      return
    }

    console.log('🔍 [META ADS CONFIG] === INÍCIO CARREGAMENTO ===')
    console.log('🔍 [META ADS CONFIG] Cliente ID:', clienteId)
    console.log('🔍 [META ADS CONFIG] Usuário autenticado:', user.email)
    
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
      setLoading(false)
    }
  }, [clienteId, user?.email])

  // Effect principal
  useEffect(() => {
    console.log('🔄 [META ADS CONFIG] Hook useEffect disparado:', { clienteId, userEmail: user?.email })
    loadConfig()
  }, [loadConfig])

  // Função para salvar configuração - CORRIGIDA
  const saveConfig = async (newConfig: ClienteMetaAdsConfig): Promise<{ success: boolean; error?: string }> => {
    if (!user?.email || !clienteId) {
      return { success: false, error: 'Usuário não autenticado ou cliente não identificado' }
    }

    setSaving(true)
    console.log('💾 [useClienteMetaAdsFixed] Salvando configuração para cliente:', clienteId)

    try {
      const clienteIdNumber = parseInt(clienteId)
      
      // PRIMEIRO: Verificar se já existe configuração para este cliente
      const { data: existingConfig, error: checkError } = await supabase
        .from('meta_ads_configs')
        .select('id')
        .eq('cliente_id', clienteIdNumber)
        .eq('email_usuario', user.email)
        .maybeSingle()

      console.log('🔍 [useClienteMetaAdsFixed] Verificando config existente:', { existingConfig, checkError })

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ [useClienteMetaAdsFixed] Erro ao verificar config existente:', checkError)
        throw checkError
      }

      let result

      if (existingConfig) {
        // ATUALIZAR configuração existente
        console.log('🔄 [useClienteMetaAdsFixed] Atualizando configuração existente ID:', existingConfig.id)
        
        result = await supabase
          .from('meta_ads_configs')
          .update({
            api_id: newConfig.appId,
            app_secret: newConfig.appSecret,
            access_token: newConfig.accessToken,
            ad_account_id: newConfig.adAccountId,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id)

      } else {
        // INSERIR nova configuração
        console.log('➕ [useClienteMetaAdsFixed] Inserindo nova configuração')
        
        result = await supabase
          .from('meta_ads_configs')
          .insert({
            cliente_id: clienteIdNumber,
            email_usuario: user.email,
            api_id: newConfig.appId,
            app_secret: newConfig.appSecret,
            access_token: newConfig.accessToken,
            ad_account_id: newConfig.adAccountId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }

      if (result.error) {
        console.error('❌ [useClienteMetaAdsFixed] Erro ao salvar:', result.error)
        
        // Tratamento específico para erro de duplicate key
        if (result.error.message.includes('duplicate key value violates unique constraint')) {
          setLastError('Configuração já existe para este cliente. Tentando atualizar...')
          
          // Fallback: Tentar atualizar diretamente usando a constraint
          const { error: updateError } = await supabase
            .from('meta_ads_configs')
            .update({
              api_id: newConfig.appId,
              app_secret: newConfig.appSecret,
              access_token: newConfig.accessToken,
              ad_account_id: newConfig.adAccountId,
              updated_at: new Date().toISOString()
            })
            .eq('cliente_id', clienteIdNumber)
            .eq('email_usuario', user.email)

          if (updateError) {
            console.error('❌ [useClienteMetaAdsFixed] Erro no fallback update:', updateError)
            setLastError(updateError.message)
            toast({
              title: "Erro ao atualizar",
              description: updateError.message,
              variant: "destructive",
            })
            return { success: false, error: updateError.message }
          } else {
            console.log('✅ [useClienteMetaAdsFixed] Fallback update bem-sucedido')
          }
        } else {
          setLastError(result.error.message)
          toast({
            title: "Erro ao salvar",
            description: result.error.message,
            variant: "destructive",
          })
          return { success: false, error: result.error.message }
        }
      }

      setConfig(newConfig)
      setIsConfigured(true)
      setLastError('')
      
      // MARCAR PASSO 6 (Métricas/Credenciais Meta Ads) quando salvamento é bem-sucedido
      console.log('✅ [useClienteMetaAdsFixed] Configuração salva - marcando passo 6')
      await marcarPasso(6)
      
      console.log('✅ [useClienteMetaAdsFixed] Configuração salva com sucesso')
      toast({
        title: "Configuração salva",
        description: "Credenciais Meta Ads salvas com sucesso!",
      })
      
      return { success: true }
    } catch (error) {
      console.error('❌ [useClienteMetaAdsFixed] Erro inesperado ao salvar:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado'
      setLastError(errorMessage)
      toast({
        title: "Erro inesperado",
        description: errorMessage,
        variant: "destructive",
      })
      return { success: false, error: errorMessage }
    } finally {
      setSaving(false)
    }
  }

  // Função para testar conexão - CORRIGIDA PARA AUTORIZAÇÃO
  const testConnection = async (): Promise<{ success: boolean; message: string; connectionSteps?: ConnectionSteps }> => {
    console.log('🔗 [useClienteMetaAdsFixed] === INICIANDO TESTE DE CONEXÃO ===')
    setLastError('')
    setConnectionSteps(null)
    
    try {
      // CORREÇÃO CRÍTICA: Obter sessão atual para autorização
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('❌ [useClienteMetaAdsFixed] Erro de sessão:', sessionError)
        const errorMsg = 'Usuário não autenticado. Faça login novamente.'
        setLastError(errorMsg)
        toast({
          title: "Erro de autenticação",
          description: errorMsg,
          variant: "destructive",
        })
        return { success: false, message: errorMsg }
      }

      console.log('🔑 [useClienteMetaAdsFixed] Sessão válida, fazendo chamada autorizada...')

      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: {
          action: 'test_connection',
          config: config
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (error) {
        console.error('❌ [useClienteMetaAdsFixed] Erro na edge function:', error)
        
        // Tratamento específico para erros de autorização
        if (error.message?.includes('401') || error.message?.includes('authorization')) {
          const errorMsg = 'Erro de autorização. Faça login novamente.'
          setLastError(errorMsg)
          toast({
            title: "Erro de autorização",
            description: errorMsg,
            variant: "destructive",
          })
          return { success: false, message: errorMsg }
        }
        
        const errorMsg = 'Erro na conexão com o servidor'
        setLastError(errorMsg)
        toast({
          title: "Erro de conexão",
          description: errorMsg,
          variant: "destructive",
        })
        return { success: false, message: errorMsg }
      }

      console.log('✅ [useClienteMetaAdsFixed] Resposta da API:', data)
      
      if (!data.success) {
        setLastError(data.message)
        console.error('❌ [useClienteMetaAdsFixed] Teste falhou:', data.message)
        toast({
          title: "Teste de conexão falhou",
          description: data.message,
          variant: "destructive",
        })
        
        return { 
          success: false, 
          message: data.message
        }
      } else {
        setConnectionSteps(data.connectionSteps)
        
        // MARCAR PASSO 6 quando teste de conexão é bem-sucedido
        console.log('✅ [useClienteMetaAdsFixed] Teste de conexão OK - marcando passo 6')
        await marcarPasso(6)
        
        toast({
          title: "Conexão bem-sucedida!",
          description: data.message,
        })
        
        return { 
          success: true, 
          message: data.message,
          connectionSteps: data.connectionSteps
        }
      }
      
    } catch (error) {
      console.error('❌ [useClienteMetaAdsFixed] Erro inesperado:', error)
      const errorMsg = 'Erro inesperado na conexão'
      setLastError(errorMsg)
      toast({
        title: "Erro inesperado",
        description: errorMsg,
        variant: "destructive",
      })
      return { success: false, message: errorMsg }
    }
  }

  // Função de carregamento de métricas - CORRIGIDA PARA AUTORIZAÇÃO
  const loadMetricsWithPeriod = async (period: string, startDate?: string, endDate?: string) => {
    console.log('📊 [META ADS METRICS] === INÍCIO CARREGAMENTO MÉTRICAS ===')
    console.log('📊 [META ADS METRICS] Parâmetros:', { period, startDate, endDate, isConfigured })
    
    if (!isConfigured) {
      console.log('⚠️ [META ADS METRICS] Tentativa de carregar métricas sem config')
      return { success: false, message: 'Configuração Meta Ads necessária' }
    }

    try {
      // CORREÇÃO CRÍTICA: Obter sessão atual para autorização
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('❌ [META ADS METRICS] Erro de sessão:', sessionError)
        setLastError('Usuário não autenticado. Faça login novamente.')
        return { success: false, message: 'Usuário não autenticado' }
      }

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
        body: payload,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      console.log('📥 [META ADS METRICS] Resposta da Edge Function:', { 
        success: insightResult?.success,
        hasInsights: !!insightResult?.insights,
        insightsLength: insightResult?.insights?.length || 0,
        error: error || insightResult?.error || null
      })

      if (error) {
        console.error('❌ [META ADS METRICS] Erro na edge function:', error)
        
        // Tratamento específico para erros de autorização
        if (error.message?.includes('401') || error.message?.includes('authorization')) {
          setLastError('Erro de autorização. Faça login novamente.')
          return { success: false, message: 'Erro de autorização' }
        }
        
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
        
        setInsights([])
        const message = insightResult?.message || 'Nenhum dado encontrado para o período selecionado'
        setLastError(message)
        return { 
          success: false, 
          message,
          period_used: insightResult?.period_used
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
    saving,
    insights,
    lastError,
    connectionSteps,
    isConfigured,
    saveConfig,
    testConnection,
    loadMetricsWithPeriod,
    refreshConfig
  }
}
