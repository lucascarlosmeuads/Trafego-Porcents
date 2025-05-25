
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
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()

  const checkUserExistence = async (email: string) => {
    console.log('🔍 [LoginForm] Verificando existência do usuário:', email)
    
    try {
      // Check if user exists in todos_clientes (for info only, not validation)
      const { data: clienteData, error: clienteError } = await supabase
        .from('todos_clientes')
        .select('email_cliente, nome_cliente')
        .eq('email_cliente', email)
        .single()

      if (clienteError && clienteError.code !== 'PGRST116') {
        console.error('⚠️ [LoginForm] Erro ao verificar todos_clientes:', clienteError)
      }

      console.log('📊 [LoginForm] Status no todos_clientes:', clienteData ? 'EXISTE' : 'NÃO EXISTE')
      if (clienteData) {
        console.log('👤 [LoginForm] Cliente encontrado:', clienteData.nome_cliente)
      }

      return {
        inTodosClientes: !!clienteData
      }
    } catch (error) {
      console.error('💥 [LoginForm] Erro na verificação:', error)
      return {
        inTodosClientes: false
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('🔐 [LoginForm] === INICIANDO PROCESSO DE AUTENTICAÇÃO ===')
    console.log('📧 [LoginForm] Email:', email)
    console.log('🔄 [LoginForm] Modo:', isSignUp ? 'CADASTRO' : 'LOGIN')

    try {
      if (isSignUp) {
        // For signup, check user existence for debugging purposes only
        const existenceCheck = await checkUserExistence(email)
        console.log('📋 [LoginForm] Relatório de existência:', existenceCheck)

        console.log('✍️ [LoginForm] Tentando criar conta no Supabase Auth...')
        const { error } = await signUp(email, password)
        
        if (error) {
          console.error('❌ [LoginForm] Erro de cadastro do Supabase:', error)
          console.error('🔥 [LoginForm] Código do erro:', error.code)
          console.error('🔥 [LoginForm] Mensagem completa:', error.message)
          
          // Mensagens de erro mais específicas
          let errorMessage = error.message
          if (error.message.includes('User already registered') || error.code === 'user_already_exists') {
            errorMessage = `Este email já possui uma conta. Tente fazer login ou use a opção "Esqueci minha senha".`
            console.log('💡 [LoginForm] DICA: Este email já está registrado no Supabase Auth')
          } else if (error.message.includes('Invalid email')) {
            errorMessage = 'Email inválido. Verifique o formato do email.'
          } else if (error.message.includes('Password')) {
            errorMessage = 'Senha deve ter pelo menos 6 caracteres.'
          }
          
          toast({
            title: "Erro no Cadastro",
            description: errorMessage,
            variant: "destructive"
          })
        } else {
          console.log('✅ [LoginForm] Cadastro realizado com sucesso!')
          toast({
            title: "Sucesso",
            description: "Conta criada com sucesso! Você pode fazer login agora."
          })
          // Automatically switch to login mode after successful signup
          setIsSignUp(false)
        }
      } else {
        // Login flow
        console.log('🔑 [LoginForm] Tentando fazer login...')
        const { error } = await signIn(email, password)
        
        if (error) {
          console.error('❌ [LoginForm] Erro de login do Supabase:', error)
          console.error('🔥 [LoginForm] Código do erro:', error.code)
          console.error('🔥 [LoginForm] Mensagem completa:', error.message)
          
          // Mensagens de erro mais específicas para login
          let errorMessage = error.message
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.'
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Email não confirmado. Verifique seu email para confirmar a conta.'
          } else if (error.message.includes('Too many requests')) {
            errorMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'
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
            {isSignUp ? 'Criar nova conta' : 'Entre com suas credenciais'}
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
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Carregando...' : (isSignUp ? 'Criar conta' : 'Entrar')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Já tem conta? Entre' : 'Não tem conta? Cadastre-se'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
