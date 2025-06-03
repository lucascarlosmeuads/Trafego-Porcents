
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, AlertTriangle, Clock, DollarSign } from 'lucide-react'

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
    <Card className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border-orange-700/50 mb-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0 mt-1">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-bold mb-3 text-lg">
              🚨 ATENÇÃO: Novo Sistema SAC - REGRAS IMPORTANTES
            </h3>
            
            <div className="space-y-4 text-gray-200">
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-red-400" />
                  <span className="font-semibold text-red-300">PRAZO CRÍTICO: 4 HORAS ÚTEIS</span>
                </div>
                <p className="text-sm">
                  Agora você precisa ficar esperto com o menu SAC! Todas as reclamações relacionadas ao seu atendimento 
                  aparecem lá e você tem <strong>4 horas úteis</strong> para responder e evitar reembolsos.
                </p>
              </div>

              <div className="bg-red-800/20 border border-red-600/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-red-400" />
                  <span className="font-semibold text-red-300">PENALIDADE POR REEMBOLSO</span>
                </div>
                <p className="text-sm">
                  <strong>Qualquer reembolso que tiver será descontado R$ 60,00 no próximo pagamento.</strong> 
                  Precisamos evitar reembolsos a todo custo!
                </p>
              </div>

              <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <span className="font-semibold text-green-300">BÔNUS POR REATIVAÇÃO</span>
                </div>
                <p className="text-sm">
                  <strong>Aumente reativações e receba R$ 150,00 por cada uma!</strong> 
                  Quanto mais problemas você resolver, melhor seu histórico.
                </p>
              </div>

              <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                  <span className="font-semibold text-purple-300">OPORTUNIDADE FUTURA</span>
                </div>
                <p className="text-sm">
                  <strong>Se você tiver um histórico bom, em breve vou vender produtos de R$ 1.200 e vou te passar R$ 500.</strong> 
                  Quem mais resolve problemas e tem menos histórico de reembolso vai ter prioridade para receber esses clientes mais caros.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Button
                onClick={handleDismiss}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
              >
                Entendi as Regras
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
