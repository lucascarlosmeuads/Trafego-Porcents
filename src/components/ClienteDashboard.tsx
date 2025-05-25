import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClienteDashboardOverview } from './ClienteDashboard/ClienteDashboardOverview'
import { BriefingForm } from './ClienteDashboard/BriefingForm'
import { VendasManager } from './ClienteDashboard/VendasManager'
import { ArquivosUpload } from './ClienteDashboard/ArquivosUpload'
import { TutorialVideos } from './ClienteDashboard/TutorialVideos'
import { ClienteSidebar } from './ClienteDashboard/ClienteSidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { useClienteData } from '@/hooks/useClienteData'
import { ensureClienteExists, restoreClienteData } from '@/utils/clienteDataHelpers'

export function ClienteDashboard() {
  const { user } = useAuth()
  const { cliente, briefing, vendas, arquivos, loading, refetch } = useClienteData(user?.email || '')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dataIntegrityChecked, setDataIntegrityChecked] = useState(false)

  // Check and ensure data integrity on mount
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
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Carregando seus dados...</div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ClienteDashboardOverview 
            cliente={cliente}
            briefing={briefing}
            vendas={vendas}
            arquivos={arquivos}
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
          <ClienteDashboardOverview 
            cliente={cliente}
            briefing={briefing}
            vendas={vendas}
            arquivos={arquivos}
          />
        )
    }
  }

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
            <div className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                <SidebarTrigger className="flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate">
                    Minha Campanha
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs sm:text-sm text-muted-foreground">
                    <span>Painel do Cliente</span>
                    {cliente && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <Badge variant="outline">{cliente.nome_cliente}</Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                  <span className="truncate max-w-[120px] lg:max-w-none">{user?.email}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 overflow-auto">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
