
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, AlertTriangle, CheckCircle, CircleDollarSign, Clock } from 'lucide-react'
import type { Cliente } from '@/lib/supabase'
import { useComissaoMetrics } from '@/hooks/useComissaoMetrics'

interface DashboardMetricsProps {
  clientes: Cliente[]
}

export function DashboardMetrics({ clientes }: DashboardMetricsProps) {
  const comissaoMetrics = useComissaoMetrics(clientes)

  const clientesAtivos = clientes.filter(cliente => 
    cliente.status_campanha !== 'Off' && 
    cliente.status_campanha !== 'Reembolso' && 
    cliente.status_campanha !== 'Problema'
  )

  const clientesNoAr = clientes.filter(cliente => 
    cliente.status_campanha === 'No Ar' || cliente.status_campanha === 'Otimização'
  )

  const clientesProblemas = clientes.filter(cliente => 
    cliente.status_campanha === 'Problema'
  )

  const clientesAtrasados = clientes.filter(cliente => {
    if (!cliente.data_venda || cliente.status_campanha === 'No Ar' || cliente.status_campanha === 'Otimização') return false
    
    const venda = new Date(cliente.data_venda)
    const limite = new Date(venda)
    limite.setDate(limite.getDate() + 15)
    
    return new Date() > limite
  })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-contrast">Total de Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-contrast">{clientes.length}</div>
          <p className="text-xs text-contrast-secondary">
            {clientesAtivos.length} ativos
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-contrast">Campanhas No Ar</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{clientesNoAr.length}</div>
          <p className="text-xs text-contrast-secondary">
            Campanhas ativas
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-contrast">💰 Total Pendente</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{comissaoMetrics.comissoesPendentes}</div>
          <p className="text-xs text-contrast-secondary">
            R$ {comissaoMetrics.totalPendente.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-contrast">🟢 Disponível para Saque</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{comissaoMetrics.comissoesDisponiveis}</div>
          <p className="text-xs text-contrast-secondary">
            R$ {comissaoMetrics.totalDisponivel.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-contrast">Problemas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{clientesProblemas.length}</div>
          <p className="text-xs text-contrast-secondary">
            Requer atenção
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-contrast">Atrasados</CardTitle>
          <TrendingUp className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{clientesAtrasados.length}</div>
          <p className="text-xs text-contrast-secondary">
            Passaram de 15 dias
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
