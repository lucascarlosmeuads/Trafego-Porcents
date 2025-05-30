
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { ClienteDashboardOverview } from './ClienteDashboard/ClienteDashboardOverview'
import { BriefingForm } from './ClienteDashboard/BriefingForm'
import { ArquivosUpload } from './ClienteDashboard/ArquivosUpload'
import { VendasManager } from './ClienteDashboard/VendasManager'
import { ClienteSidebar } from './ClienteDashboard/ClienteSidebar'
import { TutorialVideos } from './ClienteDashboard/TutorialVideos'
import { ClienteChat } from './Chat/ClienteChat'

export function ClienteDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const { cliente, briefing, vendas, arquivos, loading: dataLoading, refetch } = useClienteData(user?.email || '')

  console.log('🔍 [ClienteDashboard] Estado da autenticação:', { 
    user: user?.email, 
    authLoading, 
    dataLoading 
  })

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, this should be handled by the parent component
  // but we'll add a fallback just in case
  if (!user) {
    console.log('❌ [ClienteDashboard] Usuário não autenticado, redirecionando...')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (dataLoading) {
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

  console.log('✅ [ClienteDashboard] Renderizando dashboard principal para:', user.email)

  return (
    <div className="flex h-screen bg-gray-50">
      <ClienteSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
