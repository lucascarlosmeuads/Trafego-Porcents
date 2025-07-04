
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useClienteMetaAdsSimplified } from '@/hooks/useClienteMetaAdsSimplified'
import { formatCurrency } from '@/lib/utils'
import { 
  CheckCircle, 
  AlertCircle, 
  BarChart3, 
  Eye, 
  MousePointer, 
  DollarSign,
  RefreshCw,
  Calendar,
  MessageSquare
} from 'lucide-react'

interface ClienteMetaAdsModalSimplifiedProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clienteId: string
  nomeCliente: string
}

type PeriodOption = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'custom'

export function ClienteMetaAdsModalSimplified({ 
  open, 
  onOpenChange, 
  clienteId, 
  nomeCliente 
}: ClienteMetaAdsModalSimplifiedProps) {
  const {
    loading,
    insights,
    lastError,
    isConfigured,
    loadMetricsWithPeriod
  } = useClienteMetaAdsSimplified(clienteId)

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('last_7_days')
  const [loadingMetrics, setLoadingMetrics] = useState(false)

  const handleLoadMetrics = async () => {
    setLoadingMetrics(true)
    await loadMetricsWithPeriod(selectedPeriod)
    setLoadingMetrics(false)
  }

  // Auto-carregar métricas quando configurado
  useEffect(() => {
    if (isConfigured && insights.length === 0) {
      handleLoadMetrics()
    }
  }, [isConfigured])

  // Calcular métricas agregadas
  const totalMetrics = insights.reduce((acc, insight) => ({
    impressions: acc.impressions + parseInt(insight.impressions || '0'),
    clicks: acc.clicks + parseInt(insight.clicks || '0'),
    spend: acc.spend + parseFloat(insight.spend || '0'),
    ctr: acc.ctr + parseFloat(insight.ctr || '0'),
    cpc: acc.cpc + parseFloat(insight.cpc || '0')
  }), {
    impressions: 0,
    clicks: 0,
    spend: 0,
    ctr: 0,
    cpc: 0
  })

  const avgCTR = insights.length > 0 ? totalMetrics.ctr / insights.length : 0
  const avgCPC = insights.length > 0 ? totalMetrics.cpc / insights.length : 0

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return 'Hoje'
      case 'yesterday': return 'Ontem'
      case 'last_7_days': return 'Últimos 7 dias'
      case 'last_30_days': return 'Últimos 30 dias'
      default: return 'Últimos 7 dias'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Meta Ads - {nomeCliente}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Carregando configuração...
            </div>
          ) : !isConfigured ? (
            /* Não configurado - mensagem para contatar gestor */
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto text-blue-400 mb-4" />
                <h3 className="font-medium text-blue-900 mb-2">Meta Ads não configurado</h3>
                <p className="text-sm text-blue-700 max-w-md mx-auto mb-6">
                  Entre em contato com seu gestor para configurar a integração do Meta Ads 
                  e começar a acompanhar suas métricas em tempo real.
                </p>
              </CardContent>
            </Card>
          ) : (
            /* Métricas configuradas */
            <div className="space-y-6">
              {/* Seletor de Período */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Período das Métricas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <Select value={selectedPeriod} onValueChange={(value: PeriodOption) => setSelectedPeriod(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Hoje</SelectItem>
                          <SelectItem value="yesterday">Ontem</SelectItem>
                          <SelectItem value="last_7_days">Últimos 7 dias</SelectItem>
                          <SelectItem value="last_30_days">Últimos 30 dias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleLoadMetrics}
                      disabled={loadingMetrics}
                      className="flex items-center gap-2"
                    >
                      {loadingMetrics ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Atualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Erro */}
              {lastError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {lastError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Métricas Principais */}
              {insights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-600" />
                        Impressões
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {totalMetrics.impressions.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getPeriodLabel()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <MousePointer className="w-4 h-4 text-green-600" />
                        Cliques
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {totalMetrics.clicks.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        CTR: {avgCTR.toFixed(2)}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                        Investido
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(totalMetrics.spend)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        CPC: {formatCurrency(avgCPC)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-orange-600" />
                        Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {avgCTR.toFixed(2)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        CTR médio
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">Nenhum Dado Disponível</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Selecione um período e clique em "Atualizar" para carregar as métricas
                    </p>
                    <Button onClick={handleLoadMetrics} disabled={loadingMetrics}>
                      {loadingMetrics ? (
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <BarChart3 className="w-4 h-4 mr-2" />
                      )}
                      Carregar Métricas
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
