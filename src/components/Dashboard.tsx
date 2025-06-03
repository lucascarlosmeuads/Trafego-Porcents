
import React, { Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LoadingFallback } from './LoadingFallback'
import { 
  LazyAdminDashboard, 
  LazyGestorDashboard, 
  LazyClienteDashboard 
} from './LazyComponents'

interface DashboardProps {
  selectedManager?: string | null
  onManagerSelect?: (manager: string | null) => void
  activeTab?: string
}

export function Dashboard({ selectedManager, onManagerSelect, activeTab }: DashboardProps) {
  const { user, isAdmin, isGestor, isCliente } = useAuth()

  console.log('🚀 [Dashboard] Lazy loading baseado no tipo de usuário')
  console.log('👤 [Dashboard] User type:', { isAdmin, isGestor, isCliente })

  // CODE SPLITTING: Carregamos apenas o dashboard necessário para o tipo de usuário
  if (isAdmin && selectedManager !== undefined && onManagerSelect && activeTab) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LazyAdminDashboard 
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
        <LazyGestorDashboard />
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
