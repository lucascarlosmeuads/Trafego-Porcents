
import { usePermissaoSistema } from '@/hooks/usePermissaoSistema'
import { useTermosAceitos } from '@/hooks/useTermosAceitos'
import { TermosContratoModal } from './TermosContratoModal'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Shield, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TermosProtectionProps {
  children: React.ReactNode
  onTermosRejeitados?: () => void
}

export function TermosProtection({ children, onTermosRejeitados }: TermosProtectionProps) {
  const { podeUsarSistema, termosRejeitados, loading } = usePermissaoSistema()
  const { marcarTermosAceitos, marcarTermosRejeitados } = useTermosAceitos()
  const [termosModalOpen, setTermosModalOpen] = useState(false)
  const [showReconsiderOption, setShowReconsiderOption] = useState(false)
  const navigate = useNavigate()

  console.log('🔍 [TermosProtection] Estado atual:', {
    podeUsarSistema,
    termosRejeitados,
    loading,
    showReconsiderOption
  })

  // Se rejeitou os termos, mostrar opção de reconsiderar por alguns segundos
  useEffect(() => {
    if (termosRejeitados && !loading) {
      console.log('🚫 [TermosProtection] Termos rejeitados - preparando redirecionamento')
      
      // Mostrar opção de reconsiderar por 3 segundos
      setShowReconsiderOption(true)
      
      const timer = setTimeout(() => {
        console.log('⏰ [TermosProtection] Tempo esgotado - redirecionando')
        if (onTermosRejeitados) {
          onTermosRejeitados()
        } else {
          navigate('/termos-rejeitados')
        }
      }, 5000) // 5 segundos para o usuário reconsiderar

      return () => clearTimeout(timer)
    }
  }, [termosRejeitados, loading, onTermosRejeitados, navigate])

  // Mostrar loading enquanto verifica os termos
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
          <p className="text-gray-400">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  const handleTermosRejeitados = () => {
    console.log('❌ [TermosProtection] Usuário rejeitou os termos')
    marcarTermosRejeitados()
    setShowReconsiderOption(true)
  }

  const handleReconsiderar = () => {
    console.log('🔄 [TermosProtection] Usuário quer reconsiderar')
    setShowReconsiderOption(false)
    setTermosModalOpen(true)
  }

  const handleTermosAceitos = () => {
    console.log('✅ [TermosProtection] Usuário aceitou os termos')
    marcarTermosAceitos()
    setShowReconsiderOption(false)
  }

  // Se rejeitou os termos E está mostrando opção de reconsiderar
  if (termosRejeitados && showReconsiderOption) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <Card className="max-w-md w-full bg-gray-900 border-gray-700">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-orange-900/20 rounded-full">
                <RotateCcw className="h-8 w-8 text-orange-400" />
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Mudou de Ideia?
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Você rejeitou os termos, mas ainda pode reconsiderar sua decisão.
              </p>
              <p className="text-orange-300 text-xs">
                ⏰ Redirecionando em alguns segundos...
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleReconsiderar}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Reconsiderar e Ler Termos
              </Button>

              <Button
                onClick={() => {
                  if (onTermosRejeitados) {
                    onTermosRejeitados()
                  } else {
                    navigate('/termos-rejeitados')
                  }
                }}
                variant="outline"
                className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
              >
                Prosseguir com Rejeição
              </Button>
            </div>
          </CardContent>
        </Card>

        <TermosContratoModal
          open={termosModalOpen}
          onOpenChange={setTermosModalOpen}
          onTermosAceitos={handleTermosAceitos}
          onTermosRejeitados={handleTermosRejeitados}
        />
      </div>
    )
  }

  // Se não pode usar o sistema (cliente novo que não aceitou termos), mostrar tela de bloqueio
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
              onClick={() => setTermosModalOpen(true)}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Ler e Aceitar Termos
            </Button>
          </CardContent>
        </Card>

        <TermosContratoModal
          open={termosModalOpen}
          onOpenChange={setTermosModalOpen}
          onTermosAceitos={marcarTermosAceitos}
          onTermosRejeitados={handleTermosRejeitados}
        />
      </div>
    )
  }

  // Se pode usar o sistema (cliente antigo ou novo que aceitou), mostrar o conteúdo normal
  return <>{children}</>
}
