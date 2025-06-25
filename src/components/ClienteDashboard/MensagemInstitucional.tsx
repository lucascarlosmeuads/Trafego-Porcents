
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Shield, AlertTriangle } from 'lucide-react'
import { useTermosAceitos } from '@/hooks/useTermosAceitos'
import { useNavigate } from 'react-router-dom'

export function MensagemInstitucional() {
  const navigate = useNavigate()
  const { termosAceitos, termosRejeitados, clienteAntigo, loading, error } = useTermosAceitos()

  const handleAbrirTermos = () => {
    navigate('/termos-de-uso')
  }

  // Se ainda está carregando, não renderizar nada
  if (loading) {
    return null
  }

  // Se teve erro, mostrar aviso mas não bloquear
  if (error) {
    return (
      <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Aviso do Sistema
              </h2>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-300 text-sm">
                Houve um problema ao verificar o status dos seus termos de uso. 
                Por precaução, você tem acesso completo ao sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Se é cliente antigo, não mostrar nada sobre termos
  if (clienteAntigo) {
    return (
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Bem-vindo à Tráfego Porcents!
              </h2>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-300 leading-relaxed">
                  <p className="text-white">
                    Você tem acesso completo a todas as funcionalidades da nossa plataforma!
                  </p>
                  <p className="text-sm mt-2">
                    Aproveite todas as ferramentas disponíveis para acompanhar e gerenciar suas campanhas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Se rejeitou os termos, não mostrar nada (será redirecionado pela TermosProtection)
  if (termosRejeitados) {
    return null
  }

  // Para clientes novos, mostrar lógica de termos
  return (
    <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Bem-vindo à Tráfego Porcents!
            </h2>
          </div>

          {!termosAceitos ? (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-300 leading-relaxed">
                  <h3 className="font-semibold text-red-300 mb-2">
                    ⚠️ Ação Obrigatória
                  </h3>
                  <p className="mb-3">
                    <strong className="text-white">Para usar nossa plataforma, você deve ler e aceitar nossos termos e condições.</strong>
                  </p>
                  <p className="mb-3 text-sm">
                    Enquanto você não aceitar os termos, as funcionalidades da plataforma ficarão bloqueadas.
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
                  : "bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6"
                }
              >
                <FileText className="h-4 w-4 mr-2" />
                {termosAceitos ? "Revisar Termos" : "Ler e Decidir"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
