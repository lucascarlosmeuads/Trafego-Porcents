import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useMetaAdsConfig } from '@/hooks/useMetaAdsConfig'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  LogOut, 
  Settings, 
  BarChart3, 
  TrendingUp, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  RefreshCw 
} from 'lucide-react'

export function MetaAdsDashboard() {
  const { user, signOut, currentManagerName } = useAuth()
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
    isConfigured 
  } = useMetaAdsConfig()
  
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [testing, setTesting] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📊 [MetaAdsDashboard] Salvando configuração:', config)
    
    const result = await saveConfig(config)
    
    if (result.success) {
      toast.success('Configuração salva com sucesso!')
      setIsConfiguring(false)
    } else {
      toast.error(result.error || 'Erro ao salvar configuração')
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    console.log('🔗 [MetaAdsDashboard] Testando conexão real...')
    
    const result = await testConnection()
    
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
    
    setTesting(false)
  }

  const handleLoadData = async () => {
    setLoadingData(true)
    console.log('📊 [MetaAdsDashboard] Carregando dados do Meta Ads...')
    
    // Buscar campanhas e insights em paralelo
    const [campaignsResult, insightsResult] = await Promise.all([
      fetchCampaigns(),
      fetchInsights()
    ])
    
    if (campaignsResult.success && insightsResult.success) {
      toast.success('Dados carregados com sucesso!')
    } else {
      toast.error('Erro ao carregar alguns dados')
    }
    
    setLoadingData(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando configurações...
        </div>
      </div>
    )
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
                    {isConfigured ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-green-500 font-medium">Configurado</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <span className="text-yellow-500 font-medium">Não Configurado</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isConfigured ? 'Credenciais do Meta Ads configuradas' : 'Configure suas credenciais do Meta Ads'}
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
                  <div className="text-2xl font-bold text-white">
                    {campaigns.length > 0 ? campaigns.filter(c => c.status === 'ACTIVE').length : '--'}
                  </div>
                  <p className="text-xs text-gray-500">
                    {isConfigured ? `${campaigns.length} campanhas no total` : 'Configure primeiro o Meta Ads'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Gastos (7 dias)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {insights.length > 0 ? `$${insights[0]?.spend || '0'}` : '--'}
                  </div>
                  <p className="text-xs text-gray-500">
                    {isConfigured ? 'Últimos 7 dias' : 'Nenhum dado disponível'}
                  </p>
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
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setIsConfiguring(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {isConfigured ? 'Editar' : 'Configurar'} Meta Ads
                    </Button>
                    
                    {isConfigured && (
                      <Button 
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={testing}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        {testing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Testar Conexão
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Dados e Relatórios</CardTitle>
                  <p className="text-gray-400 text-sm">
                    Carregue e visualize dados reais das suas campanhas do Meta Ads
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleLoadData}
                      disabled={!isConfigured || loadingData}
                      className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                    >
                      {loadingData ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      {loadingData ? 'Carregando...' : 'Carregar Dados'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      disabled={!isConfigured || campaigns.length === 0}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Ver Relatórios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Tables */}
            {campaigns.length > 0 && (
              <div className="mt-8">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Campanhas Ativas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-2 text-gray-400">Nome</th>
                            <th className="text-left py-2 text-gray-400">Status</th>
                            <th className="text-left py-2 text-gray-400">Objetivo</th>
                            <th className="text-left py-2 text-gray-400">Criada em</th>
                          </tr>
                        </thead>
                        <tbody>
                          {campaigns.map((campaign) => (
                            <tr key={campaign.id} className="border-b border-gray-800">
                              <td className="py-2 text-white">{campaign.name}</td>
                              <td className="py-2">
                                <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                  {campaign.status}
                                </Badge>
                              </td>
                              <td className="py-2 text-gray-300">{campaign.objective}</td>
                              <td className="py-2 text-gray-300">
                                {new Date(campaign.created_time).toLocaleDateString('pt-BR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
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
                    required
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
                    required
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
                    required
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
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formato: act_XXXXXXXXXX (inclua o prefixo 'act_')
                  </p>
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
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
