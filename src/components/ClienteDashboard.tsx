import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { useIsMobile } from '@/hooks/useIsMobile'
import { ClienteSidebarDynamic } from './ClienteDashboard/ClienteSidebarDynamic'
import { MobileHeader } from './ClienteDashboard/MobileHeader'
import { BriefingForm } from './ClienteDashboard/BriefingForm'
import { ArquivosUpload } from './ClienteDashboard/ArquivosUpload'
import { SuporteRapido } from './ClienteDashboard/SuporteRapido'
import { ComissaoInputManual } from './ClienteDashboard/ComissaoInputManual'
import { ClienteSiteDescricao } from './ClienteDashboard/ClienteSiteDescricao'
import { MetricasMetaAds } from './ClienteDashboard/MetricasMetaAds'
import { TutorialVideos } from './ClienteDashboard/TutorialVideos'
import { LoadingFallback } from './LoadingFallback'
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar'
import { ClienteHomeDashboard } from './ClienteDashboard/ClienteHomeDashboard'
import { TermosProtection } from './ClienteDashboard/TermosProtection'
import { ComissaoMelhorada } from './ClienteDashboard/ComissaoMelhorada'

function ClienteDashboardContent() {
  const { user } = useAuth()
  const { cliente, briefing, vendas, arquivos, loading, refetch } = useClienteData(user?.email || '')
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState('home')
  const { state } = useSidebar()

  const isCollapsed = state === 'collapsed'

  if (loading) {
    return <LoadingFallback />
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Acesso não encontrado
          </h2>
          <p className="text-muted-foreground">
            Não foi possível encontrar suas informações. Entre em contato com seu gestor.
          </p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <ClienteHomeDashboard 
            onTabChange={setActiveTab}
          />
        )
      case 'briefing':
        return (
          <BriefingForm 
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
      case 'suporte':
        return (
          <SuporteRapido 
            onBack={() => setActiveTab('briefing')}
            onTabChange={setActiveTab}
          />
        )
      case 'comissao':
        return <ComissaoMelhorada />
      case 'vendas':
        return <MetricasMetaAds />
      case 'steps':
        return <TutorialVideos onBack={() => setActiveTab('suporte')} />
      default:
        return (
          <ClienteHomeDashboard 
            onTabChange={setActiveTab}
          />
        )
    }
  }

  const dashboardContent = () => {
    if (isMobile) {
      return (
        <div className="flex flex-col h-screen bg-background mobile-container">
          <MobileHeader 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            clienteInfo={cliente}
          />
          
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="min-h-full">
              {renderContent()}
            </div>
          </main>
        </div>
      )
    }

    return (
      <div className="flex h-screen bg-background overflow-hidden w-full">
        {/* Sidebar sem interferência do header - ocupa toda a altura */}
        <ClienteSidebarDynamic
          activeTab={activeTab}
          onTabChange={setActiveTab}
          clienteInfo={cliente}
        />
        
        <main className={`flex-1 overflow-y-auto bg-background transition-all duration-300 ${
          isCollapsed ? 'ml-2' : 'ml-6'
        }`}>
          <div className={`min-h-full transition-all duration-300 ${
            isCollapsed ? 'p-4' : 'p-8'
          }`}>
            {renderContent()}
          </div>
        </main>
      </div>
    )
  }

  return dashboardContent()
}

export function ClienteDashboard() {
  return (
    <TermosProtection>
      <SidebarProvider>
        <ClienteDashboardContent />
      </SidebarProvider>
    </TermosProtection>
  )
}
