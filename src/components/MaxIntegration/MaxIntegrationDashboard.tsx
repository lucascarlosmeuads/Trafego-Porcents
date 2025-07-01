import { useState } from 'react'
import { useMaxIntegration } from '@/hooks/useMaxIntegration'
import { useGestores } from '@/hooks/useGestores'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { LoadingFallback } from '@/components/LoadingFallback'
import { MaxIntegrationLogs } from './MaxIntegrationLogs'
import { MaxIntegrationStats } from './MaxIntegrationStats'
import { WebhookMonitoringDashboard } from './WebhookMonitoringDashboard'
import { WebhookDiagnostics } from './WebhookDiagnostics'
import { WebhookTroubleshooting } from './WebhookTroubleshooting'
import { AlternativeWebhookTest } from './AlternativeWebhookTest'
import { 
  Settings, 
  User, 
  Activity, 
  TestTube, 
  AlertCircle,
  CheckCircle,
  Globe,
  RefreshCw,
  FileText,
  AlertTriangle
} from 'lucide-react'

export function MaxIntegrationDashboard() {
  const { config, logs, loading, updating, changeActiveGestor, toggleIntegration, testWebhook, refetch } = useMaxIntegration()
  const { gestores, loading: gestoresLoading } = useGestores()
  const [testingWebhook, setTestingWebhook] = useState(false)
  const [activeTab, setActiveTab] = useState<'config' | 'monitor' | 'diagnostics' | 'troubleshooting' | 'logs'>(
    'config'
  )

  const handleGestorChange = async (gestorEmail: string) => {
    const gestor = gestores.find(g => g.email === gestorEmail)
    if (gestor) {
      await changeActiveGestor(gestor.email, gestor.nome)
    }
  }

  const handleToggleIntegration = async (active: boolean) => {
    await toggleIntegration(active)
  }

  const handleTestWebhook = async () => {
    setTestingWebhook(true)
    await testWebhook()
    setTestingWebhook(false)
  }

  if (loading || gestoresLoading) {
    return <LoadingFallback />
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-orange-500 mb-4" />
            <CardTitle>Integração não configurada</CardTitle>
            <CardDescription>
              A integração com o App Max ainda não foi configurada no sistema.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 lg:p-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Integração App Max</h1>
          <p className="text-gray-400">
            Configure e monitore a integração automática de pedidos do App Max
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg overflow-x-auto">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'config' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Settings className="w-4 h-4 mr-2 inline" />
          Configurações
        </button>
        <button
          onClick={() => setActiveTab('monitor')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'monitor' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Activity className="w-4 h-4 mr-2 inline" />
          Monitor
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'diagnostics' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <TestTube className="w-4 h-4 mr-2 inline" />
          Diagnósticos
        </button>
        <button
          onClick={() => setActiveTab('troubleshooting')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'troubleshooting' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4 mr-2 inline" />
          Soluções
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'logs' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <FileText className="w-4 h-4 mr-2 inline" />
          Logs
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'config' && (
        <>
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status da Integração</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {config.integration_active ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        Ativa
                      </Badge>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                        Inativa
                      </Badge>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gestor Ativo</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold text-white">
                  {config.gestor_nome}
                </div>
                <p className="text-xs text-muted-foreground">
                  {config.gestor_email}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Webhook URL</CardTitle>
                <Globe className="w-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xs font-mono text-gray-400 break-all">
                  {config.webhook_url}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configurações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações
              </CardTitle>
              <CardDescription>
                Configure o gestor que receberá os novos pedidos do App Max
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ativar/Desativar Integração */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">
                    Integração Ativa
                  </label>
                  <p className="text-xs text-gray-400">
                    Ativar ou desativar o recebimento de pedidos do App Max
                  </p>
                </div>
                <Switch
                  checked={config.integration_active}
                  onCheckedChange={handleToggleIntegration}
                  disabled={updating}
                />
              </div>

              <Separator />

              {/* Seletor de Gestor */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Gestor que receberá os pedidos
                </label>
                <Select
                  value={config.gestor_email}
                  onValueChange={handleGestorChange}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar gestor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {gestores
                      .filter(g => g.ativo)
                      .map(gestor => (
                        <SelectItem key={gestor.id} value={gestor.email}>
                          <div className="flex items-center space-x-2">
                            <span>{gestor.nome}</span>
                            <span className="text-xs text-gray-400">
                              ({gestor.email})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400">
                  Todos os novos pedidos do App Max serão atribuídos automaticamente 
                  ao gestor selecionado
                </p>
              </div>

              <Separator />

              {/* Teste do Webhook */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">
                    Testar Integração
                  </label>
                  <p className="text-xs text-gray-400">
                    Enviar um pedido de teste para validar a configuração
                  </p>
                </div>
                <Button
                  onClick={handleTestWebhook}
                  disabled={testingWebhook || !config.integration_active}
                  variant="outline"
                  size="sm"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {testingWebhook ? 'Testando...' : 'Testar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'monitor' && (
        <WebhookMonitoringDashboard />
      )}

      {activeTab === 'diagnostics' && (
        <WebhookDiagnostics />
      )}

      {activeTab === 'troubleshooting' && (
        <WebhookTroubleshooting />
      )}

      {activeTab === 'logs' && (
        <>
          {/* Estatísticas */}
          <MaxIntegrationStats logs={logs} />

          {/* Logs de Integração */}
          <MaxIntegrationLogs logs={logs} />
        </>
      )}
    </div>
  )
}
