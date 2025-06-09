
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { LogOut, Settings, BarChart3, TrendingUp, Eye, AlertCircle } from 'lucide-react'

export function MetaAdsDashboard() {
  const { user, signOut, currentManagerName } = useAuth()
  const [isConfiguring, setIsConfiguring] = useState(false)
  
  // Estados para configuração do Meta Ads
  const [config, setConfig] = useState({
    appId: '',
    appSecret: '',
    accessToken: '',
    adAccountId: ''
  })

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📊 [MetaAdsDashboard] Configuração enviada:', config)
    // TODO: Implementar salvamento da configuração
    setIsConfiguring(false)
  }

  const handleTestConnection = () => {
    console.log('🔗 [MetaAdsDashboard] Testando conexão com Meta Ads...')
    // TODO: Implementar teste de conexão
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Meta Ads Analytics</h1>
              <p className="text-sm text-gray-400">Painel de Relatórios e Métricas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Bem-vindo,</p>
              <p className="font-medium text-white">{currentManagerName}</p>
              <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">
                {user?.email}
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {!isConfiguring ? (
          <>
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Status da Configuração
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <span className="text-yellow-500 font-medium">Não Configurado</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Configure suas credenciais do Meta Ads
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Campanhas Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">--</div>
                  <p className="text-xs text-gray-500">Configure primeiro o Meta Ads</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Últimos Dados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">--</div>
                  <p className="text-xs text-gray-500">Nenhum dado disponível</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Configuração do Meta Ads</CardTitle>
                  <p className="text-gray-400 text-sm">
                    Configure suas credenciais para conectar com a API do Facebook/Meta
                  </p>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setIsConfiguring(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar Meta Ads
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Relatórios e Dados</CardTitle>
                  <p className="text-gray-400 text-sm">
                    Visualize métricas, campanhas e performance dos anúncios
                  </p>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    disabled
                    className="border-gray-600 text-gray-500"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver Relatórios (Configure primeiro)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          /* Configuração Form */
          <Card className="bg-gray-900 border-gray-800 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white">Configurar Meta Ads API</CardTitle>
              <p className="text-gray-400 text-sm">
                Insira suas credenciais do Facebook Developers para conectar com a API
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConfigSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="appId" className="text-gray-300">App ID</Label>
                  <Input
                    id="appId"
                    type="text"
                    value={config.appId}
                    onChange={(e) => setConfig(prev => ({ ...prev, appId: e.target.value }))}
                    placeholder="Seu App ID do Facebook"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="appSecret" className="text-gray-300">App Secret</Label>
                  <Input
                    id="appSecret"
                    type="password"
                    value={config.appSecret}
                    onChange={(e) => setConfig(prev => ({ ...prev, appSecret: e.target.value }))}
                    placeholder="Seu App Secret"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="accessToken" className="text-gray-300">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    value={config.accessToken}
                    onChange={(e) => setConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                    placeholder="Seu Access Token"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="adAccountId" className="text-gray-300">Ad Account ID</Label>
                  <Input
                    id="adAccountId"
                    type="text"
                    value={config.adAccountId}
                    onChange={(e) => setConfig(prev => ({ ...prev, adAccountId: e.target.value }))}
                    placeholder="act_1234567890"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formato: act_XXXXXXXXXX (inclua o prefixo 'act_')
                  </p>
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Testar Conexão
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Salvar Configuração
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsConfiguring(false)}
                    className="text-gray-400 hover:bg-gray-800"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
