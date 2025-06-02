
import { useAuth } from '@/hooks/useAuth'
import { LoginForm } from '@/components/LoginForm'
import { Dashboard } from '@/components/Dashboard'
import { CreateSellerUserButton } from '@/components/CreateSellerUserButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const Index = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Dashboard />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Login Form */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Sistema de Gestão
            </CardTitle>
            <CardDescription>
              Faça login para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        {/* Admin Tools - Criar Vendedor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ferramentas Administrativas</CardTitle>
            <CardDescription>
              Execute tarefas administrativas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateSellerUserButton />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Index
