
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGestorMetaAds } from '@/hooks/useGestorMetaAds'
import { useManagerData } from '@/hooks/useManagerData'
import { useAuth } from '@/hooks/useAuth'
import { AdminMetaAdsDateFilter } from '../AdminDashboard/AdminMetaAdsDateFilter'
import { AdminCustoLucroReport } from '../AdminDashboard/AdminCustoLucroReport'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { 
  RefreshCw, 
  Activity,
  Target,
  AlertCircle
} from 'lucide-react'

export function GestorMetaAdsMetrics() {
  const { user } = useAuth()
  const { 
    insights, 
    fetchingInsights, 
    lastError,
    isConfigured,
    fetchTodayInsights,
    fetchInsightsWithPeriod
  } = useGestorMetaAds()

  const { clientes } = useManagerData(user?.email || '')
  const [lastFetchInfo, setLastFetchInfo] = useState<string>('')
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

  // Buscar vendas do período para os clientes do gestor
  const fetchVendasPeriodo = async (startDate: string, endDate: string) => {
    if (!user?.email) return

    setLoadingVendas(true)
    try {
      console.log('💰 [GestorMetaAdsMetrics] Buscando vendas do período:', { startDate, endDate, gestor: user.email })
      
      // Buscar vendas dos clientes do gestor no período
      const { data: vendasCliente, error: errorVendasCliente } = await supabase
        .from('vendas_cliente')
        .select('valor_venda, email_cliente')
        .gte('data_venda', startDate)
        .lte('data_venda', endDate)

      if (errorVendasCliente) {
        console.error('❌ [GestorMetaAdsMetrics] Erro ao buscar vendas_cliente:', errorVendasCliente)
      }

      // Buscar vendas da tabela todos_clientes para o gestor
      const { data: vendasTodosClientes, error: errorTodosClientes } = await supabase
        .from('todos_clientes')
        .select('valor_venda_inicial, email_cliente')
        .eq('email_gestor', user.email)
        .gte('data_venda', startDate)
        .lte('data_venda', endDate)

      if (errorTodosClientes) {
        console.error('❌ [GestorMetaAdsMetrics] Erro ao buscar todos_clientes:', errorTodosClientes)
      }

      // Filtrar vendas apenas dos clientes do gestor
      const emailsClientesGestor = clientes.map(c => c.email_cliente).filter(Boolean)
      
      let totalVendas = 0

      if (vendasCliente) {
        const vendasFiltradas = vendasCliente.filter(venda => 
          emailsClientesGestor.includes(venda.email_cliente)
        )
        const somaVendasCliente = vendasFiltradas.reduce((sum, venda) => sum + (venda.valor_venda || 0), 0)
        totalVendas += somaVendasCliente
        console.log('💰 [GestorMetaAdsMetrics] Vendas de vendas_cliente (filtradas):', somaVendasCliente)
      }

      if (vendasTodosClientes) {
        const somaVendasTodos = vendasTodosClientes.reduce((sum, cliente) => sum + (cliente.valor_venda_inicial || 0), 0)
        totalVendas += somaVendasTodos
        console.log('💰 [GestorMetaAdsMetrics] Vendas de todos_clientes:', somaVendasTodos)
      }

      console.log('💰 [GestorMetaAdsMetrics] Total de vendas do período:', totalVendas)
      setVendasPeriodo(totalVendas)

    } catch (error) {
      console.error('❌ [GestorMetaAdsMetrics] Erro ao buscar vendas:', error)
    } finally {
      setLoadingVendas(false)
    }
  }

  const handleDateRangeChange = async (startDate: string, endDate: string, preset?: string) => {
    setLastFetchInfo('')
    
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
    
    // SEMPRE buscar vendas para o período selecionado
    await fetchVendasPeriodo(finalStartDate, finalEndDate)
  }

  const fetchInsightsWithCustomDates = async (startDate: string, endDate: string) => {
    return await fetchInsightsWithPeriod('custom' as any, startDate, endDate)
  }

  if (!isConfigured) {
    return (
      <Card className="w-full bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 text-purple-400" />
            Meta Ads - Métricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
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
        <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
          <Activity className="h-5 w-5 text-purple-400" />
          Meta Ads - Relatórios dos Seus Clientes
        </h3>
        <p className="text-sm text-gray-400">
          Investimento em tráfego vs. Retorno em vendas dos seus clientes
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
        <Alert className="border-red-800 bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            <div className="font-medium mb-1">Erro ao buscar dados:</div>
            <div className="text-sm">{lastError}</div>
            {lastError.includes('campanhas') && (
              <div className="text-sm mt-2 text-red-300">
                💡 <strong>Dica:</strong> Acesse o Facebook Ads Manager para verificar suas campanhas e certificar-se de que estão ativas.
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {fetchingInsights && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2 text-purple-400" />
            <span className="text-gray-300">Carregando dados...</span>
          </CardContent>
        </Card>
      )}

      {/* Relatório de Custos e Lucro */}
      {insights && (
        <AdminCustoLucroReport 
          vendasDia={vendasPeriodo}
          investimentoTrafego={parseFloat(insights.spend) || 0}
          loadingVendas={loadingVendas}
        />
      )}

      {/* Estado vazio */}
      {!fetchingInsights && !insights && !lastError && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-500 opacity-50" />
            <p className="font-medium text-gray-400">Nenhum dado disponível</p>
            <p className="text-sm text-gray-500 mt-1">
              Selecione um período acima para buscar os dados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
