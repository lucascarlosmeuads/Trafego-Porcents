
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useClienteMetaAdsSimplified } from '@/hooks/useClienteMetaAdsSimplified'
import { formatCurrency } from '@/lib/utils'
import { 
  BarChart3, 
  Eye, 
  MousePointer, 
  DollarSign,
  RefreshCw,
  Settings,
  TrendingUp
} from 'lucide-react'

interface ClienteMetaAdsWidgetProps {
  clienteId: string
  nomeCliente: string
}

export function ClienteMetaAdsWidget({ clienteId, nomeCliente }: ClienteMetaAdsWidgetProps) {
  const {
    campaigns,
    insights,
    loading,
    isConfigured,
    loadMetricsWithPeriod
  } = useClienteMetaAdsSimplified(clienteId)

  const [loadingData, setLoadingData] = useState(false)

  // Auto-carregar métricas quando configurado
  useEffect(() => {
    if (isConfigured && insights.length === 0) {
      handleLoadMetrics()
    }
  }, [isConfigured])

  const handleLoadMetrics = async () => {
    setLoadingData(true)
    await loadMetricsWithPeriod('last_7_days')
    setLoadingData(false)
  }

  // Se não está configurado, não mostrar nada
  if (!isConfigured || loading) {
    return null
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
            Meta Ads - Últimos 7 dias
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMetrics}
            disabled={loadingData}
          >
            {loadingData ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
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

            {/* Campanhas Ativas */}
            {campaigns.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Campanhas Ativas:</h4>
                <div className="flex flex-wrap gap-2">
                  {campaigns
                    .filter(c => c.status === 'ACTIVE')
                    .slice(0, 3)
                    .map((campaign) => (
                      <Badge key={campaign.id} variant="outline" className="text-xs">
                        {campaign.name}
                      </Badge>
                    ))}
                  {campaigns.filter(c => c.status === 'ACTIVE').length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{campaigns.filter(c => c.status === 'ACTIVE').length - 3} mais
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <BarChart3 className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-3">
              Métricas Meta Ads não carregadas
            </p>
            <Button size="sm" onClick={handleLoadMetrics} disabled={loadingData}>
              {loadingData ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <BarChart3 className="w-4 h-4 mr-2" />
              )}
              Carregar Dados
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
