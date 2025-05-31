
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { ClienteWelcome } from './ClienteDashboard/ClienteWelcome'
import { BriefingForm } from './ClienteDashboard/BriefingForm'
import { ArquivosUpload } from './ClienteDashboard/ArquivosUpload'
import { VendasManager } from './ClienteDashboard/VendasManager'
import { TutorialVideos } from './ClienteDashboard/TutorialVideos'
import { ClienteChat } from './Chat/ClienteChat'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { ClienteSidebarResponsive } from './ClienteDashboard/ClienteSidebarResponsive'
import { MobileHeader } from './ClienteDashboard/MobileHeader'

export function ClienteDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const { cliente, briefing, vendas, arquivos, loading: dataLoading, refetch } = useClienteData(user?.email || '')

  console.log('🔍 [ClienteDashboard] === DEBUGGING PAINEL DO CLIENTE ===')
  console.log('🔍 [ClienteDashboard] Estado da autenticação:', { 
    user: user?.email, 
    authLoading, 
    dataLoading,
    activeTab
  })

  // Show loading while authentication is being checked
  if (authLoading) {
    console.log('⏳ [ClienteDashboard] Mostrando loading de autenticação')
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, this should be handled by the parent component
  if (!user) {
    console.log('❌ [ClienteDashboard] Usuário não autenticado, redirecionando...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    console.log('🎯 [ClienteDashboard] renderContent() chamado com activeTab:', activeTab)
    
    if (dataLoading) {
      console.log('⏳ [ClienteDashboard] Mostrando loading de dados')
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'overview':
        return (
          <ClienteWelcome 
            onTabChange={setActiveTab}
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
          <ClienteWelcome 
            onTabChange={setActiveTab}
          />
        )
    }
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <ClienteSidebarResponsive activeTab={activeTab} onTabChange={setActiveTab} />
        
        <SidebarInset className="flex-1">
          <MobileHeader activeTab={activeTab} />
          
          <main className="flex-1 p-4 md:p-6">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

// Add default export for lazy loading
export default ClienteDashboard
