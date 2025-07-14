
import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useOptimizedComponents } from '@/hooks/useOptimizedComponents'
import { ClientesTable } from './ClientesTable'
import { GestoresManagement } from './GestoresManagement'
import { AdminDashboardMetrics } from './AdminDashboard/AdminDashboardMetrics'
import { OptimizedAdminDashboardMetrics } from './AdminDashboard/OptimizedAdminDashboardMetrics'
import { LazyStatusFunnelDashboard, LazyDocumentationViewer } from './LazyComponents'
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

interface AdminDashboardProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  activeTab: string
}

export function AdminDashboard({ selectedManager, onManagerSelect, activeTab }: AdminDashboardProps) {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  
  // TODOS os hooks devem ser chamados sempre, sem condições
  const { useOptimized } = useOptimizedComponents()
  
  // CORREÇÃO: Buscar dados dos clientes baseado no gestor selecionado
  // Para admin, passar o email do usuário, isAdminUser=true, e selectedManager
  const { clientes: gestorClientes, loading: clientesLoading } = useManagerData(
    user?.email || '', // userEmail: email do admin atual
    true, // isAdminUser: true para admin
    selectedManager === '__GESTORES__' ? '' : selectedManager, // selectedManager: email do gestor ou null/vazio para todos
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
  console.log('⚡ [AdminDashboard] Usando componentes otimizados:', useOptimized)

  // Renderizar loading APÓS todos os hooks serem chamados
  if (loading) {
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
            
            {/* Métricas do Admin - Usar versão otimizada quando disponível */}
            {useOptimized ? (
              <OptimizedAdminDashboardMetrics 
                clientes={gestorClientes} 
                selectedManager={selectedManager}
              />
            ) : (
              <AdminDashboardMetrics 
                clientes={gestorClientes} 
                selectedManager={selectedManager}
              />
            )}
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
    <div className="w-full">
      {renderContent()}
    </div>
  )
}

// Add default export for lazy loading
export default AdminDashboard
