
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useClienteMetaAds } from '@/hooks/useClienteMetaAds'
import { useToast } from '@/hooks/use-toast'
import { 
  Settings, 
  TestTube, 
  BarChart3, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  DollarSign,
  Eye,
  MousePointer
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
  const { toast } = useToast()
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
    updateAdAccountId
  } = useClienteMetaAds(clienteId)

  const [activeTab, setActiveTab] = useState('config')
  const [testing, setTesting] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)

  const handleSaveConfig = async () => {
    const result = await saveConfig(config)
    if (result.success) {
      toast({
        title: "✅ Configuração salva",
        description: "Configuração do Meta Ads salva com sucesso!",
      })
    } else {
      toast({
        title: "❌ Erro ao salvar",
        description: result.error || "Erro desconhecido",
        variant: "destructive"
      })
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    const result = await testConnection()
    setTesting(false)
    
    if (result.success) {
      toast({
        title: "✅ Conexão bem-sucedida",
        description: "Configuração válida! Dados conectados.",
      })
      setActiveTab('metrics')
    } else {
      toast({
        title: "❌ Erro na conexão",
        description: result.message,
        variant: "destructive"
      })
    }
  }

  const handleFetchData = async () => {
    if (!isConfigured) {
      toast({
        title: "⚠️ Configuração necessária",
        description: "Configure primeiro as credenciais do Meta Ads",
        variant: "destructive"
      })
      return
    }

    setFetchingData(true)
    
    // Buscar campanhas e insights em paralelo
    const [campaignsResult, insightsResult] = await Promise.all([
      fetchCampaigns(),
      fetchInsights()
    ])
    
    setFetchingData(false)

    if (campaignsResult.success && insightsResult.success) {
      toast({
        title: "✅ Dados atualizados",
        description: `${campaigns.length} campanhas e métricas carregadas`,
      })
    } else {
      toast({
        title: "⚠️ Erro parcial",
        description: "Alguns dados não puderam ser carregados",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Meta Ads - {nomeCliente}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Teste
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Métricas
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Campanhas
            </TabsTrigger>
          </TabsList>

          {/* Aba de Configuração */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Credenciais do Meta Ads</CardTitle>
                <CardDescription>
                  Configure as credenciais específicas para este cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="app-id">App ID</Label>
                    <Input
                      id="app-id"
                      placeholder="Digite o App ID"
                      value={config.appId}
                      onChange={(e) => setConfig(prev => ({ ...prev, appId: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="app-secret">App Secret</Label>
                    <Input
                      id="app-secret"
                      type="password"
                      placeholder="Digite o App Secret"
                      value={config.appSecret}
                      onChange={(e) => setConfig(prev => ({ ...prev, appSecret: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="access-token">Access Token</Label>
                  <Input
                    id="access-token"
                    placeholder="Digite o Access Token"
                    value={config.accessToken}
                    onChange={(e) => setConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ad-account-id">Ad Account ID</Label>
                  <Input
                    id="ad-account-id"
                    placeholder="Digite o ID da Conta de Anúncios"
                    value={config.adAccountId}
                    onChange={(e) => setConfig(prev => ({ ...prev, adAccountId: e.target.value }))}
                  />
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {isConfigured ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Configurado
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Incompleto
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleSaveConfig} 
                    disabled={saving || loading}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Configuração'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Teste */}
          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Teste de Conexão</CardTitle>
                <CardDescription>
                  Valide se as credenciais estão funcionando corretamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lastError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{lastError}</AlertDescription>
                  </Alert>
                )}

                {connectionSteps && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Resultado do Teste:</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <pre className="text-sm text-green-800">
                        {JSON.stringify(connectionSteps, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleTestConnection} 
                    disabled={testing || !isConfigured}
                    variant="outline"
                  >
                    {testing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleFetchData} 
                    disabled={fetchingData || !isConfigured}
                  >
                    {fetchingData ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Buscar Dados
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Métricas */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {insights.map((insight, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Gasto</p>
                        <p className="text-2xl font-bold">R$ {insight.spend}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {insights.map((insight, index) => (
                <Card key={`impressions-${index}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Impressões</p>
                        <p className="text-2xl font-bold">{insight.impressions}</p>
                      </div>
                      <Eye className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {insights.map((insight, index) => (
                <Card key={`clicks-${index}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Cliques</p>
                        <p className="text-2xl font-bold">{insight.clicks}</p>
                      </div>
                      <MousePointer className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {insights.map((insight, index) => (
                <Card key={`ctr-${index}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">CTR</p>
                        <p className="text-2xl font-bold">{insight.ctr}%</p>
                      </div>
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {insights.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nenhuma métrica disponível. Clique em "Buscar Dados" na aba de teste.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba de Campanhas */}
          <TabsContent value="campaigns" className="space-y-4">
            {campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Target className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{campaign.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {campaign.objective} • {campaign.created_time}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nenhuma campanha encontrada. Clique em "Buscar Dados" na aba de teste.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
