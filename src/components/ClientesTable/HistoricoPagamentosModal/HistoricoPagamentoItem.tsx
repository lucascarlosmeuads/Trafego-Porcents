
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { type HistoricoPagamento } from '@/hooks/useComissaoAvancada'
import { 
  DollarSign, 
  Calendar, 
  User, 
  FileText
} from 'lucide-react'

interface HistoricoPagamentoItemProps {
  pagamento: HistoricoPagamento
  isRecent?: boolean
}

export function HistoricoPagamentoItem({
  pagamento,
  isRecent = false
}: HistoricoPagamentoItemProps) {
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex items-start justify-between p-4 rounded-lg border bg-card">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-lg text-green-600">
            {formatCurrency(pagamento.valor_pago)}
          </span>
          {isRecent && (
            <Badge variant="secondary" className="text-xs">
              Mais recente
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatarData(pagamento.data_pagamento)}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {pagamento.pago_por}
          </div>
        </div>
        
        {pagamento.observacoes && (
          <div className="flex items-start gap-1 text-sm">
            <FileText className="h-3 w-3 mt-0.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {pagamento.observacoes}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
