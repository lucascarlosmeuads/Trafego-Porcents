
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

export function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    // Verificar se há parâmetros de erro na URL
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    
    if (errorParam) {
      console.error('❌ [ResetPasswordForm] Erro na URL:', errorParam, errorDescription)
      
      if (errorParam === 'access_denied' && errorDescription?.includes('expired')) {
        setError('O link de recuperação expirou. Solicite um novo link de recuperação.')
      } else {
        setError('Link de recuperação inválido. Solicite um novo link.')
      }
    }

    // Verificar se há tokens de recuperação válidos
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (accessToken && refreshToken) {
      console.log('✅ [ResetPasswordForm] Tokens de recuperação encontrados')
      // Os tokens serão automaticamente processados pelo Supabase
    }
  }, [searchParams])

  const validatePasswords = (): boolean => {
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return false
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return false
    }

    return true
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🔐 [ResetPasswordForm] === REDEFININDO SENHA ===')

    try {
      if (!validatePasswords()) {
        return
      }

      console.log('🔄 [ResetPasswordForm] Atualizando senha...')
      
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) {
        console.error('❌ [ResetPasswordForm] Erro ao redefinir senha:', error)
        
        if (error.message.includes('New password should be different')) {
          setError('A nova senha deve ser diferente da senha atual.')
        } else if (error.message.includes('Password should be')) {
          setError('A senha não atende aos critérios de segurança.')
        } else {
          setError('Não foi possível redefinir a senha. Tente novamente.')
        }
      } else {
        console.log('✅ [ResetPasswordForm] Senha redefinida com sucesso!')
        setSuccess(true)
        toast({
          title: "Senha Atualizada",
          description: "Sua senha foi redefinida com sucesso!",
        })
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          navigate('/')
        }, 3000)
      }
    } catch (error) {
      console.error('💥 [ResetPasswordForm] Erro inesperado:', error)
      setError('Algo deu errado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
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
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Senha Redefinida!</CardTitle>
            <CardDescription>
              Sua senha foi atualizada com sucesso. Redirecionando para o login...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
            Digite sua nova senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nova senha"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
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
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmar nova senha"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError('')
                }}
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
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {password && (
              <div className="text-sm text-muted-foreground">
                <p className={password.length >= 6 ? 'text-green-600' : 'text-red-600'}>
                  • Mínimo 6 caracteres {password.length >= 6 ? '✓' : '✗'}
                </p>
                {confirmPassword && (
                  <p className={password === confirmPassword ? 'text-green-600' : 'text-red-600'}>
                    • Senhas coincidem {password === confirmPassword ? '✓' : '✗'}
                  </p>
                )}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !password || !confirmPassword}
            >
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Voltar ao Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
