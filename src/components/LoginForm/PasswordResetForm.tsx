
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface PasswordResetFormProps {
  onBackToLogin: () => void
}

export function PasswordResetForm({ onBackToLogin }: PasswordResetFormProps) {
  const [resetEmail, setResetEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('🔐 [PasswordResetForm] === INICIANDO RECUPERAÇÃO DE SENHA ===')
    console.log('📧 [PasswordResetForm] Email para recuperação:', resetEmail)

    try {
      // Validação do email
      if (!resetEmail || !resetEmail.includes('@') || resetEmail.length < 5) {
        console.error('❌ [PasswordResetForm] Email inválido para recuperação:', resetEmail)
        toast({
          title: "Email Inválido",
          description: "Por favor, insira um email válido para recuperação.",
          variant: "destructive"
        })
        return
      }

      console.log('📤 [PasswordResetForm] Enviando email de recuperação...')
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/`
      })
      
      if (error) {
        console.error('❌ [PasswordResetForm] Erro ao enviar email de recuperação:', error)
        toast({
          title: "Erro na Recuperação",
          description: "Não foi possível enviar o email de recuperação. Tente novamente.",
          variant: "destructive"
        })
      } else {
        console.log('✅ [PasswordResetForm] Email de recuperação enviado com sucesso!')
        toast({
          title: "Email Enviado",
          description: "Verifique seu email para instruções de recuperação de senha.",
        })
        setResetEmail('')
        onBackToLogin()
      }
    } catch (error) {
      console.error('💥 [PasswordResetForm] Erro inesperado na recuperação:', error)
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
                setResetEmail('')
                onBackToLogin()
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
