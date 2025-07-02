
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useAdminMetaAds } from '@/hooks/useAdminMetaAds'
import { toast } from '@/hooks/use-toast'
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

export function AdminMetaAdsConfig() {
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
  } = useAdminMetaAds()
  
  const [isOpen, setIsOpen] = useState(false)
  const [showTokens, setShowTokens] = useState(false)
  const [formData, setFormData] = useState({
    api_id: '',
    app_secret: '',
    access_token: '',
    ad_account_id: '',
    email_usuario: 'admin-global'
  })

  // Atualizar form quando config carrega
  useEffect(() => {
    console.log('🔄 [AdminMetaAdsConfig] Config mudou:', config)
    if (config) {
      setFormData({
        api_id: config.api_id || '',
        app_secret: config.app_secret || '',
        access_token: config.access_token || '',
        ad_account_id: config.ad_account_id || '',
        email_usuario: config.email_usuario || 'admin-global'
      })
    }
  }, [config])

  // Buscar configuração ao montar o componente
  useEffect(() => {
    if (!config && !loading) {
      console.log('🔄 [AdminMetaAdsConfig] Refazendo busca da configuração...')
      refetchConfig()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('💾 [AdminMetaAdsConfig] Submetendo formulário:', {
      ...formData,
      app_secret: '***HIDDEN***',
      access_token: '***HIDDEN***'
    })
    
    const result = await saveConfig(formData)
    if (result.success) {
      console.log('✅ [AdminMetaAdsConfig] Configuração salva com sucesso')
      // Atualizar a configuração no estado após salvar
      await refetchConfig()
    }
  }

  const handleTestConnection = async () => {
    console.log('🔗 [AdminMetaAdsConfig] Testando conexão...')
    const result = await testConnection()
    console.log('📊 [AdminMetaAdsConfig] Resultado do teste:', result)
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Carregando configuração Meta Ads...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuração Meta Ads Global
                {isConfigured && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Configurado
                  </Badge>
                )}
                {!isConfigured && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Info className="h-3 w-3 mr-1" />
                    Clique para configurar
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Status de Conexão */}
            {connectionSteps && (
              <Alert className="mb-4 border-green-200 bg-green-50">
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
                      ) : connectionSteps.campaigns_access === 'WARNING' ? (
                        <AlertCircle className="h-3 w-3 text-yellow-600" />
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
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Erro:</strong> {lastError}
                </AlertDescription>
              </Alert>
            )}

            {/* Info sobre configuração global */}
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Configuração Global:</strong> Esta configuração será usada por todo o sistema para conectar com Meta Ads e buscar relatórios globais.
              </AlertDescription>
            </Alert>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="api_id">App ID *</Label>
                  <Input
                    id="api_id"
                    value={formData.api_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, api_id: e.target.value }))}
                    placeholder="Seu App ID do Facebook"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Encontre no Facebook Developers
                  </p>
                </div>

                <div>
                  <Label htmlFor="ad_account_id">Ad Account ID *</Label>
                  <Input
                    id="ad_account_id"
                    value={formData.ad_account_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, ad_account_id: e.target.value }))}
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
                  <Label htmlFor="app_secret">App Secret *</Label>
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
                  id="app_secret"
                  type={showTokens ? "text" : "password"}
                  value={formData.app_secret}
                  onChange={(e) => setFormData(prev => ({ ...prev, app_secret: e.target.value }))}
                  placeholder="Seu App Secret"
                  required
                />
              </div>

              <div>
                <Label htmlFor="access_token">Access Token *</Label>
                <Input
                  id="access_token"
                  type={showTokens ? "text" : "password"}
                  value={formData.access_token}
                  onChange={(e) => setFormData(prev => ({ ...prev, access_token: e.target.value }))}
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
                      Salvar Configuração Global
                    </>
                  )}
                </Button>

                {isConfigured && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={testingConnection}
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
