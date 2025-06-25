
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Shield, AlertTriangle, Eye } from 'lucide-react'
import { TermosContratoModal } from './TermosContratoModal'
import { useTermosAceitos } from '@/hooks/useTermosAceitos'

export function MensagemInstitucional() {
  const [termosModalOpen, setTermosModalOpen] = useState(false)
  const { termosAceitos, termosRejeitados, clienteAntigo, loading, marcarTermosAceitos, marcarTermosRejeitados } = useTermosAceitos()

  const handleAbrirTermos = () => {
    setTermosModalOpen(true)
  }

  const handleTermosAceitos = () => {
    marcarTermosAceitos()
  }

  const handleTermosRejeitados = () => {
    marcarTermosRejeitados()
  }

  // Se ainda está carregando, não renderizar nada
  if (loading) {
    return null
  }

  // Interface completamente discreta para clientes antigos
  if (clienteAntigo) {
    return (
      <>
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Título Principal */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  Bem-vindo à Tráfego Porcents!
                </h2>
              </div>

              {/* Mensagem simples e limpa para clientes antigos */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-gray-300 leading-relaxed flex-1">
                    <p className="text-white text-base">
                      Você tem acesso completo a todas as funcionalidades da nossa plataforma!
                    </p>
                    <p className="text-sm mt-2 text-gray-400">
                      Aproveite todas as ferramentas disponíveis para acompanhar e gerenciar suas campanhas.
                    </p>
                    
                    {/* Link super discreto para ver termos (quase invisível) */}
                    <div className="mt-4 pt-2 border-t border-gray-700/50">
                      <button
                        onClick={handleAbrirTermos}
                        className="text-xs text-gray-500 hover:text-gray-400 transition-colors underline-offset-2 hover:underline"
                      >
                        ver termos de uso
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Termos (discreto para clientes antigos) */}
        <TermosContratoModal
          open={termosModalOpen}
          onOpenChange={setTermosModalOpen}
          onTermosAceitos={handleTermosAceitos}
          onTermosRejeitados={handleTermosRejeitados}
        />
      </>
    )
  }

  // Se rejeitou os termos, não mostrar nada (será redirecionado pela TermosProtection)
  if (termosRejeitados) {
    return null
  }

  // Interface para clientes novos (mais proeminente sobre termos)
  return (
    <>
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Título Principal */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Bem-vindo à Tráfego Porcents!
              </h2>
            </div>

            {/* Status dos Termos para Clientes Novos */}
            {!termosAceitos ? (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-gray-300 leading-relaxed flex-1">
                    <h3 className="font-semibold text-red-300 mb-2">
                      ⚠️ Ação Obrigatória
                    </h3>
                    <p className="mb-3">
                      <strong className="text-white">Para usar nossa plataforma, você deve ler e aceitar nossos termos e condições.</strong>
                    </p>
                    <p className="mb-3 text-sm">
                      Enquanto você não aceitar os termos, as funcionalidades da plataforma ficarão bloqueadas: 
                      você não conseguirá preencher formulários, fazer uploads, registrar vendas ou usar qualquer recurso do sistema.
                    </p>
                    <p className="text-yellow-300 text-sm font-semibold">
                      Você pode aceitar ou recusar - a escolha é sua. Mas para continuar, é necessário tomar uma decisão.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="text-gray-300 leading-relaxed">
                    <h3 className="font-semibold text-green-300 mb-2">
                      ✅ Termos Aceitos
                    </h3>
                    <p>
                      Você já aceitou nossos termos e condições. Agora pode usar todas as funcionalidades da plataforma!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Seção de Termos - Proeminente para clientes novos */}
            <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-teal-400" />
                  <div>
                    <h3 className="font-semibold text-white">Termos e Condições</h3>
                    <p className="text-sm text-gray-400">
                      {termosAceitos 
                        ? "Clique para revisar os termos aceitos" 
                        : "Leia com atenção antes de decidir"
                      }
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleAbrirTermos}
                  variant={termosAceitos ? "outline" : "default"}
                  size="lg"
                  className={termosAceitos 
                    ? "border-teal-500 text-teal-400 hover:bg-teal-500/10" 
                    : "bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 animate-pulse"
                  }
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {termosAceitos ? "Revisar Termos" : "Ler e Decidir"}
                </Button>
              </div>
              
              {/* Destaque extra para clientes novos que ainda não aceitaram */}
              {!termosAceitos && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-yellow-400 text-center">
                    🔒 <strong>Acesso liberado apenas após aceitar os termos</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Termos */}
      <TermosContratoModal
        open={termosModalOpen}
        onOpenChange={setTermosModalOpen}
        onTermosAceitos={handleTermosAceitos}
        onTermosRejeitados={handleTermosRejeitados}
      />
    </>
  )
}
