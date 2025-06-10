
import { memo, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, CircleDollarSign, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface AdminDashboardMetricsProps {
  clientes: Cliente[]
  selectedManager?: string | null
}

// Optimize AdminDashboardMetrics with React.memo
export const OptimizedAdminDashboardMetrics = memo(function OptimizedAdminDashboardMetrics({ 
  clientes, 
  selectedManager 
}: AdminDashboardMetricsProps) {
  
  // Memoize expensive metric calculations
  const metrics = useMemo(() => {
    console.log('📊 [OptimizedAdminDashboardMetrics] Calculando métricas para', clientes.length, 'clientes')
    
    const totalClientes = clientes.length

    // Campanhas no ar (status "Campanha no Ar" ou "Otimização")
    const clientesNoAr = clientes.filter(cliente => 
      cliente.status_campanha === 'Campanha no Ar' || cliente.status_campanha === 'Otimização'
    )

    // CORREÇÃO: Total pendente - APENAS clientes com status "Pendente" (vermelhinhos)
    const clientesPendentes = clientes.filter(cliente => 
      cliente.comissao === 'Pendente'
    )
    const totalPendente = clientesPendentes.reduce((total, cliente) => 
      total + (cliente.valor_comissao || 60.00), 0
    )

    // Total já recebido - clientes com comissão paga
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

    // Sites pendentes
    const sitesPendentes = clientes.filter(cliente => 
      cliente.site_status === 'pendente' || cliente.site_status === 'aguardando_link'
    )

    console.log('📈 [OptimizedAdminDashboardMetrics] Métricas calculadas:', {
      totalClientes,
      clientesNoAr: clientesNoAr.length,
      clientesPendentes: clientesPendentes.length,
      totalPendente: formatCurrency(totalPendente),
      clientesPagos: clientesPagos.length,
      totalRecebido: formatCurrency(totalRecebido),
      clientesProblemas: clientesProblemas.length,
      sitesPendentes: sitesPendentes.length
    })

    return {
      totalClientes,
      clientesNoAr,
      clientesPendentes,
      totalPendente,
      clientesPagos,
      totalRecebido,
      clientesProblemas,
      sitesPendentes
    }
  }, [clientes])

  // Memoize the header text to prevent unnecessary recalculations
  const headerText = useMemo(() => {
    if (!selectedManager || selectedManager === 'Todos os Gestores' || selectedManager === 'Todos os Clientes') {
      return 'Métricas Gerais - Todos os Gestores'
    }
    return `Métricas do Gestor: ${selectedManager}`
  }, [selectedManager])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-contrast">{headerText}</h2>
        <span className="text-sm text-contrast-secondary">
          Atualizado em tempo real
        </span>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-contrast">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-contrast">{metrics.totalClientes}</div>
            <p className="text-xs text-contrast-secondary">clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-contrast">Campanhas No Ar</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.clientesNoAr.length}</div>
            <p className="text-xs text-contrast-secondary">campanhas ativas</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-contrast">🔴 Total Pendente</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(metrics.totalPendente)}</div>
            <p className="text-xs text-contrast-secondary">
              {metrics.clientesPendentes.length} comissões pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-contrast">🟢 Total Recebido</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalRecebido)}</div>
            <p className="text-xs text-contrast-secondary">
              {metrics.clientesPagos.length} comissões pagas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-contrast">⚠️ Problemas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{metrics.clientesProblemas.length}</div>
            <p className="text-xs text-contrast-secondary">requer atenção</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-contrast">🌐 Sites Pendentes</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.sitesPendentes.length}</div>
            <p className="text-xs text-contrast-secondary">aguardando criação</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

// Add default export
export default OptimizedAdminDashboardMetrics
