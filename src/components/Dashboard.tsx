import React, { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ManagerSidebar } from './ManagerSidebar'
import { LoadingFallback } from './LoadingFallback'
import { 
  LazyUltraOptimizedAdminDashboard,
  LazyGestorDashboard, 
  LazyClienteDashboard, 
  LazyVendedorDashboard,
  LazyChatLayoutSplit,
  LazyStatusFunnelDashboard,
  LazySimpleVendedorDashboard,
  LazySitesDashboard
} from './LazyUltraOptimizedComponents'

export function Dashboard() {
  const { user, isAdmin, isGestor, isCliente, isVendedor, isSites, loading } = useAuth()
  const [selectedManager, setSelectedManager] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('clientes')

  console.log('🚀 [Dashboard] === ETAPA 4: REACT QUERY ULTRA-OTIMIZADO ATIVO ===')
  console.log('⚡ [Dashboard] Cache inteligente + Optimistic updates + Prefetch')
  console.log('👤 [Dashboard] User type detection:', { isAdmin, isGestor, isCliente, isVendedor, isSites })
  console.log('📊 [Dashboard] Selected manager:', selectedManager)
  console.log('📑 [Dashboard] Active tab:', activeTab)

  useEffect(() => {
    if (isAdmin) {
      console.log('👑 [Dashboard] Admin logado - usando UltraOptimizedAdminDashboard')
    } else if (isGestor) {
      console.log('👤 [Dashboard] Gestor logado - usando LazyGestorDashboard')
    } else if (isCliente) {
      console.log('🎯 [Dashboard] Cliente logado - usando LazyClienteDashboard')
    } else if (isVendedor) {
      console.log('💼 [Dashboard] Vendedor logado - usando LazyVendedorDashboard')
    } else if (isSites) {
      console.log('🌐 [Dashboard] Sites user logado - usando LazySitesDashboard')
    }
  }, [isAdmin, isGestor, isCliente, isVendedor, isSites])

  if (loading) {
    return <LoadingFallback />
  }

  const handleManagerSelect = (manager: string | null) => {
    console.log('🎯 [Dashboard] Manager selecionado (ETAPA 4):', manager)
    setSelectedManager(manager)
  }

  if (isAdmin) {
    return (
      <div className="flex h-screen bg-background">
        <ManagerSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          selectedManager={selectedManager}
          onManagerSelect={handleManagerSelect}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Suspense fallback={<LoadingFallback />}>
              <LazyUltraOptimizedAdminDashboard 
                selectedManager={selectedManager}
                onManagerSelect={handleManagerSelect}
                activeTab={activeTab}
              />
            </Suspense>
          </div>
        </main>
      </div>
    )
  }

  if (isVendedor) {
    return (
      <div className="flex h-screen bg-background">
        <ManagerSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          selectedManager={selectedManager}
          onManagerSelect={handleManagerSelect}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Suspense fallback={<LoadingFallback />}>
              <LazyVendedorDashboard />
            </Suspense>
          </div>
        </main>
      </div>
    )
  }

  if (isSites) {
    return (
      <div className="flex h-screen bg-background">
        <ManagerSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          selectedManager={selectedManager}
          onManagerSelect={handleManagerSelect}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Suspense fallback={<LoadingFallback />}>
              <LazySitesDashboard />
            </Suspense>
          </div>
        </main>
      </div>
    )
  }
  
  if (isGestor) {
    return (
      <div className="flex h-screen bg-background">
        <ManagerSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          selectedManager={selectedManager}
          onManagerSelect={handleManagerSelect}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Suspense fallback={<LoadingFallback />}>
              <LazyGestorDashboard />
            </Suspense>
          </div>
        </main>
      </div>
    )
  }

  if (isCliente) {
    return (
      <div className="min-h-screen bg-background">
        <Suspense fallback={<LoadingFallback />}>
          <LazyClienteDashboard />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Tipo de usuário não reconhecido</h1>
        <p className="text-muted-foreground">Por favor, entre em contato com o suporte.</p>
      </div>
    </div>
  )
}
