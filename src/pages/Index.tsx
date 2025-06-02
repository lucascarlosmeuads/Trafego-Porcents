
import { useAuth, AuthProvider } from '@/hooks/useAuth'
import { LoginForm } from '@/components/LoginForm'
import { Dashboard } from '@/components/Dashboard'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
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
