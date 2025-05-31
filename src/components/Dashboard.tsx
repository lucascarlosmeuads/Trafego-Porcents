
import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ManagerSidebar } from './ManagerSidebar'
import { LoadingFallback } from './LoadingFallback'
import * as LazyComponents from './LazyComponents'

export function Dashboard() {
  const { 
    user, 
    loading, 
    isAdmin, 
    isGestor,
    isCliente,
    isVendedor,
    isSites
  } = useAuth()

  const [selectedManager, setSelectedManager] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')

  console.log('🔍 [Dashboard] === DEBUGGING ROTEAMENTO DE DASHBOARD ===')
  console.log('🔍 [Dashboard] Estado de autenticação:', {
    userEmail: user?.email,
    loading,
    isAdmin,
    isGestor,
    isCliente,
    isVendedor,
    isSites
  })

  // Reset tab when user type changes
  useEffect(() => {
    setActiveTab('dashboard')
    setSelectedManager(null)
  }, [isAdmin, isGestor, isCliente, isVendedor, isSites])

  if (loading) {
    console.log('⏳ [Dashboard] Mostrando loading geral')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingFallback message="Carregando..." size="lg" />
      </div>
    )
  }

  if (!user) {
    console.log('❌ [Dashboard] Usuário não autenticado')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Usuário não autenticado</div>
      </div>
    )
  }

  // Cliente Dashboard
  if (isCliente) {
    console.log('✅ [Dashboard] Direcionando para ClienteDashboard')
    console.log('🎯 [Dashboard] Usuário identificado como CLIENTE:', user.email)
    return (
      <Suspense fallback={<LoadingFallback message="Carregando painel do cliente..." size="lg" />}>
        <LazyComponents.ClienteDashboard />
      </Suspense>
    )
  }

  // Vendedor Dashboards
  if (isVendedor) {
    console.log('✅ [Dashboard] Direcionando para VendedorDashboard')
    const isSimpleVendedor = user.email?.includes('simple') || false
    
    if (isSimpleVendedor) {
      console.log('🎯 [Dashboard] Usuário é vendedor simples')
      return (
        <Suspense fallback={<LoadingFallback message="Carregando painel do vendedor..." size="lg" />}>
          <LazyComponents.SimpleVendedorDashboard />
        </Suspense>
      )
    }
    
    console.log('🎯 [Dashboard] Usuário é vendedor padrão')
    return (
      <Suspense fallback={<LoadingFallback message="Carregando painel do vendedor..." size="lg" />}>
        <LazyComponents.VendedorDashboard />
      </Suspense>
    )
  }

  // Sites Dashboard
  if (isSites) {
    console.log('✅ [Dashboard] Direcionando para SitesDashboard')
    return (
      <Suspense fallback={<LoadingFallback message="Carregando painel de sites..." size="lg" />}>
        <LazyComponents.SitesDashboard />
      </Suspense>
    )
  }

  // Admin/Gestor Dashboards
  if (isAdmin || isGestor) {
    console.log('✅ [Dashboard] Direcionando para Admin/Gestor Dashboard')
    return (
      <div className="min-h-screen flex w-full">
        <ManagerSidebar
          selectedManager={selectedManager}
          onManagerSelect={setSelectedManager}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <div className="flex-1 p-6 overflow-auto">
          {/* Admin Dashboard */}
          {isAdmin && (
            <Suspense fallback={<LoadingFallback message="Carregando painel admin..." />}>
              <LazyComponents.AdminDashboard
                selectedManager={selectedManager}
                onManagerSelect={setSelectedManager}
                activeTab={activeTab}
              />
            </Suspense>
          )}
          
          {/* Gestor Dashboard */}
          {isGestor && (
            <Suspense fallback={<LoadingFallback message="Carregando painel do gestor..." />}>
              <LazyComponents.GestorDashboard activeTab={activeTab} />
            </Suspense>
          )}
        </div>
      </div>
    )
  }

  console.log('❌ [Dashboard] Tipo de usuário não autorizado')
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg text-red-600">
        Tipo de usuário não autorizado
      </div>
    </div>
  )
}
