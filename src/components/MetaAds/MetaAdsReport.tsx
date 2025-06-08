
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Eye, MousePointer, DollarSign } from 'lucide-react'
import { MetaAdsReport as ReportType } from '@/hooks/useMetaAds'

interface MetaAdsReportProps {
  report: ReportType
}

export function MetaAdsReport({ report }: MetaAdsReportProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const metrics = [
    {
      title: 'Gasto Total',
      value: formatCurrency(report.spend),
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Impressões',
      value: formatNumber(report.impressions),
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Cliques',
      value: formatNumber(report.clicks),
      icon: MousePointer,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'CPC (Custo por Clique)',
      value: formatCurrency(report.cpc),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Relatório Meta Ads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => {
              const Icon = metric.icon
              return (
                <div
                  key={metric.title}
                  className={`p-4 rounded-lg border ${metric.bgColor} ${metric.borderColor} transition-all duration-200 hover:shadow-md`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 font-medium">
                      {metric.title}
                    </p>
                    <p className={`text-2xl font-bold ${metric.color}`}>
                      {metric.value}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-2">📊 Resumo do Desempenho</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Taxa de Cliques (CTR):</span>{' '}
                {report.impressions > 0 ? ((report.clicks / report.impressions) * 100).toFixed(2) : '0.00'}%
              </div>
              <div>
                <span className="font-medium">Custo por Mil Impressões (CPM):</span>{' '}
                {formatCurrency(report.impressions > 0 ? (report.spend / report.impressions) * 1000 : 0)}
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            Dados atualizados em tempo real via Meta Graph API
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
