
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useClienteMetaAdsSimplified } from '@/hooks/useClienteMetaAdsSimplified'
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { formatCurrency } from '@/lib/utils'
import { 
  ArrowLeft, 
  BarChart3, 
  Eye, 
  MousePointer, 
  DollarSign,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Calendar,
  MessageSquare
} from 'lucide-react'

interface ClienteCampanhasProps {
  onBack: () => void
}

export function ClienteCampanhas({ onBack }: ClienteCampanhasProps) {
  const { user } = useAuth()
  const { cliente } = useClienteData(user?.email || '')
  
  // Usando o hook simplificado unificado
  const {
    loading,
    insights,
    isConfigured,
    lastError,
    loadMetricsWithPeriod
  } = useClienteMetaAdsSimplified(cliente?.id?.toString() || '')

  const [selectedPeriod, setSelectedPeriod] = useState('last_7_days')
  const [loadingData, setLoadingData] = useState(false)
  const [lastFetchInfo, setLastFetchInfo] = useState('')

  // Auto-carregar métricas quando configurado
  useEffect(() => {
    console.log('🔍 [ClienteCampanhas] useEffect disparado:', {
      isConfigured,
      hasInsights: insights.length > 0,
      clienteId: cliente?.id
    })
    
    if (isConfigured && insights.length === 0) {
      console.log('🔄 [ClienteCampanhas] Carregando métricas automaticamente...')
      handleLoadData()
    }
  }, [isConfigured])

  const handleLoadData = async () => {
    console.log('📊 [ClienteCampanhas] Carregando dados para período:', selectedPeriod)
    setLoadingData(true)
    setLastFetchInfo('')
    
    const result = await loadMetricsWithPeriod(selectedPeriod)
    
    console.log('📊 [ClienteCampanhas] Resultado do carregamento:', result)
    
    if (result.success) {
      setLastFetchInfo(`Dados carregados: ${result.period_used || selectedPeriod}`)
    } else {
      setLastFetchInfo('')
    }
    
    setLoadingData(false)
  }

  const handlePeriodChange = async (newPeriod: string) => {
    console.log('📅 [ClienteCampanhas] Mudando período de', selectedPeriod, 'para', newPeriod)
    setSelectedPeriod(newPeriod)
    
    // Carregar dados automaticamente quando o período muda
    setLoadingData(true)
    setLastFetchInfo('')
    
    const result = await loadMetricsWithPeriod(newPeriod)
    
    if (result.success) {
      setLastFetchInfo(`Dados carregados: ${result.period_used || newPeriod}`)
    }
    
    setLoadingData(false)
  }

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
      default: return 'Período selecionado'
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-950 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-gray-400">Carregando dados...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-950 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Meta Ads</h1>
              <p className="text-gray-400">Métricas da sua campanha</p>
            </div>
          </div>
        </div>

        {!isConfigured ? (
          /* Não configurado - mensagem para contatar gestor */
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto text-blue-400 mb-4" />
              <h3 className="font-medium text-white mb-2">Meta Ads não configurado</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                Entre em contato com seu gestor para configurar a integração do Meta Ads 
                e começar a acompanhar suas métricas em tempo real.
              </p>
              <Button onClick={onBack} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Métricas */
          <div className="space-y-6">
            {/* Seletor de Período */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Período das Métricas
                </CardTitle>
                {lastFetchInfo && (
                  <p className="text-sm text-green-400">{lastFetchInfo}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="today">Hoje</SelectItem>
                        <SelectItem value="yesterday">Ontem</SelectItem>
                        <SelectItem value="last_7_days">Últimos 7 dias</SelectItem>
                        <SelectItem value="last_30_days">Últimos 30 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleLoadData}
                    disabled={loadingData}
                  >
                    {loadingData ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Atualizar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Erro */}
            {lastError && (
              <Alert className="border-red-600 bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  {lastError}
                </AlertDescription>
              </Alert>
            )}

            {/* Cards de Métricas */}
            {insights.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-300">
                      <Eye className="w-4 h-4" />
                      Impressões
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-200">
                      {totalMetrics.impressions.toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-400">
                      {getPeriodLabel()}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-900/20 border-green-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-300">
                      <MousePointer className="w-4 h-4" />
                      Cliques
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-200">
                      {totalMetrics.clicks.toLocaleString()}
                    </div>
                    <div className="text-xs text-green-400">
                      CTR: {avgCTR.toFixed(2)}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-900/20 border-purple-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-300">
                      <DollarSign className="w-4 h-4" />
                      Investido
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-200">
                      {formatCurrency(totalMetrics.spend)}
                    </div>
                    <div className="text-xs text-purple-400">
                      CPC: {formatCurrency(avgCPC)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-900/20 border-orange-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-300">
                      <TrendingUp className="w-4 h-4" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-200">
                      {avgCTR.toFixed(2)}%
                    </div>
                    <div className="text-xs text-orange-400">
                      CTR médio
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="text-center py-12">
                  <BarChart3 className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <h3 className="font-medium text-white mb-2">Nenhum Dado Disponível</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Selecione um período e clique em "Atualizar" para carregar as métricas
                  </p>
                  <Button onClick={handleLoadData} disabled={loadingData}>
                    {loadingData ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <BarChart3 className="w-4 h-4 mr-2" />
                    )}
                    Carregar Métricas
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Loading state durante carregamento */}
            {loadingData && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-white">Carregando métricas para {getPeriodLabel()}...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
