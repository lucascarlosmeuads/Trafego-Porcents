
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, FileText, Camera, TrendingUp, Calendar, Target, BarChart, Eye, Activity } from 'lucide-react'
import type { Cliente } from '@/lib/supabase'
import type { BriefingCliente, VendaCliente, ArquivoCliente } from '@/hooks/useClienteData'
import { useClienteMetaAds } from '@/hooks/useClienteMetaAds'
import { formatCurrency } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface ClienteDashboardMetricsProps {
  cliente: Cliente | null
  briefing: BriefingCliente | null
  vendas: VendaCliente[]
  arquivos: ArquivoCliente[]
}

export function ClienteDashboardMetrics({ cliente, briefing, vendas, arquivos }: ClienteDashboardMetricsProps) {
  const totalVendas = vendas.reduce((sum, venda) => sum + venda.valor_venda, 0)
  const vendasCount = vendas.length
  const arquivosCount = arquivos.length

  const investimentoDiario = briefing?.investimento_diario || 0
  const diasCampanha = cliente?.data_venda ? 
    Math.max(1, Math.floor((new Date().getTime() - new Date(cliente.data_venda).getTime()) / (1000 * 60 * 60 * 24))) : 0
  const totalInvestido = investimentoDiario * diasCampanha

  // Hook para buscar dados do Meta Ads do cliente específico
  const { 
    insights, 
    campaigns, 
    fetchInsights, 
    fetchCampaigns,
    loading: metaAdsLoading,
    isConfigured,
    lastError
  } = useClienteMetaAds(cliente?.id?.toString() || '')

  const [loadingMetrics, setLoadingMetrics] = useState(false)

  // Carregar métricas Meta Ads quando componente montar
  useEffect(() => {
    const loadMetaAdsData = async () => {
      if (cliente?.id && isConfigured) {
        setLoadingMetrics(true)
        try {
          await Promise.all([
            fetchCampaigns(),
            fetchInsights()
          ])
        } catch (error) {
          console.error('Erro ao carregar dados Meta Ads:', error)
        } finally {
          setLoadingMetrics(false)
        }
      }
    }

    loadMetaAdsData()
  }, [cliente?.id, isConfigured, fetchCampaigns, fetchInsights])

  // Calcular métricas agregadas dos insights
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

  // Médias para CPM, CPC e CTR
  const avgCPM = insights.length > 0 ? metaAdsMetrics.cpm / insights.length : 0
  const avgCPC = insights.length > 0 ? metaAdsMetrics.cpc / insights.length : 0
  const avgCTR = insights.length > 0 ? metaAdsMetrics.ctr / insights.length : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Vendas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalVendas)}</div>
            <p className="text-xs text-muted-foreground">
              {vendasCount} {vendasCount === 1 ? 'venda registrada' : 'vendas registradas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materiais Enviados</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{arquivosCount}</div>
            <p className="text-xs text-muted-foreground">
              Arquivos disponíveis para criação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investimento Estimado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalInvestido)}</div>
            <p className="text-xs text-muted-foreground">
              {diasCampanha} {diasCampanha === 1 ? 'dia' : 'dias'} × {formatCurrency(investimentoDiario)}/dia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Meta Ads */}
      {isConfigured && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impressões</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMetrics ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-blue-600">
                    {metaAdsMetrics.impressions.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Visualizações dos anúncios
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
              {loadingMetrics ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
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
              <CardTitle className="text-sm font-medium">Investimento Real</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMetrics ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-purple-600">
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
              <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMetrics ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-orange-600">
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Status do Briefing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {briefing ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge variant={briefing.liberar_edicao ? "secondary" : "default"}>
                    {briefing.liberar_edicao ? "Em edição" : "Aprovado"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Produto:</span>
                  <span className="text-sm font-medium">{briefing.nome_produto}</span>
                </div>
                {briefing.investimento_diario && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Investimento diário:</span>
                    <span className="text-sm font-medium">{formatCurrency(briefing.investimento_diario)}</span>
                  </div>
                )}
                {briefing.comissao_aceita && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Comissão aceita:</span>
                    <span className="text-sm font-medium">{briefing.comissao_aceita}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Briefing ainda não preenchido. Acesse a aba "Briefing" para começar.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Detalhes da Campanha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cliente ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status atual:</span>
                  <Badge>{cliente.status_campanha || 'Não definido'}</Badge>
                </div>
                {cliente.data_venda && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data da venda:</span>
                    <span className="text-sm font-medium">
                      {new Date(cliente.data_venda).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
                {cliente.data_limite && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data limite:</span>
                    <span className="text-sm font-medium">{cliente.data_limite}</span>
                  </div>
                )}
                {cliente.vendedor && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Vendedor:</span>
                    <span className="text-sm font-medium">{cliente.vendedor}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Site status:</span>
                  <Badge variant="outline">{cliente.site_status || 'Pendente'}</Badge>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma campanha encontrada para seu email.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Card Meta Ads com dados detalhados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Performance Meta Ads
            {isConfigured && (
              <Badge variant="outline" className="ml-2">
                Conectado
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConfigured ? (
            <div className="text-center py-8 space-y-2">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-600">Meta Ads não configurado</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Entre em contato com seu gestor para configurar a integração do Meta Ads 
                e acompanhar suas métricas em tempo real.
              </p>
            </div>
          ) : lastError ? (
            <div className="text-center py-8 space-y-2">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="font-medium text-red-600">Erro ao carregar métricas</h3>
              <p className="text-sm text-red-500 max-w-md mx-auto">
                {lastError}
              </p>
            </div>
          ) : loadingMetrics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {metaAdsMetrics.impressions.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600">Impressões</div>
                  <div className="text-xs text-gray-500">CPM: {formatCurrency(avgCPM)}</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {metaAdsMetrics.clicks.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">Cliques</div>
                  <div className="text-xs text-gray-500">CTR: {avgCTR.toFixed(2)}%</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(metaAdsMetrics.spend)}
                  </div>
                  <div className="text-sm text-purple-600">Investido</div>
                  <div className="text-xs text-gray-500">CPC: {formatCurrency(avgCPC)}</div>
                </div>
              </div>
              
              {campaigns.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Campanhas Ativas</h4>
                  <div className="space-y-2">
                    {campaigns.slice(0, 3).map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{campaign.name}</div>
                          <div className="text-xs text-gray-500">
                            {campaign.objective} • {new Date(campaign.created_time).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
                    ))}
                    {campaigns.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{campaigns.length - 3} campanhas adicionais
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
