
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/utils/currencyUtils'
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

interface ValorVendaMetricsProps {
  clientes: Array<{
    id: string | number
    valor_venda_inicial: number | null
    status_campanha: string
  }>
}

export function ValorVendaMetrics({ clientes }: ValorVendaMetricsProps) {
  // Calcular métricas
  const clientesComValor = clientes.filter(c => c.valor_venda_inicial && c.valor_venda_inicial > 0)
  const clientesSemValor = clientes.filter(c => !c.valor_venda_inicial || c.valor_venda_inicial <= 0)
  
  const totalVendas = clientesComValor.reduce((sum, c) => sum + (c.valor_venda_inicial || 0), 0)
  const ticketMedio = clientesComValor.length > 0 ? totalVendas / clientesComValor.length : 0
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total em Vendas</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalVendas)}
          </div>
          <p className="text-xs text-muted-foreground">
            {clientesComValor.length} vendas registradas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(ticketMedio)}
          </div>
          <p className="text-xs text-muted-foreground">
            Valor médio por venda
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes sem Valor</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {clientesSemValor.length}
          </div>
          <p className="text-xs text-muted-foreground">
            Necessitam preenchimento manual
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
