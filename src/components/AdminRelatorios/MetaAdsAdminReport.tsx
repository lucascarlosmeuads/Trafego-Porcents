
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DollarSign, 
  Eye, 
  MousePointer, 
  TrendingUp,
  Target,
  BarChart3
} from 'lucide-react'

interface MetaAdsReportData {
  spend: number
  impressions: number
  clicks: number
  cpc: number
  ctr: number
  cpm: number
  report_date: string
}

interface MetaAdsAdminReportProps {
  reportData: MetaAdsReportData
  loading: boolean
}

export function MetaAdsAdminReport({ reportData, loading }: MetaAdsAdminReportProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0)
  }

  const formatPercentage = (value: number) => {
    return `${(value || 0).toFixed(2)}%`
  }

  const metricCards = [
    {
      title: 'Gasto Total',
      value: formatCurrency(reportData.spend),
      icon: DollarSign,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    },
    {
      title: 'Impressões',
      value: formatNumber(reportData.impressions),
      icon: Eye,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Cliques',
      value: formatNumber(reportData.clicks),
      icon: MousePointer,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      title: 'CPC (Custo por Clique)',
      value: formatCurrency(reportData.cpc),
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      title: 'CTR (Taxa de Cliques)',
      value: formatPercentage(reportData.ctr),
      icon: Target,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      title: 'CPM (Custo por Mil)',
      value: formatCurrency(reportData.cpm),
      icon: BarChart3,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    }
  ]

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
              <p className="text-gray-300">Carregando relatório...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Relatório de Performance</h2>
        <div className="text-sm text-gray-400">
          Dados de: {new Date(reportData.report_date).toLocaleDateString('pt-BR')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric, index) => (
          <Card 
            key={index}
            className={`bg-gray-900 border-gray-800 ${metric.borderColor} hover:scale-105 transition-transform duration-200`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo adicional */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Resumo da Campanha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-gray-400 mb-1">Eficiência de Cliques</div>
              <div className="text-white font-semibold">
                {reportData.ctr ? `${reportData.ctr.toFixed(2)}% CTR` : 'N/A'}
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-gray-400 mb-1">Custo por Resultado</div>
              <div className="text-white font-semibold">
                {formatCurrency(reportData.cpc)}
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-gray-400 mb-1">Alcance por Real</div>
              <div className="text-white font-semibold">
                {reportData.cpm ? `${Math.round(1000 / reportData.cpm)} pessoas/R$` : 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
