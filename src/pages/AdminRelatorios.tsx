
import { useAuth } from '@/hooks/useAuth'
import { useAdminMetaAds } from '@/hooks/useAdminMetaAds'
import { AdminRelatoriosHeader } from '@/components/AdminRelatorios/AdminRelatoriosHeader'
import { MetaAdsAdminForm } from '@/components/AdminRelatorios/MetaAdsAdminForm'
import { MetaAdsAdminReport } from '@/components/AdminRelatorios/MetaAdsAdminReport'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, CheckCircle } from 'lucide-react'

export function AdminRelatorios() {
  const { user, loading: authLoading } = useAuth()
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

  // Aguardar autenticação
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

  // Se não tem usuário, será redirecionado pelo Dashboard
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
          <p className="text-gray-300">Redirecionando...</p>
        </div>
      </div>
    )
  }

  const emailUsuario = user?.email || ''
  
  console.log('📊 [AdminRelatorios] === ACESSO SIMPLIFICADO ===')
  console.log('📊 [AdminRelatorios] Email:', emailUsuario)
  console.log('📊 [AdminRelatorios] Acesso direto para usuários @relatorios.com')

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminRelatoriosHeader />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-8 w-8 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Painel de Relatórios Meta Ads</h1>
            <p className="text-gray-400">Análise exclusiva para equipe de relatórios</p>
          </div>
        </div>

        {/* Confirmação de acesso */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <p className="text-green-400 text-sm">
              ✅ Acesso autorizado para: <strong>{emailUsuario}</strong> | Tipo: Relatórios
            </p>
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
