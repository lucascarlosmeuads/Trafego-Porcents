import { useState, useEffect } from 'react'
import { useSimpleAuth } from '@/hooks/useSimpleAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BriefingForm } from './ClienteDashboard/BriefingForm'
import { VendasManager } from './ClienteDashboard/VendasManager'
import { ArquivosUpload } from './ClienteDashboard/ArquivosUpload'
import { TutorialVideos } from './ClienteDashboard/TutorialVideos'
import { ClienteSidebar } from './ClienteDashboard/ClienteSidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { useClienteData } from '@/hooks/useClienteData'
import { ensureClienteExists, restoreClienteData } from '@/utils/clienteDataHelpers'
import { useIsMobile } from '@/hooks/use-mobile'
import { ClienteWelcome } from './ClienteDashboard/ClienteWelcome'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ClienteDashboard() {
  const { user } = useSimpleAuth()
  const { cliente, briefing, vendas, arquivos, loading, refetch } = useClienteData(user?.email || '')
  const [activeTab, setActiveTab] = useState('welcome')
  const [dataIntegrityChecked, setDataIntegrityChecked] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const checkDataIntegrity = async () => {
      if (!user?.email || dataIntegrityChecked) return

      console.log('🔧 [ClienteDashboard] Verificando integridade dos dados para:', user.email)

      // Try to restore data for known missing clients
      if (user.email === 'lojaofertascertas@gmail.com') {
        console.log('🔧 [ClienteDashboard] Tentando restaurar dados para lojaofertascertas@gmail.com')
        await restoreClienteData(user.email)
      }

      // Ensure client exists in database
      await ensureClienteExists(user.email)
      
      setDataIntegrityChecked(true)
      
      // Refetch data after integrity check
      setTimeout(() => {
        refetch()
      }, 1000)
    }

    checkDataIntegrity()
  }, [user?.email, dataIntegrityChecked, refetch])

  if (loading && !dataIntegrityChecked) {
    return (
      <div className="flex items-center justify-center py-8 px-4">
        <div className="text-base sm:text-lg">Carregando seus dados...</div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'welcome':
        return (
          <ClienteWelcome onTabChange={setActiveTab} />
        )
      case 'vendas':
        return (
          <VendasManager 
            emailCliente={user?.email || ''} 
            vendas={vendas}
            onVendasUpdated={refetch}
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
      case 'materiais':
        return (
          <ArquivosUpload 
            emailCliente={user?.email || ''} 
            arquivos={arquivos}
            onArquivosUpdated={refetch}
          />
        )
      case 'tutorial':
        return <TutorialVideos />
      default:
        return (
          <ClienteWelcome onTabChange={setActiveTab} />
        )
    }
  }

  const showBackButton = activeTab !== 'welcome'

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ClienteSidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <SidebarInset className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <header className="bg-card shadow-sm border-b sticky top-0 z-40 w-full">
            <div className={`flex justify-between items-center relative ${
              isMobile ? 'py-2 px-3' : 'py-4 px-4 sm:px-6 lg:px-8'
            }`}>
              {/* Back Button - Fixed position on mobile */}
              {showBackButton && (
                <Button
                  variant="ghost"
                  size={isMobile ? "sm" : "default"}
                  onClick={() => setActiveTab('welcome')}
                  className={`${
                    isMobile 
                      ? 'absolute left-2 top-1/2 -translate-y-1/2 z-50 h-8 px-2 text-xs' 
                      : 'mr-4'
                  } flex items-center gap-1 hover:bg-accent`}
                >
                  <ArrowLeft className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  {isMobile ? 'Início' : 'Voltar para o Início'}
                </Button>
              )}

              <div className={`flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1 ${
                showBackButton && isMobile ? 'pl-16' : ''
              }`}>
                {!showBackButton && (
                  <SidebarTrigger className={`flex-shrink-0 ${isMobile ? 'w-8 h-8' : ''}`} />
                )}
                <div className="min-w-0 flex-1">
                  <h1 className={`${
                    isMobile ? 'text-sm' : 'text-lg sm:text-xl lg:text-2xl'
                  } font-bold text-foreground truncate`}>
                    {activeTab === 'welcome' ? 'Passo a Passo' : 'Minha Campanha'}
                  </h1>
                  <div className={`flex flex-col sm:flex-row sm:items-center sm:space-x-2 ${
                    isMobile ? 'text-xs' : 'text-xs sm:text-sm'
                  } text-muted-foreground`}>
                    <span>Painel do Cliente</span>
                    {cliente && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <Badge variant="outline" className={`${
                          isMobile ? 'text-xs mt-1 sm:mt-0 max-w-32 truncate' : ''
                        }`}>
                          {cliente.nome_cliente}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {!isMobile && (
                <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                  <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                    <span className="truncate max-w-[120px] lg:max-w-none">{user?.email}</span>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Content */}
          <main className={`flex-1 overflow-auto ${
            isMobile ? 'py-3 px-3' : 'py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8'
          }`}>
            <div className="w-full max-w-full overflow-hidden">
              {renderContent()}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
