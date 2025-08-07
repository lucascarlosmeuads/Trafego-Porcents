
import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ClientesTable } from './ClientesTable'
import { GestoresManagement } from './GestoresManagement'
import { AdminDashboardMetrics } from './AdminDashboard/AdminDashboardMetrics'
import { OptimizedAdminDashboardMetrics } from './AdminDashboard/OptimizedAdminDashboardMetrics'
import { LazyStatusFunnelDashboard, LazyDocumentationViewer, LazyAcervoIdeasDashboard } from './LazyComponents'
import { LoadingFallback } from './LoadingFallback'
import { ManagerSelector } from './ManagerSelector'
import { useManagerData } from '@/hooks/useManagerData'
import { SacDashboard } from './SAC/SacDashboard'
import { LazyRelatorioSacGestores } from './LazyComponents'
import { AdminSugestoes } from './AdminSugestoes'
import { SiteRequestsDashboard } from './SiteRequests/SiteRequestsDashboard'
import { MaxIntegrationDashboard } from './MaxIntegration/MaxIntegrationDashboard'
import { AdminMetaAdsConfig } from './AdminDashboard/AdminMetaAdsConfig'
import { AdminMetaAdsMetrics } from './AdminDashboard/AdminMetaAdsMetrics'
import { OpenAICustosDashboard } from './AdminDashboard/OpenAICustosDashboard'
import GeradorCriativosDashboardNew from './GeradorCriativos/GeradorCriativosDashboardNew'
import { IdeiasDashboard } from './AcervoIdeias/IdeiasDashboard'
import { LeadsParcerriaPanel } from './LeadsParceria/LeadsParcerriaPanel'
import { ErrorBoundary } from './ErrorBoundary'
import { CreateParceiraUser } from './CreateParceiraUser'

interface AdminDashboardProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AdminDashboard({ selectedManager, onManagerSelect, activeTab, onTabChange }: AdminDashboardProps) {
  // CORREÇÃO: Todos os hooks devem ser chamados PRIMEIRO, sem condições
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  
  // Buscar dados dos clientes - sempre chamar o hook
  const { clientes: gestorClientes, loading: clientesLoading } = useManagerData(
    user?.email || 'fallback@example.com', 
    true, 
    selectedManager === '__GESTORES__' ? '' : selectedManager
  )

  useEffect(() => {
    if (user && isAdmin) {
      setLoading(false)
    }
  }, [user, isAdmin])

  console.log('🔍 [AdminDashboard] === DEBUG ADMIN DASHBOARD ===')
  console.log('👤 [AdminDashboard] Admin user email:', user?.email)
  console.log('🎯 [AdminDashboard] Selected manager:', selectedManager)
  console.log('📊 [AdminDashboard] Clientes encontrados:', gestorClientes.length)
  console.log('⏳ [AdminDashboard] Loading clientes:', clientesLoading)

  // Renderizar loading apenas se user/isAdmin ainda não estiverem carregados
  if (loading || !user || !isAdmin) {
    return <LoadingFallback />
  }

  const renderContent = () => {
    // Gerenciamento de gestores
    if (selectedManager === '__GESTORES__') {
      return <GestoresManagement />
    }
    
    // Navegação por abas
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Seletor de gestores */}
            <div className="bg-card border rounded-lg p-4">
              <ManagerSelector 
                selectedManager={selectedManager}
                onManagerSelect={onManagerSelect}
                isAdminContext={true}
              />
            </div>


            {/* Configuração Meta Ads Global */}
            <AdminMetaAdsConfig />

            {/* Métricas Meta Ads */}
            <AdminMetaAdsMetrics />
            
            {/* Métricas do Admin */}
            <AdminDashboardMetrics 
              clientes={gestorClientes} 
              selectedManager={selectedManager}
            />
          </div>
        )

      case 'max-integration':
        return <MaxIntegrationDashboard />

      case 'solicitacoes-site':
        return <SiteRequestsDashboard />

      case 'sac':
        return <SacDashboard />

      case 'sac-relatorio':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyRelatorioSacGestores />
          </Suspense>
        )

      case 'documentacao':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyDocumentationViewer />
          </Suspense>
        )

      case 'sugestoes':
        return (
          <div className="w-full">
            <AdminSugestoes />
          </div>
        )
      
      case 'openai-custos':
        return <OpenAICustosDashboard />
      
      case 'gerador-criativos':
        return <GeradorCriativosDashboardNew />
      
      case 'acervo-ideias':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Acervo de Ideias</h1>
                  <p className="text-muted-foreground">
                    Análise inteligente de briefings convertidos em oportunidades de negócio
                  </p>
                </div>
              </div>
              <LazyAcervoIdeasDashboard />
            </div>
          </Suspense>
        )

      case 'leads-parceria':
        return <LeadsParcerriaPanel />
      
      case 'criar-usuario-parceria':
        return <CreateParceiraUser />
      
      case 'clientes':
      default:
        return (
          <div className="space-y-4 w-full">
            {/* Seletor de gestores apenas quando não estiver gerenciando gestores */}
            {selectedManager !== '__GESTORES__' && (
              <div className="bg-card border rounded-lg p-4">
                <ManagerSelector 
                  selectedManager={selectedManager}
                  onManagerSelect={onManagerSelect}
                  isAdminContext={true}
                />
              </div>
            )}
            
            {/* Admin panel: Pass selectedManager directly for proper filtering */}
            <div className="w-full">
              <ClientesTable selectedManager={selectedManager} />
            </div>
          </div>
        )
    }
  }

  return (
    <ErrorBoundary>
      <div className="w-full">
        {renderContent()}
      </div>
    </ErrorBoundary>
  )
}

// Add default export for lazy loading
export default AdminDashboard
