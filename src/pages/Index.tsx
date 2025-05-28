
import { useAuth, AuthProvider } from '@/hooks/useAuth'
import { LoginForm } from '@/components/LoginForm'
import { Dashboard } from '@/components/Dashboard'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AppContent() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Detectar tokens de recuperação de senha na URL
  useEffect(() => {
    const detectPasswordRecoveryToken = () => {
      const hash = window.location.hash
      const searchParams = new URLSearchParams(window.location.search)
      
      console.log('🔍 [Index] Verificando tokens de recuperação...')
      console.log('🔍 [Index] Hash:', hash)
      console.log('🔍 [Index] Search params:', window.location.search)
      
      if (hash && hash.includes('access_token=')) {
        console.log('✅ [Index] Token de recuperação encontrado no hash!')
        console.log('🔄 [Index] Redirecionando para /reset-password...')
        const newUrl = `/reset-password${hash}`
        navigate(newUrl, { replace: true })
        return
      }
      
      if (searchParams.has('access_token')) {
        console.log('✅ [Index] Token de recuperação encontrado nos query params!')
        console.log('🔄 [Index] Redirecionando para /reset-password...')
        navigate(`/reset-password${window.location.search}`, { replace: true })
        return
      }
      
      if (searchParams.get('type') === 'recovery') {
        console.log('✅ [Index] Link de recuperação detectado!')
        console.log('🔄 [Index] Redirecionando para /reset-password...')
        navigate(`/reset-password${window.location.search}`, { replace: true })
        return
      }
      
      console.log('ℹ️ [Index] Nenhum token de recuperação encontrado')
    }

    if (!loading) {
      detectPasswordRecoveryToken()
    }
  }, [navigate, loading])

  // Função para limpar estado e recarregar
  const handleEmergencyReset = () => {
    console.log('🚨 [Index] === RESET DE EMERGÊNCIA ===')
    console.log('🚨 [Index] Limpando localStorage...')
    
    // Limpar todo o estado de autenticação
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        console.log('🗑️ [Index] Removendo chave:', key)
        localStorage.removeItem(key)
      }
    })
    
    console.log('🔄 [Index] Recarregando página...')
    window.location.reload()
  }

  if (loading) {
    console.log('⏳ [Index] === ESTADO DE CARREGAMENTO ===')
    console.log('⏳ [Index] Aguardando determinação de tipo de usuário...')
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="text-lg">Carregando...</div>
          <div className="text-sm text-muted-foreground">
            Verificando permissões de acesso...
          </div>
          
          {/* Botão de emergência que aparece após alguns segundos */}
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
              onClick={handleEmergencyReset}
              className="w-full"
              size="sm"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Reset de Emergência
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground mt-4">
            Se o carregamento demorar muito, use o reset de emergência
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('🔑 [Index] === SEM USUÁRIO AUTENTICADO ===')
    console.log('🔑 [Index] Mostrando formulário de login...')
    return <LoginForm />
  }

  console.log('✅ [Index] === USUÁRIO AUTENTICADO ===')
  console.log('✅ [Index] Email:', user.email)
  console.log('🎯 [Index] Redirecionando para Dashboard...')
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
