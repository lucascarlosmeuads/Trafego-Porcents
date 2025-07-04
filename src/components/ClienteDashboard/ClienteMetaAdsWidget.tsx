
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useClienteMetaAdsSimplified } from '@/hooks/useClienteMetaAdsSimplified'
import { formatCurrency } from '@/lib/utils'
import { 
  BarChart3, 
  Eye, 
  MousePointer, 
  DollarSign,
  RefreshCw,
  TrendingUp,
  Info,
  AlertCircle,
  MessageSquare
} from 'lucide-react'

interface ClienteMetaAdsWidgetProps {
  clienteId: string
  nomeCliente: string
}

export function ClienteMetaAdsWidget({ clienteId, nomeCliente }: ClienteMetaAdsWidgetProps) {
  const {
    insights,
    loading,
    isConfigured,
    loadMetricsWithPeriod,
    lastError
  } = useClienteMetaAdsSimplified(clienteId)

  const [loadingData, setLoadingData] = useState(false)
  const [lastFetchInfo, setLastFetchInfo] = useState('')
  const [fallbackMessage, setFallbackMessage] = useState('')

  // Auto-carregar métricas quando configurado
  useEffect(() => {
    if (isConfigured && insights.length === 0) {
      handleLoadMetrics()
    }
  }, [isConfigured])

  const handleLoadMetrics = async (period: string = 'today') => {
    setLoadingData(true)
    setLastFetchInfo('')
    setFallbackMessage('')
    
    const result = await loadMetricsWithPeriod(period)
    
    if (result.success) {
      setLastFetchInfo(`Dados carregados: ${result.period_used || period}`)
      if (result.fallback_used) {
        setFallbackMessage(result.message || '')
      }
    } else {
      setLastFetchInfo('')
      if (result.suggestions?.length > 0) {
        setFallbackMessage(`Dica: ${result.suggestions[0]}`)
      }
    }
    
    setLoadingData(false)
  }

  const handleTryYesterday = () => {
    handleLoadMetrics('yesterday')
  }

  const handleTryLast7Days = () => {
    handleLoadMetrics('last_7_days')
  }

  // Se não está configurado, mostrar mensagem para contatar gestor
  if (!isConfigured && !loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Meta Ads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-blue-200 bg-blue-50">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <p className="font-medium">Meta Ads não configurado</p>
                <p className="text-sm">
                  Entre em contato com seu gestor para configurar a integração do Meta Ads 
                  e começar a acompanhar suas métricas em tempo real.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Se está carregando
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Meta Ads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-500">Verificando configuração...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calcular métricas totais
  const totalMetrics = insights.reduce((acc, insight) => ({
    impressions: acc.impressions + parseInt(insight.impressions || '0'),
    clicks: acc.clicks + parseInt(insight.clicks || '0'),
    spend: acc.spend + parseFloat(insight.spend || '0'),
    ctr: acc.ctr + parseFloat(insight.ctr || '0')
  }), {
    impressions: 0,
    clicks: 0,
    spend: 0,
    ctr: 0
  })

  const avgCTR = insights.length > 0 ? totalMetrics.ctr / insights.length : 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Meta Ads
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLoadMetrics()}
            disabled={loadingData}
          >
            {loadingData ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </CardTitle>
        {lastFetchInfo && (
          <p className="text-xs text-green-600">{lastFetchInfo}</p>
        )}
      </CardHeader>
      <CardContent>
        {/* Mensagem de fallback */}
        {fallbackMessage && (
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {fallbackMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Erro com sugestões */}
        {lastError && !loadingData && (
          <Alert className="mb-4 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-2">
                <p>{lastError}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleTryYesterday}>
                    Tentar Ontem
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleTryLast7Days}>
                    Últimos 7 dias
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {insights.length > 0 ? (
          <div className="space-y-4">
            {/* Métricas em Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-blue-700">
                  {totalMetrics.impressions.toLocaleString()}
                </div>
                <div className="text-xs text-blue-600">Impressões</div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded-lg">
                <MousePointer className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-green-700">
                  {totalMetrics.clicks.toLocaleString()}
                </div>
                <div className="text-xs text-green-600">Cliques</div>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-purple-700">
                  {formatCurrency(totalMetrics.spend)}
                </div>
                <div className="text-xs text-purple-600">Investido</div>
              </div>

              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-orange-700">
                  {avgCTR.toFixed(2)}%
                </div>
                <div className="text-xs text-orange-600">CTR Médio</div>
              </div>
            </div>
          </div>
        ) : !loadingData && !lastError ? (
          <div className="text-center py-4">
            <BarChart3 className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-3">
              Carregue as métricas Meta Ads
            </p>
            <div className="flex gap-2 justify-center">
              <Button size="sm" onClick={() => handleLoadMetrics('today')}>
                Hoje
              </Button>
              <Button size="sm" variant="outline" onClick={handleTryYesterday}>
                Ontem
              </Button>
              <Button size="sm" variant="outline" onClick={handleTryLast7Days}>
                7 dias
              </Button>
            </div>
          </div>
        ) : null}

        {/* Loading state */}
        {loadingData && (
          <div className="text-center py-4">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-500">Carregando métricas...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
