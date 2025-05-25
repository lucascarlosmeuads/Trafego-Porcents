
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminDashboard } from './AdminDashboard'
import { GestorDashboard } from './GestorDashboard'
import { ClienteDashboard } from './ClienteDashboard'
import { ManagerSidebar } from './ManagerSidebar'
import { User, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function Dashboard() {
  const { user, signOut, isAdmin, isGestor, isCliente, currentManagerName, loading } = useAuth()
  const [selectedManager, setSelectedManager] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('clientes')

  // Verificar se o usuário tem permissão após o carregamento
  const isUnauthorized = !loading && user && !isAdmin && !isGestor && !isCliente

  const getDisplayTitle = () => {
    if (isCliente) return 'Minha Campanha'
    if (!isAdmin) return currentManagerName
    
    if (activeTab === 'dashboard') return 'Dashboard Geral'
    if (activeTab === 'problemas' || selectedManager === '__PROBLEMAS__') return 'Problemas Pendentes'
    if (selectedManager === '__GESTORES__') return 'Gerenciamento de Gestores'
    if (selectedManager === null) return 'Todos os Clientes'
    return selectedManager
  }

  const getDisplaySubtitle = () => {
    if (isCliente) return 'Painel do Cliente'
    if (!isAdmin) return 'Gestor'
    
    if (activeTab === 'dashboard') return 'Análise Completa'
    if (activeTab === 'problemas' || selectedManager === '__PROBLEMAS__') return 'Resolução de Problemas'
    if (selectedManager === '__GESTORES__') return 'Configuração de Equipe'
    if (selectedManager === null) return 'Visualização Completa'
    return 'Gestor Individual'
  }

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('🚪 [Dashboard] Botão Sair clicado')
    
    try {
      await signOut()
      console.log('✅ [Dashboard] Logout realizado com sucesso')
    } catch (error) {
      console.error('❌ [Dashboard] Erro ao fazer logout:', error)
    }
  }

  const handleSignOutTouch = async (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('🚪 [Dashboard] Botão Sair clicado (touch)')
    
    try {
      await signOut()
      console.log('✅ [Dashboard] Logout realizado com sucesso')
    } catch (error) {
      console.error('❌ [Dashboard] Erro ao fazer logout:', error)
    }
  }

  // Mostrar tela de acesso negado para usuários não autorizados
  if (isUnauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Seu usuário não possui permissão para acessar este sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Email: <span className="font-medium">{user?.email}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Para solicitar acesso, entre em contato com o administrador do sistema.
            </p>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              Fazer Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar só para admin */}
        {isAdmin && (
          <ManagerSidebar 
            selectedManager={selectedManager} 
            onManagerSelect={setSelectedManager}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}
        
        <SidebarInset className="flex-1 min-w-0 flex flex-col">
          {/* Header responsivo com posicionamento correto */}
          <header className="bg-card shadow-sm border-b sticky top-0 z-40 w-full">
            <div className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                {isAdmin && <SidebarTrigger className="flex-shrink-0" />}
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate">
                    Painel de Gestão
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs sm:text-sm text-muted-foreground">
                    <span>{getDisplaySubtitle()}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-primary font-medium truncate">
                      {getDisplayTitle()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="truncate max-w-[120px] lg:max-w-none">{user?.email}</span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  onMouseDown={handleSignOut}
                  onTouchStart={handleSignOutTouch}
                  size="sm"
                  className="cursor-pointer select-none touch-manipulation"
                  style={{ 
                    pointerEvents: 'auto',
                    zIndex: 9999,
                    position: 'relative'
                  }}
                >
                  Sair
                </Button>
              </div>
            </div>
          </header>

          {/* Content responsivo com padding adequado */}
          <main className="flex-1 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 overflow-auto">
            {isAdmin ? (
              <AdminDashboard 
                selectedManager={selectedManager}
                onManagerSelect={setSelectedManager}
                activeTab={activeTab}
              />
            ) : isGestor ? (
              <GestorDashboard />
            ) : isCliente ? (
              <ClienteDashboard />
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-lg">Carregando...</div>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
