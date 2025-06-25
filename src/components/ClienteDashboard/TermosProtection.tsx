
import { usePermissaoSistema } from '@/hooks/usePermissaoSistema'
import { useTermosAceitos } from '@/hooks/useTermosAceitos'
import { TermosContratoModal } from './TermosContratoModal'
import { useState } from 'react'
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

  console.log('🔍 [TermosProtection] Estado atual:', {
    podeUsarSistema,
    termosRejeitados,
    loading,
    showReconsiderOption
  })

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
    setTermosModalOpen(true)
  }

  const handleTermosAceitos = () => {
    console.log('✅ [TermosProtection] Usuário aceitou os termos')
    marcarTermosAceitos()
    setShowReconsiderOption(false)
  }

  // Se rejeitou os termos OU está mostrando opção de reconsiderar
  if (termosRejeitados || showReconsiderOption) {
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
                Você rejeitou os termos, mas ainda pode reconsiderar sua decisão e continuar usando nossa plataforma.
              </p>
              <p className="text-orange-300 text-xs">
                💡 Clique no botão abaixo para reconsiderar
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleReconsiderar}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Reconsiderar e Ler Termos
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
