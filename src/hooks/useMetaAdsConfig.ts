
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface MetaAdsConfig {
  appId: string
  appSecret: string
  accessToken: string
  adAccountId: string
}

export function useMetaAdsConfig() {
  const { user } = useAuth()
  const [config, setConfig] = useState<MetaAdsConfig>({
    appId: '',
    appSecret: '',
    accessToken: '',
    adAccountId: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Carregar configuração existente
  useEffect(() => {
    const loadConfig = async () => {
      if (!user?.email) return

      console.log('🔍 [useMetaAdsConfig] Carregando configuração para:', user.email)
      
      try {
        const { data, error } = await supabase
          .from('meta_ads_configs')
          .select('*')
          .eq('email_usuario', user.email)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('❌ [useMetaAdsConfig] Erro ao carregar configuração:', error)
        } else if (data) {
          console.log('✅ [useMetaAdsConfig] Configuração carregada:', data)
          setConfig({
            appId: data.api_id || '',
            appSecret: data.app_secret || '',
            accessToken: data.access_token || '',
            adAccountId: data.ad_account_id || ''
          })
        } else {
          console.log('📝 [useMetaAdsConfig] Nenhuma configuração encontrada')
        }
      } catch (error) {
        console.error('❌ [useMetaAdsConfig] Erro inesperado:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [user?.email])

  const saveConfig = async (newConfig: MetaAdsConfig) => {
    if (!user?.email) return { success: false, error: 'Usuário não autenticado' }

    setSaving(true)
    console.log('💾 [useMetaAdsConfig] Salvando configuração...')

    try {
      const { error } = await supabase
        .from('meta_ads_configs')
        .upsert({
          email_usuario: user.email,
          api_id: newConfig.appId,
          app_secret: newConfig.appSecret,
          access_token: newConfig.accessToken,
          ad_account_id: newConfig.adAccountId,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('❌ [useMetaAdsConfig] Erro ao salvar:', error)
        return { success: false, error: error.message }
      }

      setConfig(newConfig)
      console.log('✅ [useMetaAdsConfig] Configuração salva com sucesso')
      return { success: true }
    } catch (error) {
      console.error('❌ [useMetaAdsConfig] Erro inesperado ao salvar:', error)
      return { success: false, error: 'Erro inesperado' }
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    console.log('🔗 [useMetaAdsConfig] Testando conexão com Meta Ads...')
    // TODO: Implementar teste real da API do Meta Ads
    // Por enquanto, simular sucesso se todos os campos estão preenchidos
    const isValid = config.appId && config.appSecret && config.accessToken && config.adAccountId
    
    if (isValid) {
      console.log('✅ [useMetaAdsConfig] Simulação: Conexão OK')
      return { success: true, message: 'Conexão simulada com sucesso!' }
    } else {
      console.log('❌ [useMetaAdsConfig] Campos obrigatórios não preenchidos')
      return { success: false, message: 'Preencha todos os campos obrigatórios' }
    }
  }

  const isConfigured = config.appId && config.appSecret && config.accessToken && config.adAccountId

  return {
    config,
    setConfig,
    loading,
    saving,
    saveConfig,
    testConnection,
    isConfigured
  }
}
