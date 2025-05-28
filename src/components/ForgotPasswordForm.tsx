
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSmartPasswordReset } from '@/hooks/useSmartPasswordReset'
import { ArrowLeft, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react'

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const { loading, resetCompleted, resultMessage, resetPassword, resetState } = useSmartPasswordReset()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      return
    }

    await resetPassword(email)
  }

  const handleBackToLogin = () => {
    resetState()
    onBack()
  }

  if (resetCompleted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Problema Resolvido!</CardTitle>
          <CardDescription>
            Sua senha foi configurada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                <strong>✅ {resultMessage}</strong>
              </p>
              
              <div className="space-y-2 text-sm text-green-700">
                <p><strong>📧 Email:</strong> {email}</p>
                <p><strong>🔑 Senha:</strong> parceriadesucesso</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Instruções:</strong>
              </p>
              <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                <li>Clique em "Ir para Login" abaixo</li>
                <li>Use seu email e a senha: <strong>parceriadesucesso</strong></li>
                <li>Você conseguirá acessar sua conta normalmente</li>
              </ol>
            </div>
            
            <Button 
              type="button" 
              className="w-full"
              onClick={handleBackToLogin}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ir para Login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Problemas para Entrar?</CardTitle>
        <CardDescription>
          Digite seu email e resolveremos automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Como funciona:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Digite seu email abaixo</li>
                <li>Clique em "Resolver Problema"</li>
                <li>Sua senha será definida como: <strong>parceriadesucesso</strong></li>
                <li>Faça login normalmente</li>
              </ol>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={loading || !email}>
              {loading ? 'Resolvendo...' : 'Resolver Problema Automaticamente'}
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
