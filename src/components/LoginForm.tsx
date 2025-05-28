
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const { toast } = useToast()

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('🔐 [LoginForm] === INICIANDO RECUPERAÇÃO DE SENHA ===')
    console.log('📧 [LoginForm] Email para recuperação:', resetEmail)

    try {
      // Validação do email
      if (!resetEmail || !resetEmail.includes('@') || resetEmail.length < 5) {
        console.error('❌ [LoginForm] Email inválido para recuperação:', resetEmail)
        toast({
          title: "Email Inválido",
          description: "Por favor, insira um email válido para recuperação.",
          variant: "destructive"
        })
        return
      }

      console.log('📤 [LoginForm] Enviando email de recuperação...')
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/`
      })
      
      if (error) {
        console.error('❌ [LoginForm] Erro ao enviar email de recuperação:', error)
        toast({
          title: "Erro na Recuperação",
          description: "Não foi possível enviar o email de recuperação. Tente novamente.",
          variant: "destructive"
        })
      } else {
        console.log('✅ [LoginForm] Email de recuperação enviado com sucesso!')
        toast({
          title: "Email Enviado",
          description: "Verifique seu email para instruções de recuperação de senha.",
        })
        setResetEmail('')
        setIsPasswordReset(false)
      }
    } catch (error) {
      console.error('💥 [LoginForm] Erro inesperado na recuperação:', error)
      toast({
        title: "Erro",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('🔐 [LoginForm] === INICIANDO PROCESSO DE LOGIN ===')
    console.log('📧 [LoginForm] Email:', email)

    try {
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
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Renderização condicional baseada no modo atual
  if (isPasswordReset) {
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
            <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
            <CardDescription>
              Digite seu email para receber instruções de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Seu email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full"
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsPasswordReset(false)
                  setResetEmail('')
                }}
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
            
            {/* Link para recuperação de senha */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
                onClick={() => setIsPasswordReset(true)}
                disabled={loading}
              >
                Esqueci minha senha
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
