
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePasswordReset } from '@/hooks/usePasswordReset'
import { extractTokensFromUrl } from '@/utils/passwordResetHelpers'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react'

export function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [hasValidToken, setHasValidToken] = useState(false)
  const { loading, resetPassword } = usePasswordReset()
  const { toast } = useToast()

  useEffect(() => {
    const setupSession = async () => {
      console.log('🔐 [ResetPassword] Iniciando setup da sessão de recuperação...')
      setSessionLoading(true)
      
      try {
        // Verificar se há tokens válidos na URL
        const tokens = extractTokensFromUrl()
        
        if (!tokens || tokens.type !== 'recovery') {
          console.log('❌ [ResetPassword] Tokens de recuperação não encontrados ou inválidos')
          setHasValidToken(false)
          setSessionLoading(false)
          return
        }

        console.log('✅ [ResetPassword] Tokens válidos encontrados, configurando sessão...')
        console.log('🔑 [ResetPassword] Access token:', `${tokens.access_token.substring(0, 20)}...`)
        console.log('🔑 [ResetPassword] Refresh token:', tokens.refresh_token ? `${tokens.refresh_token.substring(0, 20)}...` : 'vazio')

        // Configurar a sessão no Supabase
        const { data, error } = await supabase.auth.setSession({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || ''
        })

        if (error) {
          console.error('❌ [ResetPassword] Erro ao configurar sessão:', error)
          toast({
            title: "Link Inválido",
            description: "Link de recuperação inválido ou expirado. Solicite um novo.",
            variant: "destructive"
          })
          setHasValidToken(false)
          setSessionLoading(false)
          return
        }

        if (data.session && data.user) {
          console.log('✅ [ResetPassword] Sessão configurada com sucesso!')
          console.log('👤 [ResetPassword] Usuário autenticado:', data.user.email)
          setHasValidToken(true)
          setSessionReady(true)
        } else {
          console.error('❌ [ResetPassword] Sessão ou usuário não encontrado após setSession')
          setHasValidToken(false)
        }

      } catch (error) {
        console.error('💥 [ResetPassword] Erro inesperado ao configurar sessão:', error)
        toast({
          title: "Erro",
          description: "Erro interno. Tente solicitar um novo link de recuperação.",
          variant: "destructive"
        })
        setHasValidToken(false)
      } finally {
        setSessionLoading(false)
      }
    }

    setupSession()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sessionReady) {
      toast({
        title: "Erro",
        description: "Sessão não está pronta. Tente recarregar a página.",
        variant: "destructive"
      })
      return
    }

    console.log('🔐 [ResetPassword] Iniciando redefinição de senha...')
    await resetPassword(newPassword, confirmPassword)
  }

  // Mostrar loading enquanto verifica a sessão
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Verificando Link</CardTitle>
            <CardDescription>
              Aguarde enquanto validamos seu link de recuperação...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Mostrar erro se não há token válido
  if (!hasValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">Link Inválido</CardTitle>
            <CardDescription>
              Este link de recuperação é inválido ou já expirou
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 text-center">
                Solicite um novo link de recuperação de senha através da tela de login.
              </div>
              <Button 
                type="button" 
                className="w-full"
                onClick={() => window.location.href = '/'}
              >
                Ir para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mostrar formulário de redefinição apenas se a sessão estiver pronta
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/fd16b733-7b5d-498a-b2bd-19347f5f0518.png"
              alt="Tráfego Porcents Logo" 
              className="h-32 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Nova Senha</CardTitle>
          <CardDescription>
            Digite sua nova senha para redefinir o acesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nova senha (mínimo 6 caracteres)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full pr-10"
                disabled={loading}
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmar nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pr-10"
                disabled={loading}
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <div className="text-sm text-red-600">
                As senhas não coincidem
              </div>
            )}

            {newPassword && newPassword.length < 6 && (
              <div className="text-sm text-red-600">
                A senha deve ter pelo menos 6 caracteres
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6 || !sessionReady}
            >
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
