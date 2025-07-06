
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Cliente } from '@/lib/supabase'
import { useClienteMetaAdsFixed } from '@/hooks/useClienteMetaAdsFixed'
import { toast } from '@/hooks/use-toast'
import { 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  EyeOff,
  Activity,
  TrendingUp
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ClienteMetaAdsModalFixedProps {
  cliente: Cliente
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClienteMetaAdsModalFixed({
  cliente,
  open,
  onOpenChange
}: ClienteMetaAdsModalFixedProps) {
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
    loadMetricsWithPeriod,
    refreshConfig
  } = useClienteMetaAdsFixed(cliente.id!.toString())

  const [activeTab, setActiveTab] = useState('configuracao')
  const [showTokens, setShowTokens] = useState(false)
  const [formData, setFormData] = useState({
    appId: '',
    appSecret: '',
    accessToken: '',
    adAccountId: ''
  })

  // Atualizar form quando config carrega
  useEffect(() => {
    if (config) {
      setFormData({
        appId: config.appId || '',
        appSecret: config.appSecret || '',
        accessToken: config.accessToken || '',
        adAccountId: config.adAccountId || ''
      })
    }
  }, [config])

  const handleSave = async () => {
    console.log('💾 [ClienteMetaAdsModalFixed] Salvando configuração...')
    
    const result = await saveConfig(formData)
    
    if (result.success) {
      console.log('✅ [ClienteMetaAdsModalFixed] Configuração salva, testando conexão...')
      
      // Após salvar com sucesso, testar conexão automaticamente
      const testResult = await testConnection()
      
      if (testResult.success) {
        console.log('✅ [ClienteMetaAdsModalFixed] Teste de conexão OK, carregando métricas...')
        
        // Após testar com sucesso, carregar métricas e ir para aba métricas
        const metricsResult = await loadMetricsWithPeriod('today')
        
        if (metricsResult.success || metricsResult.message.includes('Sem dados')) {
          console.log('✅ [ClienteMetaAdsModalFixed] Navegando para aba métricas')
          setActiveTab('metricas')
          
          toast({
            title: "Configuração completa!",
            description: "Credenciais salvas e testadas com sucesso. Métricas carregadas.",
          })
        } else {
          // Se falhar no carregamento de métricas, ainda vai para a aba métricas
          setActiveTab('metricas')
          
          toast({
            title: "Configuração salva",
            description: "Credenciais salvas e testadas. Verifique as métricas na aba ao lado.",
          })
        }
      }
    }
  }

  const handleTestConnection = async () => {
    console.log('🔗 [ClienteMetaAdsModalFixed] Testando conexão...')
    const result = await testConnection()
    console.log('📊 [ClienteMetaAdsModalFixed] Resultado do teste:', result)
    
    if (result.success) {
      // Após teste bem-sucedido, carregar métricas e ir para aba métricas
      const metricsResult = await loadMetricsWithPeriod('today')
      
      if (metricsResult.success || metricsResult.message.includes('Sem dados')) {
        setActiveTab('metricas')
        
        toast({
          title: "Teste bem-sucedido!",
          description: "Conexão estabelecida e métricas carregadas.",
        })
      }
    }
  }

  const handleLoadMetrics = async (period: string) => {
    console.log('📊 [ClienteMetaAdsModalFixed] Carregando métricas para período:', period)
    await loadMetricsWithPeriod(period)
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Carregando configuração Meta Ads...
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Meta Ads - {cliente.nome_cliente}
            {isConfigured && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Configurado
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="configuracao">Configuração</TabsTrigger>
            <TabsTrigger value="metricas" disabled={!isConfigured}>
              Métricas
              {insights.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {insights.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configuracao" className="space-y-4">
            {/* Status de Conexão */}
            {connectionSteps && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="font-medium mb-2">✅ Conexão Estabelecida com Sucesso!</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      {connectionSteps.validation === 'OK' ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-600" />
                      )}
                      Validação
                    </div>
                    <div className="flex items-center gap-1">
                      {connectionSteps.basic_connection === 'OK' ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-600" />
                      )}
                      Conexão API
                    </div>
                    <div className="flex items-center gap-1">
                      {connectionSteps.ad_account_access === 'OK' ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-600" />
                      )}
                      Ad Account
                    </div>
                    <div className="flex items-center gap-1">
                      {connectionSteps.campaigns_access === 'OK' ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-600" />
                      )}
                      Campanhas
                    </div>
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

            {/* Formulário */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appId">App ID *</Label>
                  <Input
                    id="appId"
                    value={formData.appId}
                    onChange={(e) => setFormData(prev => ({ ...prev, appId: e.target.value }))}
                    placeholder="Seu App ID do Facebook"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Encontre no Facebook Developers
                  </p>
                </div>

                <div>
                  <Label htmlFor="adAccountId">Ad Account ID *</Label>
                  <Input
                    id="adAccountId"
                    value={formData.adAccountId}
                    onChange={(e) => setFormData(prev => ({ ...prev, adAccountId: e.target.value }))}
                    placeholder="act_1234567890"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Encontre no Facebook Ads Manager
                  </p>
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
                  value={formData.appSecret}
                  onChange={(e) => setFormData(prev => ({ ...prev, appSecret: e.target.value }))}
                  placeholder="Seu App Secret"
                  required
                />
              </div>

              <div>
                <Label htmlFor="accessToken">Access Token *</Label>
                <Input
                  id="accessToken"
                  type={showTokens ? "text" : "password"}
                  value={formData.accessToken}
                  onChange={(e) => setFormData(prev => ({ ...prev, accessToken: e.target.value }))}
                  placeholder="Seu Access Token"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Token deve ter permissões: ads_read, ads_management
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-4">
                <Button
                  onClick={handleSave}
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
                      Salvar e Testar
                    </>
                  )}
                </Button>

                {isConfigured && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Testar Conexão
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metricas" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Métricas Meta Ads
              </h3>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleLoadMetrics('today')}>
                  Hoje
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleLoadMetrics('yesterday')}>
                  Ontem
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleLoadMetrics('last_7_days')}>
                  7 dias
                </Button>
              </div>
            </div>

            {insights.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Impressões</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {parseInt(insights[0].impressions || '0').toLocaleString()}
                      </p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Cliques</p>
                      <p className="text-2xl font-bold text-green-800">
                        {parseInt(insights[0].clicks || '0').toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600">
                        CTR: {parseFloat(insights[0].ctr || '0').toFixed(2)}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600">Investimento</p>
                      <p className="text-2xl font-bold text-red-800">
                        {formatCurrency(parseFloat(insights[0].spend || '0'))}
                      </p>
                      <p className="text-xs text-red-600">
                        CPC: {formatCurrency(parseFloat(insights[0].cpc || '0'))}
                      </p>
                    </div>
                    <Settings className="h-8 w-8 text-red-500" />
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">CPM</p>
                      <p className="text-2xl font-bold text-purple-800">
                        {formatCurrency(parseFloat(insights[0].cpm || '0'))}
                      </p>
                      <p className="text-xs text-purple-600">
                        Custo por mil impressões
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </div>
            )}

            {lastError && insights.length === 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  {lastError}
                </AlertDescription>
              </Alert>
            )}

            {!lastError && insights.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma métrica disponível. Clique em um dos botões acima para carregar dados.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
