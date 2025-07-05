
import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useClienteMetaAds } from '@/hooks/useClienteMetaAds'
import { DateFilterWidget } from './DateFilterWidget'
import { Eye, MousePointer, DollarSign, Target, TrendingUp, Users, Zap, Award, BarChart3, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ClienteMetaAdsWidgetProps {
  clienteId: string
  nomeCliente: string
}

export function ClienteMetaAdsWidget({ clienteId, nomeCliente }: ClienteMetaAdsWidgetProps) {
  const [period, setPeriod] = useState('last_7_days')
  const [customStartDate, setCustomStartDate] = useState<string>()
  const [customEndDate, setCustomEndDate] = useState<string>()

  const { data: metricas, isLoading, error } = useClienteMetaAds({
    clienteId,
    period,
    startDate: customStartDate,
    endDate: customEndDate
  })

  const handlePeriodChange = (newPeriod: string, startDate?: string, endDate?: string) => {
    setPeriod(newPeriod)
    setCustomStartDate(startDate)
    setCustomEndDate(endDate)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  if (error) {
    return (
      <Card className="mobile-info-card info-card-warning">
        <CardContent className="mobile-p text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-orange-500/20 text-orange-600 mb-3">
            <BarChart3 className="mobile-icon-md" />
          </div>
          <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Dados Indisponíveis</h3>
          <p className="mobile-description text-orange-800 dark:text-orange-200">
            Não foi possível carregar os dados dos anúncios no momento. Nossa equipe já foi notificada.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mobile-content-spacing">
      {/* Filtro de Data com máximo aproveitamento */}
      <DateFilterWidget
        currentPeriod={period}
        onPeriodChange={handlePeriodChange}
        loading={isLoading}
      />

      {/* Cards de Métricas otimizados para mobile */}
      {isLoading ? (
        <div className="mobile-metrics-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="mobile-metric-card shimmer">
              <CardContent className="mobile-p">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
                </div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
                <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : metricas ? (
        <>
          <div className="mobile-metrics-grid">
            {/* Alcance */}
            <Card className="mobile-metric-card metric-card-reach hover-lift">
              <CardContent className="mobile-p">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/20 text-blue-600">
                    <Eye className="h-3 w-3" />
                  </div>
                  <span className="metric-label text-blue-800 dark:text-blue-200 text-xs font-semibold">ALCANCE</span>
                </div>
                <div className="mobile-metric-number text-blue-900 dark:text-blue-100">
                  {formatNumber(metricas.reach || 0)}
                </div>
                <p className="metric-description text-blue-700 dark:text-blue-300">
                  Pessoas alcançadas pelos anúncios
                </p>
              </CardContent>
            </Card>

            {/* Impressões */}
            <Card className="mobile-metric-card metric-card-reach hover-lift">
              <CardContent className="mobile-p">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/20 text-blue-600">
                    <Activity className="h-3 w-3" />
                  </div>
                  <span className="metric-label text-blue-800 dark:text-blue-200 text-xs font-semibold">IMPRESSÕES</span>
                </div>
                <div className="mobile-metric-number text-blue-900 dark:text-blue-100">
                  {formatNumber(metricas.impressions || 0)}
                </div>
                <p className="metric-description text-blue-700 dark:text-blue-300">
                  Vezes que os anúncios foram vistos
                </p>
              </CardContent>
            </Card>

            {/* Cliques */}
            <Card className="mobile-metric-card metric-card-clicks hover-lift">
              <CardContent className="mobile-p">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-green-500/20 text-green-600">
                    <MousePointer className="h-3 w-3" />
                  </div>
                  <span className="metric-label text-green-800 dark:text-green-200 text-xs font-semibold">CLIQUES</span>
                </div>
                <div className="mobile-metric-number text-green-900 dark:text-green-100">
                  {formatNumber(metricas.clicks || 0)}
                </div>
                <p className="metric-description text-green-700 dark:text-green-300">
                  Pessoas que clicaram nos anúncios
                </p>
              </CardContent>
            </Card>

            {/* CTR */}
            <Card className="mobile-metric-card metric-card-ctr hover-lift">
              <CardContent className="mobile-p">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-orange-500/20 text-orange-600">
                    <Target className="h-3 w-3" />
                  </div>
                  <span className="metric-label text-orange-800 dark:text-orange-200 text-xs font-semibold">CTR</span>
                </div>
                <div className="mobile-metric-number text-orange-900 dark:text-orange-100">
                  {formatPercentage(metricas.ctr || 0)}
                </div>
                <p className="metric-description text-orange-700 dark:text-orange-300">
                  Taxa de cliques dos anúncios
                </p>
              </CardContent>
            </Card>

            {/* Gasto */}
            <Card className="mobile-metric-card metric-card-spend hover-lift">
              <CardContent className="mobile-p">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-purple-500/20 text-purple-600">
                    <DollarSign className="h-3 w-3" />
                  </div>
                  <span className="metric-label text-purple-800 dark:text-purple-200 text-xs font-semibold">INVESTIDO</span>
                </div>
                <div className="mobile-metric-number text-purple-900 dark:text-purple-100">
                  {formatCurrency(metricas.spend || 0)}
                </div>
                <p className="metric-description text-purple-700 dark:text-purple-300">
                  Total investido em anúncios
                </p>
              </CardContent>
            </Card>

            {/* CPM */}
            <Card className="mobile-metric-card metric-card-cost hover-lift">
              <CardContent className="mobile-p">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-600">
                    <TrendingUp className="h-3 w-3" />
                  </div>
                  <span className="metric-label text-cyan-800 dark:text-cyan-200 text-xs font-semibold">CPM</span>
                </div>
                <div className="mobile-metric-number text-cyan-900 dark:text-cyan-100">
                  {formatCurrency(metricas.cpm || 0)}
                </div>
                <p className="metric-description text-cyan-700 dark:text-cyan-300">
                  Custo por mil impressões
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Card de interpretação com máximo aproveitamento */}
          <Card className="mobile-info-card info-card-success hover-lift">
            <CardContent className="mobile-p">
              <div className="flex items-start gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white flex-shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-green-900 dark:text-green-100 mb-2 flex items-center gap-1 text-sm">
                    <Zap className="h-4 w-4" />
                    🎯 Interpretação Inteligente dos Resultados
                  </h4>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge className="trust-badge text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {formatNumber(metricas.reach || 0)} Pessoas Alcançadas
                      </Badge>
                      <Badge className="monitoring-badge text-xs">
                        <MousePointer className="h-3 w-3 mr-1" />
                        {formatPercentage(metricas.ctr || 0)} Taxa de Cliques
                      </Badge>
                    </div>
                    <p className="mobile-description text-green-800 dark:text-green-200 leading-relaxed">
                      Seus anúncios estão alcançando <strong>{formatNumber(metricas.reach || 0)} pessoas</strong> com uma taxa de cliques de <strong>{formatPercentage(metricas.ctr || 0)}</strong>. Nossa equipe continua otimizando para maximizar seus resultados com inteligência artificial avançada.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="mobile-info-card info-card-primary">
          <CardContent className="mobile-p text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-blue-500/20 text-blue-600 mb-3">
              <BarChart3 className="mobile-icon-md" />
            </div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🚀 Aguardando Dados</h3>
            <p className="mobile-description text-blue-800 dark:text-blue-200">
              Assim que sua campanha começar a gerar dados, eles aparecerão aqui em tempo real!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
