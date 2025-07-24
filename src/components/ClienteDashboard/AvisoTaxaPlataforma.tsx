import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, CreditCard, Calendar, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/utils/dateFormatters'

interface AvisoTaxaPlataformaProps {
  dataVenda: string | null
  nomeCliente: string | null
}

export function AvisoTaxaPlataforma({ dataVenda, nomeCliente }: AvisoTaxaPlataformaProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [diasRestantes, setDiasRestantes] = useState(0)

  useEffect(() => {
    if (!dataVenda) return

    // Verificar se o cliente é elegível (comprou a partir de 21/07/2025)
    const dataCorte = new Date(2025, 6, 21) // 21/07/2025 (mês é zero-indexed)
    const [year, month, day] = dataVenda.split('-').map(Number)
    const dataVendaDate = new Date(year, month - 1, day)

    // Cliente não é elegível se comprou antes de 21/07/2025
    if (dataVendaDate < dataCorte) {
      return
    }

    // Calcular dias desde a compra
    const hoje = new Date()
    const diasDesdeCompra = Math.floor((hoje.getTime() - dataVendaDate.getTime()) / (1000 * 60 * 60 * 24))
    const diasRestantesCalc = 30 - diasDesdeCompra

    setDiasRestantes(diasRestantesCalc)

    // Só mostrar o aviso se:
    // 1. Passaram 30 dias ou mais
    // 2. O usuário ainda não dispensou o aviso
    if (diasDesdeCompra >= 30) {
      const avisoVisto = localStorage.getItem(`aviso-taxa-plataforma-${dataVenda}`)
      const lembrarDepois = localStorage.getItem(`aviso-taxa-lembrar-${dataVenda}`)
      
      // Se tem "lembrar depois", verificar se já passou o período
      if (lembrarDepois) {
        const dataLembrete = new Date(lembrarDepois)
        if (hoje < dataLembrete) {
          return // Ainda no período de "lembrar depois"
        }
      }

      if (!avisoVisto) {
        setIsVisible(true)
      }
    }
  }, [dataVenda])

  const handleDismiss = () => {
    if (!dataVenda) return
    localStorage.setItem(`aviso-taxa-plataforma-${dataVenda}`, 'true')
    setIsVisible(false)
  }

  const handleRemindLater = () => {
    if (!dataVenda) return
    // Lembrar em 7 dias
    const lembrarEm = new Date()
    lembrarEm.setDate(lembrarEm.getDate() + 7)
    localStorage.setItem(`aviso-taxa-lembrar-${dataVenda}`, lembrarEm.toISOString())
    setIsVisible(false)
  }

  const handlePayNow = () => {
    // Aqui você pode adicionar a lógica para redirecionar para o pagamento
    // Por enquanto, apenas dismiss
    handleDismiss()
  }

  if (!isVisible || !dataVenda) return null

  const isOverdue = diasRestantes < 0
  const urgencyDays = Math.abs(diasRestantes)

  return (
    <Card className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border-orange-700/50 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0 mt-1">
            {isOverdue ? (
              <AlertTriangle className="h-5 w-5 text-white" />
            ) : (
              <CreditCard className="h-5 w-5 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              💰 Taxa da Plataforma
              {isOverdue && <span className="text-red-400 text-xs">(VENCIDA)</span>}
            </h3>
            
            <div className="text-gray-300 text-sm mb-3 leading-relaxed space-y-1">
              <p>
                Olá <strong>{nomeCliente}</strong>! Já se passaram 30 dias desde sua compra em{' '}
                <strong>{formatDate(dataVenda)}</strong>.
              </p>
              <p>
                {isOverdue ? (
                  <span className="text-orange-300">
                    ⚠️ Sua taxa da plataforma está <strong>vencida há {urgencyDays} dias</strong>. 
                    Para continuarmos rodando seu tráfego pago, é necessário realizar o pagamento.
                  </span>
                ) : (
                  <span>
                    Para continuarmos rodando seu tráfego pago, é necessário pagar a taxa da plataforma.
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                onClick={handlePayNow}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white border-0"
              >
                <CreditCard className="h-3 w-3 mr-1" />
                Pagar Agora
              </Button>
              
              {!isOverdue && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemindLater}
                  className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Lembrar em 7 dias
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                Dispensar
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