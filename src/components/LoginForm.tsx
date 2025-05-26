
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('🔐 [LoginForm] === INICIANDO PROCESSO DE AUTENTICAÇÃO ===')
    console.log('📧 [LoginForm] Email:', email)
    console.log('🔄 [LoginForm] Modo:', isSignUp ? 'CADASTRO' : 'LOGIN')

    try {
      if (isSignUp) {
        // Validação adicional antes do cadastro
        if (!email || !email.includes('@') || email.length < 5) {
          console.error('❌ [LoginForm] Email inválido:', email)
          toast({
            title: "Email Inválido",
            description: "Por favor, insira um email válido.",
            variant: "destructive"
          })
          return
        }

        // Prevenir emails de teste problemáticos
        const testEmails = ['cliente@cliente.com', 'test@test.com', 'teste@teste.com']
        if (testEmails.includes(email.toLowerCase())) {
          console.error('❌ [LoginForm] Email de teste bloqueado:', email)
          toast({
            title: "Email não permitido",
            description: "Use um email válido para criar sua conta.",
            variant: "destructive"
          })
          return
        }

        console.log('✍️ [LoginForm] Tentando criar conta no Supabase Auth...')
        console.log('🔍 [LoginForm] IMPORTANTE: Validação baseada APENAS no Supabase Auth')
        
        const { error } = await signUp(email, password)
        
        if (error) {
          console.error('❌ [LoginForm] Erro de cadastro do Supabase Auth:', error)
          console.error('🔥 [LoginForm] Código do erro:', error.code)
          console.error('🔥 [LoginForm] Mensagem completa:', error.message)
          
          // Mensagens de erro mais específicas baseadas apenas em Auth
          let errorMessage = error.message
          if (error.message.includes('User already registered') || error.code === 'user_already_exists') {
            errorMessage = `Este email já possui uma conta no sistema de autenticação. Tente fazer login ou use a opção "Esqueci minha senha".`
            console.log('💡 [LoginForm] Email já registrado no Supabase Auth')
          } else if (error.message.includes('Invalid email')) {
            errorMessage = 'Email inválido. Verifique o formato do email.'
          } else if (error.message.includes('Password')) {
            errorMessage = 'Senha deve ter pelo menos 6 caracteres.'
          } else if (error.message.includes('Signup is disabled')) {
            errorMessage = 'Cadastro está desabilitado. Entre em contato com o administrador.'
          }
          
          toast({
            title: "Erro no Cadastro",
            description: errorMessage,
            variant: "destructive"
          })
        } else {
          console.log('✅ [LoginForm] Cadastro realizado com sucesso no Supabase Auth!')
          console.log('🎯 [LoginForm] Conta criada para:', email)

          // CORREÇÃO: Verificar se cliente já existe antes de inserir
          try {
            console.log('🔍 [LoginForm] Verificando se cliente já existe na tabela todos_clientes...')
            const { data: existingClient, error: checkError } = await supabase
              .from('todos_clientes')
              .select('id, email_cliente')
              .eq('email_cliente', email)
              .maybeSingle()

            if (checkError && checkError.code !== 'PGRST116') {
              console.error('❌ [LoginForm] Erro ao verificar cliente existente:', checkError)
              // Não bloquear o cadastro por isso
            } else if (existingClient) {
              console.log('⚠️ [LoginForm] Cliente já existe na tabela todos_clientes:', existingClient)
              // Cliente já existe, não inserir novamente
            } else {
              console.log('📋 [LoginForm] Inserindo novo cliente na tabela todos_clientes...')
              
              // Extrair nome do email (parte antes do @)
              const nomeCliente = email.split('@')[0] || 'Cliente'
              
              // Validar se o nome não está vazio
              if (!nomeCliente || nomeCliente.trim() === '') {
                console.error('❌ [LoginForm] Nome do cliente inválido, pulando inserção')
              } else {
                const { error: insertError } = await supabase
                  .from('todos_clientes')
                  .insert([{
                    nome_cliente: nomeCliente,
                    telefone: '', // Will be filled later
                    email_cliente: email,
                    vendedor: 'Sistema',
                    email_gestor: '', // Will be assigned later by a manager
                    status_campanha: 'Preenchimento do Formulário',
                    data_venda: new Date().toISOString().split('T')[0],
                    valor_comissao: 60.00,
                    comissao_paga: false,
                    site_status: 'pendente'
                  }])

                if (insertError) {
                  console.warn('⚠️ [LoginForm] Erro ao inserir na tabela todos_clientes:', insertError)
                  // Don't block signup if this fails, but log the error
                  if (insertError.code === '23505') {
                    console.log('💡 [LoginForm] Cliente já existe (constraint violation)')
                  }
                } else {
                  console.log('✅ [LoginForm] Cliente inserido na tabela todos_clientes com sucesso!')
                }
              }
            }
          } catch (insertError) {
            console.warn('⚠️ [LoginForm] Erro inesperado ao gerenciar cliente:', insertError)
            // Don't block signup if this fails
          }

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
