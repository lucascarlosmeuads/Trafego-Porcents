
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useGestorMetaAds } from '@/hooks/useGestorMetaAds'
import { 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  EyeOff,
  Info
} from 'lucide-react'

export function GestorMetaAdsConfig() {
  const { 
    config, 
    loading, 
    saving, 
    testingConnection, 
    lastError, 
    connectionSteps,
    isConfigured,
    saveConfig, 
    testConnection,
    refetchConfig
  } = useGestorMetaAds()
  
  const [isOpen, setIsOpen] = useState(false)
  const [showTokens, setShowTokens] = useState(false)
  const [formData, setFormData] = useState({
    api_id: '',
    app_secret: '',
    access_token: '',
    ad_account_id: ''
  })

  // Atualizar form quando config carrega
  useEffect(() => {
    console.log('🔄 [GestorMetaAdsConfig] Config mudou:', config)
    if (config) {
      setFormData({
        api_id: config.api_id || '',
        app_secret: config.app_secret || '',
        access_token: config.access_token || '',
        ad_account_id: config.ad_account_id || ''
      })
    }
  }, [config])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('💾 [GestorMetaAdsConfig] Submetendo formulário')
    
    const result = await saveConfig(formData)
    if (result.success) {
      console.log('✅ [GestorMetaAdsConfig] Configuração salva com sucesso')
      await refetchConfig()
    }
  }

  const handleTestConnection = async () => {
    console.log('🔗 [GestorMetaAdsConfig] Testando conexão...')
    await testConnection()
  }

  if (loading) {
    return (
      <Card className="w-full bg-gray-900 border-gray-800">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-purple-400" />
          <span className="text-gray-300">Carregando configuração Meta Ads...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-gray-900 border-gray-800">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-800/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-400" />
                Configuração Meta Ads
                {isConfigured && (
                  <Badge variant="secondary" className="bg-green-900 text-green-300 border-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Configurado
                  </Badge>
                )}
                {!isConfigured && (
                  <Badge variant="outline" className="text-orange-400 border-orange-600">
                    <Info className="h-3 w-3 mr-1" />
                    Clique para configurar
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Status de Conexão */}
            {connectionSteps && (
              <Alert className="mb-4 border-green-800 bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  <div className="font-medium mb-2">✅ Conexão Estabelecida com Sucesso!</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      {connectionSteps.validation === 'OK' ? (
                        <CheckCircle className="h-3 w-3 text-green-400" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-gray-300">Validação</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {connectionSteps.basic_connection === 'OK' ? (
                        <CheckCircle className="h-3 w-3 text-green-400" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-gray-300">Conexão API</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {connectionSteps.ad_account_access === 'OK' ? (
                        <CheckCircle className="h-3 w-3 text-green-400" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-gray-300">Ad Account</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {connectionSteps.campaigns_access === 'OK' ? (
                        <CheckCircle className="h-3 w-3 text-green-400" />
                      ) : connectionSteps.campaigns_access === 'WARNING' ? (
                        <AlertCircle className="h-3 w-3 text-yellow-400" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-gray-300">Campanhas</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Erro */}
            {lastError && (
              <Alert className="mb-4 border-red-800 bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  <strong>Erro:</strong> {lastError}
                </AlertDescription>
              </Alert>
            )}

            {/* Info sobre configuração */}
            <Alert className="mb-4 border-blue-800 bg-blue-900/20">
              <Info className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                <strong>Configuração do Gestor:</strong> Esta configuração será usada para buscar relatórios Meta Ads dos seus clientes.
              </AlertDescription>
            </Alert>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="api_id" className="text-gray-300">App ID *</Label>
                  <Input
                    id="api_id"
                    value={formData.api_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, api_id: e.target.value }))}
                    placeholder="Seu App ID do Facebook"
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Encontre no Facebook Developers
                  </p>
                </div>

                <div>
                  <Label htmlFor="ad_account_id" className="text-gray-300">Ad Account ID *</Label>
                  <Input
                    id="ad_account_id"
                    value={formData.ad_account_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, ad_account_id: e.target.value }))}
                    placeholder="act_1234567890"
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Encontre no Facebook Ads Manager
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="app_secret" className="text-gray-300">App Secret *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTokens(!showTokens)}
                    className="text-gray-400 hover:text-white"
                  >
                    {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showTokens ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
                <Input
                  id="app_secret"
                  type={showTokens ? "text" : "password"}
                  value={formData.app_secret}
                  onChange={(e) => setFormData(prev => ({ ...prev, app_secret: e.target.value }))}
                  placeholder="Seu App Secret"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="access_token" className="text-gray-300">Access Token *</Label>
                <Input
                  id="access_token"
                  type={showTokens ? "text" : "password"}
                  value={formData.access_token}
                  onChange={(e) => setFormData(prev => ({ ...prev, access_token: e.target.value }))}
                  placeholder="Seu Access Token"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Token deve ter permissões: ads_read, ads_management
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
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

                {isConfigured && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    {testingConnection ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
