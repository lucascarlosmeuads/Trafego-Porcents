
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

export interface MetaAdsConfig {
  api_id: string
  app_secret: string
  access_token: string
  ad_account_id: string
}

export interface MetaAdsReport {
  spend: number
  impressions: number
  clicks: number
  cpc: number
}

export function useMetaAds() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<MetaAdsConfig | null>(null)
  const [report, setReport] = useState<MetaAdsReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadConfig = async () => {
    if (!user?.email) return

    try {
      const { data, error } = await supabase
        .from('meta_ads_configs')
        .select('*')
        .eq('email_usuario', user.email)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setConfig({
          api_id: data.api_id,
          app_secret: data.app_secret,
          access_token: data.access_token,
          ad_account_id: data.ad_account_id
        })
      }
    } catch (err) {
      console.error('Erro ao carregar configuração:', err)
    }
  }

  const saveConfig = async (newConfig: MetaAdsConfig) => {
    if (!user?.email) return

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('meta_ads_configs')
        .upsert({
          email_usuario: user.email,
          ...newConfig
        })

      if (error) throw error

      setConfig(newConfig)
      return true
    } catch (err) {
      console.error('Erro ao salvar configuração:', err)
      setError('Erro ao salvar configuração. Tente novamente.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async (testConfig: MetaAdsConfig) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/act_${testConfig.ad_account_id}?fields=name&access_token=${testConfig.access_token}`
      )

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Ops! Token inválido. Verifique se copiou corretamente.')
        } else if (response.status === 403) {
          throw new Error('Sem permissão. Verifique se o token tem acesso a esta conta.')
        } else if (response.status === 404) {
          throw new Error('Conta não encontrada. Confira o ID da conta de anúncios.')
        } else {
          throw new Error('Problema de conexão. Tente novamente em instantes.')
        }
      }

      return true
    } catch (err: any) {
      setError(err.message || 'Erro ao testar conexão.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const fetchReport = async (reportConfig?: MetaAdsConfig) => {
    const configToUse = reportConfig || config
    if (!configToUse || !user?.email) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/act_${configToUse.ad_account_id}/insights?fields=spend,impressions,clicks,cpc&access_token=${configToUse.access_token}`
      )

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Ops! Token inválido. Verifique se copiou corretamente.')
        } else if (response.status === 403) {
          throw new Error('Sem permissão. Verifique se o token tem acesso a esta conta.')
        } else if (response.status === 404) {
          throw new Error('Conta não encontrada. Confira o ID da conta de anúncios.')
        } else {
          throw new Error('Problema de conexão. Tente novamente em instantes.')
        }
      }

      const data = await response.json()
      
      if (!data.data || data.data.length === 0) {
        throw new Error('Nenhum dado encontrado para esta conta.')
      }

      const reportData = data.data[0]
      const newReport: MetaAdsReport = {
        spend: parseFloat(reportData.spend || '0'),
        impressions: parseInt(reportData.impressions || '0'),
        clicks: parseInt(reportData.clicks || '0'),
        cpc: parseFloat(reportData.cpc || '0')
      }

      setReport(newReport)

      // Salvar relatório no histórico
      await supabase
        .from('meta_ads_reports')
        .insert({
          email_usuario: user.email,
          ad_account_id: configToUse.ad_account_id,
          ...newReport
        })

      return newReport
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar relatório.')
      return null
    } finally {
      setLoading(false)
    }
  }

  const clearConfig = async () => {
    if (!user?.email) return

    try {
      await supabase
        .from('meta_ads_configs')
        .delete()
        .eq('email_usuario', user.email)

      setConfig(null)
      setReport(null)
      setError(null)
    } catch (err) {
      console.error('Erro ao limpar configuração:', err)
    }
  }

  return {
    config,
    report,
    loading,
    error,
    loadConfig,
    saveConfig,
    testConnection,
    fetchReport,
    clearConfig,
    setError
  }
}
