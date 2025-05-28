
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [validToken, setValidToken] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const processRecoveryToken = async () => {
      console.log('🔐 [ResetPasswordForm] === PROCESSANDO TOKEN DE RECUPERAÇÃO ===')
      
      // Extrair tokens do hash (formato: #access_token=...&refresh_token=...)
      const hash = window.location.hash.substring(1) // Remove o #
      const searchParams = new URLSearchParams(window.location.search)
      
      console.log('🔍 [ResetPasswordForm] Hash recebido:', hash)
      console.log('🔍 [ResetPasswordForm] Search params:', window.location.search)
      
      let accessToken = null
      let refreshToken = null
      
      // Primeiro tentar extrair do hash
      if (hash) {
        const hashParams = new URLSearchParams(hash)
        accessToken = hashParams.get('access_token')
        refreshToken = hashParams.get('refresh_token')
        
        console.log('🔑 [ResetPasswordForm] Token do hash - Access:', accessToken ? 'Encontrado' : 'Não encontrado')
        console.log('🔑 [ResetPasswordForm] Token do hash - Refresh:', refreshToken ? 'Encontrado' : 'Não encontrado')
      }
      
      // Se não encontrou no hash, tentar nos query parameters
      if (!accessToken) {
        accessToken = searchParams.get('access_token')
        refreshToken = searchParams.get('refresh_token')
        
        console.log('🔑 [ResetPasswordForm] Token dos params - Access:', accessToken ? 'Encontrado' : 'Não encontrado')
        console.log('🔑 [ResetPasswordForm] Token dos params - Refresh:', refreshToken ? 'Encontrado' : 'Não encontrado')
      }
      
      // Verificar se há erro na URL
      const errorParam = searchParams.get('error') || new URLSearchParams(hash).get('error')
      const errorDescription = searchParams.get('error_description') || new URLSearchParams(hash).get('error_description')
      
      if (errorParam) {
        console.error('❌ [ResetPasswordForm] Erro na URL:', errorParam, errorDescription)
        
        if (errorParam === 'access_denied' && errorDescription?.includes('expired')) {
          setError('O link de recuperação expirou. Solicite um novo link de recuperação.')
        } else {
          setError('Link de recuperação inválido. Solicite um novo link.')
        }
        return
      }
      
      // Se encontrou tokens, tentar configurar a sessão
      if (accessToken && refreshToken) {
        console.log('✅ [ResetPasswordForm] Tokens encontrados, configurando sessão...')
        
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (error) {
            console.error('❌ [ResetPasswordForm] Erro ao configurar sessão:', error)
            setError('Token inválido ou expirado. Solicite um novo link de recuperação.')
          } else {
            console.log('✅ [ResetPasswordForm] Sessão configurada com sucesso!')
            setValidToken(true)
          }
        } catch (error) {
          console.error('❌ [ResetPasswordForm] Erro inesperado ao configurar sessão:', error)
          setError('Erro ao processar o link de recuperação. Tente novamente.')
        }
      } else {
        console.log('⚠️ [ResetPasswordForm] Nenhum token encontrado, verificando sessão atual...')
        
        // Verificar se já há uma sessão ativa
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          console.log('✅ [ResetPasswordForm] Sessão ativa encontrada!')
          setValidToken(true)
        } else {
          console.log('❌ [ResetPasswordForm] Nenhuma sessão válida encontrada')
          setError('Link de recuperação inválido. Solicite um novo link.')
        }
      }
    }

    processRecoveryToken()
  }, [])

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
        } else if (error.message.includes('session_not_found')) {
          setError('Sessão expirada. Solicite um novo link de recuperação.')
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
        
        // Fazer logout após redefinir senha (força novo login)
        await supabase.auth.signOut()
        
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

  // Se não há token válido, mostrar erro
  if (!validToken && !loading) {
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
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Link Inválido</CardTitle>
            <CardDescription>
              {error || 'O link de recuperação é inválido ou expirou.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
              disabled={loading || !password || !confirmPassword || !validToken}
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
