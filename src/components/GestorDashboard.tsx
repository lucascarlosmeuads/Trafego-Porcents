
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardMetrics />
      case 'clientes':
        return <ClientesTable />
      case 'saques':
        return <SolicitacoesSaque />
      case 'chat':
        return <GestorChatList />
      default:
        return <DashboardMetrics />
    }
  }

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  )
}
