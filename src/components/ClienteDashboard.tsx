
import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { useIsMobile } from '@/hooks/useIsMobile'
import { ClienteSidebarDynamic } from './ClienteDashboard/ClienteSidebarDynamic'
import { MobileBottomNav } from './ClienteDashboard/MobileBottomNav'
import { MobileHeader } from './ClienteDashboard/MobileHeader'
import { BriefingForm } from './ClienteDashboard/BriefingForm'
import { ArquivosUpload } from './ClienteDashboard/ArquivosUpload'
import { SuporteRapido } from './ClienteDashboard/SuporteRapido'
import { ComissaoInputManual } from './ClienteDashboard/ComissaoInputManual'
import { ClienteSiteDescricao } from './ClienteDashboard/ClienteSiteDescricao'
import { MetricasMetaAds } from './ClienteDashboard/MetricasMetaAds'
import { TutorialVideos } from './ClienteDashboard/TutorialVideos'
import { LoadingFallback } from './LoadingFallback'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

export function ClienteDashboard() {
  const { user } = useAuth()
  const { cliente, briefing, vendas, arquivos, loading, refetch } = useClienteData(user?.email || '')
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState('briefing')

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
          />
        )
      case 'comissao':
        return <ComissaoInputManual />
      case 'site':
        return <ClienteSiteDescricao />
      case 'vendas':
        return <MetricasMetaAds />
      case 'steps':
        return <TutorialVideos onBack={() => setActiveTab('briefing')} />
      default:
        return (
          <BriefingForm 
            onBriefingUpdated={refetch}
          />
        )
    }
  }

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background mobile-container">
        <MobileHeader 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          clienteInfo={cliente}
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
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background overflow-hidden w-full">
        {/* Header com trigger da sidebar */}
        <div className="fixed top-0 left-0 right-0 z-50 h-12 bg-card border-b border-border flex items-center px-4">
          <SidebarTrigger />
          <div className="flex items-center gap-3 ml-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TP</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Dashboard Cliente
              </h1>
            </div>
          </div>
        </div>

        <ClienteSidebarDynamic
          activeTab={activeTab}
          onTabChange={setActiveTab}
          clienteInfo={cliente}
        />
        
        <main className="flex-1 overflow-y-auto bg-background pt-12">
          <div className="p-6 min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
