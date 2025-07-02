
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAdminMetaAds } from '@/hooks/useAdminMetaAds'
import { AdminMetaAdsDateFilter } from './AdminMetaAdsDateFilter'
import { AdminCustoLucroReport } from './AdminCustoLucroReport'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { 
  DollarSign, 
  RefreshCw, 
  TrendingUp,
  Activity,
  Target,
  AlertCircle,
  ShoppingCart
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
  const [vendasDia, setVendasDia] = useState<number>(0)
  const [loadingVendas, setLoadingVendas] = useState(false)

  // Buscar insights automaticamente ao montar o componente
  useEffect(() => {
    if (isConfigured) {
      fetchTodayInsights()
      fetchVendasDia()
    }
  }, [isConfigured])

  // Buscar vendas do dia
  const fetchVendasDia = async () => {
    setLoadingVendas(true)
    try {
      const hoje = new Date().toISOString().split('T')[0]
      
      console.log('💰 [AdminMetaAdsMetrics] Buscando vendas do dia:', hoje)
      
      // Buscar vendas de hoje da tabela vendas_cliente
      const { data: vendasCliente, error: errorVendasCliente } = await supabase
        .from('vendas_cliente')
        .select('valor_venda')
        .eq('data_venda', hoje)

      if (errorVendasCliente) {
        console.error('❌ [AdminMetaAdsMetrics] Erro ao buscar vendas_cliente:', errorVendasCliente)
      }

      // Buscar vendas de hoje da tabela todos_clientes (data_venda >= 01/07/2025)
      const { data: vendasTodosClientes, error: errorTodosClientes } = await supabase
        .from('todos_clientes')
        .select('valor_venda_inicial')
        .eq('data_venda', hoje)
        .gte('data_venda', '2025-07-01')

      if (errorTodosClientes) {
        console.error('❌ [AdminMetaAdsMetrics] Erro ao buscar todos_clientes:', errorTodosClientes)
      }

      // Somar todas as vendas
      let totalVendas = 0

      if (vendasCliente) {
        const somaVendasCliente = vendasCliente.reduce((sum, venda) => sum + (venda.valor_venda || 0), 0)
        totalVendas += somaVendasCliente
        console.log('💰 [AdminMetaAdsMetrics] Vendas de vendas_cliente:', somaVendasCliente)
      }

      if (vendasTodosClientes) {
        const somaVendasTodos = vendasTodosClientes.reduce((sum, cliente) => sum + (cliente.valor_venda_inicial || 0), 0)
        totalVendas += somaVendasTodos
        console.log('💰 [AdminMetaAdsMetrics] Vendas de todos_clientes:', somaVendasTodos)
      }

      console.log('💰 [AdminMetaAdsMetrics] Total de vendas do dia:', totalVendas)
      setVendasDia(totalVendas)

    } catch (error) {
      console.error('❌ [AdminMetaAdsMetrics] Erro ao buscar vendas:', error)
    } finally {
      setLoadingVendas(false)
    }
  }

  const handleDateRangeChange = async (startDate: string, endDate: string, preset?: string) => {
    setLastFetchInfo('')
    
    if (preset === 'today') {
      const result = await fetchTodayInsights()
      if (result?.period_used) {
        setLastFetchInfo(`Dados encontrados para: ${result.period_used}`)
      }
      // Buscar vendas quando mudar para hoje
      await fetchVendasDia()
    } else if (preset && preset !== 'custom') {
      const result = await fetchInsightsWithPeriod(preset as any)
      if (result?.success) {
        setLastFetchInfo(`Dados encontrados para: ${result.period_used || preset}`)
      } else {
        setLastFetchInfo('')
      }
      // Para outros períodos, não buscar vendas por enquanto
      setVendasDia(0)
    } else if (preset === 'custom' && startDate && endDate) {
      const result = await fetchInsightsWithCustomDates(startDate, endDate)
      if (result?.success) {
        setLastFetchInfo(`Dados encontrados para: ${startDate} até ${endDate}`)
      } else {
        setLastFetchInfo('')
      }
      // Para período personalizado, não buscar vendas por enquanto
      setVendasDia(0)
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

      {/* Métricas principais */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Valor Investido */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investimento em Tráfego</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${insights.spend === 0 ? 'text-gray-500' : 'text-red-600'}`}>
                {formatCurrency(insights.spend)}
              </div>
              <p className="text-xs text-muted-foreground">
                {insights.spend === 0 ? 'Nenhum gasto registrado' : 'Total investido em campanhas hoje'}
              </p>
            </CardContent>
          </Card>

          {/* Vendas do Dia */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas do Dia</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${vendasDia === 0 ? 'text-gray-500' : 'text-green-600'}`}>
                {loadingVendas ? '...' : formatCurrency(vendasDia)}
              </div>
              <p className="text-xs text-muted-foreground">
                {vendasDia === 0 ? 'Nenhuma venda registrada hoje' : 'Total de vendas realizadas hoje'}
              </p>
              {/* ROI Info */}
              {insights.spend > 0 && vendasDia > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  ROI: {((vendasDia / insights.spend - 1) * 100).toFixed(1)}% 
                  {vendasDia > insights.spend ? ' 📈' : ' 📉'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Relatório de Custos e Lucro */}
      {insights && (
        <AdminCustoLucroReport 
          vendasDia={vendasDia}
          investimentoTrafego={insights.spend}
          loadingVendas={loadingVendas}
        />
      )}

      {/* Estado vazio */}
      {!fetchingInsights && !insights && !lastError && (
        <Card>
          <CardContent className="text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
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
