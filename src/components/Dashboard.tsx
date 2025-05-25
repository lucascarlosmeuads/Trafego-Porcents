
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminDashboard } from './AdminDashboard'
import { GestorDashboard } from './GestorDashboard'
import { ClienteDashboard } from './ClienteDashboard'
import { ManagerSidebar } from './ManagerSidebar'
import { User, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function Dashboard() {
  const { user, signOut, isAdmin, isGestor, isCliente, currentManagerName, loading } = useAuth()
  const [selectedManager, setSelectedManager] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('clientes')

  console.log('🔍 [Dashboard] Estado atual:')
  console.log('   - user:', user?.email)
  console.log('   - loading:', loading)
  console.log('   - isAdmin:', isAdmin)
  console.log('   - isGestor:', isGestor)
  console.log('   - isCliente:', isCliente)
  console.log('   - currentManagerName:', currentManagerName)

  // Loading otimizado com timeout máximo
  if (loading) {
    console.log('🔄 [Dashboard] Ainda carregando...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-lg">Carregando...</div>
          <div className="text-sm text-muted-foreground">
            Verificando permissões...
          </div>
        </div>
      </div>
    )
  }

  // CORREÇÃO CRÍTICA: Verificar se tem usuário E se pelo menos um dos tipos é true
  const hasValidUserType = isAdmin || isGestor || isCliente
  const isUnauthorized = user && !hasValidUserType

  console.log('🎯 [Dashboard] Verificação de acesso:')
  console.log('   - user exists:', !!user)
  console.log('   - hasValidUserType:', hasValidUserType)
  console.log('   - isUnauthorized:', isUnauthorized)
  console.log('   - Qual painel será mostrado:', 
    isCliente ? 'CLIENTE DASHBOARD' :
    isGestor ? 'GESTOR DASHBOARD' :
    isAdmin ? 'ADMIN DASHBOARD' :
    'ACESSO NEGADO'
  )

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
    
    console.log('🚪 [Dashboard] Logout solicitado')
    
    try {
      await signOut()
    } catch (error) {
      console.error('❌ [Dashboard] Erro no logout:', error)
      // Fallback: forçar reload mesmo com erro
      window.location.href = '/'
    }
  }

  // Mostrar tela de acesso negado APENAS se não tiver nenhum tipo válido
  if (isUnauthorized) {
    console.log('❌ [Dashboard] Mostrando tela de acesso negado')
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
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Se chegou até aqui, mostrar o painel correto
  console.log('✅ [Dashboard] Mostrando painel para usuário autorizado')

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
          {/* Header responsivo */}
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
                  size="sm"
                  className="cursor-pointer"
                >
                  Sair
                </Button>
              </div>
            </div>
          </header>

          {/* Content responsivo */}
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
                <div className="text-lg">Verificando acesso...</div>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
