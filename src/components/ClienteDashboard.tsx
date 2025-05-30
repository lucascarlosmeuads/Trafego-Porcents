
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { ClienteDashboardOverview } from './ClienteDashboard/ClienteDashboardOverview'
import { BriefingForm } from './ClienteDashboard/BriefingForm'
import { ArquivosUpload } from './ClienteDashboard/ArquivosUpload'
import { VendasManager } from './ClienteDashboard/VendasManager'
import { ClienteWelcome } from './ClienteDashboard/ClienteWelcome'
import { ClienteSidebar } from './ClienteDashboard/ClienteSidebar'
import { TutorialVideos } from './ClienteDashboard/TutorialVideos'
import { ClienteChat } from './Chat/ClienteChat'

export function ClienteDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const { cliente, briefing, vendas, arquivos, loading, refetch } = useClienteData(user?.email || '')

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
      case 'overview':
        return (
          <ClienteDashboardOverview 
            cliente={cliente}
            briefing={briefing}
            vendas={vendas}
            arquivos={arquivos}
          />
        )
      case 'briefing':
        return (
          <BriefingForm 
            briefing={briefing}
            emailCliente={user?.email || ''}
            onBriefingUpdated={refetch}
          />
        )
      case 'arquivos':
        return (
          <ArquivosUpload 
            emailCliente={user?.email || ''}
            arquivos={arquivos}
            onArquivosUpdated={refetch}
          />
        )
      case 'vendas':
        return (
          <VendasManager 
            emailCliente={user?.email || ''}
            vendas={vendas}
            onVendasUpdated={refetch}
          />
        )
      case 'tutoriais':
        return <TutorialVideos />
      case 'chat':
        return <ClienteChat />
      default:
        return (
          <ClienteDashboardOverview 
            cliente={cliente}
            briefing={briefing}
            vendas={vendas}
            arquivos={arquivos}
          />
        )
    }
  }

  if (!user) {
    return <ClienteWelcome onTabChange={setActiveTab} />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ClienteSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
