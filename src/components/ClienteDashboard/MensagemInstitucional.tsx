
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Shield, AlertTriangle } from 'lucide-react'
import { useTermosAceitos } from '@/hooks/useTermosAceitos'

export function MensagemInstitucional() {
  const navigate = useNavigate()
  const { termosAceitos, termosRejeitados, clienteAntigo, loading } = useTermosAceitos()

  const handleAbrirTermos = (e: React.MouseEvent) => {
    console.log('🔄 [MensagemInstitucional] === CLIQUE NO BOTÃO ===')
    console.log('🔍 [MensagemInstitucional] Event:', e)
    console.log('🔍 [MensagemInstitucional] Estado:', { termosAceitos, termosRejeitados, clienteAntigo, loading })
    console.log('🔍 [MensagemInstitucional] URL atual antes:', window.location.pathname)
    
    e.preventDefault()
    e.stopPropagation()
    
    try {
      console.log('🔄 [MensagemInstitucional] Forçando navegação direta')
      
      // Forçar navegação direta sempre, independente do estado
      window.location.href = '/termos'
      
      console.log('✅ [MensagemInstitucional] Navegação executada')
    } catch (error) {
      console.error('❌ [MensagemInstitucional] Erro na navegação:', error)
    }
  }

  console.log('🔍 [MensagemInstitucional] Renderizando com estado:', { 
    termosAceitos, 
    termosRejeitados, 
    clienteAntigo, 
    loading 
  })

  // Se ainda está carregando, não renderizar nada
  if (loading) {
    console.log('⏳ [MensagemInstitucional] Loading - não renderizando')
    return null
  }

  // Se é cliente antigo, não mostrar nada sobre termos
  if (clienteAntigo) {
    console.log('👴 [MensagemInstitucional] Cliente antigo - renderizando mensagem simples')
    return (
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

            {/* Mensagem simples para clientes antigos */}
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

            {/* Botão para ver termos mesmo sendo cliente antigo */}
            <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-teal-400" />
                  <div>
                    <h3 className="font-semibold text-white">Termos e Condições</h3>
                    <p className="text-sm text-gray-400">
                      Clique para visualizar nossos termos
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleAbrirTermos}
                  variant="outline"
                  size="lg"
                  className="border-teal-500 text-teal-400 hover:bg-teal-500/10"
                  type="button"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Termos
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Se rejeitou os termos, não mostrar nada (será redirecionado pela TermosProtection)
  if (termosRejeitados) {
    console.log('❌ [MensagemInstitucional] Termos rejeitados - não renderizando')
    return null
  }

  // Para clientes novos, mostrar lógica de termos
  console.log('🆕 [MensagemInstitucional] Cliente novo - renderizando mensagem completa')
  return (
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

          {/* Aviso sobre Termos - Condicional baseado no status */}
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

          {/* Seção de Termos de Aceite */}
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
                type="button"
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
