
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Cliente } from '@/lib/supabase'
import { 
  DollarSign, 
  History,
  Star
} from 'lucide-react'

interface PagamentoResumoCardsProps {
  totalPago: number
  totalPagamentos: number
  cliente: Cliente
}

export function PagamentoResumoCards({
  totalPago,
  totalPagamentos,
  cliente
}: PagamentoResumoCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Pago</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPago)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pagamentos</p>
              <p className="text-2xl font-bold">{totalPagamentos}</p>
            </div>
            <History className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status Atual</p>
              <Badge 
                variant={cliente.comissao === 'Pago' ? 'default' : 'destructive'}
                className="mt-1"
              >
                {cliente.comissao || 'Pendente'}
              </Badge>
            </div>
            {cliente.eh_ultimo_pago && (
              <Star className="h-6 w-6 text-yellow-500 fill-current" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
