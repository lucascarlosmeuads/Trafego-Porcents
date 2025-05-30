
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

  // Reset tab when user type changes
  useEffect(() => {
    setActiveTab('dashboard')
    setSelectedManager(null)
  }, [isAdmin, isGestor, isCliente, isVendedor, isSites])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Usuário não autenticado</div>
      </div>
    )
  }

  // Cliente Dashboard
  if (isCliente) {
    return <ClienteDashboard />
  }

  // Vendedor Dashboards
  if (isVendedor) {
    const isSimpleVendedor = user.email?.includes('simple') || false
    
    if (isSimpleVendedor) {
      return <SimpleVendedorDashboard />
    }
    
    return <VendedorDashboard />
  }

  // Sites Dashboard
  if (isSites) {
    return <SitesDashboard />
  }

  // Admin/Gestor Dashboards
  if (isAdmin || isGestor) {
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
              activeTab={activeTab}
              onTabChange={setActiveTab}
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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg text-red-600">
        Tipo de usuário não autorizado
      </div>
    </div>
  )
}
