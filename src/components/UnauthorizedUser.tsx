
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, LogOut, Mail } from 'lucide-react'

export function UnauthorizedUser() {
  const { user, signOut } = useAuth()
  const [isRetrying, setIsRetrying] = useState(false)

  const handleTryAgain = () => {
    setIsRetrying(true)
    // Força uma nova verificação recarregando a página
    window.location.reload()
  }

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            Acesso Não Autorizado
          </CardTitle>
          <CardDescription className="text-base">
            Não foi possível verificar suas permissões de acesso
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informações do usuário */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Email autenticado:</span>
            </div>
            <p className="text-sm text-muted-foreground break-all">
              {user?.email || 'Não identificado'}
            </p>
          </div>

          {/* Possíveis causas */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Possíveis causas:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Sua conta ainda não foi ativada no sistema</li>
              <li>• Email não cadastrado nas tabelas de usuários</li>
              <li>• Problema temporário na verificação</li>
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button 
              onClick={handleTryAgain} 
              className="w-full"
              disabled={isRetrying}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Verificando...' : 'Tentar Novamente'}
            </Button>
            
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full"
              disabled={isRetrying}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Fazer Logout
            </Button>
          </div>

          {/* Informações de contato */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Se o problema persistir, entre em contato com o suporte
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UnauthorizedUser
