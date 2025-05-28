
import { useAuth, AuthProvider } from '@/hooks/useAuth'
import { LoginForm } from '@/components/LoginForm'
import { Dashboard } from '@/components/Dashboard'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AppContent() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Detectar tokens de recuperação de senha na URL
  useEffect(() => {
    const detectPasswordRecoveryToken = () => {
      // Verificar hash fragments (formato: #access_token=...)
      const hash = window.location.hash
      const searchParams = new URLSearchParams(window.location.search)
      
      console.log('🔍 [Index] Verificando tokens de recuperação...')
      console.log('🔍 [Index] Hash:', hash)
      console.log('🔍 [Index] Search params:', window.location.search)
      
      // Verificar se há access_token no hash
      if (hash && hash.includes('access_token=')) {
        console.log('✅ [Index] Token de recuperação encontrado no hash!')
        console.log('🔄 [Index] Redirecionando para /reset-password...')
        
        // Preservar o hash na navegação
        const newUrl = `/reset-password${hash}`
        navigate(newUrl, { replace: true })
        return
      }
      
      // Verificar se há access_token nos query parameters
      if (searchParams.has('access_token')) {
        console.log('✅ [Index] Token de recuperação encontrado nos query params!')
        console.log('🔄 [Index] Redirecionando para /reset-password...')
        
        navigate(`/reset-password${window.location.search}`, { replace: true })
        return
      }
      
      // Verificar se há type=recovery
      if (searchParams.get('type') === 'recovery') {
        console.log('✅ [Index] Link de recuperação detectado!')
        console.log('🔄 [Index] Redirecionando para /reset-password...')
        
        navigate(`/reset-password${window.location.search}`, { replace: true })
        return
      }
      
      console.log('ℹ️ [Index] Nenhum token de recuperação encontrado')
    }

    // Executar verificação apenas se não estiver carregando
    if (!loading) {
      detectPasswordRecoveryToken()
    }
  }, [navigate, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="text-lg">Carregando...</div>
          <div className="text-sm text-muted-foreground">
            Verificando permissões...
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Recarregar se demorar muito
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return <Dashboard />
}

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default Index
