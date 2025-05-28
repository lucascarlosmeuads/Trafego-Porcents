
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ForgotPasswordForm } from '@/components/ForgotPasswordForm'
import { AlertCircle, HelpCircle } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const { signIn } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('🔐 [LoginForm] === INICIANDO PROCESSO DE LOGIN ===')
    console.log('📧 [LoginForm] Email:', email)

    try {
      // Login flow
      console.log('🔑 [LoginForm] Tentando fazer login...')
      
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
        
        // Mensagens de erro mais específicas para login
        let errorMessage = "Email ou senha incorretos. Verifique suas credenciais."
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos. Tente "Esqueci minha senha" se precisar.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Use "Esqueci minha senha" para resolver.'
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
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary">
        <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
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
          <CardTitle className="text-2xl font-bold">Painel de Gestão</CardTitle>
          <CardDescription>
            Entre com suas credenciais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                disabled={loading}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
                minLength={6}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processando...' : 'Entrar'}
            </Button>
            
            {/* Seção de ajuda destacada */}
            <div className="border-t pt-4 mt-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                <div className="flex items-center space-x-2 text-blue-800">
                  <HelpCircle className="w-5 h-5" />
                  <span className="font-semibold text-sm">Problemas para entrar?</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Clique no botão abaixo para resolver automaticamente
                </p>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full border-blue-300 hover:bg-blue-50 hover:border-blue-400"
                onClick={() => setShowForgotPassword(true)}
                disabled={loading}
              >
                <AlertCircle className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-blue-700 font-semibold">Esqueci minha senha / Não consigo entrar</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
