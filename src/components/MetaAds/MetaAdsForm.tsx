
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, Loader2, TestTube, Trash2 } from 'lucide-react'
import { useMetaAds, MetaAdsConfig } from '@/hooks/useMetaAds'

interface MetaAdsFormProps {
  onReportGenerated?: () => void
}

export function MetaAdsForm({ onReportGenerated }: MetaAdsFormProps) {
  const { config, loading, error, saveConfig, testConnection, fetchReport, clearConfig, setError } = useMetaAds()
  const [formData, setFormData] = useState<MetaAdsConfig>({
    api_id: '',
    app_secret: '',
    access_token: '',
    ad_account_id: ''
  })
  const [testSuccess, setTestSuccess] = useState(false)

  useEffect(() => {
    if (config) {
      setFormData(config)
    }
  }, [config])

  const handleInputChange = (field: keyof MetaAdsConfig, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setTestSuccess(false)
    setError(null)
  }

  const handleTestConnection = async () => {
    if (!isFormValid()) {
      setError('Preencha todos os campos antes de testar a conexão.')
      return
    }

    const success = await testConnection(formData)
    setTestSuccess(success)
  }

  const handleSaveAndReport = async () => {
    if (!isFormValid()) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }

    const saved = await saveConfig(formData)
    if (saved) {
      const report = await fetchReport(formData)
      if (report && onReportGenerated) {
        onReportGenerated()
      }
    }
  }

  const handleClearConfig = async () => {
    if (window.confirm('Tem certeza que deseja limpar todas as configurações? Esta ação não pode ser desfeita.')) {
      await clearConfig()
      setFormData({
        api_id: '',
        app_secret: '',
        access_token: '',
        ad_account_id: ''
      })
      setTestSuccess(false)
    }
  }

  const isFormValid = () => {
    return Object.values(formData).every(value => value.trim() !== '')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Configurações da Meta API
          {config && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearConfig}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Configurações
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="api_id">API ID *</Label>
            <Input
              id="api_id"
              type="text"
              value={formData.api_id}
              onChange={(e) => handleInputChange('api_id', e.target.value)}
              placeholder="Digite o API ID..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="app_secret">App Secret *</Label>
            <Input
              id="app_secret"
              type="password"
              value={formData.app_secret}
              onChange={(e) => handleInputChange('app_secret', e.target.value)}
              placeholder="Digite o App Secret..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_token">Access Token *</Label>
            <Input
              id="access_token"
              type="password"
              value={formData.access_token}
              onChange={(e) => handleInputChange('access_token', e.target.value)}
              placeholder="Digite o Access Token..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ad_account_id">ID da Conta de Anúncio *</Label>
            <Input
              id="ad_account_id"
              type="text"
              value={formData.ad_account_id}
              onChange={(e) => handleInputChange('ad_account_id', e.target.value)}
              placeholder="Ex: 123456789"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {testSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Conexão testada com sucesso! Agora você pode salvar e gerar o relatório.</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleTestConnection}
            disabled={loading || !isFormValid()}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            Testar Conexão
          </Button>

          <Button
            onClick={handleSaveAndReport}
            disabled={loading || !isFormValid()}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Salvar e Ver Relatório
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
          <p>• Todos os campos são obrigatórios</p>
          <p>• Use "Testar Conexão" antes de salvar para validar os dados</p>
          <p>• Suas configurações ficam salvas para uso futuro</p>
        </div>
      </CardContent>
    </Card>
  )
}
