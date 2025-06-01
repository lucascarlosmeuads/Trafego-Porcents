
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CheckCircle, AlertTriangle, CircleDollarSign, XCircle } from 'lucide-react'
import type { Cliente } from '@/lib/supabase'

interface DashboardMetricsProps {
  clientes: Cliente[]
}

export function DashboardMetrics({ clientes }: DashboardMetricsProps) {
  console.log('📊 [DashboardMetrics] Calculando métricas para', clientes.length, 'clientes')

  // Total de clientes
  const totalClientes = clientes.length

  // Campanhas no ar (status "Campanha no Ar" ou "Otimização")
  const clientesNoAr = clientes.filter(cliente => 
    cliente.status_campanha === 'Campanha no Ar' || cliente.status_campanha === 'Otimização'
  )

  // Total pendente (comissao = "Pendente" - cor vermelha)
  const clientesPendentes = clientes.filter(cliente => 
    cliente.comissao === 'Pendente'
  )
  const totalPendente = clientesPendentes.reduce((total, cliente) => 
    total + (cliente.valor_comissao || 60.00), 0
  )

  // Total já recebido (comissao = "Pago" - cor verde)
  const clientesPagos = clientes.filter(cliente => 
    cliente.comissao === 'Pago'
  )
  const totalRecebido = clientesPagos.reduce((total, cliente) => 
    total + (cliente.valor_comissao || 60.00), 0
  )

  // Clientes com problemas
  const clientesProblemas = clientes.filter(cliente => 
    cliente.status_campanha === 'Problema'
  )

  console.log('📈 [DashboardMetrics] Métricas calculadas:', {
    totalClientes,
    campanhasNoAr: clientesNoAr.length,
    pendentes: clientesPendentes.length,
    pagos: clientesPagos.length,
    problemas: clientesProblemas.length,
    totalPendente,
    totalRecebido
  })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-contrast">Total de Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-contrast">{totalClientes}</div>
          <p className="text-xs text-contrast-secondary">
            clientes cadastrados
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
            campanhas ativas
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-contrast">🔴 Total Pendente</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">R$ {totalPendente.toFixed(2)}</div>
          <p className="text-xs text-contrast-secondary">
            {clientesPendentes.length} comissões pendentes
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-contrast">🟢 Total Já Recebido</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">R$ {totalRecebido.toFixed(2)}</div>
          <p className="text-xs text-contrast-secondary">
            {clientesPagos.length} comissões pagas
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-contrast">⚠️ Problemas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{clientesProblemas.length}</div>
          <p className="text-xs text-contrast-secondary">
            requer atenção
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
