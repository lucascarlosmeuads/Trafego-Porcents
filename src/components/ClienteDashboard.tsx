import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { useIsMobile } from '@/hooks/useIsMobile'
import { ClienteWelcome } from './ClienteDashboard/ClienteWelcome'
import { BriefingForm } from './ClienteDashboard/BriefingForm'
import { ArquivosUpload } from './ClienteDashboard/ArquivosUpload'
import { VendasManager } from './ClienteDashboard/VendasManager'
import { TutorialVideos } from './ClienteDashboard/TutorialVideos'
import { SuporteRapido } from './ClienteDashboard/SuporteRapido'
import { ClienteCampanhas } from './ClienteDashboard/ClienteCampanhas'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { ClienteSidebarResponsive } from './ClienteDashboard/ClienteSidebarResponsive'
import { MobileHeader } from './ClienteDashboard/MobileHeader'
import { MobileBottomNav } from './ClienteDashboard/MobileBottomNav'
import { ProfileDropdown } from './ProfileDropdown'
import { TermosProtection } from './ClienteDashboard/TermosProtection'

export function ClienteDashboard() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
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

  const handleTermosRejeitados = () => {
    console.log('🚫 [ClienteDashboard] Redirecionando para termos rejeitados')
    navigate('/termos-rejeitados')
  }

  const renderContent = () => {
    console.log('🎯 [ClienteDashboard] renderContent() chamado com activeTab:', activeTab)
    
    if (dataLoading) {
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
      case 'campanhas':
        return <ClienteCampanhas onBack={handleBackToOverview} />
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

  // Envolver todo o conteúdo com a proteção de termos
  const dashboardContent = () => {
    // Layout mobile também COM SidebarProvider para acessar o sidebar
    if (isMobile) {
      return (
        <SidebarProvider defaultOpen={false}>
          <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Sidebar para mobile */}
            <ClienteSidebarResponsive activeTab={activeTab} onTabChange={setActiveTab} />
            
            <SidebarInset className="flex-1 flex flex-col w-full">
              {/* Header mobile com botão hamburguer */}
              <MobileHeader 
                activeTab={activeTab} 
                onBack={activeTab !== 'overview' ? handleBackToOverview : undefined}
              />
              
              {/* Conteúdo principal */}
              <main className="flex-1 pb-20 w-full overflow-x-hidden">
                {renderContent()}
              </main>
              
              {/* Navegação inferior */}
              <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            </SidebarInset>
          </div>
        </SidebarProvider>
      )
    }

    // Layout desktop COM SidebarProvider - SEM navegação inferior
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen flex w-full" style={{backgroundColor: '#0a0a0a'}}>
          <ClienteSidebarResponsive activeTab={activeTab} onTabChange={setActiveTab} />
          
          <SidebarInset className="flex-1 flex flex-col min-w-0">
            <MobileHeader 
              activeTab={activeTab} 
              onBack={activeTab !== 'overview' ? handleBackToOverview : undefined}
            />
            
            <main className="flex-1 p-6 overflow-x-hidden">
              <div className="max-w-7xl mx-auto">
                {renderContent()}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  // Retornar conteúdo protegido pelos termos
  return (
    <TermosProtection onTermosRejeitados={handleTermosRejeitados}>
      {dashboardContent()}
    </TermosProtection>
  )
}

// Add default export for lazy loading
export default ClienteDashboard
