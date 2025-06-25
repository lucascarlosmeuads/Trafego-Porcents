
import { usePermissaoSistema } from '@/hooks/usePermissaoSistema'
import { TermosRejeitadosScreen } from './TermosRejeitadosScreen'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Shield, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface TermosProtectionProps {
  children: React.ReactNode
}

export function TermosProtection({ children }: TermosProtectionProps) {
  const { podeUsarSistema, termosRejeitados, loading } = usePermissaoSistema()
  const navigate = useNavigate()
  const [showForceButton, setShowForceButton] = useState(false)

  // Mostrar botão de força após 10 segundos de loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowForceButton(true)
      }, 10000)

      return () => clearTimeout(timer)
    } else {
      setShowForceButton(false)
    }
  }, [loading])

  const handleForceAccess = () => {
    console.log('🚨 [TermosProtection] Acesso forçado pelo usuário')
    // Limpar cache e recarregar
    localStorage.removeItem('supabase-auth-token')
    Object.keys(localStorage).forEach((key) => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key)
      }
    })
    window.location.reload()
  }

  // Mostrar loading enquanto verifica os termos
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
          <p className="text-gray-400">Verificando acesso ao sistema...</p>
          <div className="text-sm text-gray-500">
            Aguarde alguns segundos...
          </div>
          
          {showForceButton && (
            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-yellow-400" />
                <p className="text-yellow-300 text-sm">
                  O carregamento está demorando mais que o esperado
                </p>
              </div>
              <Button
                onClick={handleForceAccess}
                variant="outline"
                size="sm"
                className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
              >
                Forçar Carregamento
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Se rejeitou os termos, mostrar tela de encerramento
  if (termosRejeitados) {
    return <TermosRejeitadosScreen />
  }

  // Se não pode usar o sistema (cliente novo que não aceitou termos), redirecionar para página de termos
  if (!podeUsarSistema) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <Card className="max-w-md w-full bg-gray-900 border-gray-700">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-red-900/20 rounded-full">
                <Shield className="h-8 w-8 text-red-400" />
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Acesso Restrito
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Para acessar seu painel, é necessário ler e aceitar nossos termos e condições de uso.
              </p>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-300 text-xs">
                ⚠️ Este é um requisito obrigatório para usar nossa plataforma
              </p>
            </div>

            <Button
              onClick={() => navigate('/termos-de-uso')}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Ler e Aceitar Termos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Se pode usar o sistema (cliente antigo ou novo que aceitou), mostrar o conteúdo normal
  return <>{children}</>
}
