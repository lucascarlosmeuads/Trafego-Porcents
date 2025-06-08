
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

interface MetaAdsConfig {
  api_id: string
  app_secret: string
  access_token: string
  ad_account_id: string
}

interface MetaAdsReportData {
  spend: number
  impressions: number
  clicks: number
  cpc: number
  ctr: number
  cpm: number
  report_date: string
}

export function useAdminMetaAds() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [config, setConfig] = useState<MetaAdsConfig | null>(null)
  const [reportData, setReportData] = useState<MetaAdsReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar configuração salva
  const loadSavedConfig = useCallback(async () => {
    if (!user?.email) return

    try {
      const { data, error } = await supabase
        .from('meta_ads_configs')
        .select('*')
        .eq('email_usuario', user.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setConfig({
          api_id: data.api_id,
          app_secret: data.app_secret,
          access_token: data.access_token,
          ad_account_id: data.ad_account_id
        })
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
    }
  }, [user?.email])

  // Testar conexão com a API do Meta
  const handleTestConnection = async (configData: MetaAdsConfig): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      // Simular teste da API do Meta (em produção, fazer chamada real)
      const apiUrl = `https://graph.facebook.com/v18.0/${configData.ad_account_id}/insights`
      const params = new URLSearchParams({
        access_token: configData.access_token,
        fields: 'account_id',
        limit: '1'
      })

      const response = await fetch(`${apiUrl}?${params}`)
      const result = await response.json()

      if (!response.ok) {
        let errorMessage = 'Erro de conexão. Tente novamente.'
        
        if (result.error) {
          switch (result.error.code) {
            case 190:
              errorMessage = 'Token inválido. Verifique se copiou corretamente.'
              break
            case 17:
              errorMessage = 'Conta não encontrada. Confira o ID da conta de anúncios.'
              break
            case 10:
              errorMessage = 'Sem permissão para essa conta.'
              break
            default:
              errorMessage = result.error.message || errorMessage
          }
        }
        
        setError(errorMessage)
        toast({
          title: "Erro na Conexão",
          description: errorMessage,
          variant: "destructive"
        })
        return false
      }

      return true
    } catch (error) {
      const errorMessage = 'Erro de conexão. Tente novamente.'
      setError(errorMessage)
      toast({
        title: "Erro na Conexão",
        description: errorMessage,
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Salvar configuração no Supabase
  const handleSaveConfig = async (configData: MetaAdsConfig) => {
    if (!user?.email) return

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('meta_ads_configs')
        .upsert({
          email_usuario: user.email,
          ...configData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email_usuario'
        })

      if (error) throw error

      setConfig(configData)
    } catch (error) {
      const errorMessage = 'Erro ao salvar configuração.'
      setError(errorMessage)
      toast({
        title: "Erro ao Salvar",
        description: errorMessage,
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Carregar relatório da API do Meta
  const handleLoadReport = async (configData: MetaAdsConfig) => {
    setLoading(true)
    setError(null)

    try {
      const apiUrl = `https://graph.facebook.com/v18.0/${configData.ad_account_id}/insights`
      const params = new URLSearchParams({
        access_token: configData.access_token,
        fields: 'spend,impressions,clicks,cpc,ctr,cpm',
        time_range: JSON.stringify({
          since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          until: new Date().toISOString().split('T')[0]
        })
      })

      const response = await fetch(`${apiUrl}?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Erro ao carregar relatório')
      }

      const data = result.data[0] || {}
      const reportData: MetaAdsReportData = {
        spend: parseFloat(data.spend || '0'),
        impressions: parseInt(data.impressions || '0'),
        clicks: parseInt(data.clicks || '0'),
        cpc: parseFloat(data.cpc || '0'),
        ctr: parseFloat(data.ctr || '0'),
        cpm: parseFloat(data.cpm || '0'),
        report_date: new Date().toISOString().split('T')[0]
      }

      setReportData(reportData)

      // Salvar relatório no banco
      if (user?.email) {
        await supabase
          .from('meta_ads_reports')
          .upsert({
            email_usuario: user.email,
            ad_account_id: configData.ad_account_id,
            ...reportData
          }, {
            onConflict: 'email_usuario,ad_account_id,report_date'
          })
      }

    } catch (error) {
      const errorMessage = 'Erro ao carregar relatório. Verifique suas credenciais.'
      setError(errorMessage)
      toast({
        title: "Erro no Relatório",
        description: errorMessage,
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Limpar configurações
  const handleClearConfig = async () => {
    if (!user?.email) return

    setLoading(true)
    try {
      await supabase
        .from('meta_ads_configs')
        .delete()
        .eq('email_usuario', user.email)

      setConfig(null)
      setReportData(null)
      setError(null)
    } catch (error) {
      console.error('Erro ao limpar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSavedConfig()
  }, [loadSavedConfig])

  return {
    config,
    reportData,
    loading,
    error,
    handleSaveConfig,
    handleTestConnection,
    handleClearConfig,
    handleLoadReport
  }
}
