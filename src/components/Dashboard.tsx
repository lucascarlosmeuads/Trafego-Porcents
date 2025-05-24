
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { ClientesTable } from './ClientesTable'
import { AdminDashboard } from './AdminDashboard'
import { GestorDashboard } from './GestorDashboard'
import { ManagerSidebar } from './ManagerSidebar'
import { ThemeToggle } from './ThemeToggle'
import { User } from 'lucide-react'
import { useState } from 'react'

export function Dashboard() {
  const { user, signOut, isAdmin, currentManagerName } = useAuth()
  const [selectedManager, setSelectedManager] = useState<string | null>(null)

  const getDisplayTitle = () => {
    if (!isAdmin) return currentManagerName
    if (selectedManager === null) return 'Todos os Clientes'
    return selectedManager
  }

  const getDisplaySubtitle = () => {
    if (!isAdmin) return 'Gestor'
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar só para admin */}
        {isAdmin && (
          <ManagerSidebar 
            selectedManager={selectedManager} 
            onManagerSelect={setSelectedManager} 
          />
        )}
        
        <SidebarInset className="flex-1 min-w-0">
          {/* Header responsivo */}
          <header className="bg-card shadow-sm border-b sticky top-0 z-40">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
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
                  <ThemeToggle />
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut}
                    onMouseDown={handleSignOut}
                    onTouchStart={handleSignOut}
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
            </div>
          </header>

          {/* Content responsivo */}
          <main className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 min-h-0">
            {isAdmin ? (
              <AdminDashboard selectedManager={selectedManager} />
            ) : (
              <GestorDashboard />
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
