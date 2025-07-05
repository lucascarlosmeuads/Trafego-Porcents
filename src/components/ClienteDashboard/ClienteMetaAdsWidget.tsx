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
  Clock,
  Sparkles,
  Activity,
  Award,
  Zap
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
      <Card className="info-card animate-fade-in-up">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-trafego text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <span className="page-title text-xl">Dados dos Anúncios</span>
              {connectionStatus === 'offline' && <WifiOff className="w-4 h-4 text-red-600 ml-2" />}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-trafego flex items-center justify-center animate-pulse">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Verificando configuração...</h3>
            <p className="text-sm text-muted-foreground">Aguarde enquanto preparamos seus dados</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Se não está configurado
  if (!isConfigured) {
    return (
      <Card className="info-card animate-fade-in-up">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="page-title text-xl">Relatório de Anúncios</span>
                {connectionStatus === 'offline' && <WifiOff className="w-4 w-4 text-red-600 ml-2" />}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="info-card-warning border-0">
            <MessageSquare className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    📊 Relatórios em Preparação
                  </h4>
                  <p className="text-sm leading-relaxed">
                    Nosso time técnico está configurando seus relatórios personalizados. 
                    Em breve você terá acesso a dados detalhados sobre o desempenho dos seus anúncios.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleRefreshConfig}
                    disabled={loading}
                    className="hover-lift bg-gradient-card border-amber-300"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Verificar Configuração
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Filtro de Data no topo */}
      <DateFilterWidget
        currentPeriod={currentPeriod}
        onPeriodChange={handlePeriodChange}
        loading={loadingData}
      />

      <Card className="info-card hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-trafego text-white">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="page-title text-xl">Dados dos Anúncios</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="trust-badge text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                  {connectionStatus === 'offline' && (
                    <Badge variant="destructive" className="text-xs">
                      <WifiOff className="w-3 h-3 mr-1" />
                      Offline
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLoadMetrics()}
                disabled={loadingData}
                className="hover-lift bg-gradient-card border-border/50"
              >
                {loadingData ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="ml-2 hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </CardTitle>
          {lastFetchInfo && (
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-2">
              <Activity className="w-3 h-3" />
              {lastFetchInfo}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
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
            <div className="space-y-8">
              {/* Indicador de dados do cache */}
              {cachedMetrics && insights.length === 0 && (
                <div className="info-card p-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    📦 Dados salvos localmente • {new Date(cachedMetrics.timestamp).toLocaleString('pt-BR')}
                  </div>
                </div>
              )}

              {/* Métricas Principais redesenhadas */}
              <div className="metrics-grid">
                {/* Pessoas Alcançadas */}
                <div className="metric-card metric-card-reach p-6 group hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <Badge className="professional-badge bg-blue-50 text-blue-700 border-blue-200">
                      <Eye className="w-3 h-3 mr-1" />
                      Alcance
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="metric-number text-blue-600">
                      {totalMetrics.pessoasAlcancadas.toLocaleString()}
                    </div>
                    <div className="metric-label">Pessoas Alcançadas</div>
                    <div className="metric-description">
                      Número de pessoas únicas que visualizaram seus anúncios
                    </div>
                  </div>
                </div>

                {/* Visitantes do Anúncio */}
                <div className="metric-card metric-card-clicks p-6 group hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
                      <MousePointer className="w-6 h-6 text-green-600" />
                    </div>
                    <Badge className="professional-badge bg-green-50 text-green-700 border-green-200">
                      <Zap className="w-3 h-3 mr-1" />
                      Cliques
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="metric-number text-green-600">
                      {totalMetrics.visitantesAnuncio.toLocaleString()}
                    </div>
                    <div className="metric-label">Visitantes Interessados</div>
                    <div className="metric-description">
                      Pessoas que clicaram porque se interessaram pelo seu produto
                    </div>
                  </div>
                </div>

                {/* Valor Investido */}
                <div className="metric-card metric-card-spend p-6 group hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <Badge className="professional-badge bg-purple-50 text-purple-700 border-purple-200">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Investimento
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="metric-number text-purple-600">
                      {formatCurrency(totalMetrics.investimento)}
                    </div>
                    <div className="metric-label">Valor Investido</div>
                    <div className="metric-description">
                      Total investido trabalhando para gerar resultados
                    </div>
                  </div>
                </div>

                {/* Taxa de Interesse */}
                <div className="metric-card metric-card-ctr p-6 group hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
                      <Target className="w-6 h-6 text-orange-600" />
                    </div>
                    <Badge className="professional-badge bg-orange-50 text-orange-700 border-orange-200">
                      <Award className="w-3 h-3 mr-1" />
                      Performance
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="metric-number text-orange-600">
                      {taxaInteresseMedia.toFixed(1)}%
                    </div>
                    <div className="metric-label">Taxa de Interesse</div>
                    <div className="metric-description">
                      Percentual de pessoas que demonstraram interesse
                    </div>
                  </div>
                </div>

                {/* Custo por Conversa */}
                <div className="metric-card metric-card-cost p-6 group hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
                      <MessageSquare className="w-6 h-6 text-cyan-600" />
                    </div>
                    <Badge className="professional-badge bg-cyan-50 text-cyan-700 border-cyan-200">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Estimativa
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="metric-number text-cyan-600">
                      {formatCurrency(estimativaCustoPorConversa)}
                    </div>
                    <div className="metric-label">Custo por Conversa</div>
                    <div className="metric-description">
                      Estimativa para gerar cada contato qualificado
                    </div>
                  </div>
                </div>

                {/* Custo por Venda */}
                <div className="metric-card metric-card-conversion p-6 group hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
                      <ShoppingCart className="w-6 h-6 text-emerald-600" />
                    </div>
                    <Badge className="professional-badge bg-emerald-50 text-emerald-700 border-emerald-200">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Projeção
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="metric-number text-emerald-600">
                      {formatCurrency(estimativaCustoPorVenda)}
                    </div>
                    <div className="metric-label">Custo por Venda</div>
                    <div className="metric-description">
                      Projeção baseada em dados do mercado
                    </div>
                  </div>
                </div>
              </div>

              {/* Card de tranquilização redesenhado */}
              <Alert className="info-card-success border-0 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/20 text-green-600">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 flex items-center gap-2 mb-2">
                        <Heart className="h-5 w-5" />
                        Como Interpretar Seus Resultados com Tranquilidade
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed mb-4">
                        Estes números representam o trabalho constante da nossa equipe especializada. 
                        Cada métrica é monitorada e otimizada diariamente para maximizar seus resultados.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-200">Pessoas Alcançadas</p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Sua marca ganha visibilidade! Milhares visualizam seus anúncios diariamente.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <MousePointer className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-200">Visitantes Interessados</p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Cliques reais de pessoas interessadas no que você oferece!
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Target className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-200">Taxa de Interesse</p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Otimizamos continuamente para atrair o público ideal para você!
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <DollarSign className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-200">Investimento Inteligente</p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Cada real trabalha estrategicamente para gerar oportunidades reais!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="info-card bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 p-4 rounded-xl border border-green-200 dark:border-green-800/30">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-green-800 dark:text-green-200 mb-2">
                            🛡️ Você Está em Boas Mãos!
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                            Nossa equipe de especialistas analisa estes dados 24/7 e faz ajustes automáticos. 
                            Estes relatórios são para sua <strong>transparência e confiança</strong> no nosso trabalho. 
                            Relaxe e deixe nossa expertise maximizar seus resultados!
                          </p>
                          
                          <div className="flex items-center gap-3 mt-3">
                            <Badge className="trust-badge text-xs">
                              ✅ Monitorado 24/7
                            </Badge>
                            <Badge className="monitoring-badge text-xs">
                              🔄 Auto-Otimização
                            </Badge>
                            <Badge className="professional-badge text-xs">
                              📊 Dados Reais
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Alert>
            </div>
          ) : !loadingData && !lastError ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-trafego flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Pronto para Mostrar Seus Resultados! 📊
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                Selecione um período acima para visualizar como seus anúncios estão performando 
                e gerando resultados reais para seu negócio.
              </p>
              <div className="info-card-primary p-6 rounded-xl max-w-lg mx-auto">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <p className="font-semibold text-blue-800 dark:text-blue-200">💡 Dica Profissional</p>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Comece com <strong>"Ontem"</strong> ou <strong>"Últimos 7 dias"</strong> para ver dados mais consistentes e confiáveis!
                </p>
              </div>
            </div>
          ) : null}

          {/* Loading state redesenhado */}
          {loadingData && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-trafego flex items-center justify-center animate-pulse">
                <RefreshCw className="w-10 h-10 text-white animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Buscando Seus Dados...
              </h3>
              <p className="text-muted-foreground mb-4">
                Nossa equipe mantém estas informações sempre atualizadas para você! ⚡
              </p>
              <div className="flex items-center justify-center gap-2">
                <Badge className="monitoring-badge">
                  <Activity className="w-3 h-3 mr-1 animate-pulse" />
                  Processando...
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
