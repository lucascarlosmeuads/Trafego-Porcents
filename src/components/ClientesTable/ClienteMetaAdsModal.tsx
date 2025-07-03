
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useClienteMetaAds } from '@/hooks/useClienteMetaAds'
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
  Save,
  TestTube
} from 'lucide-react'

interface ClienteMetaAdsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clienteId: string
  nomeCliente: string
}

export function ClienteMetaAdsModal({ 
  open, 
  onOpenChange, 
  clienteId, 
  nomeCliente 
}: ClienteMetaAdsModalProps) {
  const {
    config,
    setConfig,
    loading,
    saving,
    saveConfig,
    testConnection,
    fetchCampaigns,
    fetchInsights,
    campaigns,
    insights,
    isConfigured,
    lastError,
    lastErrorType,
    connectionSteps,
    refreshConfig,
    autoLoadData
  } = useClienteMetaAds(clienteId)

  const [localConfig, setLocalConfig] = useState(config)
  const [testing, setTesting] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [activeTab, setActiveTab] = useState('config')

  // Sincronizar config local quando o config do hook mudar
  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  // Auto-mudar para aba de métricas quando configurado
  useEffect(() => {
    if (isConfigured && insights.length > 0) {
      setActiveTab('metrics')
    }
  }, [isConfigured, insights.length])

  const handleSave = async () => {
    const result = await saveConfig(localConfig)
    if (result.success) {
      console.log('✅ [ClienteMetaAdsModal] Configuração salva com sucesso')
      // Auto-carregar dados após salvar
      setTimeout(async () => {
        try {
          await autoLoadData()
          setActiveTab('metrics')
        } catch (error) {
          console.error('❌ [ClienteMetaAdsModal] Erro ao carregar dados:', error)
        }
      }, 1000)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const result = await testConnection()
      console.log('🔧 [ClienteMetaAdsModal] Teste resultado:', result)
    } catch (error) {
      console.error('❌ [ClienteMetaAdsModal] Erro no teste:', error)
    } finally {
      setTesting(false)
    }
  }

  const handleLoadData = async () => {
    setLoadingData(true)
    try {
      await Promise.all([
        fetchCampaigns(),
        fetchInsights()
      ])
      setActiveTab('metrics')
    } catch (error) {
      console.error('❌ [ClienteMetaAdsModal] Erro ao carregar dados:', error)
    } finally {
      setLoadingData(false)
    }
  }

  // Calcular métricas agregadas
  const metrics = insights.reduce((acc, insight) => ({
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

  const avgCTR = insights.length > 0 ? metrics.ctr / insights.length : 0
  const avgCPC = insights.length > 0 ? metrics.cpc / insights.length : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Meta Ads - {nomeCliente}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2" disabled={!isConfigured}>
              <BarChart3 className="w-4 h-4" />
              Métricas
              {isConfigured && <CheckCircle className="w-3 h-3 text-green-600" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                Carregando configuração...
              </div>
            ) : (
              <>
                {/* Status da Configuração */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      {isConfigured ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Meta Ads Configurado
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          Configuração Necessária
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {isConfigured 
                        ? 'Suas credenciais estão configuradas e prontas para uso.'
                        : 'Configure suas credenciais do Meta Ads para começar a acompanhar métricas.'
                      }
                    </p>
                  </CardContent>
                </Card>

                {/* Formulário de Configuração */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appId">App ID</Label>
                    <Input
                      id="appId"
                      type="text"
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
                      placeholder="Token de acesso"
                      value={localConfig.accessToken}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adAccountId">Ad Account ID</Label>
                    <Input
                      id="adAccountId"
                      type="text"
                      placeholder="ID da conta de anúncios"
                      value={localConfig.adAccountId}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, adAccountId: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Erros de Conexão */}
                {lastError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <div className="font-medium mb-1">Erro na configuração:</div>
                      <div className="text-sm">{lastError}</div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Steps de Conexão */}
                {connectionSteps && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-sm text-green-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Conexão Testada com Sucesso
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(connectionSteps).map(([step, status]) => (
                          <div key={step} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span className="text-green-700">
                              {step}: {String(status)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Botões de Ação */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Salvar Configuração
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={handleTest}
                    disabled={testing || !localConfig.appId || !localConfig.appSecret || !localConfig.accessToken}
                    className="flex items-center gap-2"
                  >
                    {testing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                    Testar Conexão
                  </Button>

                  {isConfigured && (
                    <Button 
                      variant="outline"
                      onClick={handleLoadData}
                      disabled={loadingData}
                      className="flex items-center gap-2"
                    >
                      {loadingData ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <BarChart3 className="w-4 h-4" />
                      )}
                      Carregar Métricas
                    </Button>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            {!isConfigured ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-orange-500 mb-4" />
                <h3 className="font-medium text-gray-900">Configuração Necessária</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Configure primeiro suas credenciais do Meta Ads na aba "Configuração"
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('config')}
                  className="mt-4"
                >
                  Ir para Configuração
                </Button>
              </div>
            ) : insights.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="font-medium text-gray-900">Nenhum Dado Disponível</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Clique em "Carregar Métricas" para buscar os dados do Meta Ads
                </p>
                <Button 
                  onClick={handleLoadData}
                  disabled={loadingData}
                  className="mt-4"
                >
                  {loadingData ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <BarChart3 className="w-4 h-4 mr-2" />
                  )}
                  Carregar Métricas
                </Button>
              </div>
            ) : (
              <>
                {/* Métricas Principais */}
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
                        {metrics.impressions.toLocaleString()}
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
                        {metrics.clicks.toLocaleString()}
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
                        {formatCurrency(metrics.spend)}
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
                        Campanhas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {campaigns.filter(c => c.status === 'ACTIVE').length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {campaigns.length} total
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Lista de Campanhas */}
                {campaigns.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Campanhas Ativas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {campaigns.map((campaign) => (
                          <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-sm">{campaign.name}</div>
                              <div className="text-xs text-gray-500">
                                {campaign.objective}
                              </div>
                            </div>
                            <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Botão de Atualização */}
                <div className="flex justify-center">
                  <Button 
                    variant="outline"
                    onClick={handleLoadData}
                    disabled={loadingData}
                    className="flex items-center gap-2"
                  >
                    {loadingData ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Atualizar Dados
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
