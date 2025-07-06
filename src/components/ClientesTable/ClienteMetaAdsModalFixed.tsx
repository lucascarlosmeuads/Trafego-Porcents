
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useClienteMetaAdsFixed } from '@/hooks/useClienteMetaAdsFixed'
import { toast } from '@/hooks/use-toast'
import { 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  EyeOff,
  Info,
  BarChart3,
  Target,
  TrendingUp
} from 'lucide-react'

interface Cliente {
  id: number
  nome_cliente: string
  email_cliente: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  cliente: Cliente | null
}

export function ClienteMetaAdsModalFixed({ isOpen, onClose, cliente }: Props) {
  const {
    config,
    loading,
    saving,
    insights,
    lastError,
    connectionSteps,
    isConfigured,
    saveConfig,
    testConnection,
    loadInsights,
    setOnConfigurationSuccess
  } = useClienteMetaAdsFixed(cliente?.id?.toString() || '')

  const [activeTab, setActiveTab] = useState('config')
  const [showTokens, setShowTokens] = useState(false)
  const [localConfig, setLocalConfig] = useState({
    appId: '',
    appSecret: '',
    accessToken: '',
    adAccountId: ''
  })

  // Sincronizar configuração local com o hook
  useEffect(() => {
    if (config.appId || config.appSecret || config.accessToken || config.adAccountId) {
      setLocalConfig(config)
    }
  }, [config])

  // Configurar callback para navegar automaticamente para métricas
  useEffect(() => {
    setOnConfigurationSuccess(() => {
      console.log('🎯 [ClienteMetaAdsModalFixed] Configuração bem-sucedida, navegando para métricas')
      setActiveTab('metrics')
      toast({
        title: "Sucesso!",
        description: "Configuração salva e testada com sucesso. Carregando métricas...",
      })
      // Carregar insights automaticamente
      setTimeout(() => {
        loadInsights('today')
      }, 1000)
    })
  }, [setOnConfigurationSuccess, loadInsights])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('💾 [ClienteMetaAdsModalFixed] Submetendo configuração')
    
    if (!localConfig.appId || !localConfig.appSecret || !localConfig.accessToken || !localConfig.adAccountId) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      })
      return
    }
    
    const result = await saveConfig(localConfig)
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Configuração salva com sucesso!",
      })
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao salvar configuração",
        variant: "destructive"
      })
    }
  }

  const handleTestConnection = async () => {
    console.log('🔗 [ClienteMetaAdsModalFixed] Testando conexão com config local')
    
    if (!localConfig.appId || !localConfig.appSecret || !localConfig.accessToken || !localConfig.adAccountId) {
      toast({
        title: "Erro",
        description: "Configure todos os campos antes de testar",
        variant: "destructive"
      })
      return
    }
    
    const result = await testConnection(localConfig)
    if (result.success) {
      toast({
        title: "Conexão OK!",
        description: "Teste de conexão realizado com sucesso!",
      })
    } else {
      toast({
        title: "Erro na Conexão",
        description: result.message || "Erro ao testar conexão",
        variant: "destructive"
      })
    }
  }

  const handleLoadInsights = async (period: string = 'today') => {
    console.log('📊 [ClienteMetaAdsModalFixed] Carregando insights:', period)
    const result = await loadInsights(period)
    if (result.success) {
      toast({
        title: "Dados Carregados!",
        description: `Métricas de ${period} carregadas com sucesso!`,
      })
    } else {
      toast({
        title: "Sem dados",
        description: result.message || "Nenhum dado encontrado para o período",
        variant: "destructive"
      })
    }
  }

  if (!cliente) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Meta Ads - {cliente.nome_cliente}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuração
              {isConfigured && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 ml-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  OK
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Métricas
              {insights.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 ml-1">
                  {insights.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Carregando configuração...
              </div>
            )}

            {!loading && (
              <>
                {/* Status de Conexão */}
                {connectionSteps && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <div className="font-medium mb-2">✅ Conexão Estabelecida com Sucesso!</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {Object.entries(connectionSteps).map(([step, status]) => (
                          <div key={step} className="flex items-center gap-1">
                            {status === 'OK' ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-red-600" />
                            )}
                            {step.replace('_', ' ')}
                          </div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Erro */}
                {lastError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Erro:</strong> {lastError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Info sobre configuração específica */}
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Configuração Específica:</strong> Esta configuração será usada apenas para {cliente.nome_cliente}. Se não configurada, usará a configuração global do gestor.
                  </AlertDescription>
                </Alert>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="appId">App ID *</Label>
                      <Input
                        id="appId"
                        value={localConfig.appId}
                        onChange={(e) => setLocalConfig(prev => ({ ...prev, appId: e.target.value }))}
                        placeholder="Seu App ID do Facebook"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="adAccountId">Ad Account ID *</Label>
                      <Input
                        id="adAccountId"
                        value={localConfig.adAccountId}
                        onChange={(e) => setLocalConfig(prev => ({ ...prev, adAccountId: e.target.value }))}
                        placeholder="act_1234567890 (sem o prefixo act_ também funciona)"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="appSecret">App Secret *</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTokens(!showTokens)}
                      >
                        {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {showTokens ? 'Ocultar' : 'Mostrar'}
                      </Button>
                    </div>
                    <Input
                      id="appSecret"
                      type={showTokens ? "text" : "password"}
                      value={localConfig.appSecret}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, appSecret: e.target.value }))}
                      placeholder="Seu App Secret"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="accessToken">Access Token *</Label>
                    <Input
                      id="accessToken"
                      type={showTokens ? "text" : "password"}
                      value={localConfig.accessToken}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                      placeholder="Seu Access Token"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Token deve ter permissões: ads_read, ads_management
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Settings className="h-4 w-4 mr-2" />
                          Salvar Configuração
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={saving}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Testar Conexão
                    </Button>
                  </div>
                </form>
              </>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            {!isConfigured ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="font-medium text-muted-foreground">Configure primeiro o Meta Ads</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Vá para a aba "Configuração" para começar
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('config')}
                  className="mt-4"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Ir para Configuração
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button size="sm" onClick={() => handleLoadInsights('today')}>
                    Hoje
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleLoadInsights('yesterday')}>
                    Ontem
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleLoadInsights('last_7d')}>
                    Últimos 7 dias
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleLoadInsights('last_30d')}>
                    Últimos 30 dias
                  </Button>
                </div>

                {insights.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {insights.map((insight, index) => (
                      <div key={index} className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-blue-900">Impressões</h4>
                            <Eye className="h-4 w-4 text-blue-600" />
                          </div>
                          <p className="text-2xl font-bold text-blue-800">
                            {parseInt(insight.impressions || '0').toLocaleString()}
                          </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-green-900">Cliques</h4>
                            <Target className="h-4 w-4 text-green-600" />
                          </div>
                          <p className="text-2xl font-bold text-green-800">
                            {parseInt(insight.clicks || '0').toLocaleString()}
                          </p>
                          <p className="text-sm text-green-600">
                            CTR: {parseFloat(insight.ctr || '0').toFixed(2)}%
                          </p>
                        </div>

                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-red-900">Investimento</h4>
                            <TrendingUp className="h-4 w-4 text-red-600" />
                          </div>
                          <p className="text-2xl font-bold text-red-800">
                            R$ {parseFloat(insight.spend || '0').toFixed(2)}
                          </p>
                          <p className="text-sm text-red-600">
                            CPC: R$ {parseFloat(insight.cpc || '0').toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="font-medium text-muted-foreground">Nenhum dado disponível</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Clique em um dos botões acima para carregar os dados
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
