
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePasswordReset } from '@/hooks/usePasswordReset'
import { ArrowLeft, Mail } from 'lucide-react'

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const { loading, emailSent, sendResetEmail } = usePasswordReset()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      return
    }

    await sendResetEmail(email)
  }

  if (emailSent) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Email Enviado!</CardTitle>
          <CardDescription>
            Verifique sua caixa de entrada e clique no link para redefinir sua senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 text-center">
              Enviamos um link de recuperação para:
              <br />
              <strong>{email}</strong>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
        <CardDescription>
          Digite seu email para receber o link de recuperação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={loading || !email}>
              {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={onBack}
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
