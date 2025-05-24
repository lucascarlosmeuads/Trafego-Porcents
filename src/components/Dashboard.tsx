
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { ClientesTable } from './ClientesTable'
import { AdminDashboard } from './AdminDashboard'
import { ManagerSidebar } from './ManagerSidebar'
import { ThemeToggle } from './ThemeToggle'
import { User } from 'lucide-react'

export function Dashboard() {
  const { user, signOut, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState(isAdmin ? "dashboard" : "clientes")
  const [selectedManager, setSelectedManager] = useState("Andreza")

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ManagerSidebar 
          selectedManager={selectedManager} 
          onManagerSelect={setSelectedManager} 
        />
        
        <SidebarInset className="flex-1 min-w-0">
          {/* Header responsivo */}
          <header className="bg-card shadow-sm border-b sticky top-0 z-40">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                  <SidebarTrigger className="flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate">
                      Painel de Gestão
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs sm:text-sm text-muted-foreground">
                      <span>{isAdmin ? 'Administrador' : 'Gestor'}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="text-primary font-medium truncate">
                        {selectedManager}
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
                  <Button variant="outline" onClick={signOut} size="sm">
                    Sair
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Content responsivo */}
          <main className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 min-h-0">
            {isAdmin ? (
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto sm:mx-0">
                  <TabsTrigger value="dashboard" className="text-xs sm:text-sm">
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="clientes" className="text-xs sm:text-sm">
                    Clientes
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard" className="mt-4 sm:mt-6">
                  <AdminDashboard />
                </TabsContent>
                <TabsContent value="clientes" className="mt-4 sm:mt-6">
                  <ClientesTable selectedManager={selectedManager} />
                </TabsContent>
              </Tabs>
            ) : (
              <ClientesTable selectedManager={selectedManager} />
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
