
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from '@/components/ThemeProvider'
import { useToast } from '@/hooks/use-toast'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [logoSrc, setLogoSrc] = useState('/images/logo-preto.png')
  const { signIn, signUp } = useAuth()
  const { theme } = useTheme()
  const { toast } = useToast()

  // Atualizar logo baseado no tema
  useEffect(() => {
    const updateLogo = () => {
      if (theme === 'dark') {
        setLogoSrc('/images/logo-branco.png')
      } else if (theme === 'light') {
        setLogoSrc('/images/logo-preto.png')
      } else {
        // Para tema 'system', detectar preferência do sistema
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        setLogoSrc(systemTheme === 'dark' ? '/images/logo-branco.png' : '/images/logo-preto.png')
      }
    }

    updateLogo()

    // Listener para mudanças no tema do sistema quando em modo 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => updateLogo()
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password)
      
      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive"
        })
      } else if (isSignUp) {
        toast({
          title: "Sucesso",
          description: "Verifique seu email para confirmar a conta"
        })
      }
    } catch (error) {
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
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src={logoSrc} 
              alt="Tráfego Porcents Logo" 
              className="h-20 w-auto object-contain"
              style={{ transition: 'opacity 0.2s ease-in-out' }}
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
