
import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { 
  LazyAdminDashboard, 
  LazyGestorDashboard, 
  LazyClienteDashboard 
} from './LazyComponents'
import { LoadingFallback } from './LoadingFallback'
import { VendedorDashboard } from './VendedorDashboard'
import { SimpleVendedorDashboard } from './SimpleVendedorDashboard'
import { SitesDashboard } from './SitesDashboard'
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
    signOut
  } = useAuth()

  const navigate = useNavigate()
  const [selectedManager, setSelectedManager] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loggingOut, setLoggingOut] = useState(false)

  console.log('🚨 [Dashboard] === DEBUGGING COMPLETO ===')
  console.log('🚨 [Dashboard] URL atual:', window.location.href)
  console.log('🚨 [Dashboard] Usuário:', user?.email)
  console.log('🚨 [Dashboard] Loading:', loading)
  console.log('🚨 [Dashboard] Tipos de usuário:', {
    isAdmin,
    isGestor,
    isCliente,
    isVendedor,
    isSites,
    isRelatorios
  })

  // NOVO: Redirecionamento imediato para relatórios
  useEffect(() => {
    console.log('🚨 [Dashboard] useEffect triggered:', { loading, user: !!user, isRelatorios })
    
    if (!loading && user && isRelatorios) {
      console.log('🚨 [Dashboard] REDIRECIONANDO para /admin-relatorios')
      console.log('🚨 [Dashboard] Navegando de:', window.location.pathname)
      navigate('/admin-relatorios', { replace: true })
      return
    }
  }, [loading, user, isRelatorios, navigate])

  // Reset tab when user type changes
  useEffect(() => {
    setActiveTab('dashboard')
    setSelectedManager(null)
  }, [isAdmin, isGestor, isCliente, isVendedor, isSites, isRelatorios])

  const handleSignOut = async () => {
    console.log('🚪 [Dashboard] Iniciando logout')
    setLoggingOut(true)
    
    try {
      await signOut()
    } catch (error) {
      console.error('❌ [Dashboard] Erro no logout:', error)
      window.location.href = '/'
    }
  }

  if (loading) {
    console.log('⏳ [Dashboard] Mostrando loading...')
    return <LoadingFallback />
  }

  if (!user) {
    console.log('❌ [Dashboard] Usuário não autenticado, redirecionando para login')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecionando para login...</div>
      </div>
    )
  }

  // Se for usuário de relatórios, mostrar loading enquanto redireciona
  if (isRelatorios) {
    console.log('📊 [Dashboard] Usuário de relatórios detectado, aguardando redirecionamento...')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
          <p className="text-gray-300">Redirecionando para painel de relatórios...</p>
        </div>
      </div>
    )
  }

  // Cliente Dashboard
  if (isCliente) {
    console.log('✅ [Dashboard] Direcionando para ClienteDashboard')
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LazyClienteDashboard />
      </Suspense>
    )
  }

  // Vendedor Dashboards
  if (isVendedor) {
    console.log('✅ [Dashboard] Direcionando para VendedorDashboard')
    const isSimpleVendedor = user.email?.includes('simple') || false
    
    if (isSimpleVendedor) {
      return <SimpleVendedorDashboard />
    }
    
    return <VendedorDashboard />
  }

  // Sites Dashboard
  if (isSites) {
    console.log('✅ [Dashboard] Direcionando para SitesDashboard')
    return <SitesDashboard />
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
              {isAdmin && (
                <LazyAdminDashboard
                  selectedManager={selectedManager}
                  onManagerSelect={setSelectedManager}
                  activeTab={activeTab}
                />
              )}
              
              {isGestor && (
                <LazyGestorDashboard activeTab={activeTab} />
              )}
            </Suspense>
          </div>
        </div>
      </div>
    )
  }

  console.log('❌ [Dashboard] Tipo de usuário não reconhecido')
  
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
                <p className="font-mono text-xs mt-2">
                  isRelatorios: {isRelatorios ? 'true' : 'false'}
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
