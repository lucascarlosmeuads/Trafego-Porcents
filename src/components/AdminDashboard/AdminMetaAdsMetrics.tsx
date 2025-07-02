
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAdminMetaAds } from '@/hooks/useAdminMetaAds'
import { AdminMetaAdsDateFilter } from './AdminMetaAdsDateFilter'
import { AdminCustoLucroReport } from './AdminCustoLucroReport'
import { formatCurrency } from '@/lib/utils'
import { 
  RefreshCw, 
  Activity,
  Target,
  AlertCircle
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

  const [lastFetchInfo, setLastFetchInfo] = useState<string>('')

  // Buscar insights automaticamente ao montar o componente
  useEffect(() => {
    if (isConfigured) {
      fetchTodayInsights()
    }
  }, [isConfigured])

  const handleDateRangeChange = async (startDate: string, endDate: string, preset?: string) => {
    setLastFetchInfo('')
    
    if (preset === 'today') {
      const result = await fetchTodayInsights()
      if (result?.period_used) {
        setLastFetchInfo(`Dados encontrados para: ${result.period_used}`)
      }
    } else if (preset && preset !== 'custom') {
      const result = await fetchInsightsWithPeriod(preset as any)
      if (result?.success) {
        setLastFetchInfo(`Dados encontrados para: ${result.period_used || preset}`)
      } else {
        setLastFetchInfo('')
      }
    } else if (preset === 'custom' && startDate && endDate) {
      const result = await fetchInsightsWithCustomDates(startDate, endDate)
      if (result?.success) {
        setLastFetchInfo(`Dados encontrados para: ${startDate} até ${endDate}`)
      } else {
        setLastFetchInfo('')
      }
    }
  }

  const fetchInsightsWithCustomDates = async (startDate: string, endDate: string) => {
    return await fetchInsightsWithPeriod('custom' as any, startDate, endDate)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Meta Ads - Relatórios
        </h3>
        <p className="text-sm text-muted-foreground">
          Investimento em tráfego vs. Retorno em vendas
        </p>
      </div>

      {/* Filtro de datas */}
      <AdminMetaAdsDateFilter 
        onDateRangeChange={handleDateRangeChange}
        loading={fetchingInsights}
        lastFetchInfo={lastFetchInfo}
      />

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

      {/* Relatório de Custos e Lucro - Agora corrigido */}
      {insights && (
        <AdminCustoLucroReport 
          investimentoTrafego={insights.spend}
          loadingVendas={false}
        />
      )}

      {/* Estado vazio */}
      {!fetchingInsights && !insights && !lastError && (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="font-medium text-muted-foreground">Nenhum dado disponível</p>
            <p className="text-sm text-muted-foreground mt-1">
              Selecione um período acima para buscar os dados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
