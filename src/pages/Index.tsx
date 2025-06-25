
import { useAuth, AuthProvider } from '@/hooks/useAuth'
import { LoginForm } from '@/components/LoginForm'
import { Dashboard } from '@/components/Dashboard'
import { EmergencyLogout } from '@/components/EmergencyLogout'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
        {/* Botão de emergência disponível mesmo durante carregamento */}
        <EmergencyLogout />
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <>
      <Dashboard />
      {/* Botão de logout de emergência sempre visível */}
      <EmergencyLogout />
    </>
  )
}

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default Index
