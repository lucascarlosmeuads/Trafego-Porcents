
import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { 
  LazyAdminDashboard, 
  LazyGestorDashboard, 
  LazyClienteDashboard 
} from './LazyComponents'
import { LoadingFallback } from './LoadingFallback'
import { VendedorDashboard } from './VendedorDashboard'
import { SimpleVendedorDashboard } from './SimpleVendedorDashboard'
import { SitesDashboard } from './SitesDashboard'
import { ManagerSidebar } from './ManagerSidebar'

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
    return <LoadingFallback />
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
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LazyClienteDashboard />
      </Suspense>
    )
  }

  // Vendedor Dashboards (não lazy por enquanto para evitar erros)
  if (isVendedor) {
    console.log('✅ [Dashboard] Direcionando para VendedorDashboard')
    const isSimpleVendedor = user.email?.includes('simple') || false
    
    if (isSimpleVendedor) {
      console.log('🎯 [Dashboard] Usuário é vendedor simples')
      return <SimpleVendedorDashboard />
    }
    
    console.log('🎯 [Dashboard] Usuário é vendedor padrão')
    return <VendedorDashboard />
  }

  // Sites Dashboard (não lazy por enquanto)
  if (isSites) {
    console.log('✅ [Dashboard] Direcionando para SitesDashboard')
    return <SitesDashboard />
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
          <Suspense fallback={<LoadingFallback />}>
            {/* Admin Dashboard */}
            {isAdmin && (
              <LazyAdminDashboard
                selectedManager={selectedManager}
                onManagerSelect={setSelectedManager}
                activeTab={activeTab}
              />
            )}
            
            {/* Gestor Dashboard */}
            {isGestor && (
              <LazyGestorDashboard activeTab={activeTab} />
            )}
          </Suspense>
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
