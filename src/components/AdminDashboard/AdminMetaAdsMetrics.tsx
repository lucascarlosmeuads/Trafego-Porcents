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
import { 
  getDateRangeFromPresetBrazil, 
  getTodayBrazil, 
  getYesterdayBrazil,
  logVendasQuery,
  logVendasAuditoria
} from '@/utils/timezoneUtils'

export function AdminMetaAdsMetrics() {
  console.log('🚀 [AdminMetaAdsMetrics] Componente iniciado')
  
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
  const [clientesData, setClientesData] = useState<any[]>([])

  console.log('📊 [AdminMetaAdsMetrics] Estado atual:', {
    insights,
    fetchingInsights,
    isConfigured,
    lastError,
    vendasPeriodo,
    loadingVendas
  })

  // Buscar insights automaticamente ao montar o componente
  useEffect(() => {
    console.log('🔄 [AdminMetaAdsMetrics] useEffect - isConfigured:', isConfigured)
    if (isConfigured) {
      console.log('✅ [AdminMetaAdsMetrics] Configurado - buscando dados de hoje')
      fetchTodayInsights()
      const todayBrazil = getTodayBrazil()
      fetchVendasPeriodo(todayBrazil, todayBrazil)
    } else {
      console.log('❌ [AdminMetaAdsMetrics] Não configurado ainda')
    }
  }, [isConfigured])

  // Buscar vendas do período com timezone brasileiro E auditoria detalhada
  const fetchVendasPeriodo = async (startDate: string, endDate: string) => {
    logVendasQuery(startDate, endDate, 'AdminMetaAdsMetrics')
    setLoadingVendas(true)
    
    try {
      console.log('🔍 [AdminMetaAdsMetrics] === INICIANDO BUSCA DETALHADA ===')
      console.log('📅 Período solicitado:', { startDate, endDate })
      
      // Buscar vendas de vendas_cliente no período
      const { data: vendasCliente, error: errorVendasCliente } = await supabase
        .from('vendas_cliente')
        .select('*')
        .gte('data_venda', startDate)
        .lte('data_venda', endDate)

      if (errorVendasCliente) {
        console.error('❌ [AdminMetaAdsMetrics] Erro ao buscar vendas_cliente:', errorVendasCliente)
      }

      // Buscar vendas de todos_clientes no período (data_venda >= 01/07/2025)
      const { data: vendasTodosClientes, error: errorTodosClientes } = await supabase
        .from('todos_clientes')
        .select('*')
        .gte('data_venda', startDate)
        .lte('data_venda', endDate)
        .gte('data_venda', '2025-07-01')

      if (errorTodosClientes) {
        console.error('❌ [AdminMetaAdsMetrics] Erro ao buscar todos_clientes:', errorTodosClientes)
      }

      // Auditoria detalhada com logs
      const auditoria = logVendasAuditoria(
        startDate, 
        endDate, 
        vendasCliente || [], 
        vendasTodosClientes || [], 
        'AdminMetaAdsMetrics'
      )

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

      console.log('💰 [AdminMetaAdsMetrics] === RESUMO FINAL ===')
      console.log('📊 Contagem de vendas:', {
        vendasClienteCount: vendasCliente?.length || 0,
        todosClientesCount: vendasTodosClientes?.length || 0,
        totalCount: auditoria.totalCount,
        totalValue: totalVendas
      })
      
      // Verificar se há discrepância
      const expectedCount = (vendasCliente?.length || 0) + (vendasTodosClientes?.length || 0)
      if (auditoria.totalCount !== expectedCount) {
        console.warn('⚠️ [AdminMetaAdsMetrics] DISCREPÂNCIA DE CONTAGEM!', {
          esperado: expectedCount,
          encontrado: auditoria.totalCount
        })
      }
      
      setVendasPeriodo(totalVendas)
      
      // Combinar dados dos clientes para cálculo de comissões
      const allClientesData = [
        ...(vendasCliente || []),
        ...(vendasTodosClientes || [])
      ]
      setClientesData(allClientesData)

    } catch (error) {
      console.error('❌ [AdminMetaAdsMetrics] Erro ao buscar vendas:', error)
    } finally {
      setLoadingVendas(false)
    }
  }

  const handleDateRangeChange = async (startDate: string, endDate: string, preset?: string) => {
    console.log('📅 [AdminMetaAdsMetrics] Mudança de período:', { startDate, endDate, preset })
    
    setLastFetchInfo('')
    setCampaignsInfo({count: 0})
    
    // Calcular as datas corretas baseadas no preset usando timezone brasileiro
    let finalStartDate = startDate
    let finalEndDate = endDate
    
    if (preset && preset !== 'custom') {
      const dateRange = getDateRangeFromPresetBrazil(preset)
      finalStartDate = dateRange.startDate
      finalEndDate = dateRange.endDate
      console.log('📅 [AdminMetaAdsMetrics] Datas calculadas do preset (Brasil):', { 
        preset, 
        finalStartDate, 
        finalEndDate 
      })
    }
    
    // Buscar dados do Meta Ads
    if (preset === 'today') {
      console.log('📊 [AdminMetaAdsMetrics] Buscando insights de hoje')
      const result = await fetchTodayInsights()
      if (result.success) {
        setLastFetchInfo(`Dados encontrados para: ${result.period_used || 'hoje'}`)
        setCampaignsInfo({
          count: result.campaigns_count || 0,
          details: `${result.campaigns_count || 0} campanha(s) processada(s)`
        })
      }
    } else if (preset && preset !== 'custom') {
      console.log('📊 [AdminMetaAdsMetrics] Buscando insights com preset:', preset)
      const result = await fetchInsightsWithPeriod(preset as any)
      if (result.success) {
        setLastFetchInfo(`Dados encontrados para: ${result.period_used || preset}`)
        setCampaignsInfo({
          count: result.campaigns_count || 0,
          details: `${result.campaigns_count || 0} campanha(s) processada(s)`
        })
      } else {
        setLastFetchInfo('')
        setCampaignsInfo({count: 0})
      }
    } else if (preset === 'custom' && startDate && endDate) {
      console.log('📊 [AdminMetaAdsMetrics] Buscando insights com datas customizadas')
      const result = await fetchInsightsWithCustomDates(startDate, endDate)
      if (result.success) {
        setLastFetchInfo(`Dados encontrados para: ${startDate} até ${endDate}`)
        setCampaignsInfo({
          count: result.campaigns_count || 0,
          details: `${result.campaigns_count || 0} campanha(s) processada(s)`
        })
      } else {
        setLastFetchInfo('')
        setCampaignsInfo({count: 0})
      }
    }
    
    // SEMPRE buscar vendas para o período selecionado (usando timezone brasileiro)
    console.log('💰 [AdminMetaAdsMetrics] Buscando vendas para:', { finalStartDate, finalEndDate })
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
            Meta Ads - Métricas Globais
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
          Meta Ads - Relatórios Globais da Plataforma
        </h3>
        <p className="text-sm text-muted-foreground">
          Investimento em tráfego vs. Retorno em vendas (toda a plataforma)
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

      {/* Relatório de Custos e Lucro - Componente principal */}
      {insights && (
        <AdminCustoLucroReport 
          vendasDia={vendasPeriodo}
          investimentoTrafego={parseFloat(insights.spend || '0')}
          loadingVendas={loadingVendas}
          clientesData={clientesData}
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
