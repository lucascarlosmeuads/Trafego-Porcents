
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAdminMetaAds } from '@/hooks/useAdminMetaAds'
import { formatCurrency } from '@/lib/utils'
import { 
  DollarSign, 
  Eye, 
  MousePointer, 
  MessageCircle, 
  RefreshCw, 
  TrendingUp,
  Activity,
  Target,
  Calendar,
  AlertCircle,
  Info
} from 'lucide-react'

export function AdminMetaAdsMetrics() {
  const { 
    insights, 
    fetchingInsights, 
    lastError,
    isConfigured,
    fetchTodayInsights,
    fetchInsightsWithPeriod
  } = useAdminMetaAds()

  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'yesterday' | 'last_7_days' | 'last_30_days'>('today')
  const [lastFetchInfo, setLastFetchInfo] = useState<string>('')

  // Buscar insights automaticamente ao montar o componente
  useEffect(() => {
    if (isConfigured) {
      fetchTodayInsights()
    }
  }, [isConfigured])

  const handleRefresh = async () => {
    if (selectedPeriod === 'today') {
      const result = await fetchTodayInsights()
      if (result?.period_used) {
        setLastFetchInfo(`Dados encontrados para: ${result.period_used}`)
      }
    } else {
      const result = await fetchInsightsWithPeriod(selectedPeriod)
      if (result?.success) {
        setLastFetchInfo(`Dados encontrados para: ${result.period_used || selectedPeriod}`)
      } else {
        setLastFetchInfo('')
      }
    }
  }

  const handlePeriodChange = async (period: 'today' | 'yesterday' | 'last_7_days' | 'last_30_days') => {
    setSelectedPeriod(period)
    setLastFetchInfo('')
    
    if (period === 'today') {
      const result = await fetchTodayInsights()
      if (result?.period_used) {
        setLastFetchInfo(`Dados encontrados para: ${result.period_used}`)
      }
    } else {
      const result = await fetchInsightsWithPeriod(period)
      if (result?.success) {
        setLastFetchInfo(`Dados encontrados para: ${result.period_used || period}`)
      }
    }
  }

  if (!isConfigured) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Meta Ads - Métricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Configure primeiro o Meta Ads</p>
            <p className="text-sm">Expanda a seção de configuração acima para começar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const periodLabels = {
    today: 'Hoje (automático)',
    yesterday: 'Ontem',
    last_7_days: 'Últimos 7 dias',
    last_30_days: 'Últimos 30 dias'
  }

  return (
    <div className="space-y-6">
      {/* Header com seletor de período e botão de refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Meta Ads - Relatórios
          </h3>
          <p className="text-sm text-muted-foreground">
            Dados das campanhas ativas
          </p>
          {lastFetchInfo && (
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
              <Info className="h-3 w-3" />
              {lastFetchInfo}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(periodLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleRefresh} 
            disabled={fetchingInsights}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${fetchingInsights ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Info sobre período "Hoje (automático)" */}
      {selectedPeriod === 'today' && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Modo Automático:</strong> Se não houver dados para hoje, o sistema buscará automaticamente dados de ontem ou dos últimos 7 dias.
          </AlertDescription>
        </Alert>
      )}

      {/* Status de erro */}
      {lastError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-medium mb-1">Erro ao buscar dados:</div>
            <div className="text-sm">{lastError}</div>
            {lastError.includes('campanhas') && (
              <div className="text-sm mt-2 text-red-700">
                💡 <strong>Dica:</strong> Acesse o Facebook Ads Manager para verificar suas campanhas e certificar-se de que estão ativas.
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {fetchingInsights && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Carregando dados...
          </CardContent>
        </Card>
      )}

      {/* Métricas principais */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Valor Gasto */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investimento</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(insights.spend)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total investido nas campanhas
              </p>
            </CardContent>
          </Card>

          {/* Custo por Mensagem */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo por Lead</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(insights.cost_per_message || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Baseado em {insights.clicks} cliques
              </p>
            </CardContent>
          </Card>

          {/* Impressões */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impressões</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {insights.impressions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                CPM: {formatCurrency(insights.cpm)}
              </p>
            </CardContent>
          </Card>

          {/* Cliques */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cliques</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {insights.clicks.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                CTR: {insights.ctr.toFixed(2)}% | CPC: {formatCurrency(insights.cpc)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estado vazio */}
      {!fetchingInsights && !insights && !lastError && (
        <Card>
          <CardContent className="text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="font-medium text-muted-foreground">Nenhum dado disponível</p>
            <p className="text-sm text-muted-foreground mt-1">
              Selecione um período e clique em "Atualizar" para buscar os dados
            </p>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Buscar Dados
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
