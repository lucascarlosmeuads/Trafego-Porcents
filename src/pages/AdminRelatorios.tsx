
import { useAuth } from '@/hooks/useAuth'
import { useAdminMetaAds } from '@/hooks/useAdminMetaAds'
import { AdminRelatoriosHeader } from '@/components/AdminRelatorios/AdminRelatoriosHeader'
import { MetaAdsAdminForm } from '@/components/AdminRelatorios/MetaAdsAdminForm'
import { MetaAdsAdminReport } from '@/components/AdminRelatorios/MetaAdsAdminReport'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export function AdminRelatorios() {
  const { user, loading: authLoading, isRelatorios } = useAuth()
  const navigate = useNavigate()
  const {
    config,
    reportData,
    loading,
    error,
    handleSaveConfig,
    handleTestConnection,
    handleClearConfig,
    handleLoadReport
  } = useAdminMetaAds()

  // Verificação de autenticação e permissão específica para relatórios
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
          <p className="text-gray-300">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!user || !isRelatorios) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Card className="bg-red-900/20 border-red-500/30 max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Acesso Restrito</h2>
            <p className="text-gray-300 mb-4">
              Este painel é exclusivo para analistas de relatórios (@relatorios.com).
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Voltar ao Sistema
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminRelatoriosHeader />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header com proteção específica para relatórios */}
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-8 w-8 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Painel de Relatórios Meta Ads</h1>
            <p className="text-gray-400">Análise exclusiva para equipe de relatórios</p>
          </div>
        </div>

        {/* Formulário de configuração */}
        <MetaAdsAdminForm
          config={config}
          loading={loading}
          error={error}
          onSaveConfig={handleSaveConfig}
          onTestConnection={handleTestConnection}
          onClearConfig={handleClearConfig}
          onLoadReport={handleLoadReport}
        />

        {/* Relatório de métricas */}
        {reportData && (
          <MetaAdsAdminReport 
            reportData={reportData}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}

export default AdminRelatorios
