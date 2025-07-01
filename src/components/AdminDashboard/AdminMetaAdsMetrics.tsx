
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Target
} from 'lucide-react'

export function AdminMetaAdsMetrics() {
  const { 
    insights, 
    fetchingInsights, 
    lastError,
    isConfigured,
    fetchTodayInsights 
  } = useAdminMetaAds()

  // Buscar insights automaticamente ao montar o componente
  useEffect(() => {
    if (isConfigured) {
      fetchTodayInsights()
    }
  }, [isConfigured])

  const handleRefresh = () => {
    fetchTodayInsights()
  }

  if (!isConfigured) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Meta Ads - Hoje
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

  return (
    <div className="space-y-6">
      {/* Header com botão de refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Meta Ads - Relatório de Hoje
          </h3>
          <p className="text-sm text-muted-foreground">
            Dados em tempo real das campanhas ativas
          </p>
        </div>
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

      {/* Status */}
      {lastError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Erro:</span>
              <span className="text-sm">{lastError}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {fetchingInsights && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Carregando dados de hoje...
          </CardContent>
        </Card>
      )}

      {/* Métricas principais */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Valor Gasto Hoje */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gasto Hoje</CardTitle>
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
              <CardTitle className="text-sm font-medium">Custo por Mensagem</CardTitle>
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
            <p className="font-medium text-muted-foreground">Nenhum dado disponível para hoje</p>
            <p className="text-sm text-muted-foreground mt-1">
              Clique em "Atualizar" para buscar os dados mais recentes
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
