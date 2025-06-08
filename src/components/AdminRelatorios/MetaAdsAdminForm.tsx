
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Settings, TestTube, Save, Trash2, BarChart } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface MetaAdsConfig {
  api_id: string
  app_secret: string
  access_token: string
  ad_account_id: string
}

interface MetaAdsAdminFormProps {
  config: MetaAdsConfig | null
  loading: boolean
  error: string | null
  onSaveConfig: (config: MetaAdsConfig) => Promise<void>
  onTestConnection: (config: MetaAdsConfig) => Promise<boolean>
  onClearConfig: () => Promise<void>
  onLoadReport: (config: MetaAdsConfig) => Promise<void>
}

export function MetaAdsAdminForm({
  config,
  loading,
  error,
  onSaveConfig,
  onTestConnection,
  onClearConfig,
  onLoadReport
}: MetaAdsAdminFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<MetaAdsConfig>({
    api_id: config?.api_id || '',
    app_secret: config?.app_secret || '',
    access_token: config?.access_token || '',
    ad_account_id: config?.ad_account_id || ''
  })

  const handleInputChange = (field: keyof MetaAdsConfig, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    const requiredFields: (keyof MetaAdsConfig)[] = ['api_id', 'app_secret', 'access_token', 'ad_account_id']
    const emptyFields = requiredFields.filter(field => !formData[field].trim())
    
    if (emptyFields.length > 0) {
      toast({
        title: "Erro de Validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      })
      return false
    }
    return true
  }

  const handleTestConnection = async () => {
    if (!validateForm()) return
    
    try {
      const isValid = await onTestConnection(formData)
      if (isValid) {
        toast({
          title: "Conexão Testada",
          description: "Credenciais válidas! Conexão estabelecida com sucesso.",
          variant: "default"
        })
      }
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleSaveAndReport = async () => {
    if (!validateForm()) return
    
    try {
      await onSaveConfig(formData)
      await onLoadReport(formData)
      toast({
        title: "Configuração Salva",
        description: "Credenciais salvas e relatório carregado com sucesso!",
        variant: "default"
      })
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleClear = async () => {
    try {
      await onClearConfig()
      setFormData({
        api_id: '',
        app_secret: '',
        access_token: '',
        ad_account_id: ''
      })
      toast({
        title: "Configurações Limpas",
        description: "Todas as configurações foram removidas.",
        variant: "default"
      })
    } catch (error) {
      // Error handled by hook
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-400" />
          Configurações da API Meta Ads
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="api_id" className="text-gray-300">
              API ID *
            </Label>
            <Input
              id="api_id"
              type="text"
              value={formData.api_id}
              onChange={(e) => handleInputChange('api_id', e.target.value)}
              placeholder="Digite o API ID"
              className="bg-gray-800 border-gray-700 text-white"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ad_account_id" className="text-gray-300">
              ID da Conta de Anúncio *
            </Label>
            <Input
              id="ad_account_id"
              type="text"
              value={formData.ad_account_id}
              onChange={(e) => handleInputChange('ad_account_id', e.target.value)}
              placeholder="act_1234567890"
              className="bg-gray-800 border-gray-700 text-white"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="app_secret" className="text-gray-300">
              App Secret *
            </Label>
            <Input
              id="app_secret"
              type="password"
              value={formData.app_secret}
              onChange={(e) => handleInputChange('app_secret', e.target.value)}
              placeholder="••••••••••••••••"
              className="bg-gray-800 border-gray-700 text-white"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_token" className="text-gray-300">
              Access Token *
            </Label>
            <Input
              id="access_token"
              type="password"
              value={formData.access_token}
              onChange={(e) => handleInputChange('access_token', e.target.value)}
              placeholder="••••••••••••••••"
              className="bg-gray-800 border-gray-700 text-white"
              disabled={loading}
            />
          </div>
        </div>

        <Separator className="bg-gray-700" />

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleTestConnection}
            disabled={loading}
            variant="outline"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Testar Conexão
          </Button>

          <Button
            onClick={handleSaveAndReport}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar e Ver Relatório'}
          </Button>

          <Button
            onClick={handleClear}
            disabled={loading}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
