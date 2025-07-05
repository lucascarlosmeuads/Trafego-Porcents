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

  // Loading state otimizado para mobile
  if (loading) {
    return (
      <Card className="mobile-info-card animate-fade-in-up">
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="flex items-center justify-center mobile-icon-lg rounded-xl bg-gradient-trafego text-white">
              <BarChart3 className="mobile-icon-sm" />
            </div>
            <div className="min-w-0">
              <span className="mobile-title text-gray-900 dark:text-gray-100">Dados dos Anúncios</span>
              {connectionStatus === 'offline' && <WifiOff className="w-4 h-4 text-red-600 ml-2" />}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-gradient-trafego flex items-center justify-center animate-pulse">
              <RefreshCw className="mobile-icon-md text-white animate-spin" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Verificando configuração...</h3>
            <p className="mobile-description text-gray-600 dark:text-gray-400">Aguarde enquanto preparamos seus dados</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Se não está configurado - otimizado para mobile
  if (!isConfigured) {
    return (
      <Card className="mobile-info-card animate-fade-in-up">
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center mobile-icon-lg rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <BarChart3 className="mobile-icon-sm" />
              </div>
              <div className="min-w-0">
                <span className="mobile-title text-gray-900 dark:text-gray-100">Relatório de Anúncios</span>
                {connectionStatus === 'offline' && <WifiOff className="w-4 h-4 text-red-600 ml-2" />}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="info-card-warning border-0">
            <MessageSquare className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-900 dark:text-amber-100">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-base md:text-lg mb-2 flex items-center gap-2">
                    <Sparkles className="mobile-icon-sm" />
                    📊 Relatórios em Preparação
                  </h4>
                  <p className="mobile-description leading-relaxed">
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
                    className="hover-lift bg-gradient-card border-amber-300 mobile-touch-target"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    <span className="mobile-description">Verificar Configuração</span>
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
    <div className="mobile-content-spacing animate-fade-in-up">
      {/* Filtro de Data no topo */}
      <DateFilterWidget
        currentPeriod={currentPeriod}
        onPeriodChange={handlePeriodChange}
        loading={loadingData}
      />

      <Card className="mobile-info-card hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center mobile-icon-lg rounded-xl bg-gradient-trafego text-white">
                <BarChart3 className="mobile-icon-sm" />
              </div>
              <div className="min-w-0">
                <span className="mobile-title text-gray-900 dark:text-gray-100">Dados dos Anúncios</span>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge className="trust-badge text-xs">
                    <CheckCircle className="mobile-icon-sm mr-1" />
                    Verificado
                  </Badge>
                  {connectionStatus === 'offline' && (
                    <Badge variant="destructive" className="text-xs">
                      <WifiOff className="mobile-icon-sm mr-1" />
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
                className="hover-lift bg-gradient-card border-border/50 mobile-touch-target"
              >
                {loadingData ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="ml-2 mobile-hide">Atualizar</span>
              </Button>
            </div>
          </CardTitle>
          {lastFetchInfo && (
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-2">
              <Activity className="w-3 h-3" />
              {lastFetchInfo}
            </p>
          )}
        </CardHeader>
        <CardContent className="mobile-content-spacing">
          {/* Status de conexão */}
          {connectionStatus === 'offline' && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <WifiOff className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900 dark:text-red-100 mobile-description">
                Sem conexão com a internet. Mostrando dados salvos localmente.
              </AlertDescription>
            </Alert>
          )}

          {/* Mensagem de fallback */}
          {fallbackMessage && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 dark:text-blue-100 mobile-description">
                {fallbackMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Erro com sugestões otimizado para mobile */}
          {lastError && !loadingData && displayData.length === 0 && (
            <Alert className="mb-4 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-900 dark:text-orange-100">
                <div className="space-y-3">
                  <p className="mobile-description">{lastError}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => handlePeriodChange('yesterday')} className="mobile-touch-target">
                      <span className="mobile-description">Tentar Ontem</span>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handlePeriodChange('last_7_days')} className="mobile-touch-target">
                      <span className="mobile-description">Últimos 7 dias</span>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleLoadMetrics()} className="mobile-touch-target">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      <span className="mobile-description">Tentar Novamente</span>
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {displayData.length > 0 ? (
            <div className="mobile-content-spacing">
              {/* Indicador de dados do cache */}
              {cachedMetrics && insights.length === 0 && (
                <div className="info-card p-3 text-center">
                  <div className="flex items-center justify-center gap-2 mobile-description text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    📦 Dados salvos localmente • {new Date(cachedMetrics.timestamp).toLocaleString('pt-BR')}
                  </div>
                </div>
              )}

              {/* Métricas Principais otimizadas para mobile */}
              <div className="mobile-metrics-grid">
                {/* Pessoas Alcançadas */}
                <div className="mobile-metric-card metric-card-reach group hover-lift">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className="flex items-center justify-center mobile-icon-lg rounded-xl bg-white/90 backdrop-blur-sm shadow-sm">
                      <Users className="mobile-icon-md text-blue-700" />
                    </div>
                    <Badge className="professional-badge bg-blue-100/90 text-blue-800 border-blue-300 font-medium">
                      <Eye className="mobile-icon-sm mr-1" />
                      <span className="mobile-hide">Alcance</span>
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="mobile-metric-number text-blue-700 font-bold">
                      {totalMetrics.pessoasAlcancadas.toLocaleString()}
                    </div>
                    <div className="metric-label text-gray-800 dark:text-gray-200 font-semibold">Pessoas Alcançadas</div>
                    <div className="mobile-description text-gray-700 dark:text-gray-300">
                      Número de pessoas únicas que visualizaram seus anúncios
                    </div>
                  </div>
                </div>

                {/* Visitantes do Anúncio */}
                <div className="mobile-metric-card metric-card-clicks group hover-lift">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className="flex items-center justify-center mobile-icon-lg rounded-xl bg-white/90 backdrop-blur-sm shadow-sm">
                      <MousePointer className="mobile-icon-md text-green-700" />
                    </div>
                    <Badge className="professional-badge bg-green-100/90 text-green-800 border-green-300 font-medium">
                      <Zap className="mobile-icon-sm mr-1" />
                      <span className="mobile-hide">Cliques</span>
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="mobile-metric-number text-green-700 font-bold">
                      {totalMetrics.visitantesAnuncio.toLocaleString()}
                    </div>
                    <div className="metric-label text-gray-800 dark:text-gray-200 font-semibold">Visitantes Interessados</div>
                    <div className="mobile-description text-gray-700 dark:text-gray-300">
                      Pessoas que clicaram porque se interessaram pelo seu produto
                    </div>
                  </div>
                </div>

                {/* Valor Investido */}
                <div className="mobile-metric-card metric-card-spend group hover-lift">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className="flex items-center justify-center mobile-icon-lg rounded-xl bg-white/90 backdrop-blur-sm shadow-sm">
                      <DollarSign className="mobile-icon-md text-purple-700" />
                    </div>
                    <Badge className="professional-badge bg-purple-100/90 text-purple-800 border-purple-300 font-medium">
                      <TrendingUp className="mobile-icon-sm mr-1" />
                      <span className="mobile-hide">Investimento</span>
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="mobile-metric-number text-purple-700 font-bold">
                      {formatCurrency(totalMetrics.investimento)}
                    </div>
                    <div className="metric-label text-gray-800 dark:text-gray-200 font-semibold">Valor Investido</div>
                    <div className="mobile-description text-gray-700 dark:text-gray-300">
                      Total investido trabalhando para gerar resultados
                    </div>
                  </div>
                </div>

                {/* Taxa de Interesse */}
                <div className="mobile-metric-card metric-card-ctr group hover-lift">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className="flex items-center justify-center mobile-icon-lg rounded-xl bg-white/90 backdrop-blur-sm shadow-sm">
                      <Target className="mobile-icon-md text-orange-700" />
                    </div>
                    <Badge className="professional-badge bg-orange-100/90 text-orange-800 border-orange-300 font-medium">
                      <Award className="mobile-icon-sm mr-1" />
                      <span className="mobile-hide">Performance</span>
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="mobile-metric-number text-orange-700 font-bold">
                      {taxaInteresseMedia.toFixed(1)}%
                    </div>
                    <div className="metric-label text-gray-800 dark:text-gray-200 font-semibold">Taxa de Interesse</div>
                    <div className="mobile-description text-gray-700 dark:text-gray-300">
                      Percentual de pessoas que demonstraram interesse
                    </div>
                  </div>
                </div>

                {/* Custo por Conversa */}
                <div className="mobile-metric-card metric-card-cost group hover-lift">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className="flex items-center justify-center mobile-icon-lg rounded-xl bg-white/90 backdrop-blur-sm shadow-sm">
                      <MessageSquare className="mobile-icon-md text-cyan-700" />
                    </div>
                    <Badge className="professional-badge bg-cyan-100/90 text-cyan-800 border-cyan-300 font-medium">
                      <MessageSquare className="mobile-icon-sm mr-1" />
                      <span className="mobile-hide">Estimativa</span>
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="mobile-metric-number text-cyan-700 font-bold">
                      {formatCurrency(estimativaCustoPorConversa)}
                    </div>
                    <div className="metric-label text-gray-800 dark:text-gray-200 font-semibold">Custo por Conversa</div>
                    <div className="mobile-description text-gray-700 dark:text-gray-300">
                      Estimativa para gerar cada contato qualificado
                    </div>
                  </div>
                </div>

                {/* Custo por Venda */}
                <div className="mobile-metric-card metric-card-conversion group hover-lift">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className="flex items-center justify-center mobile-icon-lg rounded-xl bg-white/90 backdrop-blur-sm shadow-sm">
                      <ShoppingCart className="mobile-icon-md text-emerald-700" />
                    </div>
                    <Badge className="professional-badge bg-emerald-100/90 text-emerald-800 border-emerald-300 font-medium">
                      <ShoppingCart className="mobile-icon-sm mr-1" />
                      <span className="mobile-hide">Projeção</span>
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="mobile-metric-number text-emerald-700 font-bold">
                      {formatCurrency(estimativaCustoPorVenda)}
                    </div>
                    <div className="metric-label text-gray-800 dark:text-gray-200 font-semibold">Custo por Venda</div>
                    <div className="mobile-description text-gray-700 dark:text-gray-300">
                      Projeção baseada em dados do mercado
                    </div>
                  </div>
                </div>
              </div>

              {/* Card de tranquilização otimizado para mobile */}
              <Alert className="info-card-success border-0 mobile-p">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="flex items-center justify-center mobile-icon-lg rounded-xl bg-green-500/20 text-green-600 flex-shrink-0">
                    <Shield className="mobile-icon-md" />
                  </div>
                  <div className="flex-1 mobile-content-spacing min-w-0">
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-green-900 dark:text-green-100 flex items-center gap-2 mb-2">
                        <Heart className="mobile-icon-sm" />
                        Como Interpretar Seus Resultados
                      </h3>
                      <p className="mobile-description text-green-800 dark:text-green-200 leading-relaxed mb-4">
                        Estes números representam o trabalho constante da nossa equipe. 
                        Cada métrica é monitorada e otimizada diariamente para maximizar seus resultados.
                      </p>
                    </div>
                    
                    <div className="mobile-grid-1-2 gap-4">
                      <div className="space-y-3">
                        {[
                          { icon: Users, title: 'Pessoas Alcançadas', desc: 'Sua marca ganha visibilidade! Milhares visualizam seus anúncios diariamente.' },
                          { icon: MousePointer, title: 'Visitantes Interessados', desc: 'Cliques reais de pessoas interessadas no que você oferece!' }
                        ].map(({ icon: Icon, title, desc }, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <Icon className="mobile-icon-sm text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-green-900 dark:text-green-100">{title}</p>
                              <p className="mobile-description text-green-800 dark:text-green-200">
                                {desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-3">
                        {[
                          { icon: Target, title: 'Taxa de Interesse', desc: 'Otimizamos continuamente para atrair o público ideal para você!' },
                          { icon: DollarSign, title: 'Investimento Inteligente', desc: 'Cada real trabalha estrategicamente para gerar oportunidades reais!' }
                        ].map(({ icon: Icon, title, desc }, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <Icon className="mobile-icon-sm text-orange-600 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-green-900 dark:text-green-100">{title}</p>
                              <p className="mobile-description text-green-800 dark:text-green-200">
                                {desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="info-card bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 mobile-p rounded-xl border border-green-200 dark:border-green-800/30">
                      <div className="flex items-start gap-3">
                        <Sparkles className="mobile-icon-sm text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-green-900 dark:text-green-100 mb-2">
                            🛡️ Você Está em Boas Mãos!
                          </p>
                          <p className="mobile-description text-green-800 dark:text-green-200 leading-relaxed">
                            Nossa equipe analisa estes dados 24/7 e faz ajustes automáticos. 
                            Estes relatórios são para sua <strong>transparência e confiança</strong> no nosso trabalho. 
                            Relaxe e deixe nossa expertise maximizar seus resultados!
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <Badge className="trust-badge text-xs">
                              ✅ Monitorado 24/7
                            </Badge>
                            <Badge className="monitoring-badge text-xs">
                              🔄 Auto-Otimização
                            </Badge>
                            <Badge className="professional-badge text-xs mobile-hide">
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
            <div className="text-center py-8 md:py-12">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-2xl bg-gradient-trafego flex items-center justify-center">
                <BarChart3 className="mobile-icon-md md:w-10 md:h-10 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mobile-text-balance">
                Pronto para Mostrar Seus Resultados! 📊
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed mobile-description">
                Selecione um período acima para visualizar como seus anúncios estão performando 
                e gerando resultados reais para seu negócio.
              </p>
              <div className="info-card-primary mobile-p rounded-xl max-w-lg mx-auto">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="mobile-icon-sm text-blue-600" />
                  <p className="font-semibold text-blue-900 dark:text-blue-100">💡 Dica</p>
                </div>
                <p className="mobile-description text-blue-800 dark:text-blue-200">
                  Comece com <strong>"Ontem"</strong> ou <strong>"Últimos 7 dias"</strong> para ver dados mais consistentes e confiáveis!
                </p>
              </div>
            </div>
          ) : null}

          {/* Loading state otimizado para mobile */}
          {loadingData && (
            <div className="text-center py-8 md:py-12">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-2xl bg-gradient-trafego flex items-center justify-center animate-pulse">
                <RefreshCw className="mobile-icon-md md:w-10 md:h-10 text-white animate-spin" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Buscando Seus Dados...
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 mobile-description">
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
