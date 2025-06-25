
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
  const { refetch } = useTermosAceitos()
  const [termosModalOpen, setTermosModalOpen] = useState(false)
  const [processandoAceite, setProcessandoAceite] = useState(false)

  console.log('🔍 [TermosProtection] Estado atual:', {
    podeUsarSistema,
    termosRejeitados,
    loading,
    processandoAceite
  })

  // Mostrar loading enquanto verifica os termos ou está processando aceite
  if (loading || processandoAceite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
          <p className="text-gray-400">
            {processandoAceite ? 'Processando aceitação dos termos...' : 'Verificando acesso...'}
          </p>
        </div>
      </div>
    )
  }

  const handleTermosAceitos = async () => {
    console.log('✅ [TermosProtection] Usuário aceitou os termos - iniciando processamento')
    setProcessandoAceite(true)
    setTermosModalOpen(false)
    
    // Aguardar um momento para garantir que o modal foi fechado
    setTimeout(() => {
      console.log('🔄 [TermosProtection] Forçando refresh da página para atualizar estado')
      // Forçar refresh completo da página para garantir estado limpo
      window.location.reload()
    }, 500)
  }

  const handleTermosRejeitados = async () => {
    console.log('❌ [TermosProtection] Usuário rejeitou os termos')
    setTermosModalOpen(false)
    // Forçar re-verificação do estado após um pequeno delay
    setTimeout(() => {
      refetch()
    }, 100)
  }

  const handleVoltarEAceitar = () => {
    console.log('🔄 [TermosProtection] Usuário quer voltar e aceitar')
    setTermosModalOpen(true)
  }

  // Se rejeitou os termos, mostrar tela de suporte com opção de voltar
  if (termosRejeitados) {
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
                Você rejeitou os termos, mas ainda pode voltar e aceitar para continuar usando nossa plataforma.
              </p>
              <p className="text-orange-300 text-xs">
                💡 Clique no botão abaixo para voltar e aceitar os termos
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleVoltarEAceitar}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                disabled={processandoAceite}
              >
                <FileText className="h-4 w-4 mr-2" />
                {processandoAceite ? 'Processando...' : 'Voltar e Aceitar Termos'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <TermosContratoModal
          open={termosModalOpen}
          onOpenChange={setTermosModalOpen}
          onTermosAceitos={handleTermosAceitos}
          onTermosRejeitados={undefined}
          showOnlyAccept={true}
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
              disabled={processandoAceite}
            >
              <FileText className="h-4 w-4 mr-2" />
              {processandoAceite ? 'Processando...' : 'Ler e Aceitar Termos'}
            </Button>
          </CardContent>
        </Card>

        <TermosContratoModal
          open={termosModalOpen}
          onOpenChange={setTermosModalOpen}
          onTermosAceitos={handleTermosAceitos}
          onTermosRejeitados={handleTermosRejeitados}
          showOnlyAccept={false}
        />
      </div>
    )
  }

  // Se pode usar o sistema (cliente antigo ou novo que aceitou), mostrar o conteúdo normal
  return <>{children}</>
}
