
import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { GestoresManagement } from '../GestoresManagement'
import { LazyStatusFunnelDashboard, LazyDocumentationViewer, LazyAdminChatLayoutSplit } from '../LazyComponents'
import { LoadingFallback } from '../LoadingFallback'
import { ManagerSelector } from '../ManagerSelector'
import { AdminPaginatedTable } from './AdminPaginatedTable'

interface OptimizedAdminDashboardProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  activeTab: string
}

export function OptimizedAdminDashboard({ selectedManager, onManagerSelect, activeTab }: OptimizedAdminDashboardProps) {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)

  console.log('🔍 [OptimizedAdminDashboard] === ADMIN DASHBOARD OTIMIZADO ===')
  console.log('👤 [OptimizedAdminDashboard] Admin user email:', user?.email)
  console.log('🎯 [OptimizedAdminDashboard] Selected manager:', selectedManager)
  console.log('📑 [OptimizedAdminDashboard] Active tab:', activeTab)

  useEffect(() => {
    if (user && isAdmin) {
      setLoading(false)
    }
  }, [user, isAdmin])

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
            
            {/* Dashboard com métricas otimizadas */}
            <Suspense fallback={<LoadingFallback />}>
              <LazyStatusFunnelDashboard />
            </Suspense>
          </div>
        )

      case 'documentacao':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyDocumentationViewer />
          </Suspense>
        )

      case 'chat':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyAdminChatLayoutSplit />
          </Suspense>
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
            
            {/* Tabela otimizada com paginação */}
            <div className="w-full">
              <AdminPaginatedTable selectedManager={selectedManager} />
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
export default OptimizedAdminDashboard
