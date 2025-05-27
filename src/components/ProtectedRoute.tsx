
import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LoginPage } from '@/pages/Login'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  if (!user) {
    return <LoginPage />
  }

  return <>{children}</>
}
