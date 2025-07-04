import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useClienteMetaAdsSimplified } from '@/hooks/useClienteMetaAdsSimplified'
import { formatCurrency } from '@/lib/utils'
import { 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  BarChart3, 
  Eye, 
  MousePointer, 
  DollarSign,
  RefreshCw,
  ArrowRight,
  Calendar
} from 'lucide-react'

interface ClienteMetaAdsModalSimplifiedProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clienteId: string
  nomeCliente: string
}

type WizardStep = 'config' | 'success' | 'metrics'
type PeriodOption = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'custom'

export function ClienteMetaAdsModalSimplified({ 
  open, 
  onOpenChange, 
  clienteId, 
  nomeCliente 
}: ClienteMetaAdsModalSimplifiedProps) {
  const {
    config,
    setConfig,
    loading,
    saving,
    testing,
    insights,
    lastError,
    connectionSteps,
    isConfigured,
    saveAndTestConfig,
    loadMetricsWithPeriod
  } = useClienteMetaAdsSimplified(clienteId)

  const [currentStep, setCurrentStep] = useState<WizardStep>('config')
  const [localConfig, setLocalConfig] = useState(config)
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('last_7_days')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [loadingMetrics, setLoadingMetrics] = useState(false)

  // Sincronizar config local quando o config do hook mudar
  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  // Determinar step inicial baseado na configuração
  useEffect(() => {
    if (open && !loading) {
      if (isConfigured && insights.length > 0) {
        setCurrentStep('metrics')
      } else if (isConfigured) {
        setCurrentStep('success')
      } else {
        setCurrentStep('config')
      }
    }
  }, [open, loading, isConfigured, insights.length])

  const handleSaveAndTest = async () => {
    const result = await saveAndTestConfig(localConfig)
    if (result.success) {
      setCurrentStep('success')
      // Auto-carregar métricas padrão
      setTimeout(() => {
        handleLoadMetrics()
      }, 1000)
    }
  }

  const handleLoadMetrics = async () => {
    setLoadingMetrics(true)
    
    let startDate = ''
    let endDate = ''
    
    if (selectedPeriod === 'custom') {
      startDate = customStartDate
      endDate = customEndDate
    }
    
    const result = await loadMetricsWithPeriod(selectedPeriod, startDate, endDate)
    
    if (result.success) {
      setCurrentStep('metrics')
    }
    
    setLoadingMetrics(false)
  }

  const handleBackToConfig = () => {
    setCurrentStep('config')
  }

  const handleViewMetrics = () => {
    if (insights.length > 0) {
      setCurrentStep('metrics')
    } else {
      handleLoadMetrics()
    }
  }

  // Calcular métricas agregadas
  const totalMetrics = insights.reduce((acc, insight) => ({
    impressions: acc.impressions + parseInt(insight.impressions || '0'),
    clicks: acc.clicks + parseInt(insight.clicks || '0'),
    spend: acc.spend + parseFloat(insight.spend || '0'),
    ctr: acc.ctr + parseFloat(insight.ctr || '0'),
    cpc: acc.cpc + parseFloat(insight.cpc || '0')
  }), {
    impressions: 0,
    clicks: 0,
    spend: 0,
    ctr: 0,
    cpc: 0
  })

  const avgCTR = insights.length > 0 ? totalMetrics.ctr / insights.length : 0
  const avgCPC = insights.length > 0 ? totalMetrics.cpc / insights.length : 0

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return 'Hoje'
      case 'yesterday': return 'Ontem'
      case 'last_7_days': return 'Últimos 7 dias'
      case 'last_30_days': return 'Últimos 30 dias'
      case 'custom': return 'Período personalizado'
      default: return 'Últimos 7 dias'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Meta Ads - {nomeCliente}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              currentStep === 'config' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
            }`}>
              <Settings className="w-4 h-4" />
              Configuração
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              currentStep === 'success' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              <CheckCircle className="w-4 h-4" />
              Sucesso
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              currentStep === 'metrics' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
            }`}>
              <BarChart3 className="w-4 h-4" />
              Métricas
            </div>
          </div>

          {/* STEP 1: Configuração */}
          {currentStep === 'config' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  Carregando configuração...
                </div>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Credenciais Meta Ads</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Configure suas credenciais do Facebook Business para acessar as métricas dos anúncios
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="appId">App ID</Label>
                          <Input
                            id="appId"
                            placeholder="ID do aplicativo Meta"
                            value={localConfig.appId}
                            onChange={(e) => setLocalConfig(prev => ({ ...prev, appId: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="appSecret">App Secret</Label>
                          <Input
                            id="appSecret"
                            type="password"
                            placeholder="Chave secreta do aplicativo"
                            value={localConfig.appSecret}
                            onChange={(e) => setLocalConfig(prev => ({ ...prev, appSecret: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="accessToken">Access Token</Label>
                          <Input
                            id="accessToken"
                            type="password"
                            placeholder="Token de acesso de usuário"
                            value={localConfig.accessToken}
                            onChange={(e) => setLocalConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="adAccountId">Ad Account ID</Label>
                          <Input
                            id="adAccountId"
                            placeholder="ID da conta de anúncios (act_xxxxx)"
                            value={localConfig.adAccountId}
                            onChange={(e) => setLocalConfig(prev => ({ ...prev, adAccountId: e.target.value }))}
                          />
                        </div>
                      </div>

                      {lastError && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">
                            {lastError}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex justify-end">
                        <Button 
                          onClick={handleSaveAndTest}
                          disabled={saving || testing || !localConfig.appId || !localConfig.appSecret || !localConfig.accessToken || !localConfig.adAccountId}
                          className="flex items-center gap-2"
                        >
                          {saving || testing ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          {saving ? 'Salvando...' : testing ? 'Testando...' : 'Salvar e Testar'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* STEP 2: Sucesso */}
          {currentStep === 'success' && (
            <div className="space-y-6">
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-green-800">Configuração Concluída!</CardTitle>
                  <p className="text-green-700">
                    Suas credenciais do Meta Ads foram salvas e testadas com sucesso
                  </p>
                </CardHeader>
                <CardContent>
                  {connectionSteps && (
                    <div className="space-y-2 mb-6">
                      <h4 className="font-medium text-green-800">Verificações realizadas:</h4>
                      {Object.entries(connectionSteps).map(([step, status]) => (
                        <div key={step} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-green-700">
                            {step}: {String(status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      variant="outline"
                      onClick={handleBackToConfig}
                      className="flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Editar Configuração
                    </Button>
                    <Button 
                      onClick={handleViewMetrics}
                      disabled={loadingMetrics}
                      className="flex items-center gap-2"
                    >
                      {loadingMetrics ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <BarChart3 className="w-4 h-4" />
                      )}
                      Ver Métricas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 3: Métricas */}
          {currentStep === 'metrics' && (
            <div className="space-y-6">
              {/* Seletor de Período */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Período das Métricas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <Label htmlFor="period">Selecionar período</Label>
                      <Select value={selectedPeriod} onValueChange={(value: PeriodOption) => setSelectedPeriod(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Hoje</SelectItem>
                          <SelectItem value="yesterday">Ontem</SelectItem>
                          <SelectItem value="last_7_days">Últimos 7 dias</SelectItem>
                          <SelectItem value="last_30_days">Últimos 30 dias</SelectItem>
                          <SelectItem value="custom">Período personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedPeriod === 'custom' && (
                      <>
                        <div>
                          <Label htmlFor="startDate">Data inicial</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">Data final</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    <Button 
                      onClick={handleLoadMetrics}
                      disabled={loadingMetrics}
                      className="flex items-center gap-2"
                    >
                      {loadingMetrics ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Atualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Métricas Principais */}
              {insights.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Eye className="w-4 h-4 text-blue-600" />
                          Impressões
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {totalMetrics.impressions.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getPeriodLabel()}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <MousePointer className="w-4 h-4 text-green-600" />
                          Cliques
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {totalMetrics.clicks.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          CTR: {avgCTR.toFixed(2)}%
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-purple-600" />
                          Investido
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(totalMetrics.spend)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          CPC: {formatCurrency(avgCPC)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-orange-600" />
                          Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {avgCTR.toFixed(2)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          CTR médio
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">Nenhum Dado Disponível</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Selecione um período e clique em "Atualizar" para carregar as métricas
                    </p>
                    <Button onClick={handleLoadMetrics} disabled={loadingMetrics}>
                      {loadingMetrics ? (
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <BarChart3 className="w-4 h-4 mr-2" />
                      )}
                      Carregar Métricas
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Botão Voltar */}
              <div className="flex justify-start">
                <Button 
                  variant="outline"
                  onClick={handleBackToConfig}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Editar Configuração
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
