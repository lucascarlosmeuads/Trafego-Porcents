import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ClientesTable } from './ClientesTable'
import { GestoresManagement } from './GestoresManagement'
import { AdminDashboardMetrics } from './AdminDashboard/AdminDashboardMetrics'
import { LazyAdminChatLayoutSplit } from './LazyComponents'
import { LoadingFallback } from './LoadingFallback'
import { ManagerSelector } from './ManagerSelector'
import { useManagerData } from '@/hooks/useManagerData'

interface AdminDashboardProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  activeTab: string
}

export function AdminDashboard({ selectedManager, onManagerSelect, activeTab }: AdminDashboardProps) {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  
  // Buscar dados dos clientes baseado no gestor selecionado
  const { clientes: gestorClientes, loading: clientesLoading } = useManagerData(
    selectedManager === '__GESTORES__' ? '' : (selectedManager || '')
  )

  useEffect(() => {
    if (user && isAdmin) {
      setLoading(false)
    }
  }, [user, isAdmin])

  if (loading) {
    return <LoadingFallback />
  }

  const renderContent = () => {
    // Gerenciamento de gestores
    if (selectedManager === '__GESTORES__') {
      return <GestoresManagement />
    }
    
    // Navegação por abas
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Seletor de gestores */}
            <div className="bg-card border rounded-lg p-4">
              <ManagerSelector 
                selectedManager={selectedManager}
                onManagerSelect={onManagerSelect}
                isAdminContext={true}
              />
            </div>
            
            {/* Métricas do Admin */}
            <AdminDashboardMetrics 
              clientes={gestorClientes} 
              selectedManager={selectedManager}
            />
          </div>
        )

      case 'documentacao':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground">Documentação em desenvolvimento</p>
            </div>
          </div>
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
                <ManagerSelector 
                  selectedManager={selectedManager}
                  onManagerSelect={onManagerSelect}
                  isAdminContext={true}
                />
              </div>
            )}
            
            {/* Admin panel: Pass selectedManager directly for proper filtering */}
            <div className="w-full">
              <ClientesTable selectedManager={selectedManager} />
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
