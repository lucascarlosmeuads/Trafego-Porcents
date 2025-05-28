
import { useState } from 'react'
import { useSimpleAuth } from '@/hooks/useSimpleAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface MainLoginFormProps {
  onForgotPassword: () => void
}

export function MainLoginForm({ onForgotPassword }: MainLoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useSimpleAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('🔐 [MainLoginForm] === INICIANDO LOGIN ===')
    console.log('📧 [MainLoginForm] Email:', email)

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
        console.error('❌ [MainLoginForm] Erro de login:', error)
        
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
        console.log('✅ [MainLoginForm] Login realizado com sucesso')
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        })
      }
    } catch (error) {
      console.error('💥 [MainLoginForm] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
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
            
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
                onClick={onForgotPassword}
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
