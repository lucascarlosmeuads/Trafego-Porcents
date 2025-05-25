
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, Clock, DollarSign, CheckCircle2 } from 'lucide-react'
import { useComissaoMetrics } from '@/hooks/useComissaoMetrics'
import type { Cliente } from '@/lib/supabase'

interface DashboardMetricsProps {
  clientes: Cliente[]
}

export function DashboardMetrics({ clientes }: DashboardMetricsProps) {
  const { comissoesPendentes, comissoesDisponiveis, totalPendente, totalDisponivel } = useComissaoMetrics(clientes)

  const statusDistribution = clientes.reduce((acc, cliente) => {
    const status = cliente.status_campanha || 'Sem status'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const clientesNoAr = statusDistribution['No Ar'] || 0
  const clientesProblema = statusDistribution['Problema'] || 0
  const clientesOtimizacao = statusDistribution['Otimização'] || 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="card-dark">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-contrast">Total de Clientes</CardTitle>
          <Users className="h-4 w-4 text-contrast-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-contrast">{clientes.length}</div>
          <div className="flex items-center gap-1 text-xs text-contrast-secondary mt-1">
            <TrendingUp className="h-3 w-3" />
            <span>Clientes ativos</span>
          </div>
        </CardContent>
      </Card>

      <Card className="card-dark">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-contrast">💰 Total Pendente</CardTitle>
          <Clock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-contrast">R$ {totalPendente.toFixed(2)}</div>
          <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
            <span>{comissoesPendentes} comissões pendentes</span>
          </div>
        </CardContent>
      </Card>

      <Card className="card-dark">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-contrast">🟢 Disponível para Saque</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">R$ {totalDisponivel.toFixed(2)}</div>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>{comissoesDisponiveis} comissões disponíveis</span>
          </div>
        </CardContent>
      </Card>

      <Card className="card-dark">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-contrast">Status Campanhas</CardTitle>
          <TrendingUp className="h-4 w-4 text-contrast-secondary" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-green-600">No Ar:</span>
              <span className="font-medium text-contrast">{clientesNoAr}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-blue-600">Otimização:</span>
              <span className="font-medium text-contrast">{clientesOtimizacao}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-amber-600">Problemas:</span>
              <span className="font-medium text-contrast">{clientesProblema}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
