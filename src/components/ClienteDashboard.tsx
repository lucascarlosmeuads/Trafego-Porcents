
import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { useMobile } from '@/hooks/use-mobile'
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
  const { clienteInfo, loading } = useClienteData(user?.email || '')
  const isMobile = useMobile()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return <LoadingFallback />
  }

  if (!clienteInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso não encontrado
          </h2>
          <p className="text-gray-600">
            Não foi possível encontrar suas informações. Entre em contato com seu gestor.
          </p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ClienteDashboardOverview onTabChange={setActiveTab} />
      case 'briefing':
        return <BriefingForm />
      case 'arquivos':
        return <ArquivosUpload />
      case 'suporte':
        return <SuporteRapido />
      case 'comissao':
        return <ClienteComissaoConfirmacao />
      case 'site':
        return <ClienteSiteDescricao />
      case 'vendas':
        return <VendasManager />
      case 'steps':
        return isMobile ? 
          <MobileOnboardingSteps onTabChange={setActiveTab} /> : 
          <OnboardingSteps onTabChange={setActiveTab} />
      case 'chat':
        return <ClienteChat />
      default:
        return <ClienteDashboardOverview onTabChange={setActiveTab} />
    }
  }

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <MobileHeader 
          onMenuClick={() => setSidebarOpen(true)}
          clienteInfo={clienteInfo}
        />
        
        <main className="flex-1 overflow-y-auto pb-16">
          {renderContent()}
        </main>

        <MobileBottomNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />

        <ClienteSidebarResponsive
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          clienteInfo={clienteInfo}
        />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ClienteSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        clienteInfo={clienteInfo}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
