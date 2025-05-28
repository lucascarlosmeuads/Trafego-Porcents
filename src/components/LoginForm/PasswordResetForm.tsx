
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'

interface PasswordResetFormProps {
  onBackToLogin: () => void
}

export function PasswordResetForm({ onBackToLogin }: PasswordResetFormProps) {
  const [resetEmail, setResetEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🔐 [PasswordResetForm] === INICIANDO RECUPERAÇÃO DE SENHA ===')
    console.log('📧 [PasswordResetForm] Email para recuperação:', resetEmail)

    try {
      // Validação mais rigorosa do email
      if (!resetEmail.trim()) {
        setError('Por favor, insira seu email.')
        return
      }

      if (!validateEmail(resetEmail)) {
        setError('Por favor, insira um email válido.')
        return
      }

      console.log('📤 [PasswordResetForm] Enviando email de recuperação...')
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        console.error('❌ [PasswordResetForm] Erro ao enviar email de recuperação:', error)
        
        // Tratamento específico de erros
        if (error.message.includes('For security purposes')) {
          setError('Por motivos de segurança, aguarde alguns minutos antes de solicitar outro email de recuperação.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Este email não foi confirmado. Verifique sua caixa de entrada para confirmar sua conta primeiro.')
        } else if (error.message.includes('User not found')) {
          setError('Email não encontrado em nossa base de dados.')
        } else {
          setError('Não foi possível enviar o email de recuperação. Tente novamente em alguns minutos.')
        }
      } else {
        console.log('✅ [PasswordResetForm] Email de recuperação enviado com sucesso!')
        setEmailSent(true)
        toast({
          title: "Email Enviado",
          description: "Verifique seu email para instruções de recuperação de senha.",
        })
      }
    } catch (error) {
      console.error('💥 [PasswordResetForm] Erro inesperado na recuperação:', error)
      setError('Algo deu errado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (!resetEmail.trim() || !validateEmail(resetEmail)) {
      setError('Por favor, insira um email válido antes de reenviar.')
      return
    }

    setEmailSent(false)
    handlePasswordReset({ preventDefault: () => {} } as React.FormEvent)
  }

  if (emailSent) {
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
            <CardTitle className="text-2xl font-bold">Email Enviado!</CardTitle>
            <CardDescription>
              Enviamos instruções para <strong>{resetEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Verifique também sua pasta de spam. O link expira em 1 hora.
              </AlertDescription>
            </Alert>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Não recebeu o email?
              </p>
              <Button
                variant="outline"
                onClick={handleResendEmail}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Reenviando...' : 'Reenviar Email'}
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={onBackToLogin}
              className="w-full"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Login
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
          <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
          <CardDescription>
            Digite seu email para receber instruções de recuperação
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
            
            <div>
              <Input
                type="email"
                placeholder="Seu email"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value)
                  setError('')
                }}
                required
                className="w-full"
                disabled={loading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading || !resetEmail.trim()}>
              {loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setResetEmail('')
                setError('')
                onBackToLogin()
              }}
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
