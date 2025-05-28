
import { useSimpleAuth, SimpleAuthProvider } from '@/hooks/useSimpleAuth'
import { LoginForm } from '@/components/LoginForm'
import { Dashboard } from '@/components/Dashboard'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AppContent() {
  const { user, loading } = useSimpleAuth()
  const navigate = useNavigate()

  // Detectar tokens de recuperação de senha na URL
  useEffect(() => {
    const detectPasswordRecoveryToken = () => {
      const hash = window.location.hash
      const searchParams = new URLSearchParams(window.location.search)
      
      console.log('🔍 [Index] Verificando tokens de recuperação...')
      
      if (hash && hash.includes('access_token=')) {
        console.log('✅ [Index] Token de recuperação encontrado no hash!')
        const newUrl = `/reset-password${hash}`
        navigate(newUrl, { replace: true })
        return
      }
      
      if (searchParams.has('access_token') || searchParams.get('type') === 'recovery') {
        console.log('✅ [Index] Token de recuperação encontrado!')
        navigate(`/reset-password${window.location.search}`, { replace: true })
        return
      }
      
      console.log('ℹ️ [Index] Nenhum token de recuperação encontrado')
    }

    if (!loading) {
      detectPasswordRecoveryToken()
    }
  }, [navigate, loading])

  // Função para limpeza completa do estado
  const handleCompleteReset = () => {
    console.log('🚨 [Index] === LIMPEZA COMPLETA ===')
    
    // Limpar TUDO do localStorage relacionado ao Supabase
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase') || key.includes('sb-') || key.includes('auth')) {
        console.log('🗑️ [Index] Removendo chave:', key)
        localStorage.removeItem(key)
      }
    })
    
    // Limpar sessionStorage também
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase') || key.includes('sb-') || key.includes('auth')) {
        console.log('🗑️ [Index] Removendo chave do sessionStorage:', key)
        sessionStorage.removeItem(key)
      }
    })
    
    console.log('🔄 [Index] Recarregando página...')
    window.location.href = '/'
  }

  // Log do estado atual
  console.log('📊 [Index] Estado:', { 
    loading, 
    userPresent: !!user, 
    userEmail: user?.email || 'null' 
  })

  if (loading) {
    console.log('⏳ [Index] === CARREGANDO ===')
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="text-lg">Carregando...</div>
          <div className="text-sm text-muted-foreground">
            Verificando permissões de acesso...
          </div>
          
          <div className="mt-6 space-y-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar Página
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={handleCompleteReset}
              className="w-full"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpeza Completa
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground mt-4">
            Se o problema persistir, use a limpeza completa
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('🔑 [Index] === SEM USUÁRIO - MOSTRANDO LOGIN ===')
    return <LoginForm />
  }

  console.log('✅ [Index] === USUÁRIO AUTENTICADO - MOSTRANDO DASHBOARD ===')
  console.log('✅ [Index] Email:', user.email)
  return <Dashboard />
}

const Index = () => {
  return (
    <SimpleAuthProvider>
      <AppContent />
    </SimpleAuthProvider>
  )
}

export default Index
