
import React, { useState, useEffect, Suspense, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ManagerSelector } from './ManagerSelector'
import { useManagerData } from '@/hooks/useManagerData'
import { LoadingFallback, MetricsLoadingFallback, TableLoadingFallback } from './LoadingFallback'
import { 
  LazyAdminDashboardMetrics, 
  LazyClientesTable, 
  LazyGestoresManagement,
  LazyStatusFunnelDashboard, 
  LazyDocumentationViewer, 
  LazyAdminChatLayoutSplit 
} from './LazyComponents'

interface AdminDashboardProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  activeTab: string
}

// MEMOIZAÇÃO: Memoizar componentes que não mudam frequentemente
const MemoizedManagerSelector = React.memo(ManagerSelector)

export function AdminDashboard({ selectedManager, onManagerSelect, activeTab }: AdminDashboardProps) {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  
  // CORREÇÃO: Buscar dados dos clientes baseado no gestor selecionado
  // Para admin, passar o email do usuário, isAdminUser=true, e selectedManager
  const { clientes: gestorClientes, loading: clientesLoading } = useManagerData(
    user?.email || '', // userEmail: email do admin atual
    true, // isAdminUser: true para admin
    selectedManager === '__GESTORES__' ? '' : selectedManager, // selectedManager: email do gestor ou null/vazio para todos
  )

  console.log('🔍 [AdminDashboard] === DEBUG ADMIN DASHBOARD ===')
  console.log('👤 [AdminDashboard] Admin user email:', user?.email)
  console.log('🎯 [AdminDashboard] Selected manager:', selectedManager)
  console.log('📊 [AdminDashboard] Clientes encontrados:', gestorClientes.length)
  console.log('⏳ [AdminDashboard] Loading clientes:', clientesLoading)

  useEffect(() => {
    if (user && isAdmin) {
      setLoading(false)
    }
  }, [user, isAdmin])

  // MEMOIZAÇÃO: Memoizar props que são passadas para componentes filhos
  const managerSelectorProps = useMemo(() => ({
    selectedManager,
    onManagerSelect,
    isAdminContext: true
  }), [selectedManager, onManagerSelect])

  const adminDashboardMetricsProps = useMemo(() => ({
    clientes: gestorClientes,
    selectedManager
  }), [gestorClientes, selectedManager])

  if (loading) {
    return <LoadingFallback />
  }

  const renderContent = () => {
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
              <MemoizedManagerSelector {...managerSelectorProps} />
            </div>
            
            {/* Métricas do Admin - LAZY LOADING */}
            <Suspense fallback={<MetricsLoadingFallback />}>
              <LazyAdminDashboardMetrics {...adminDashboardMetricsProps} />
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
                <MemoizedManagerSelector {...managerSelectorProps} />
              </div>
            )}
            
            {/* Admin panel: Pass selectedManager directly for proper filtering - LAZY LOADING */}
            <div className="w-full">
              <Suspense fallback={<TableLoadingFallback />}>
                <LazyClientesTable selectedManager={selectedManager} />
              </Suspense>
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
