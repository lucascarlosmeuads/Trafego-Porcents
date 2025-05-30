
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AdminDashboard } from './AdminDashboard'
import { ClienteDashboard } from './ClienteDashboard'
import { VendedorDashboard } from './VendedorDashboard'
import { SimpleVendedorDashboard } from './SimpleVendedorDashboard'
import { SitesDashboard } from './SitesDashboard'
import { GestorDashboard } from './GestorDashboard'
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
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
    return <ClienteDashboard />
  }

  // Vendedor Dashboards
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

  // Sites Dashboard
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
          {/* Admin Dashboard */}
          {isAdmin && (
            <AdminDashboard
              selectedManager={selectedManager}
              onManagerSelect={setSelectedManager}
              activeTab={activeTab}
            />
          )}
          
          {/* Gestor Dashboard */}
          {isGestor && (
            <GestorDashboard activeTab={activeTab} />
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
