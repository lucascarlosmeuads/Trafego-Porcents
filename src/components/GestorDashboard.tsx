
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { ClientesTable } from './ClientesTable'
import { DashboardMetrics } from './GestorDashboard/DashboardMetrics'
import { ManagerSidebar } from './ManagerSidebar'
import { ChatLayoutSplit } from './Chat/ChatLayoutSplit'

interface GestorDashboardProps {
  activeTab: string
}

export function GestorDashboard({ activeTab }: GestorDashboardProps) {
  const { user } = useAuth()
  const { clientes, loading } = useManagerData(user?.email || '')

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
        return <DashboardMetrics clientes={clientes} />
      case 'clientes':
        return <ClientesTable />
      case 'chat':
        return <ChatLayoutSplit />
      default:
        return <DashboardMetrics clientes={clientes} />
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
