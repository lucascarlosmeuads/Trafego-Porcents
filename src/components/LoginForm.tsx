
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isSettingNewPassword, setIsSettingNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, resetPassword, updatePassword } = useAuth()
  const { toast } = useToast()

  // Detectar recovery via evento customizado E parâmetros de URL
  useEffect(() => {
    const checkRecoveryFlow = () => {
      // Verificar múltiplos formatos de parâmetros
      const urlParams = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const isRecoveryUrl = urlParams.get('type') === 'recovery' || 
                           hashParams.get('type') === 'recovery' ||
                           window.location.href.includes('type=recovery')

      console.log('🔍 [LoginForm] Verificando recovery:', {
        search: window.location.search,
        hash: window.location.hash,
        href: window.location.href,
        isRecoveryUrl
      })

      if (isRecoveryUrl) {
        console.log('✅ [LoginForm] Recovery detectado via URL!')
        setIsSettingNewPassword(true)
        setIsForgotPassword(false)
        setIsSignUp(false)
        
        // Limpar URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }

    // Listener para evento customizado de recovery
    const handleRecoveryEvent = (event: any) => {
      console.log('🔑 [LoginForm] Recovery event recebido:', event.detail)
      if (event.detail.isRecovery) {
        setIsSettingNewPassword(true)
        setIsForgotPassword(false)
        setIsSignUp(false)
        toast({
          title: "Redefinir Senha",
          description: "Defina sua nova senha abaixo.",
        })
      }
    }

    // Verificar na inicialização
    checkRecoveryFlow()
    
    // Adicionar listener para eventos de recovery
    window.addEventListener('supabase-recovery', handleRecoveryEvent)
    
    return () => {
      window.removeEventListener('supabase-recovery', handleRecoveryEvent)
    }
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('🔐 [LoginForm] === INICIANDO PROCESSO DE AUTENTICAÇÃO ===')
    console.log('📧 [LoginForm] Email:', email)
    console.log('🔄 [LoginForm] Modo:', 
      isSettingNewPassword ? 'NOVA SENHA' :
      isSignUp ? 'CADASTRO' : 
      isForgotPassword ? 'RECUPERAÇÃO' : 'LOGIN'
    )

    try {
      if (isSettingNewPassword) {
        // Fluxo de definir nova senha
        if (!password || password.length < 6) {
          console.error('❌ [LoginForm] Senha muito curta')
          toast({
            title: "Senha Inválida",
            description: "A senha deve ter pelo menos 6 caracteres.",
            variant: "destructive"
          })
          return
        }

        if (password !== confirmPassword) {
          console.error('❌ [LoginForm] Senhas não coincidem')
          toast({
            title: "Senhas não coincidem",
            description: "As senhas digitadas não são iguais.",
            variant: "destructive"
          })
          return
        }

        console.log('🔑 [LoginForm] Atualizando senha...')
        
        const { error } = await updatePassword(password)
        
        if (error) {
          console.error('❌ [LoginForm] Erro ao atualizar senha:', error)
          
          let errorMessage = "Erro ao atualizar senha. Tente novamente."
          if (error.message.includes('session_not_found') || error.message.includes('unauthorized')) {
            errorMessage = 'Sessão expirada. Solicite um novo link de recuperação.'
          } else if (error.message.includes('Password') || error.message.includes('password')) {
            errorMessage = 'Senha deve ter pelo menos 6 caracteres.'
          }
          
          toast({
            title: "Erro ao Atualizar Senha",
            description: errorMessage,
            variant: "destructive"
          })
        } else {
          console.log('✅ [LoginForm] Senha atualizada com sucesso!')
          toast({
            title: "Senha Atualizada!",
            description: "Sua senha foi atualizada com sucesso. Você já está logado."
          })
          
          // Limpar estados
          setIsSettingNewPassword(false)
          setPassword('')
          setConfirmPassword('')
        }
      } else if (isForgotPassword) {
        // Fluxo de recuperação de senha (mantido igual)
        if (!email || !email.includes('@') || email.length < 5) {
          console.error('❌ [LoginForm] Email inválido para recuperação:', email)
          toast({
            title: "Email Inválido",
            description: "Por favor, insira um email válido para recuperação.",
            variant: "destructive"
          })
          return
        }

        console.log('🔑 [LoginForm] Tentando recuperar senha...')
        
        const { error } = await resetPassword(email)
        
        if (error) {
          console.error('❌ [LoginForm] Erro na recuperação:', error)
          toast({
            title: "Erro na Recuperação",
            description: "Não foi possível enviar o email de recuperação. Tente novamente.",
            variant: "destructive"
          })
        } else {
          console.log('✅ [LoginForm] Email de recuperação enviado!')
          toast({
            title: "Email Enviado",
            description: "Verifique sua caixa de entrada para redefinir sua senha.",
          })
          setIsForgotPassword(false)
          setEmail('')
        }
      } else if (isSignUp) {
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

        if (!password || password.length < 6) {
          console.error('❌ [LoginForm] Senha muito curta')
          toast({
            title: "Senha Inválida",
            description: "A senha deve ter pelo menos 6 caracteres.",
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
        
        const { error } = await signUp(email, password)
        
        if (error) {
          console.error('❌ [LoginForm] Erro de cadastro do Supabase Auth:', error)
          
          // Mensagens de erro mais específicas
          let errorMessage = error.message
          if (error.message.includes('User already registered') || error.code === 'user_already_exists') {
            errorMessage = `Este email já possui uma conta. Tente fazer login ou use a opção "Esqueci minha senha".`
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

          // Verificar se cliente já existe antes de inserir
          try {
            const { data: existingClient } = await supabase
              .from('todos_clientes')
              .select('id, email_cliente')
              .eq('email_cliente', email)
              .maybeSingle()

            if (!existingClient) {
              const nomeCliente = email.split('@')[0] || 'Cliente'
              
              if (nomeCliente && nomeCliente.trim() !== '') {
                await supabase
                  .from('todos_clientes')
                  .insert([{
                    nome_cliente: nomeCliente,
                    telefone: '',
                    email_cliente: email,
                    vendedor: 'Sistema',
                    email_gestor: '',
                    status_campanha: 'Preenchimento do Formulário',
                    data_venda: new Date().toISOString().split('T')[0],
                    valor_comissao: 60.00,
                    comissao_paga: false,
                    site_status: 'pendente'
                  }])
              }
            }
          } catch (insertError) {
            console.warn('⚠️ [LoginForm] Erro ao gerenciar cliente:', insertError)
          }

          toast({
            title: "Sucesso",
            description: "Conta criada com sucesso! Você pode fazer login agora."
          })
          setIsSignUp(false)
        }
      } else {
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
            {isSettingNewPassword 
              ? 'Defina sua nova senha' 
              : isForgotPassword 
                ? 'Recuperar senha' 
                : isSignUp 
                  ? 'Criar nova conta' 
                  : 'Entre com suas credenciais'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isSettingNewPassword && (
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
            )}
            
            {!isForgotPassword && (
              <div>
                <Input
                  type="password"
                  placeholder={isSettingNewPassword ? "Nova senha" : "Senha"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isForgotPassword}
                  className="w-full"
                  minLength={6}
                  disabled={loading}
                />
              </div>
            )}

            {isSettingNewPassword && (
              <div>
                <Input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full"
                  minLength={6}
                  disabled={loading}
                />
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? 'Processando...' 
                : isSettingNewPassword 
                  ? 'Definir nova senha'
                  : isForgotPassword 
                    ? 'Enviar email de recuperação'
                    : isSignUp 
                      ? 'Criar conta' 
                      : 'Entrar'
              }
            </Button>
            
            {!isForgotPassword && !isSettingNewPassword && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSignUp(!isSignUp)}
                  disabled={loading}
                >
                  {isSignUp ? 'Já tem conta? Entre' : 'Não tem conta? Cadastre-se'}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => setIsForgotPassword(true)}
                  disabled={loading}
                >
                  Esqueci minha senha
                </Button>
              </>
            )}
            
            {(isForgotPassword || isSettingNewPassword) && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsForgotPassword(false)
                  setIsSettingNewPassword(false)
                  setEmail('')
                  setPassword('')
                  setConfirmPassword('')
                }}
                disabled={loading}
              >
                Voltar ao login
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
