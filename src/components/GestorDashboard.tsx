
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { ClientesTable } from './ClientesTable'
import { GamifiedMetrics } from './GestorDashboard/GamifiedMetrics'
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
        <div className="flex items-center justify-center h-64 bg-deep-blue">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tech-purple mx-auto mb-2"></div>
            <p className="text-secondary-text">Carregando dados...</p>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'dashboard':
        return <GamifiedMetrics clientes={clientes} />
      case 'clientes':
        return (
          <div className="bg-deep-blue min-h-screen">
            <ClientesTable />
          </div>
        )
      case 'chat':
        return (
          <div className="bg-deep-blue min-h-screen">
            <ChatLayoutSplit />
          </div>
        )
      default:
        return <GamifiedMetrics clientes={clientes} />
    }
  }

  return (
    <div className="bg-deep-blue min-h-screen">
      {renderContent()}
    </div>
  )
}

// Add default export for lazy loading
export default GestorDashboard
