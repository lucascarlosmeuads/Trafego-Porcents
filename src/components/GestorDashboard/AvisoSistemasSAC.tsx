
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Info, Clock, DollarSign, CheckCircle } from 'lucide-react'

export function AvisoSistemasSAC() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Verificar se o gestor já viu o aviso
    const avisoVisto = localStorage.getItem('aviso-gestor-sac-visto')
    if (!avisoVisto) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('aviso-gestor-sac-visto', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <Card className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-blue-600/40 mb-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
            <Info className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-bold mb-3 text-lg">
              📋 Novo Sistema SAC - Informações Importantes
            </h3>
            
            <div className="space-y-4 text-gray-200">
              <div className="bg-blue-900/30 border border-blue-600/40 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <span className="font-semibold text-blue-300">Prazo de Resposta: 4 Horas Úteis</span>
                </div>
                <p className="text-sm">
                  O menu SAC agora concentra todas as reclamações relacionadas ao seu atendimento. 
                  É importante responder dentro de <strong>4 horas úteis</strong> para manter a qualidade do serviço 
                  e evitar reembolsos automáticos.
                </p>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-yellow-400" />
                  <span className="font-semibold text-yellow-300">Política de Reembolsos</span>
                </div>
                <p className="text-sm">
                  Para manter a qualidade do atendimento, reembolsos resultam em desconto de R$ 60,00 
                  no próximo pagamento. O foco é sempre resolver os problemas do cliente de forma eficiente.
                </p>
              </div>

              <div className="bg-green-900/30 border border-green-600/40 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-semibold text-green-300">Bônus por Reativação</span>
                </div>
                <p className="text-sm">
                  <strong>Excelente oportunidade!</strong> Cada reativação de cliente bem-sucedida 
                  gera um bônus de R$ 150,00. Quanto melhor seu atendimento, maior sua recompensa.
                </p>
              </div>

              <div className="bg-purple-900/30 border border-purple-600/40 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                  <span className="font-semibold text-purple-300">Oportunidades Premium</span>
                </div>
                <p className="text-sm">
                  Gestores com histórico de excelência terão prioridade para atender clientes premium 
                  (produtos de R$ 1.200) com comissão de <strong>R$ 500,00 por venda</strong>. 
                  Mantenha um bom histórico de atendimento!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Button
                onClick={handleDismiss}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                ✅ Entendi e Aceito
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white hover:bg-gray-800 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
