import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useClienteMetaAdsSimplified } from '@/hooks/useClienteMetaAdsSimplified'
import { formatCurrency } from '@/lib/utils'
import { DateFilterWidget } from './DateFilterWidget'
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
  ShoppingCart,
  Shield,
  Heart,
  Clock
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

  const handleLoadMetrics = async (period: string = currentPeriod, startDate?: string, endDate?: string) => {
    console.log('📊 [WIDGET] Iniciando carregamento de métricas:', { period, clienteId, startDate, endDate })
    
    setLoadingData(true)
    setLastFetchInfo('')
    setFallbackMessage('')
    
    const result = await loadMetricsWithPeriod(period, startDate, endDate)
    
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

  const handlePeriodChange = async (period: string, startDate?: string, endDate?: string) => {
    console.log('📅 [WIDGET] Mudando período:', { period, startDate, endDate })
    setCurrentPeriod(period)
    await handleLoadMetrics(period, startDate, endDate)
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
              {connectionStatus === 'offline' && <WifiOff className="w-4 w-4 text-red-600" />}
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
    <div className="space-y-6">
      {/* Filtro de Data no topo */}
      <DateFilterWidget
        currentPeriod={currentPeriod}
        onPeriodChange={handlePeriodChange}
        loading={loadingData}
      />

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Dados dos Anúncios
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
                    <Button size="sm" variant="outline" onClick={() => handlePeriodChange('yesterday')}>
                      Tentar Ontem
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handlePeriodChange('last_7_days')}>
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
            <div className="space-y-6">
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

              {/* Explicações mais tranquilizadoras */}
              <Alert className="border-green-200 bg-green-50">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-3">
                    <p className="font-medium flex items-center gap-2">
                      <Heart className="h-4 w-4 text-green-600" />
                      Como interpretar estes números com tranquilidade:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-2">
                        <p>💙 <strong>Pessoas Alcançadas:</strong> Sua marca está sendo vista por milhares de pessoas interessadas!</p>
                        <p>👆 <strong>Visitantes:</strong> Pessoas reais estão clicando porque se interessaram pelo seu produto!</p>
                        <p>🎯 <strong>Taxa de Interesse:</strong> Estamos ajustando continuamente para atrair o público certo!</p>
                      </div>
                      <div className="space-y-2">
                        <p>💰 <strong>Investimento:</strong> Cada real está trabalhando para gerar visibilidade e clientes!</p>
                        <p>📞 <strong>Custo por Conversa:</strong> Estimativa de quanto custa gerar cada contato qualificado!</p>
                        <p>🛒 <strong>Custo por Venda:</strong> Projeção baseada em dados do mercado - nossa equipe otimiza isso!</p>
                      </div>
                    </div>
                    <div className="bg-green-100 p-3 rounded flex items-start gap-2">
                      <Clock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        <strong>🛡️ Fique tranquilo:</strong> Nossa equipe monitora estes dados 24/7 e faz ajustes automáticos. 
                        Você não precisa se preocupar com os números - eles são apenas para sua transparência e confiança no nosso trabalho!
                      </p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          ) : !loadingData && !lastError ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">
                Pronto para carregar seus dados! 📊
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Selecione um período acima para ver como seus anúncios estão performando
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Dica:</strong> Comece com "Ontem" ou "Últimos 7 dias" para ver dados mais consistentes!
                </p>
              </div>
            </div>
          ) : null}

          {/* Loading state */}
          {loadingData && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-lg font-medium text-gray-600 mb-2">
                Buscando seus dados...
              </p>
              <p className="text-sm text-gray-500">
                Nossa equipe está sempre atualizando estas informações para você! ⚡
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
