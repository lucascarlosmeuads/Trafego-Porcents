
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ClienteDashboardOverview />
      case 'briefing':
        return <BriefingForm />
      case 'arquivos':
        return <ArquivosUpload />
      case 'vendas':
        return <VendasManager />
      case 'tutoriais':
        return <TutorialVideos />
      case 'chat':
        return <ClienteChat />
      default:
        return <ClienteDashboardOverview />
    }
  }

  if (!user) {
    return <ClienteWelcome />
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
