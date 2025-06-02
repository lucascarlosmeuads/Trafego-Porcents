
import React, { useState, useEffect, Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ManagerSidebar } from './ManagerSidebar'
import { Dashboard } from './Dashboard'
import { AdminTable } from './AdminTable'
import { MelhoriasEDicas } from './MelhoriasEDicas'
import { GestoresManagement } from './GestoresManagement'
import { LoadingFallback } from './LoadingFallback'

// Lazy load components para melhor performance
const LazyClientesTable = React.lazy(() => import('./ClientesTable').then(module => ({ default: module.ClientesTable })))
const LazyChatInterface = React.lazy(() => import('./Chat/ChatInterface').then(module => ({ default: module.ChatInterface })))
const LazyDocumentation = React.lazy(() => import('./Documentation').then(module => ({ default: module.Documentation })))

export function GestorDashboard() {
  const { isAdmin, currentManagerName } = useAuth()
  const [selectedManager, setSelectedManager] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Resetar manager selecionado quando mudar de aba (exceto gestores)
  useEffect(() => {
    if (activeTab !== 'gestores' && selectedManager === '__GESTORES__') {
      setSelectedManager(null)
    }
  }, [activeTab, selectedManager])

  const renderContent = () => {
    // Se gestores foi selecionado, mostrar gestão de gestores
    if (selectedManager === '__GESTORES__') {
      return <GestoresManagement />
    }

    // Renderizar conteúdo baseado na aba ativa
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      
      case 'clientes':
        if (isAdmin) {
          return selectedManager ? (
            <Suspense fallback={<LoadingFallback />}>
              <LazyClientesTable selectedManager={selectedManager} />
            </Suspense>
          ) : <AdminTable />
        } else {
          return (
            <Suspense fallback={<LoadingFallback />}>
              <LazyClientesTable selectedManager={currentManagerName} />
            </Suspense>
          )
        }
      
      case 'melhorias-dicas':
        return <MelhoriasEDicas />
      
      case 'chat':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyChatInterface />
          </Suspense>
        )
      
      case 'documentacao':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyDocumentation />
          </Suspense>
        )
      
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <ManagerSidebar
        selectedManager={selectedManager}
        onManagerSelect={setSelectedManager}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  )
}
