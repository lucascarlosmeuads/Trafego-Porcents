
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
  Bug,
  CheckCircle,
  WifiOff
} from 'lucide-react'
import { getTodayBrazil, getYesterdayBrazil } from '@/utils/timezoneUtils'

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
  const [showDiagnostic, setShowDiagnostic] = useState(false)
  const [currentPeriod, setCurrentPeriod] = useState('today')
  const [retryCount, setRetryCount] = useState(0)
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

  // Auto-carregar métricas com retry
  useEffect(() => {
    if (isConfigured && insights.length === 0 && !cachedMetrics) {
      handleLoadMetricsWithRetry()
    }
  }, [isConfigured])

  const handleLoadMetricsWithRetry = async (period: string = currentPeriod, maxRetries: number = 3) => {
    console.log('🔄 [RETRY] Iniciando carregamento com retry:', { period, tentativa: retryCount + 1 })
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setLoadingData(true)
        setConnectionStatus('checking')
        
        const result = await handleLoadMetrics(period, false)
        
        if (result && (result.success || insights.length > 0)) {
          setRetryCount(0)
          setConnectionStatus('online')
          return result
        }
        
        if (attempt < maxRetries) {
          console.log(`⏳ [RETRY] Tentativa ${attempt + 1} falhou, tentando novamente em 2s...`)
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        
      } catch (error) {
        console.error(`❌ [RETRY] Erro na tentativa ${attempt + 1}:`, error)
        if (attempt === maxRetries) {
          setConnectionStatus('offline')
        }
      }
    }
    
    setLoadingData(false)
    setRetryCount(prev => prev + 1)
    
    // Se todas as tentativas falharam, mostrar dados do cache se houver
    if (cachedMetrics) {
      setFallbackMessage('Usando dados salvos (conexão instável)')
      console.log('📦 [FALLBACK] Usando dados do cache após falha')
    }
  }

  const handleLoadMetrics = async (period: string = currentPeriod, showLoader: boolean = true) => {
    console.log('📊 [WIDGET] Iniciando carregamento de métricas:', { 
      period, 
      clienteId,
      showLoader,
      todayBrazil: getTodayBrazil(),
      yesterdayBrazil: getYesterdayBrazil()
    })
    
    if (showLoader) {
      setLoadingData(true)
    }
    setLastFetchInfo('')
    setFallbackMessage('')
    
    const result = await loadMetricsWithPeriod(period)
    
    console.log('📊 [WIDGET] Resultado do carregamento:', result)
    
    if (result.success) {
      setLastFetchInfo(`✅ Dados carregados: ${result.period_used || period}`)
      if (result.fallback_used) {
        setFallbackMessage(result.message || '')
      }
      setRetryCount(0)
    } else {
      setLastFetchInfo('❌ Falha no carregamento')
      if (result.suggestions?.length > 0) {
        setFallbackMessage(`💡 Dica: ${result.suggestions[0]}`)
      }
    }
    
    if (showLoader) {
      setLoadingData(false)
    }
    return result
  }

  const handlePeriodSelect = async (period: string) => {
    console.log('📅 [WIDGET] Selecionando período:', period)
    setCurrentPeriod(period)
    await handleLoadMetricsWithRetry(period, 2)
  }

  const handleRefreshConfig = async () => {
    console.log('🔄 [WIDGET] Refreshing config...')
    setConnectionStatus('checking')
    await refreshConfig()
    setTimeout(() => {
      if (isConfigured) {
        handleLoadMetricsWithRetry()
      }
    }, 1000)
  }

  const handleClearCache = () => {
    localStorage.removeItem(`metrics_cache_${clienteId}`)
    setCachedMetrics(null)
    setLastFetchInfo('')
    setFallbackMessage('')
    console.log('🗑️ [CACHE] Cache local limpo')
  }

  // Painel de diagnóstico melhorado
  if (showDiagnostic) {
    return (
      <Card className="w-full border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-orange-600" />
              Diagnóstico Meta Ads
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDiagnostic(false)}
            >
              Fechar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div><strong>Cliente ID:</strong> {diagnosticInfo.clienteId}</div>
            <div><strong>Email Usuário:</strong> {diagnosticInfo.userEmail}</div>
            
            <div className="flex items-center gap-2">
              <strong>Status Conexão:</strong> 
              {connectionStatus === 'online' && <><CheckCircle className="w-4 h-4 text-green-600" /> Online</>}
              {connectionStatus === 'offline' && <><WifiOff className="w-4 h-4 text-red-600" /> Offline</>}
              {connectionStatus === 'checking' && <><RefreshCw className="w-4 h-4 animate-spin text-blue-600" /> Verificando</>}
            </div>
            
            <div className="flex items-center gap-2">
              <strong>Config Carregada:</strong> 
              {diagnosticInfo.configLoaded ? (
                <><CheckCircle className="w-4 h-4 text-green-600" /> Sim</>
              ) : (
                <><AlertCircle className="w-4 h-4 text-red-600" /> Não</>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <strong>Configurado:</strong> 
              {isConfigured ? (
                <><CheckCircle className="w-4 h-4 text-green-600" /> Sim</>
              ) : (
                <><AlertCircle className="w-4 h-4 text-red-600" /> Não</>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <strong>Loading:</strong> 
              {loading ? (
                <><RefreshCw className="w-4 h-4 animate-spin text-blue-600" /> Sim</>
              ) : (
                <><CheckCircle className="w-4 h-4 text-green-600" /> Não</>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <strong>Tem Insights:</strong> 
              {diagnosticInfo.hasInsights ? (
                <><CheckCircle className="w-4 h-4 text-green-600" /> Sim ({insights.length})</>
              ) : (
                <><AlertCircle className="w-4 h-4 text-yellow-600" /> Não</>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <strong>Cache Local:</strong> 
              {cachedMetrics ? (
                <><CheckCircle className="w-4 h-4 text-green-600" /> Disponível ({cachedMetrics.data.length} registros)</>
              ) : (
                <><AlertCircle className="w-4 h-4 text-yellow-600" /> Vazio</>
              )}
            </div>
            
            <div><strong>Tentativas Retry:</strong> {retryCount}</div>
            <div><strong>Último Erro:</strong> {lastError || 'Nenhum'}</div>
            <div><strong>Última Info:</strong> {lastFetchInfo || 'Nenhuma'}</div>
            <div><strong>Última Check:</strong> {diagnosticInfo.lastConfigCheck}</div>
            
            <div className="flex gap-2 mt-4 flex-wrap">
              <Button 
                onClick={handleRefreshConfig} 
                disabled={loading}
                size="sm"
                variant="outline"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                Refresh Config
              </Button>
              <Button 
                onClick={() => handleLoadMetricsWithRetry('today', 1)} 
                disabled={loadingData || !isConfigured}
                size="sm"
              >
                {loadingData ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                Testar Hoje
              </Button>
              <Button 
                onClick={() => handleLoadMetricsWithRetry('yesterday', 1)} 
                disabled={loadingData || !isConfigured}
                size="sm"
                variant="outline"
              >
                Testar Ontem
              </Button>
              <Button 
                onClick={handleClearCache}
                size="sm"
                variant="destructive"
              >
                Limpar Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Loading state
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Meta Ads
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
              Meta Ads
              {connectionStatus === 'offline' && <WifiOff className="w-4 h-4 text-red-600" />}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDiagnostic(true)}
              className="text-xs"
            >
              <Bug className="w-3 h-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-blue-200 bg-blue-50">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-3">
                <p className="font-medium">Meta Ads não configurado</p>
                <p className="text-sm">
                  Entre em contato com seu gestor para configurar a integração do Meta Ads 
                  e começar a acompanhar suas métricas em tempo real.
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
                  {retryCount > 0 && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setShowDiagnostic(true)}
                    >
                      <Bug className="w-4 h-4 mr-2" />
                      Diagnóstico
                    </Button>
                  )}
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

  // Calcular métricas totais
  const totalMetrics = displayData.reduce((acc, insight) => ({
    impressions: acc.impressions + parseInt(insight.impressions || '0'),
    clicks: acc.clicks + parseInt(insight.clicks || '0'),
    spend: acc.spend + parseFloat(insight.spend || '0'),
    ctr: acc.ctr + parseFloat(insight.ctr || '0')
  }), {
    impressions: 0,
    clicks: 0,
    spend: 0,
    ctr: 0
  })

  const avgCTR = displayData.length > 0 ? totalMetrics.ctr / displayData.length : 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Meta Ads
            <CheckCircle className="w-4 h-4 text-green-600" />
            {connectionStatus === 'offline' && <WifiOff className="w-4 h-4 text-red-600" />}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDiagnostic(true)}
              className="text-xs opacity-50 hover:opacity-100"
            >
              <Bug className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLoadMetricsWithRetry()}
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

        {/* Erro com sugestões e retry */}
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
                  <Button size="sm" variant="outline" onClick={() => handleLoadMetricsWithRetry()}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Tentar Novamente
                  </Button>
                </div>
                {retryCount > 2 && (
                  <p className="text-xs">
                    💡 Após {retryCount} tentativas, considere entrar em contato com o suporte.
                  </p>
                )}
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

            {/* Métricas em Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-blue-700">
                  {totalMetrics.impressions.toLocaleString()}
                </div>
                <div className="text-xs text-blue-600">Impressões</div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded-lg">
                <MousePointer className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-green-700">
                  {totalMetrics.clicks.toLocaleString()}
                </div>
                <div className="text-xs text-green-600">Cliques</div>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-purple-700">
                  {formatCurrency(totalMetrics.spend)}
                </div>
                <div className="text-xs text-purple-600">Investido</div>
              </div>

              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-orange-700">
                  {avgCTR.toFixed(2)}%
                </div>
                <div className="text-xs text-orange-600">CTR Médio</div>
              </div>
            </div>

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
              Carregue as métricas Meta Ads
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
              Carregando métricas...
              {retryCount > 0 && ` (tentativa ${retryCount + 1})`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
