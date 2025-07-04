
import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { useIsMobile } from '@/hooks/useIsMobile'
import { ClienteSidebar } from './ClienteDashboard/ClienteSidebar'
import { ClienteSidebarResponsive } from './ClienteDashboard/ClienteSidebarResponsive'
import { MobileBottomNav } from './ClienteDashboard/MobileBottomNav'
import { MobileHeader } from './ClienteDashboard/MobileHeader'
import { ClienteDashboardOverview } from './ClienteDashboard/ClienteDashboardOverview'
import { BriefingForm } from './ClienteDashboard/BriefingForm'
import { ArquivosUpload } from './ClienteDashboard/ArquivosUpload'
import { SuporteRapido } from './ClienteDashboard/SuporteRapido'
import { ClienteComissaoConfirmacao } from './ClienteDashboard/ClienteComissaoConfirmacao'
import { ClienteSiteDescricao } from './ClienteDashboard/ClienteSiteDescricao'
import { VendasManager } from './ClienteDashboard/VendasManager'
import { OnboardingSteps } from './ClienteDashboard/OnboardingSteps'
import { MobileOnboardingSteps } from './ClienteDashboard/MobileOnboardingSteps'
import { ClienteChat } from './Chat/ClienteChat'
import { LoadingFallback } from './LoadingFallback'

export function ClienteDashboard() {
  const { user } = useAuth()
  const { cliente, briefing, vendas, arquivos, loading, refetch } = useClienteData(user?.email || '')
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      case 'suporte':
        return (
          <SuporteRapido 
            onBack={() => setActiveTab('overview')}
          />
        )
      case 'comissao':
        return <ClienteComissaoConfirmacao />
      case 'site':
        return <ClienteSiteDescricao />
      case 'vendas':
        return (
          <VendasManager 
            emailCliente={user?.email || ''}
            vendas={vendas}
            onVendasUpdated={refetch}
          />
        )
      case 'steps':
        return isMobile ? 
          <MobileOnboardingSteps onTabChange={setActiveTab} /> : 
          <OnboardingSteps onTabChange={setActiveTab} />
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

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background mobile-container">
        <MobileHeader 
          activeTab={activeTab}
        />
        
        <main className="flex-1 overflow-y-auto pb-16 bg-background">
          <div className="min-h-full">
            {renderContent()}
          </div>
        </main>

        <MobileBottomNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />

        <ClienteSidebarResponsive
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ClienteSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        clienteInfo={cliente}
      />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-6 min-h-full">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
