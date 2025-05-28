
import { useSimpleAuth } from '@/hooks/useSimpleAuth'
import { AdminDashboard } from './AdminDashboard'
import { GestorDashboard } from './GestorDashboard'
import { ClienteDashboard } from './ClienteDashboard'
import { VendedorDashboard } from './VendedorDashboard'
import { SitesDashboard } from './SitesDashboard'
import { Button } from './ui/button'
import { LogOut, AlertTriangle } from 'lucide-react'

export function Dashboard() {
  const { 
    user, 
    loading,
    signOut,
    isAdmin, 
    isGestor, 
    isCliente, 
    isVendedor,
    isSites,
    currentManagerName 
  } = useSimpleAuth()

  console.log('🎯 [Dashboard] === CARREGANDO DASHBOARD ===')
  console.log('🎯 [Dashboard] User:', user?.email)
  console.log('🎯 [Dashboard] isAdmin:', isAdmin)
  console.log('🎯 [Dashboard] isGestor:', isGestor)
  console.log('🎯 [Dashboard] isCliente:', isCliente)
  console.log('🎯 [Dashboard] isVendedor:', isVendedor)
  console.log('🎯 [Dashboard] isSites:', isSites)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto" />
          <h2 className="text-2xl font-bold">Acesso Negado</h2>
          <p className="text-muted-foreground">
            Você precisa estar logado para acessar esta página.
          </p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  // Header com logout
  const DashboardHeader = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Painel de Gestão
          </h1>
          <p className="text-sm text-gray-600">
            Bem-vindo, {currentManagerName || user.email}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={signOut}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      {isAdmin && (
        <>
          {console.log('✅ [Dashboard] Carregando AdminDashboard')}
          <AdminDashboard />
        </>
      )}
      
      {isGestor && (
        <>
          {console.log('✅ [Dashboard] Carregando GestorDashboard')}
          <GestorDashboard />
        </>
      )}
      
      {isCliente && (
        <>
          {console.log('✅ [Dashboard] Carregando ClienteDashboard')}
          <ClienteDashboard />
        </>
      )}
      
      {isVendedor && (
        <>
          {console.log('✅ [Dashboard] Carregando VendedorDashboard')}
          <VendedorDashboard />
        </>
      )}
      
      {isSites && (
        <>
          {console.log('✅ [Dashboard] Carregando SitesDashboard')}
          <SitesDashboard />
        </>
      )}
      
      {!isAdmin && !isGestor && !isCliente && !isVendedor && !isSites && (
        <>
          {console.log('⚠️ [Dashboard] Usuário não autorizado')}
          <div className="p-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto" />
              <h2 className="text-2xl font-bold">Acesso Não Autorizado</h2>
              <p className="text-muted-foreground">
                Sua conta não possui permissão para acessar este sistema.
              </p>
              <p className="text-sm text-gray-500">
                Entre em contato com o administrador se você acredita que isso é um erro.
              </p>
              <Button onClick={signOut} variant="outline">
                Fazer Logout
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
