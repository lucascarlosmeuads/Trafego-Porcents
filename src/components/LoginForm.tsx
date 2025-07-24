
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ForgotPasswordForm } from '@/components/ForgotPasswordForm'
import { Eye, EyeOff, Loader2, Smartphone } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const { signIn } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('🔐 [LoginForm] === INICIANDO PROCESSO DE LOGIN ===')
    console.log('📧 [LoginForm] Email:', email)
    console.log('📱 [LoginForm] Mobile User Agent:', navigator.userAgent)

    try {
      if (!email || !password) {
        toast({
          title: "Erro",
          description: "Email e senha são obrigatórios",
          variant: "destructive"
        })
        return
      }
      
      const { error } = await signIn(email, password)
      
      if (error) {
        console.error('❌ [LoginForm] Erro de login:', error)
        
        let errorMessage = "Email ou senha incorretos. Verifique suas credenciais."
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique seu email para confirmar a conta.'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Formato de email inválido.'
        }
        
        toast({
          title: "Erro de Login",
          description: errorMessage,
          variant: "destructive"
        })
      } else {
        console.log('✅ [LoginForm] Login realizado com sucesso para:', email)
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        })
      }
    } catch (error) {
      console.error('💥 [LoginForm] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Algo deu errado. Verifique sua conexão e tente novamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
        <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/fd16b733-7b5d-498a-b2bd-19347f5f0518.png"
              alt="Tráfego Porcents Logo" 
              className="h-32 w-auto object-contain"
              onError={(e) => {
                console.log('Erro ao carregar logo:', e)
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Painel de Gestão
          </CardTitle>
          <CardDescription className="text-gray-300">
            Entre com suas credenciais
          </CardDescription>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-blue-400">
            <Smartphone className="h-4 w-4" />
            <span className="text-blue-400">Otimizado para mobile</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-base text-white placeholder:text-gray-400"
                disabled={loading}
                autoComplete="email"
                inputMode="email"
              />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-base pr-12 text-white placeholder:text-gray-400"
                minLength={6}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg text-base" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-white">Processando...</span>
                </div>
              ) : (
                <span className="text-white">Entrar</span>
              )}
            </Button>
            
            <div className="text-center pt-2">
              <Button
                type="button"
                variant="link"
                className="text-sm text-blue-400 hover:text-blue-300 h-auto p-0"
                onClick={() => setShowForgotPassword(true)}
                disabled={loading}
              >
                Esqueci minha senha
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
