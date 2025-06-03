
import React, { Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LoadingFallback } from './LoadingFallback'
import { 
  LazyOptimizedAdminDashboard, 
  LazyGestorDashboard, 
  LazyClienteDashboard 
} from './LazyComponents'

interface DashboardProps {
  selectedManager?: string | null
  onManagerSelect?: (manager: string | null) => void
  activeTab?: string
}

export function Dashboard({ selectedManager, onManagerSelect, activeTab = 'dashboard' }: DashboardProps) {
  const { user, isAdmin, isGestor, isCliente } = useAuth()

  console.log('🚀 [Dashboard] ETAPA 3 ATIVA - Versões otimizadas com performance')
  console.log('👤 [Dashboard] User type:', { isAdmin, isGestor, isCliente })

  // ETAPA 3: Usando versão otimizada do Admin Dashboard
  if (isAdmin && selectedManager !== undefined && onManagerSelect && activeTab) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LazyOptimizedAdminDashboard 
          selectedManager={selectedManager}
          onManagerSelect={onManagerSelect}
          activeTab={activeTab}
        />
      </Suspense>
    )
  }

  if (isGestor) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LazyGestorDashboard activeTab={activeTab} />
      </Suspense>
    )
  }

  if (isCliente) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LazyClienteDashboard />
      </Suspense>
    )
  }

  return <LoadingFallback />
}

export default Dashboard
