
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGestorMetaAds } from '@/hooks/useGestorMetaAds'
import { GestorMetaAdsDateFilter } from './GestorMetaAdsDateFilter'
import { formatCurrency } from '@/lib/utils'
import { 
  RefreshCw, 
  Activity,
  Target,
  AlertCircle,
  Info,
  Eye,
  MousePointer,
  DollarSign,
  TrendingUp
} from 'lucide-react'

export function GestorMetaAdsMetrics() {
  const { 
    insights, 
    fetchingInsights, 
    lastError,
    isConfigured,
    fetchTodayInsights,
    fetchInsightsWithPeriod
  } = useGestorMetaAds()

  const [lastFetchInfo, setLastFetchInfo] = useState<string>('')
  const [campaignsInfo, setCampaignsInfo] = useState<{count: number, details?: string}>({count: 0})

  // Buscar insights automaticamente ao montar o componente
  useEffect(() => {
    if (isConfigured) {
      fetchTodayInsights().then((result) => {
        if (result.success) {
          setLastFetchInfo(`Dados encontrados para: ${result.period_used || 'hoje'}`)
          setCampaignsInfo({
            count: result.campaigns_count || 0,
            details: `${result.campaigns_count || 0} campanha(s) processada(s)`
          })
        }
      })
    }
  }, [isConfigured])

  // Função para calcular datas baseadas no preset
  const getDateRangeFromPreset = (preset: string) => {
    const hoje = new Date()
    const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000)
    
    switch (preset) {
      case 'today':
        return {
          startDate: hoje.toISOString().split('T')[0],
          endDate: hoje.toISOString().split('T')[0]
        }
      case 'yesterday':
        return {
          startDate: ontem.toISOString().split('T')[0],
          endDate: ontem.toISOString().split('T')[0]
        }
      case 'last_7_days':
        const sete_dias_atras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000)
        return {
          startDate: sete_dias_atras.toISOString().split('T')[0],
          endDate: hoje.toISOString().split('T')[0]
        }
      case 'last_30_days':
        const trinta_dias_atras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
        return {
          startDate: trinta_dias_atras.toISOString().split('T')[0],
          endDate: hoje.toISOString().split('T')[0]
        }
      default:
        return {
          startDate: hoje.toISOString().split('T')[0],
          endDate: hoje.toISOString().split('T')[0]
        }
    }
  }

  const handleDateRangeChange = async (startDate: string, endDate: string, preset?: string) => {
    setLastFetchInfo('')
    setCampaignsInfo({count: 0})
    
    if (preset === 'today') {
      const result = await fetchTodayInsights()
      if (result.success) {
        setLastFetchInfo(`Dados encontrados para: ${result.period_used || 'hoje'}`)
        setCampaignsInfo({
          count: result.campaigns_count || 0,
          details: `${result.campaigns_count || 0} campanha(s) processada(s)`
        })
      }
    } else if (preset && preset !== 'custom') {
      const result = await fetchInsightsWithPeriod(preset as any)
      if (result.success) {
        setLastFetchInfo(`Dados encontrados para: ${result.period_used || preset}`)
        setCampaignsInfo({
          count: result.campaigns_count || 0,
          details: `${result.campaigns_count || 0} campanha(s) processada(s)`
        })
      } else {
        setLastFetchInfo('')
        setCampaignsInfo({count: 0})
      }
    } else if (preset === 'custom' && startDate && endDate) {
      const result = await fetchInsightsWithPeriod('custom' as any, startDate, endDate)
      if (result.success) {
        setLastFetchInfo(`Dados encontrados para: ${startDate} até ${endDate}`)
        setCampaignsInfo({
          count: result.campaigns_count || 0,
          details: `${result.campaigns_count || 0} campanha(s) processada(s)`
        })
      } else {
        setLastFetchInfo('')
        setCampaignsInfo({count: 0})
      }
    }
  }

  if (!isConfigured) {
    return (
      <Card className="w-full bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5" />
            Meta Ads - Métricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Configure primeiro o Meta Ads</p>
            <p className="text-sm">Expanda a seção de configuração acima para começar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
          <Activity className="h-5 w-5" />
          Meta Ads - Relatórios
        </h3>
        <p className="text-sm text-gray-400">
          Métricas das suas campanhas de tráfego pago
        </p>
      </div>

      {/* Filtro de datas */}
      <GestorMetaAdsDateFilter 
        onDateRangeChange={handleDateRangeChange}
        loading={fetchingInsights}
        lastFetchInfo={lastFetchInfo}
      />

      {/* Informações sobre os dados */}
      {lastFetchInfo && (
        <Alert className="border-green-800 bg-green-900/20">
          <Info className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300">
            <div className="font-medium mb-1">✅ {lastFetchInfo}</div>
            {campaignsInfo.details && (
              <div className="text-sm">
                📊 {campaignsInfo.details}
              </div>
            )}
            {insights && (
              <div className="text-sm mt-1">
                💰 Investimento total: {formatCurrency(parseFloat(insights.spend || '0'))}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Status de erro */}
      {lastError && (
        <Alert className="border-red-800 bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            <div className="font-medium mb-1">Erro ao buscar dados:</div>
            <div className="text-sm">{lastError}</div>
            {lastError.includes('campanhas') && (
              <div className="text-sm mt-2 text-red-400">
                💡 <strong>Dica:</strong> Acesse o Facebook Ads Manager para verificar suas campanhas e certificar-se de que estão ativas.
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {fetchingInsights && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2 text-purple-400" />
            <span className="text-gray-300">Carregando dados...</span>
          </CardContent>
        </Card>
      )}

      {/* Cards de métricas */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Impressões
              </CardTitle>
              <Eye className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {parseInt(insights.impressions || '0').toLocaleString()}
              </div>
              <p className="text-xs text-gray-400">
                Visualizações dos anúncios
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Cliques
              </CardTitle>
              <MousePointer className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {parseInt(insights.clicks || '0').toLocaleString()}
              </div>
              <p className="text-xs text-gray-400">
                CTR: {parseFloat(insights.ctr || '0').toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Investimento
              </CardTitle>
              <DollarSign className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(parseFloat(insights.spend || '0'))}
              </div>
              <p className="text-xs text-gray-400">
                CPC: {formatCurrency(parseFloat(insights.cpc || '0'))}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                CPM
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(parseFloat(insights.cpm || '0'))}
              </div>
              <p className="text-xs text-gray-400">
                Custo por mil impressões
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estado vazio */}
      {!fetchingInsights && !insights && !lastError && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-600 opacity-50" />
            <p className="font-medium text-gray-400">Nenhum dado disponível</p>
            <p className="text-sm text-gray-500 mt-1">
              Selecione um período acima para buscar os dados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
