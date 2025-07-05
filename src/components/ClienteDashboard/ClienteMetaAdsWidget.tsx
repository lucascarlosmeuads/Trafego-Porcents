
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useClienteMetaAdsSimplified } from '@/hooks/useClienteMetaAdsSimplified'
import { formatCurrency } from '@/lib/utils'
import { 
  BarChart3, 
  Eye, 
  MousePointer, 
  DollarSign,
  RefreshCw,
  TrendingUp,
  Info,
  AlertCircle,
  MessageSquare,
  CheckCircle,
  WifiOff,
  Users,
  Target,
  ShoppingCart
} from 'lucide-react'

interface ClienteMetaAdsWidgetProps {
  clienteId: string
  nomeCliente: string
}

interface CachedMetrics {
  data: any[]
  timestamp: number
  period: string
}

export function ClienteMetaAdsWidget({ clienteId, nomeCliente }: ClienteMetaAdsWidgetProps) {
  const {
    insights,
    loading,
    isConfigured,
    loadMetricsWithPeriod,
    lastError,
    diagnosticInfo,
    refreshConfig
  } = useClienteMetaAdsSimplified(clienteId)

  const [loadingData, setLoadingData] = useState(false)
  const [lastFetchInfo, setLastFetchInfo] = useState('')
  const [fallbackMessage, setFallbackMessage] = useState('')
  const [currentPeriod, setCurrentPeriod] = useState('today')
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('online')
  const [cachedMetrics, setCachedMetrics] = useState<CachedMetrics | null>(null)

  // Verificar conexão
  useEffect(() => {
    const checkConnection = () => {
      setConnectionStatus(navigator.onLine ? 'online' : 'offline')
    }
    
    window.addEventListener('online', checkConnection)
    window.addEventListener('offline', checkConnection)
    checkConnection()
    
    return () => {
      window.removeEventListener('online', checkConnection)
      window.removeEventListener('offline', checkConnection)
    }
  }, [])

  // Cache de métricas no localStorage
  useEffect(() => {
    if (insights.length > 0 && currentPeriod) {
      const cacheData: CachedMetrics = {
        data: insights,
        timestamp: Date.now(),
        period: currentPeriod
      }
      localStorage.setItem(`metrics_cache_${clienteId}`, JSON.stringify(cacheData))
      setCachedMetrics(cacheData)
      console.log('✅ [CACHE] Métricas salvas no cache local')
    }
  }, [insights, currentPeriod, clienteId])

  // Carregar cache ao inicializar
  useEffect(() => {
    const loadFromCache = () => {
      try {
        const cached = localStorage.getItem(`metrics_cache_${clienteId}`)
        if (cached) {
          const cacheData: CachedMetrics = JSON.parse(cached)
          const isRecent = (Date.now() - cacheData.timestamp) < 5 * 60 * 1000 // 5 minutos
          
          if (isRecent && cacheData.data.length > 0) {
            setCachedMetrics(cacheData)
            setCurrentPeriod(cacheData.period)
            setLastFetchInfo(`Dados do cache (${cacheData.period})`)
            console.log('📦 [CACHE] Dados carregados do cache local')
          }
        }
      } catch (error) {
        console.error('❌ [CACHE] Erro ao carregar cache:', error)
      }
    }

    loadFromCache()
  }, [clienteId])

  // Auto-carregar métricas apenas uma vez quando estiver configurado
  useEffect(() => {
    if (isConfigured && insights.length === 0 && !cachedMetrics && !loadingData) {
      handleLoadMetrics()
    }
  }, [isConfigured])

  const handleLoadMetrics = async (period: string = currentPeriod) => {
    console.log('📊 [WIDGET] Iniciando carregamento de métricas:', { period, clienteId })
    
    setLoadingData(true)
    setLastFetchInfo('')
    setFallbackMessage('')
    
    const result = await loadMetricsWithPeriod(period)
    
    console.log('📊 [WIDGET] Resultado do carregamento:', result)
    
    if (result.success) {
      setLastFetchInfo(`✅ Dados carregados: ${result.period_used || period}`)
      if (result.fallback_used) {
        setFallbackMessage(result.message || '')
      }
    } else {
      setLastFetchInfo('❌ Falha no carregamento')
      if (result.suggestions?.length > 0) {
        setFallbackMessage(`💡 Dica: ${result.suggestions[0]}`)
      }
    }
    
    setLoadingData(false)
    return result
  }

  const handlePeriodSelect = async (period: string) => {
    console.log('📅 [WIDGET] Selecionando período:', period)
    setCurrentPeriod(period)
    await handleLoadMetrics(period)
  }

  const handleRefreshConfig = async () => {
    console.log('🔄 [WIDGET] Refreshing config...')
    setConnectionStatus('checking')
    await refreshConfig()
    setTimeout(() => {
      if (isConfigured) {
        handleLoadMetrics()
      }
    }, 1000)
  }

  // Loading state
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Relatório de Anúncios
            {connectionStatus === 'offline' && <WifiOff className="w-4 h-4 text-red-600" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-500">Verificando configuração...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Se não está configurado
  if (!isConfigured) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Relatório de Anúncios
              {connectionStatus === 'offline' && <WifiOff className="w-4 h-4 text-red-600" />}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-blue-200 bg-blue-50">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-3">
                <p className="font-medium">📊 Relatório não configurado</p>
                <p className="text-sm">
                  Entre em contato com seu gestor para configurar os relatórios de anúncios 
                  e começar a acompanhar seus resultados em tempo real.
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleRefreshConfig}
                    disabled={loading}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Verificar Novamente
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Usar dados do cache se insights estiver vazio
  const displayData = insights.length > 0 ? insights : (cachedMetrics?.data || [])

  // Calcular métricas totais com nomes mais simples
  const totalMetrics = displayData.reduce((acc, insight) => ({
    pessoasAlcancadas: acc.pessoasAlcancadas + parseInt(insight.impressions || '0'),
    visitantesAnuncio: acc.visitantesAnuncio + parseInt(insight.clicks || '0'),
    investimento: acc.investimento + parseFloat(insight.spend || '0'),
    taxaInteresse: acc.taxaInteresse + parseFloat(insight.ctr || '0')
  }), {
    pessoasAlcancadas: 0,
    visitantesAnuncio: 0,
    investimento: 0,
    taxaInteresse: 0
  })

  const taxaInteresseMedia = displayData.length > 0 ? totalMetrics.taxaInteresse / displayData.length : 0
  const custoPorVisitante = totalMetrics.visitantesAnuncio > 0 ? totalMetrics.investimento / totalMetrics.visitantesAnuncio : 0
  
  // Estimativas simples para métricas de negócio
  const estimativaCustoPorConversa = custoPorVisitante * 10 // Assumindo 10% de conversão
  const estimativaCustoPorVenda = custoPorVisitante * 50 // Assumindo 2% de conversão para venda

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Relatório de Anúncios
            <CheckCircle className="w-4 h-4 text-green-600" />
            {connectionStatus === 'offline' && <WifiOff className="w-4 h-4 text-red-600" />}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLoadMetrics()}
              disabled={loadingData}
            >
              {loadingData ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardTitle>
        {lastFetchInfo && (
          <p className="text-xs text-muted-foreground">{lastFetchInfo}</p>
        )}
      </CardHeader>
      <CardContent>
        {/* Status de conexão */}
        {connectionStatus === 'offline' && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <WifiOff className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Sem conexão com a internet. Mostrando dados salvos localmente.
            </AlertDescription>
          </Alert>
        )}

        {/* Mensagem de fallback */}
        {fallbackMessage && (
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {fallbackMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Erro com sugestões */}
        {lastError && !loadingData && displayData.length === 0 && (
          <Alert className="mb-4 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-3">
                <p>{lastError}</p>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => handlePeriodSelect('yesterday')}>
                    Tentar Ontem
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handlePeriodSelect('last_7_days')}>
                    Últimos 7 dias
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleLoadMetrics()}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {displayData.length > 0 ? (
          <div className="space-y-4">
            {/* Indicador de dados do cache */}
            {cachedMetrics && insights.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-2 bg-blue-50 rounded border">
                📦 Dados salvos localmente • {new Date(cachedMetrics.timestamp).toLocaleString('pt-BR')}
              </div>
            )}

            {/* Métricas Principais em linguagem simples */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">
                  {totalMetrics.pessoasAlcancadas.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600 font-medium">Pessoas Alcançadas</div>
                <div className="text-xs text-blue-500 mt-1">
                  Quantas pessoas viram seu anúncio
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <MousePointer className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">
                  {totalMetrics.visitantesAnuncio.toLocaleString()}
                </div>
                <div className="text-sm text-green-600 font-medium">Visitantes do Anúncio</div>
                <div className="text-xs text-green-500 mt-1">
                  Pessoas que clicaram no seu anúncio
                </div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">
                  {formatCurrency(totalMetrics.investimento)}
                </div>
                <div className="text-sm text-purple-600 font-medium">Valor Investido</div>
                <div className="text-xs text-purple-500 mt-1">
                  Total gasto em anúncios
                </div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Target className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-700">
                  {taxaInteresseMedia.toFixed(1)}%
                </div>
                <div className="text-sm text-orange-600 font-medium">Taxa de Interesse</div>
                <div className="text-xs text-orange-500 mt-1">
                  % de pessoas que clicaram
                </div>
              </div>

              <div className="text-center p-4 bg-cyan-50 rounded-lg">
                <MessageSquare className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-cyan-700">
                  {formatCurrency(estimativaCustoPorConversa)}
                </div>
                <div className="text-sm text-cyan-600 font-medium">Custo por Conversa</div>
                <div className="text-xs text-cyan-500 mt-1">
                  Estimativa por contato gerado
                </div>
              </div>

              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(estimativaCustoPorVenda)}
                </div>
                <div className="text-sm text-emerald-600 font-medium">Custo por Venda</div>
                <div className="text-xs text-emerald-500 mt-1">
                  Estimativa para gerar uma venda
                </div>
              </div>
            </div>

            {/* Contexto educativo */}
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="space-y-2">
                  <p className="font-medium">📈 Como interpretar seus resultados:</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• <strong>Pessoas Alcançadas:</strong> Mais pessoas = maior visibilidade da sua marca</li>
                    <li>• <strong>Taxa de Interesse:</strong> Acima de 1% é considerado bom</li>
                    <li>• <strong>Custo por Visitante:</strong> Quanto menor, melhor o aproveitamento</li>
                    <li>• <strong>Estimativas:</strong> Valores aproximados baseados em médias do mercado</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {/* Seletor de período */}
            <div className="flex gap-2 justify-center flex-wrap pt-4 border-t">
              <Button 
                size="sm" 
                variant={currentPeriod === 'today' ? 'default' : 'outline'}
                onClick={() => handlePeriodSelect('today')}
                disabled={loadingData}
              >
                Hoje
              </Button>
              <Button 
                size="sm" 
                variant={currentPeriod === 'yesterday' ? 'default' : 'outline'}
                onClick={() => handlePeriodSelect('yesterday')}
                disabled={loadingData}
              >
                Ontem
              </Button>
              <Button 
                size="sm" 
                variant={currentPeriod === 'last_7_days' ? 'default' : 'outline'}
                onClick={() => handlePeriodSelect('last_7_days')}
                disabled={loadingData}
              >
                7 dias
              </Button>
            </div>
          </div>
        ) : !loadingData && !lastError ? (
          <div className="text-center py-4">
            <BarChart3 className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-3">
              Carregue os dados dos seus anúncios
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button size="sm" onClick={() => handlePeriodSelect('today')}>
                Hoje
              </Button>
              <Button size="sm" variant="outline" onClick={() => handlePeriodSelect('yesterday')}>
                Ontem
              </Button>
              <Button size="sm" variant="outline" onClick={() => handlePeriodSelect('last_7_days')}>
                7 dias
              </Button>
            </div>
          </div>
        ) : null}

        {/* Loading state */}
        {loadingData && (
          <div className="text-center py-4">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-500">
              Carregando dados dos anúncios...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
