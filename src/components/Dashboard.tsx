
import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { 
  LazyAdminDashboard, 
  LazyGestorDashboard, 
  LazyClienteDashboard,
  LazyClienteNovoDashboard 
} from './LazyComponents'
import { LoadingFallback } from './LoadingFallback'
import { VendedorDashboard } from './VendedorDashboard'
import { SimpleVendedorDashboard } from './SimpleVendedorDashboard'
import { SitesDashboard } from './SitesDashboard'
import { MetaAdsDashboard } from './MetaAdsDashboard'
import { ManagerSidebar } from './ManagerSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, LogOut, Loader2 } from 'lucide-react'

export function Dashboard() {
  const { 
    user, 
    loading, 
    isAdmin, 
    isGestor,
    isCliente,
    isVendedor,
    isSites,
    isRelatorios,
    isClienteNovo,
    signOut
  } = useAuth()

  const [selectedManager, setSelectedManager] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loggingOut, setLoggingOut] = useState(false)

  console.log('🔍 [Dashboard] === DEBUGGING ROTEAMENTO DE DASHBOARD ===')
  console.log('🔍 [Dashboard] Estado de autenticação:', {
    userEmail: user?.email,
    userEmailRaw: user?.email ? `"${user.email}"` : 'null',
    loading,
    isAdmin,
    isGestor,
    isCliente,
    isVendedor,
    isSites,
    isRelatorios,
    isClienteNovo
  })

  // Reset tab when user type changes
  useEffect(() => {
    setActiveTab('dashboard')
    setSelectedManager(null)
  }, [isAdmin, isGestor, isCliente, isVendedor, isSites, isRelatorios, isClienteNovo])

  const handleSignOut = async () => {
    console.log('🚪 [Dashboard] Iniciando logout do botão de erro')
    setLoggingOut(true)
    
    try {
      await signOut()
    } catch (error) {
      console.error('❌ [Dashboard] Erro no logout, forçando redirecionamento:', error)
      // Fallback: forçar redirecionamento mesmo com erro
      window.location.href = '/'
    }
  }

  if (loading) {
    console.log('⏳ [Dashboard] Mostrando loading geral')
    return <LoadingFallback />
  }

  if (!user) {
    console.log('❌ [Dashboard] Usuário não autenticado')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Usuário não autenticado</div>
      </div>
    )
  }

  // Debug: Mostrar qual é o email exato que está sendo processado
  console.log('🎯 [Dashboard] Email do usuário para verificação:', `"${user.email}"`)
  console.log('🎯 [Dashboard] Tipos de usuário detectados:', {
    isAdmin: isAdmin ? '✅' : '❌',
    isGestor: isGestor ? '✅' : '❌', 
    isCliente: isCliente ? '✅' : '❌',
    isVendedor: isVendedor ? '✅' : '❌',
    isSites: isSites ? '✅' : '❌',
    isRelatorios: isRelatorios ? '✅' : '❌',
    isClienteNovo: isClienteNovo ? '✅' : '❌'
  })

  // Cliente Dashboard
  if (isCliente) {
    console.log('✅ [Dashboard] Direcionando para ClienteDashboard')
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LazyClienteDashboard />
      </Suspense>
    )
  }

  // Vendedor Dashboards (não lazy por enquanto para evitar erros)
  if (isVendedor) {
    console.log('✅ [Dashboard] Direcionando para VendedorDashboard')
    const isSimpleVendedor = user.email?.includes('simple') || false
    
    if (isSimpleVendedor) {
      console.log('🎯 [Dashboard] Usuário é vendedor simples')
      return <SimpleVendedorDashboard />
    }
    
    console.log('🎯 [Dashboard] Usuário é vendedor padrão')
    return <VendedorDashboard />
  }

  // Sites Dashboard (não lazy por enquanto)
  if (isSites) {
    console.log('✅ [Dashboard] Direcionando para SitesDashboard')
    return <SitesDashboard />
  }

  // Meta Ads Dashboard (NOVO)
  if (isRelatorios) {
    console.log('✅ [Dashboard] Direcionando para MetaAdsDashboard')
    return <MetaAdsDashboard />
  }

  // Cliente Novo Dashboard (NOVO)
  if (isClienteNovo) {
    console.log('✅ [Dashboard] Direcionando para ClienteNovoDashboard')
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LazyClienteNovoDashboard />
      </Suspense>
    )
  }

  // Admin/Gestor Dashboards
  if (isAdmin || isGestor) {
    console.log('✅ [Dashboard] Direcionando para Admin/Gestor Dashboard')
    return (
      <div className="min-h-screen flex w-full bg-background">
        <ManagerSidebar
          selectedManager={selectedManager}
          onManagerSelect={setSelectedManager}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <div className="flex-1 overflow-auto min-h-screen">
          <div className="p-6 w-full max-w-full">
            <Suspense fallback={<LoadingFallback />}>
              {/* Admin Dashboard */}
              {isAdmin && (
                <LazyAdminDashboard
                  selectedManager={selectedManager}
                  onManagerSelect={setSelectedManager}
                  activeTab={activeTab}
                />
              )}
              
              {/* Gestor Dashboard */}
              {isGestor && (
                <LazyGestorDashboard activeTab={activeTab} />
              )}
            </Suspense>
          </div>
        </div>
      </div>
    )
  }

  console.log('❌ [Dashboard] Tipo de usuário não autorizado')
  console.log('❌ [Dashboard] Detalhes para debug:')
  console.log('   - Email:', user.email)
  console.log('   - Todos os tipos são false, verificar authHelpers.ts')
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{backgroundColor: '#0a0a0a'}}>
      <div className="w-full max-w-md px-4">
        <Card className="border-red-200 shadow-lg" style={{backgroundColor: '#1a1a1a', borderColor: '#dc2626'}}>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-red-600">
              Acesso Não Autorizado
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-gray-300">
                Seu usuário não possui autorização para acessar este sistema.
              </p>
              <div className="text-sm text-gray-500 bg-gray-800 p-3 rounded border">
                <p className="font-mono break-all">
                  Email: {user.email}
                </p>
              </div>
            </div>
            
            <div className="space-y-3 pt-4">
              <p className="text-sm text-gray-400">
                Se você acredita que isso é um erro, entre em contato com o administrador ou tente fazer login novamente.
              </p>
              
              <Button 
                onClick={handleSignOut}
                disabled={loggingOut}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              >
                {loggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saindo...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Voltar ao Login
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
