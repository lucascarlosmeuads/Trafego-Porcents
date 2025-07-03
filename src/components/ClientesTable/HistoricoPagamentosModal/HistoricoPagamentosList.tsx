
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { type HistoricoPagamento } from '@/hooks/useComissaoAvancada'
import { HistoricoPagamentoItem } from './HistoricoPagamentoItem'
import { History } from 'lucide-react'

interface HistoricoPagamentosListProps {
  historico: HistoricoPagamento[]
}

export function HistoricoPagamentosList({
  historico
}: HistoricoPagamentosListProps) {
  return (
    <Card className="flex-1 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Histórico Completo
        </CardTitle>
        <CardDescription>
          {historico.length} pagamento(s) registrado(s)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] p-4">
          {historico.length > 0 ? (
            <div className="space-y-4">
              {historico.map((pagamento, index) => (
                <div key={pagamento.id}>
                  <HistoricoPagamentoItem 
                    pagamento={pagamento}
                    isRecent={index === 0}
                  />
                  {index < historico.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pagamento registrado ainda</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
