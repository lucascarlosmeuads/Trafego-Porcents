
import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ClientesTable } from './ClientesTable'
import { GestoresManagement } from './GestoresManagement'
import { AdminDashboardMetrics } from './AdminDashboard/AdminDashboardMetrics'
import { LazyStatusFunnelDashboard, LazyDocumentationViewer, LazyAdminChatLayoutSplit } from './LazyComponents'
import { LoadingFallback } from './LoadingFallback'
import { ManagerSelector } from './ManagerSelector'
import { useManagerData } from '@/hooks/useManagerData'

interface AdminDashboardProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  activeTab: string
}

export function AdminDashboard({ selectedManager, onManagerSelect, activeTab }: AdminDashboardProps) {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  
  // Buscar dados dos clientes baseado no gestor selecionado
  const { clientes: gestorClientes, loading: clientesLoading } = useManagerData(
    selectedManager === '__GESTORES__' ? '' : (selectedManager || '')
  )

  useEffect(() => {
    if (user && isAdmin) {
      setLoading(false)
    }
  }, [user, isAdmin])

  if (loading) {
    return (
      <div className="bg-admin-bg min-h-screen">
        <LoadingFallback />
      </div>
    )
  }

  const renderContent = () => {
    // Gerenciamento de gestores
    if (selectedManager === '__GESTORES__') {
      return (
        <div className="bg-admin-bg min-h-screen">
          <GestoresManagement />
        </div>
      )
    }
    
    // Navegação por abas
    switch (activeTab) {
      case 'dashboard':
        return (
          <AdminDashboardMetrics 
            clientes={gestorClientes} 
            selectedManager={selectedManager}
          />
        )

      case 'documentacao':
        return (
          <div className="bg-admin-bg min-h-screen">
            <Suspense fallback={<LoadingFallback />}>
              <LazyDocumentationViewer />
            </Suspense>
          </div>
        )

      case 'chat':
        return (
          <div className="bg-admin-bg min-h-screen">
            <Suspense fallback={<LoadingFallback />}>
              <LazyAdminChatLayoutSplit />
            </Suspense>
          </div>
        )
      
      case 'clientes':
      default:
        return (
          <div className="bg-admin-bg min-h-screen space-y-6">
            {/* Seletor de gestores apenas quando não estiver gerenciando gestores */}
            {selectedManager !== '__GESTORES__' && (
              <div className="p-6 pb-0">
                <div className="bg-admin-card border-admin-border rounded-xl p-6 shadow-sm">
                  <ManagerSelector 
                    selectedManager={selectedManager}
                    onManagerSelect={onManagerSelect}
                    isAdminContext={true}
                  />
                </div>
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
    <div className="w-full bg-admin-bg min-h-screen">
      {renderContent()}
    </div>
  )
}

// Add default export for lazy loading
export default AdminDashboard
