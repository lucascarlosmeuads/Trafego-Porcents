
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { useIsMobile } from '@/hooks/useIsMobile'
import { ClienteWelcome } from './ClienteDashboard/ClienteWelcome'
import { BriefingForm } from './ClienteDashboard/BriefingForm'
import { ArquivosUpload } from './ClienteDashboard/ArquivosUpload'
import { VendasManager } from './ClienteDashboard/VendasManager'
import { TutorialVideos } from './ClienteDashboard/TutorialVideos'
import { SuporteRapido } from './ClienteDashboard/SuporteRapido'
import { MetaAdsInterface } from './MetaAds/MetaAdsInterface'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { ClienteSidebarResponsive } from './ClienteDashboard/ClienteSidebarResponsive'
import { MobileHeader } from './ClienteDashboard/MobileHeader'
import { MobileBottomNav } from './ClienteDashboard/MobileBottomNav'
import { ProfileDropdown } from './ProfileDropdown'

export function ClienteDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const { cliente, briefing, vendas, arquivos, loading: dataLoading, refetch } = useClienteData(user?.email || '')
  const isMobile = useIsMobile()

  console.log('🔍 [ClienteDashboard] === DEBUGGING PAINEL DO CLIENTE ===')
  console.log('🔍 [ClienteDashboard] Estado da autenticação:', { 
    user: user?.email, 
    authLoading, 
    dataLoading,
    activeTab,
    isMobile,
    userAgent: navigator.userAgent
  })

  // Show loading while authentication is being checked
  if (authLoading) {
    console.log('⏳ [ClienteDashboard] Mostrando loading de autenticação')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, this should be handled by the parent component
  if (!user) {
    console.log('❌ [ClienteDashboard] Usuário não autenticado, redirecionando...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  const handleBackToOverview = () => {
    setActiveTab('overview')
  }

  const renderContent = () => {
    console.log('🎯 [ClienteDashboard] renderContent() chamado com activeTab:', activeTab)
    
    if (dataLoading && ['overview', 'briefing', 'arquivos', 'vendas'].includes(activeTab)) {
      console.log('⏳ [ClienteDashboard] Mostrando loading de dados')
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
          <ClienteWelcome 
            onTabChange={setActiveTab}
          />
        )
      case 'briefing':
        console.log('📋 [ClienteDashboard] Passando briefing para o formulário:', briefing)
        return (
          <BriefingForm 
            briefing={briefing}
            emailCliente={user?.email || ''}
            onBriefingUpdated={refetch}
            onBack={handleBackToOverview}
          />
        )
      case 'arquivos':
        // Convert arquivos from useClienteData format to ArquivosUpload format
        const arquivosForUpload = arquivos.map(arquivo => ({
          id: arquivo.id,
          nome_arquivo: arquivo.nome_arquivo,
          url_arquivo: arquivo.caminho_arquivo,
          data_upload: arquivo.created_at,
          descricao: ''
        }))
        
        return (
          <ArquivosUpload 
            emailCliente={user?.email || ''}
            arquivos={arquivosForUpload}
            onArquivosUpdated={refetch}
            onBack={handleBackToOverview}
          />
        )
      case 'meta-ads':
        return <MetaAdsInterface onBack={handleBackToOverview} />
      case 'vendas':
        // Convert vendas from useClienteData format to VendasManager format
        const vendasForManager = vendas.map(venda => ({
          id: venda.id,
          valor: venda.valor_venda,
          data: venda.data_venda,
          produto: venda.produto_vendido
        }))
        
        return (
          <VendasManager 
            emailCliente={user?.email || ''}
            vendas={vendasForManager}
            onVendasUpdated={refetch}
            onBack={handleBackToOverview}
          />
        )
      case 'tutoriais':
        return <TutorialVideos onBack={handleBackToOverview} />
      case 'suporte':
        return <SuporteRapido onBack={handleBackToOverview} />
      default:
        return (
          <ClienteWelcome 
            onTabChange={setActiveTab}
          />
        )
    }
  }

  // Layout mobile otimizado
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-sm opacity-20"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold px-3 py-2 text-sm">
                <span>Tráfego</span>
                <span className="text-orange-300">Porcents</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-gray-800 text-sm font-medium">
              {activeTab === 'overview' && 'Painel Principal'}
              {activeTab === 'briefing' && 'Briefing'}
              {activeTab === 'arquivos' && 'Materiais'}
              {activeTab === 'meta-ads' && 'Meta Ads'}
              {activeTab === 'vendas' && 'Vendas'}
              {activeTab === 'tutoriais' && 'Tutoriais'}
              {activeTab === 'suporte' && 'Suporte'}
            </div>
            <ProfileDropdown />
          </div>
        </div>
        
        <main className="pb-20 min-h-screen">
          {renderContent()}
        </main>
        
        <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    )
  }

  // Layout desktop COM SidebarProvider - SEM navegação inferior
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full" style={{backgroundColor: '#0a0a0a'}}>
        <ClienteSidebarResponsive activeTab={activeTab} onTabChange={setActiveTab} />
        
        <SidebarInset className="flex-1">
          <MobileHeader 
            activeTab={activeTab} 
            onBack={activeTab !== 'overview' ? handleBackToOverview : undefined}
          />
          
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
