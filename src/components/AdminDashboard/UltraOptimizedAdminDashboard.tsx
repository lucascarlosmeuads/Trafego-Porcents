
import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ManagerSelector } from '../ManagerSelector'
import { useUltraOptimizedManagerData } from '@/hooks/useUltraOptimizedManagerData'
import { useOptimizedPrefetch } from '@/hooks/useOptimizedReactQuery'
import { LoadingFallback, MetricsLoadingFallback, TableLoadingFallback } from '../LoadingFallback'
import { OptimizedAdminDashboardMetrics } from './OptimizedAdminDashboardMetrics'
import { 
  LazyClientesTable, 
  LazyGestoresManagement,
  LazyStatusFunnelDashboard, 
  LazyDocumentationViewer, 
  LazyAdminChatLayoutSplit 
} from '../LazyComponents'

interface UltraOptimizedAdminDashboardProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  activeTab: string
}

// MEMOIZAÇÃO: Seletor com prefetch inteligente
const PrefetchedManagerSelector = React.memo(function PrefetchedManagerSelector({
  selectedManager,
  onManagerSelect,
  isAdminContext,
  prefetchClientesForManager,
  userEmail
}: {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  isAdminContext: boolean
  prefetchClientesForManager: (userEmail: string, selectedManager?: string) => Promise<void>
  userEmail: string
}) {
  console.log('🚀 [PrefetchedManagerSelector] Seletor com prefetch ativo')
  
  const handleManagerChange = useCallback((manager: string | null) => {
    console.log('🎯 [PrefetchedManagerSelector] Mudança de gestor + prefetch:', manager)
    
    // Prefetch dos dados do novo gestor ANTES de mudar
    if (manager && manager !== '__GESTORES__') {
      prefetchClientesForManager(userEmail, manager)
    }
    
    onManagerSelect(manager)
  }, [onManagerSelect, prefetchClientesForManager, userEmail])
  
  return (
    <ManagerSelector
      selectedManager={selectedManager}
      onManagerSelect={handleManagerChange}
      isAdminContext={isAdminContext}
    />
  )
})

export const UltraOptimizedAdminDashboard = React.memo(function UltraOptimizedAdminDashboard({ 
  selectedManager, 
  onManagerSelect, 
  activeTab 
}: UltraOptimizedAdminDashboardProps) {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  
  console.log('🚀 [UltraOptimizedAdminDashboard] === ETAPA 4: REACT QUERY ULTRA-OTIMIZADO ===')
  console.log('⚡ [UltraOptimizedAdminDashboard] Cache inteligente + Optimistic updates + Prefetch')
  console.log('👤 [UltraOptimizedAdminDashboard] Admin user email:', user?.email)
  console.log('🎯 [UltraOptimizedAdminDashboard] Selected manager:', selectedManager)
  console.log('📑 [UltraOptimizedAdminDashboard] Active tab:', activeTab)

  // HOOK ULTRA-OTIMIZADO: React Query com cache inteligente
  const {
    clientes,
    loading: clientesLoading,
    metrics,
    filteredClientes,
    refetch,
    updateCliente,
    addCliente,
    isFetching,
    isStale,
    isUpdating,
    isAdding
  } = useUltraOptimizedManagerData({
    userEmail: user?.email || '',
    isAdminUser: true,
    selectedManager: selectedManager === '__GESTORES__' ? '' : selectedManager || undefined
  })

  // HOOK: Prefetch estratégico
  const { prefetchClientesForManager } = useOptimizedPrefetch()

  console.log('📊 [UltraOptimizedAdminDashboard] React Query Status:', {
    clientesCount: clientes.length,
    loading: clientesLoading,
    fetching: isFetching,
    stale: isStale,
    updating: isUpdating,
    adding: isAdding,
    cacheHit: !clientesLoading && !isFetching ? 'CACHE HIT' : 'FETCHING'
  })

  useEffect(() => {
    if (user && isAdmin) {
      setLoading(false)
    }
  }, [user, isAdmin])

  // MEMOIZAÇÃO: Props do seletor com prefetch
  const managerSelectorProps = useMemo(() => ({
    selectedManager,
    onManagerSelect,
    isAdminContext: true,
    prefetchClientesForManager,
    userEmail: user?.email || ''
  }), [selectedManager, onManagerSelect, prefetchClientesForManager, user?.email])

  // CALLBACK OTIMIZADO: Renderização com cache awareness
  const renderContent = useCallback(() => {
    console.log('🎯 [UltraOptimizedAdminDashboard] Renderizando conteúdo para tab:', activeTab)
    console.log('📊 [UltraOptimizedAdminDashboard] Cache status:', {
      isStale: isStale ? 'STALE' : 'FRESH',
      isFetching: isFetching ? 'FETCHING' : 'IDLE'
    })
    
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
            {/* Seletor de gestores com prefetch */}
            <div className="bg-card border rounded-lg p-4">
              <PrefetchedManagerSelector {...managerSelectorProps} />
            </div>
            
            {/* Status do Cache React Query */}
            {(isFetching || isStale) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  📡 {isFetching ? 'Sincronizando dados...' : 'Dados em cache (podem estar desatualizados)'}
                  {isUpdating && ' | ⚡ Atualizando cliente...'}
                  {isAdding && ' | ➕ Adicionando cliente...'}
                </p>
              </div>
            )}
            
            {/* Métricas Otimizadas - React Query Cache */}
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
            {/* Seletor de gestores com prefetch */}
            {selectedManager !== '__GESTORES__' && (
              <div className="bg-card border rounded-lg p-4">
                <PrefetchedManagerSelector {...managerSelectorProps} />
              </div>
            )}
            
            {/* Status do Cache para tabela */}
            {(isFetching || isStale) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  📡 Tabela: {isFetching ? 'Carregando dados atualizados...' : 'Exibindo dados em cache'}
                </p>
              </div>
            )}
            
            {/* Tabela de clientes - React Query Cache */}
            <div className="w-full">
              <Suspense fallback={<TableLoadingFallback />}>
                <LazyClientesTable selectedManager={selectedManager} />
              </Suspense>
            </div>
          </div>
        )
    }
  }, [activeTab, selectedManager, managerSelectorProps, metrics, isFetching, isStale, isUpdating, isAdding])

  if (loading) {
    return <LoadingFallback />
  }

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  )
})

export default UltraOptimizedAdminDashboard
