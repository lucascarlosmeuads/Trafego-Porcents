
import { useState } from 'react'
import { OptimizedGestorDashboard } from './GestorDashboard/OptimizedGestorDashboard'
import { ClientesTable } from './ClientesTable'
import { CadastroCampanhaDashboard } from './CadastroCampanha/CadastroCampanhaDashboard'
import { SiteRequestsDashboard } from './SiteRequests/SiteRequestsDashboard'
import { SaquesDashboard } from './Saques/SaquesDashboard'
import { SacDashboard } from './SAC/SacDashboard'
import { SugestoesDashboard } from './SugestoesDashboard'
import { ManagerSidebar } from './ManagerSidebar'

export default function GestorDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OptimizedGestorDashboard activeTab={activeTab} />
      case 'clientes':
        return <ClientesTable />
      case 'cadastro-campanha':
        return <CadastroCampanhaDashboard />
      case 'solicitacoes-site':
        return <SiteRequestsDashboard />
      case 'solicitacoes-saque':
        return <SaquesDashboard />
      case 'sac':
        return <SacDashboard />
      case 'sugestoes':
        return <SugestoesDashboard />
      default:
        return <OptimizedGestorDashboard activeTab={activeTab} />
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      <ManagerSidebar
        selectedManager={null}
        onManagerSelect={() => {}}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="flex-1 overflow-auto">
        {renderActiveTab()}
      </div>
    </div>
  )
}
