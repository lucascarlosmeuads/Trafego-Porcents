
import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ManagerSelector } from '../ManagerSelector'
import { useOptimizedManagerData } from '@/hooks/useOptimizedManagerData'
import { LoadingFallback, MetricsLoadingFallback, TableLoadingFallback } from '../LoadingFallback'
import { OptimizedAdminDashboardMetrics } from './OptimizedAdminDashboardMetrics'
import { 
  LazyClientesTable, 
  LazyGestoresManagement,
  LazyStatusFunnelDashboard, 
  LazyDocumentationViewer, 
  LazyAdminChatLayoutSplit 
} from '../LazyComponents'

interface OptimizedAdminDashboardProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  activeTab: string
}

// MEMOIZAÇÃO: Seletor de gestores otimizado
const OptimizedManagerSelector = React.memo(function OptimizedManagerSelector({
  selectedManager,
  onManagerSelect,
  isAdminContext
}: {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  isAdminContext: boolean
}) {
  console.log('👤 [OptimizedManagerSelector] Renderização memoizada')
  
  return (
    <ManagerSelector
      selectedManager={selectedManager}
      onManagerSelect={onManagerSelect}
      isAdminContext={isAdminContext}
    />
  )
})

export const OptimizedAdminDashboard = React.memo(function OptimizedAdminDashboard({ 
  selectedManager, 
  onManagerSelect, 
  activeTab 
}: OptimizedAdminDashboardProps) {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  
  console.log('🚀 [OptimizedAdminDashboard] === ADMIN DASHBOARD OTIMIZADO ===')
  console.log('👤 [OptimizedAdminDashboard] Admin user email:', user?.email)
  console.log('🎯 [OptimizedAdminDashboard] Selected manager:', selectedManager)
  console.log('📑 [OptimizedAdminDashboard] Active tab:', activeTab)

  // HOOK OTIMIZADO: Dados do gestor com métricas pré-calculadas
  const {
    clientes,
    loading: clientesLoading,
    metrics,
    filteredClientes,
    refetch,
    updateCliente,
    addCliente
  } = useOptimizedManagerData({
    userEmail: user?.email || '',
    isAdminUser: true,
    selectedManager: selectedManager === '__GESTORES__' ? '' : selectedManager || undefined
  })

  console.log('📊 [OptimizedAdminDashboard] Dados otimizados carregados:', {
    clientesCount: clientes.length,
    metricsCalculated: !!metrics,
    loading: clientesLoading
  })

  useEffect(() => {
    if (user && isAdmin) {
      setLoading(false)
    }
  }, [user, isAdmin])

  // MEMOIZAÇÃO: Props do seletor de gestores
  const managerSelectorProps = useMemo(() => ({
    selectedManager,
    onManagerSelect,
    isAdminContext: true
  }), [selectedManager, onManagerSelect])

  // CALLBACK OTIMIZADO: Renderização de conteúdo
  const renderContent = useCallback(() => {
    console.log('🎯 [OptimizedAdminDashboard] Renderizando conteúdo para tab:', activeTab)
    
    // Gerenciamento de gestores
    if (selectedManager === '__GESTORES__') {
      return (
        <Suspense fallback={<TableLoadingFallback />}>
          <LazyGestoresManagement />
        </Suspense>
      )
    }
    
    // Navegação por abas
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Seletor de gestores */}
            <div className="bg-card border rounded-lg p-4">
              <OptimizedManagerSelector {...managerSelectorProps} />
            </div>
            
            {/* Métricas Otimizadas - LAZY LOADING */}
            <Suspense fallback={<MetricsLoadingFallback />}>
              <OptimizedAdminDashboardMetrics 
                metrics={metrics}
                selectedManager={selectedManager}
              />
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
                <OptimizedManagerSelector {...managerSelectorProps} />
              </div>
            )}
            
            {/* Tabela de clientes - LAZY LOADING */}
            <div className="w-full">
              <Suspense fallback={<TableLoadingFallback />}>
                <LazyClientesTable selectedManager={selectedManager} />
              </Suspense>
            </div>
          </div>
        )
    }
  }, [activeTab, selectedManager, managerSelectorProps, metrics])

  if (loading) {
    return <LoadingFallback />
  }

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  )
})

// Export default para lazy loading
export default OptimizedAdminDashboard
