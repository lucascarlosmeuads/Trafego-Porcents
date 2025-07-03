
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
  RefreshCw, 
  Activity,
  Target,
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

  const [lastFetchInfo, setLastFetchInfo] = useState<string>('')
  const [campaignsInfo, setCampaignsInfo] = useState<{count: number, details?: string}>({count: 0})
  const [vendasPeriodo, setVendasPeriodo] = useState<number>(0)
  const [loadingVendas, setLoadingVendas] = useState(false)

  // Buscar insights automaticamente ao montar o componente
  useEffect(() => {
    if (isConfigured) {
      fetchTodayInsights()
      fetchVendasPeriodo(new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0])
    }
  }, [isConfigured])

  // Função para calcular datas baseadas no preset
  const getDateRangeFromPreset = (preset: string) => {
    const hoje = new Date()
    const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000)
    
    switch (preset) {
      case 'today':
        return {
          startDate: hoje.toISOString().split('T')[0],
          endDate: hoje.toISOString().split('T')[0]
        }
      case 'yesterday':
        return {
          startDate: ontem.toISOString().split('T')[0],
          endDate: ontem.toISOString().split('T')[0]
        }
      case 'last_7_days':
        const sete_dias_atras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000)
        return {
          startDate: sete_dias_atras.toISOString().split('T')[0],
          endDate: hoje.toISOString().split('T')[0]
        }
      case 'last_30_days':
        const trinta_dias_atras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
        return {
          startDate: trinta_dias_atras.toISOString().split('T')[0],
          endDate: hoje.toISOString().split('T')[0]
        }
      default:
        return {
          startDate: hoje.toISOString().split('T')[0],
          endDate: hoje.toISOString().split('T')[0]
        }
    }
  }

  // Buscar vendas do período
  const fetchVendasPeriodo = async (startDate: string, endDate: string) => {
    setLoadingVendas(true)
    try {
      console.log('💰 [AdminMetaAdsMetrics] Buscando vendas do período:', { startDate, endDate })
      
      // Buscar vendas de vendas_cliente no período
      const { data: vendasCliente, error: errorVendasCliente } = await supabase
        .from('vendas_cliente')
        .select('valor_venda')
        .gte('data_venda', startDate)
        .lte('data_venda', endDate)

      if (errorVendasCliente) {
        console.error('❌ [AdminMetaAdsMetrics] Erro ao buscar vendas_cliente:', errorVendasCliente)
      }

      // Buscar vendas de todos_clientes no período (data_venda >= 01/07/2025)
      const { data: vendasTodosClientes, error: errorTodosClientes } = await supabase
        .from('todos_clientes')
        .select('valor_venda_inicial')
        .gte('data_venda', startDate)
        .lte('data_venda', endDate)
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

      console.log('💰 [AdminMetaAdsMetrics] Total de vendas do período:', totalVendas)
      setVendasPeriodo(totalVendas)

    } catch (error) {
      console.error('❌ [AdminMetaAdsMetrics] Erro ao buscar vendas:', error)
    } finally {
      setLoadingVendas(false)
    }
  }

  const handleDateRangeChange = async (startDate: string, endDate: string, preset?: string) => {
    setLastFetchInfo('')
    setCampaignsInfo({count: 0})
    
    // Calcular as datas corretas baseadas no preset ou usar as datas fornecidas
    let finalStartDate = startDate
    let finalEndDate = endDate
    
    if (preset && preset !== 'custom') {
      const dateRange = getDateRangeFromPreset(preset)
      finalStartDate = dateRange.startDate
      finalEndDate = dateRange.endDate
    }
    
    if (preset === 'today') {
      const result = await fetchTodayInsights()
      if (result?.period_used) {
        setLastFetchInfo(`Dados encontrados para: ${result.period_used}`)
        if (result?.campaigns_count) {
          setCampaignsInfo({
            count: result.campaigns_count,
            details: `${result.campaigns_count} campanha(s) processada(s)`
          })
        }
      }
    } else if (preset && preset !== 'custom') {
      const result = await fetchInsightsWithPeriod(preset as any)
      if (result?.success) {
        setLastFetchInfo(`Dados encontrados para: ${result.period_used || preset}`)
        if (result?.campaigns_count) {
          setCampaignsInfo({
            count: result.campaigns_count,
            details: `${result.campaigns_count} campanha(s) processada(s)`
          })
        }
      } else {
        setLastFetchInfo('')
        setCampaignsInfo({count: 0})
      }
    } else if (preset === 'custom' && startDate && endDate) {
      const result = await fetchInsightsWithCustomDates(startDate, endDate)
      if (result?.success) {
        setLastFetchInfo(`Dados encontrados para: ${startDate} até ${endDate}`)
        if (result?.campaigns_count) {
          setCampaignsInfo({
            count: result.campaigns_count,
            details: `${result.campaigns_count} campanha(s) processada(s)`
          })
        }
      } else {
        setLastFetchInfo('')
        setCampaignsInfo({count: 0})
      }
    }
    
    // SEMPRE buscar vendas para o período selecionado
    await fetchVendasPeriodo(finalStartDate, finalEndDate)
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

      {/* Informações sobre os dados */}
      {lastFetchInfo && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="font-medium mb-1">✅ {lastFetchInfo}</div>
            {campaignsInfo.details && (
              <div className="text-sm">
                📊 {campaignsInfo.details}
              </div>
            )}
            {insights && (
              <div className="text-sm mt-1">
                💰 Investimento total: {formatCurrency(parseFloat(insights.spend || '0'))}
              </div>
            )}
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

      {/* Relatório de Custos e Lucro - Agora é o componente principal */}
      {insights && (
        <AdminCustoLucroReport 
          vendasDia={vendasPeriodo}
          investimentoTrafego={parseFloat(insights.spend || '0')}
          loadingVendas={loadingVendas}
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
