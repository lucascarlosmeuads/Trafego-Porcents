
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { ClientesTable } from './ClientesTable'
import { DashboardMetrics } from './GestorDashboard/DashboardMetrics'
import { SolicitacoesSaque } from './SolicitacoesSaque'
import { ManagerSidebar } from './ManagerSidebar'
import { GestorChatList } from './Chat/GestorChatList'

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
      case 'saques':
        return <SolicitacoesSaque />
      case 'chat':
        return <GestorChatList />
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
