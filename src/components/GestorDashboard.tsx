
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { ClientesTable } from './ClientesTable'
import { DashboardMetrics } from './GestorDashboard/DashboardMetrics'
import { GamifiedMetrics } from './GestorDashboard/GamifiedMetrics'
import { ManagerSidebar } from './ManagerSidebar'
import { ChatLayoutSplit } from './Chat/ChatLayoutSplit'
import { Button } from '@/components/ui/button'
import { BarChart3, Gamepad2 } from 'lucide-react'

interface GestorDashboardProps {
  activeTab: string
}

export function GestorDashboard({ activeTab }: GestorDashboardProps) {
  const { user } = useAuth()
  const { clientes, loading } = useManagerData(user?.email || '')
  const [viewMode, setViewMode] = useState<'traditional' | 'gamified'>('gamified')

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Toggle entre visões */}
            <div className="flex justify-end">
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'gamified' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('gamified')}
                  className="flex items-center gap-2"
                >
                  <Gamepad2 className="h-4 w-4" />
                  Gamificado
                </Button>
                <Button
                  variant={viewMode === 'traditional' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('traditional')}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Tradicional
                </Button>
              </div>
            </div>
            
            {/* Renderizar a visão apropriada */}
            {viewMode === 'gamified' ? (
              <GamifiedMetrics clientes={clientes} />
            ) : (
              <DashboardMetrics clientes={clientes} />
            )}
          </div>
        )
      case 'clientes':
        return <ClientesTable />
      case 'chat':
        return <ChatLayoutSplit />
      default:
        return (
          <div className="space-y-6">
            {/* Toggle entre visões */}
            <div className="flex justify-end">
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'gamified' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('gamified')}
                  className="flex items-center gap-2"
                >
                  <Gamepad2 className="h-4 w-4" />
                  Gamificado
                </Button>
                <Button
                  variant={viewMode === 'traditional' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('traditional')}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Tradicional
                </Button>
              </div>
            </div>
            
            {/* Renderizar a visão apropriada */}
            {viewMode === 'gamified' ? (
              <GamifiedMetrics clientes={clientes} />
            ) : (
              <DashboardMetrics clientes={clientes} />
            )}
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

// Add default export for lazy loading
export default GestorDashboard
