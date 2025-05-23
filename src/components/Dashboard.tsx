
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { ClientesTable } from './ClientesTable'
import { AdminDashboard } from './AdminDashboard'
import { ManagerSidebar } from './ManagerSidebar'
import { User } from 'lucide-react'

export function Dashboard() {
  const { user, signOut, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState(isAdmin ? "dashboard" : "clientes")
  const [selectedManager, setSelectedManager] = useState("Andreza")

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <ManagerSidebar 
          selectedManager={selectedManager} 
          onManagerSelect={setSelectedManager} 
        />
        
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="md:hidden" />
                  <h1 className="text-2xl font-bold text-gray-900">Painel de Gestão</h1>
                  <span className="text-sm text-gray-500">
                    {isAdmin ? 'Administrador' : 'Gestor'}
                  </span>
                  <span className="text-sm text-blue-600 font-medium">
                    {selectedManager}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  <Button variant="outline" onClick={signOut}>
                    Sair
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isAdmin ? (
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="clientes">Clientes</TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard" className="mt-6">
                  <AdminDashboard />
                </TabsContent>
                <TabsContent value="clientes" className="mt-6">
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
