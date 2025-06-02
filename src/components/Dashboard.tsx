
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
    userEmailRaw: user?.email ? `"${user.email}"` : 'null',
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

  // Debug: Mostrar qual é o email exato que está sendo processado
  console.log('🎯 [Dashboard] Email do usuário para verificação:', `"${user.email}"`)
  console.log('🎯 [Dashboard] Tipos de usuário detectados:', {
    isAdmin: isAdmin ? '✅' : '❌',
    isGestor: isGestor ? '✅' : '❌', 
    isCliente: isCliente ? '✅' : '❌',
    isVendedor: isVendedor ? '✅' : '❌',
    isSites: isSites ? '✅' : '❌'
  })

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
      <div className="min-h-screen flex w-full bg-background">
        <ManagerSidebar
          selectedManager={selectedManager}
          onManagerSelect={setSelectedManager}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <div className="flex-1 overflow-auto min-h-screen">
          <div className="p-6 w-full max-w-full">
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
      </div>
    )
  }

  console.log('❌ [Dashboard] Tipo de usuário não autorizado')
  console.log('❌ [Dashboard] Detalhes para debug:')
  console.log('   - Email:', user.email)
  console.log('   - Todos os tipos são false, verificar authHelpers.ts')
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg text-red-600 text-center">
        <p>Tipo de usuário não autorizado</p>
        <p className="text-sm text-gray-500 mt-2">
          Email: {user.email}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Verifique o console para mais detalhes de debug
        </p>
      </div>
    </div>
  )
}
