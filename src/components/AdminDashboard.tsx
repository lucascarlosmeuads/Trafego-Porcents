
import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { StatusFunnelDashboard } from './Dashboard/StatusFunnelDashboard'
import { ManagerSelector } from './ManagerSelector'
import { LoadingFallback } from './LoadingFallback'
import * as LazyComponents from './LazyComponents'

interface AdminDashboardProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  activeTab: string
}

export default function AdminDashboard({ selectedManager, onManagerSelect, activeTab }: AdminDashboardProps) {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && isAdmin) {
      setLoading(false)
    }
  }, [user, isAdmin])

  if (loading) {
    return <LoadingFallback message="Carregando..." />
  }

  const renderContent = () => {
    // Gerenciamento de gestores
    if (selectedManager === '__GESTORES__') {
      return (
        <Suspense fallback={<LoadingFallback message="Carregando gestão de gestores..." />}>
          <LazyComponents.GestoresManagement />
        </Suspense>
      )
    }
    
    // Navegação por abas
    switch (activeTab) {
      case 'dashboard':
        return <StatusFunnelDashboard />

      case 'documentacao':
        return (
          <Suspense fallback={<LoadingFallback message="Carregando documentação..." />}>
            <LazyComponents.DocumentationViewer />
          </Suspense>
        )

      case 'chat':
        return (
          <Suspense fallback={<LoadingFallback message="Carregando chat..." />}>
            <LazyComponents.AdminChatLayoutSplit />
          </Suspense>
        )
      
      case 'clientes':
      default:
        return (
          <div className="space-y-4">
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
            <Suspense fallback={<LoadingFallback message="Carregando tabela de clientes..." />}>
              <LazyComponents.ClientesTable selectedManager={selectedManager} />
            </Suspense>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  )
}
