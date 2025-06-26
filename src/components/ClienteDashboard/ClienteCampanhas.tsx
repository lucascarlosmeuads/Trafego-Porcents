
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, BarChart, Eye, Activity, DollarSign, Calendar, Target, TrendingUp, RefreshCw } from 'lucide-react'
import { useClienteMetaAds } from '@/hooks/useClienteMetaAds'
import { useClienteData } from '@/hooks/useClienteData'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface ClienteCampanhasProps {
  onBack: () => void
}

export function ClienteCampanhas({ onBack }: ClienteCampanhasProps) {
  const { user } = useAuth()
  const { cliente } = useClienteData(user?.email || '')
  const [refreshing, setRefreshing] = useState(false)

  const { 
    insights, 
    campaigns, 
    fetchInsights, 
    fetchCampaigns,
    loading: metaAdsLoading,
    isConfigured,
    lastError,
    connectionSteps
  } = useClienteMetaAds(cliente?.id?.toString() || '')

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      if (cliente?.id && isConfigured) {
        try {
          await Promise.all([
            fetchCampaigns(),
            fetchInsights()
          ])
        } catch (error) {
          console.error('Erro ao carregar dados:', error)
        }
      }
    }

    loadData()
  }, [cliente?.id, isConfigured, fetchCampaigns, fetchInsights])

  const handleRefresh = async () => {
    if (!isConfigured) return
    
    setRefreshing(true)
    try {
      await Promise.all([
        fetchCampaigns(),
        fetchInsights()
      ])
    } catch (error) {
      console.error('Erro ao atualizar dados:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Calcular métricas agregadas
  const metaAdsMetrics = insights.reduce((acc, insight) => ({
    impressions: acc.impressions + parseInt(insight.impressions || '0'),
    clicks: acc.clicks + parseInt(insight.clicks || '0'),
    spend: acc.spend + parseFloat(insight.spend || '0'),
    cpm: acc.cpm + parseFloat(insight.cpm || '0'),
    cpc: acc.cpc + parseFloat(insight.cpc || '0'),
    ctr: acc.ctr + parseFloat(insight.ctr || '0')
  }), {
    impressions: 0,
    clicks: 0,
    spend: 0,
    cpm: 0,
    cpc: 0,
    ctr: 0
  })

  const avgCPM = insights.length > 0 ? metaAdsMetrics.cpm / insights.length : 0
  const avgCPC = insights.length > 0 ? metaAdsMetrics.cpc / insights.length : 0
  const avgCTR = insights.length > 0 ? metaAdsMetrics.ctr / insights.length : 0

  if (!isConfigured) {
    return (
      <div className="p-6 bg-gray-950 min-h-screen">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-white">Campanhas Meta Ads</h1>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-600 mb-2">Meta Ads não configurado</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Entre em contato com seu gestor para configurar a integração do Meta Ads 
              e começar a acompanhar suas campanhas em tempo real.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (lastError) {
    return (
      <div className="p-6 bg-gray-950 min-h-screen">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-white">Campanhas Meta Ads</h1>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="font-medium text-red-600 mb-2">Erro ao carregar campanhas</h3>
            <p className="text-sm text-red-500 max-w-md mx-auto mb-4">
              {lastError}
            </p>
            <Button onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-950 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-white">Campanhas Meta Ads</h1>
          <Badge variant="outline" className="text-green-400 border-green-400">
            Conectado
          </Badge>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing || metaAdsLoading}
          variant="outline"
          className="text-white border-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressões</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metaAdsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-400">
                  {metaAdsMetrics.impressions.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  CPM: {formatCurrency(avgCPM)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metaAdsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-400">
                  {metaAdsMetrics.clicks.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  CTR: {avgCTR.toFixed(2)}%
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investimento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metaAdsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-purple-400">
                  {formatCurrency(metaAdsMetrics.spend)}
                </div>
                <p className="text-xs text-muted-foreground">
                  CPC: {formatCurrency(avgCPC)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metaAdsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-400">
                  {campaigns.filter(c => c.status === 'ACTIVE').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {campaigns.length} campanhas totais
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de campanhas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Suas Campanhas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metaAdsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-600">Nenhuma campanha encontrada</h3>
              <p className="text-sm text-gray-500">
                Suas campanhas aparecerão aqui assim que forem criadas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{campaign.name}</h3>
                      <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-4">
                        <span>Objetivo: {campaign.objective}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Criado em {new Date(campaign.created_time).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">ID: {campaign.id}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance insights */}
      {insights.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Detalhada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {metaAdsMetrics.impressions.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600 mb-2">Impressões Totais</div>
                <div className="text-xs text-gray-600">
                  CPM Médio: {formatCurrency(avgCPM)}
                </div>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-lg">
                <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {metaAdsMetrics.clicks.toLocaleString()}
                </div>
                <div className="text-sm text-green-600 mb-2">Cliques Totais</div>
                <div className="text-xs text-gray-600">
                  CTR Médio: {avgCTR.toFixed(2)}%
                </div>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {formatCurrency(metaAdsMetrics.spend)}
                </div>
                <div className="text-sm text-purple-600 mb-2">Investimento Total</div>
                <div className="text-xs text-gray-600">
                  CPC Médio: {formatCurrency(avgCPC)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
