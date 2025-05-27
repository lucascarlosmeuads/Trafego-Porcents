
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, Users, TrendingUp } from 'lucide-react'
import { ClientesTable } from './ClientesTable'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { CriadorSiteSidebar } from './CriadorSiteDashboard/CriadorSiteSidebar'
import { useIsMobile } from '@/hooks/use-mobile'

export function CriadorSiteDashboard() {
  const { user, currentManagerName } = useAuth()
  const [activeTab, setActiveTab] = useState('sites-pendentes')
  const isMobile = useIsMobile()

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-500 rounded-full p-3">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Bem-vindo, {currentManagerName}!
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Painel do Criador de Sites - {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sua Função</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Criador de Sites</div>
                  <p className="text-xs text-muted-foreground">
                    Responsável por criar sites para clientes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Ativo</div>
                  <p className="text-xs text-muted-foreground">
                    Sistema funcionando normalmente
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Instructions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🌐 Instruções para Criadores de Sites</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Visualize os clientes aguardando sites</p>
                    <p className="text-sm text-gray-600">Acesse a lista de clientes que precisam de sites criados</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Acesse os materiais do briefing</p>
                    <p className="text-sm text-gray-600">Use os botões "Ver materiais" e "Ver briefing" para entender o projeto</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Finalize e adicione o link do site</p>
                    <p className="text-sm text-gray-600">Após criar o site, adicione o link na coluna correspondente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'sites-pendentes':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Sites Aguardando Criação</h2>
            <p className="text-muted-foreground">
              Clientes que estão aguardando a criação de seus sites
            </p>
            <ClientesTable 
              userEmail={user?.email || ''} 
              filterType="sites-pendentes" 
            />
          </div>
        )

      default:
        return <div>Página não encontrada</div>
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <CriadorSiteSidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <SidebarInset className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <header className="bg-card shadow-sm border-b sticky top-0 z-40 w-full">
            <div className={`flex justify-between items-center ${
              isMobile ? 'py-3 px-3' : 'py-4 px-4 sm:px-6 lg:px-8'
            }`}>
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                <SidebarTrigger className={`flex-shrink-0 ${isMobile ? 'w-8 h-8' : ''}`} />
                <div className="min-w-0 flex-1">
                  <h1 className={`${
                    isMobile ? 'text-base' : 'text-lg sm:text-xl lg:text-2xl'
                  } font-bold text-foreground truncate`}>
                    {activeTab === 'dashboard' && 'Dashboard'}
                    {activeTab === 'sites-pendentes' && 'Sites Pendentes'}
                  </h1>
                  <div className={`flex flex-col sm:flex-row sm:items-center sm:space-x-2 ${
                    isMobile ? 'text-xs' : 'text-xs sm:text-sm'
                  } text-muted-foreground`}>
                    <span>Painel do Criador de Sites</span>
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
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
