
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Rocket, AlertTriangle, MapPin, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { TermosContratoModal } from './TermosContratoModal'
import { useTermosAceitos } from '@/hooks/useTermosAceitos'

export function MensagemInstitucional() {
  const [novaRegraOpen, setNovaRegraOpen] = useState(false)
  const [termosModalOpen, setTermosModalOpen] = useState(false)
  const { termosAceitos, marcarTermosAceitos } = useTermosAceitos()

  const handleAbrirTermos = () => {
    setTermosModalOpen(true)
  }

  const handleTermosAceitos = () => {
    marcarTermosAceitos()
  }

  return (
    <>
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Título Principal */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Bem-vindo à Tráfego Porcents!
              </h2>
            </div>

            {/* Explicação do Modelo */}
            <div className="text-gray-300 leading-relaxed">
              <p className="mb-4">
                Nosso modelo é baseado em performance: buscamos escalar ofertas que vendem bem para ganhar na porcentagem das vendas — e não em mensalidades.
              </p>
            </div>

            {/* Aviso sobre Testes */}
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-300 text-sm leading-relaxed">
                  <p className="mb-2">
                    Nem toda oferta escala de primeira. É normal que os primeiros dias sejam de teste e ajuste, e por isso não há garantia imediata de resultado. O serviço envolve criação de criativos de imagens com copywriter bem feitas, configuração da BM e do traqueamento — tudo isso gera custo, por isso <strong className="text-orange-300">não realizamos reembolso</strong> após a entrega.
                  </p>
                </div>
              </div>
            </div>

            {/* Nova Regra - Seção Colapsável */}
            <Collapsible open={novaRegraOpen} onOpenChange={setNovaRegraOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-4 h-auto bg-red-900/20 border border-red-500/30 rounded-lg hover:bg-red-900/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <span className="font-semibold text-red-300">
                      Nova regra de parceria ativa, clique e veja
                    </span>
                  </div>
                  {novaRegraOpen ? (
                    <ChevronUp className="h-5 w-5 text-red-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-red-400" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <div className="text-gray-300 text-sm leading-relaxed">
                    <p className="font-semibold text-red-300 mb-2">
                      📌 Atenção: adicionamos uma nova regra à parceria.
                    </p>
                    <p className="mb-3">
                      Para manter a parceria ativa, é necessário que nos <strong className="text-white">30 primeiros dias</strong> tenhamos <strong className="text-green-400">comissionamento mínimo de R$200</strong>. Caso isso não aconteça, a parceria pode ser encerrada automaticamente. Isso não é uma mensalidade. Se você quiser manter o projeto mesmo sem atingir esse valor, poderá realizar o pagamento manual de R$200.
                    </p>
                    <p className="mb-3">
                      Essa regra está sendo aplicada a todos os clientes e está aqui para garantir que possamos continuar atuando com foco total em gerar resultado real.
                    </p>
                    <p className="font-medium text-yellow-300">
                      Caso não concorde com esse formato, por favor nos comunique em até 15 dias.
                    </p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Seção de Termos de Aceite */}
            <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-teal-400" />
                  <div>
                    <h3 className="font-semibold text-white">Termos e Condições</h3>
                    <p className="text-sm text-gray-400">
                      {termosAceitos 
                        ? "✅ Você já aceitou nossos termos e condições" 
                        : "É necessário aceitar os termos para usar o sistema"
                      }
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleAbrirTermos}
                  variant={termosAceitos ? "outline" : "default"}
                  className={termosAceitos 
                    ? "border-teal-500 text-teal-400 hover:bg-teal-500/10" 
                    : "bg-teal-600 hover:bg-teal-700 text-white"
                  }
                >
                  {termosAceitos ? "Ver Termos" : "Aceitar Termos"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Termos */}
      <TermosContratoModal
        open={termosModalOpen}
        onOpenChange={setTermosModalOpen}
        onTermosAceitos={handleTermosAceitos}
      />
    </>
  )
}
