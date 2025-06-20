
import { useState } from 'react'
import { AdminTable } from './AdminTable'
import { OptimizedAdminDashboard } from './AdminDashboard/OptimizedAdminDashboard'
import { SiteRequestsDashboard } from './SiteRequests/SiteRequestsDashboard'
import { SaquesDashboard } from './Saques/SaquesDashboard'
import { SacDashboard } from './SAC/SacDashboard'
import { SacGestorReport } from './SAC/SacGestorReport'
import { AdminChatLayoutSplit } from './Chat/AdminChatLayoutSplit'
import { AdminSugestoes } from './AdminSugestoes'
import { DocumentationViewer } from './Documentation/DocumentationViewer'
import { ManagerSidebar } from './ManagerSidebar'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedManager, setSelectedManager] = useState<string | null>(null)

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <OptimizedAdminDashboard 
            selectedManager={selectedManager}
            onManagerSelect={setSelectedManager}
            activeTab={activeTab}
          />
        )
      case 'clientes':
        return <AdminTable />
      case 'solicitacoes-site':
        return <SiteRequestsDashboard />
      case 'solicitacoes-saque':
        return <SaquesDashboard />
      case 'sac':
        return <SacDashboard />
      case 'sac-relatorio':
        return <SacGestorReport />
      case 'chat':
        return <AdminChatLayoutSplit />
      case 'sugestoes':
        return <AdminSugestoes />
      case 'documentacao':
        return <DocumentationViewer />
      default:
        return (
          <OptimizedAdminDashboard 
            selectedManager={selectedManager}
            onManagerSelect={setSelectedManager}
            activeTab={activeTab}
          />
        )
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      <ManagerSidebar
        selectedManager={selectedManager}
        onManagerSelect={setSelectedManager}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="flex-1 overflow-auto">
        {renderActiveTab()}
      </div>
    </div>
  )
}
