
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CheckCircle, AlertTriangle, CircleDollarSign, Clock, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface OptimizedMetrics {
  totalClientes: number
  clientesNoAr: number
  clientesPendentes: number
  totalPendente: number
  clientesPagos: number
  totalRecebido: number
  clientesProblemas: number
  gestorDistribution: Record<string, number>
  statusDistribution: Record<string, number>
}

interface OptimizedAdminDashboardMetricsProps {
  metrics: OptimizedMetrics
  selectedManager?: string | null
}

// MEMOIZAÇÃO: Componente de métrica individual
const MetricCard = React.memo(function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  color = 'text-contrast',
  bgColor = 'bg-card'
}: {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  color?: string
  bgColor?: string
}) {
  return (
    <Card className={`${bgColor} border-border`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-contrast">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color === 'text-contrast' ? 'text-muted-foreground' : color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <p className="text-xs text-contrast-secondary">{description}</p>
      </CardContent>
    </Card>
  )
})

// MEMOIZAÇÃO: Grid de métricas gerais
const GeneralMetricsGrid = React.memo(function GeneralMetricsGrid({
  metrics
}: {
  metrics: OptimizedMetrics
}) {
  console.log('🎯 [GeneralMetricsGrid] Renderizando métricas gerais (memoizado)')
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <MetricCard
        title="Total de Clientes"
        value={metrics.totalClientes}
        description="clientes cadastrados"
        icon={Users}
      />
      
      <MetricCard
        title="Campanhas No Ar"
        value={metrics.clientesNoAr}
        description="campanhas ativas"
        icon={CheckCircle}
        color="text-green-600"
      />
      
      <MetricCard
        title="🔴 Total Pendente"
        value={formatCurrency(metrics.totalPendente)}
        description={`${metrics.clientesPendentes} comissões pendentes`}
        icon={CircleDollarSign}
        color="text-red-600"
      />
      
      <MetricCard
        title="🟢 Total Já Recebido"
        value={formatCurrency(metrics.totalRecebido)}
        description={`${metrics.clientesPagos} comissões pagas`}
        icon={CircleDollarSign}
        color="text-green-600"
      />
      
      <MetricCard
        title="⚠️ Problemas"
        value={metrics.clientesProblemas}
        description="requer atenção"
        icon={AlertTriangle}
        color="text-amber-600"
      />
    </div>
  )
})

// MEMOIZAÇÃO: Grid de controle de pagamentos
const PaymentControlGrid = React.memo(function PaymentControlGrid({
  metrics
}: {
  metrics: OptimizedMetrics
}) {
  console.log('💳 [PaymentControlGrid] Renderizando controle de pagamentos (memoizado)')
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <MetricCard
        title="⏰ Pendentes para Pagar"
        value={metrics.clientesPendentes}
        description={`${formatCurrency(metrics.totalPendente)} aguardando pagamento`}
        icon={Clock}
        color="text-orange-600"
      />
      
      <MetricCard
        title="✅ Já Paguei"
        value={metrics.clientesPagos}
        description={`${formatCurrency(metrics.totalRecebido)} já pagos pelo admin`}
        icon={CreditCard}
        color="text-blue-600"
      />
    </div>
  )
})

export const OptimizedAdminDashboardMetrics = React.memo(function OptimizedAdminDashboardMetrics({
  metrics,
  selectedManager
}: OptimizedAdminDashboardMetricsProps) {
  console.log('📊 [OptimizedAdminDashboardMetrics] Renderizando métricas otimizadas')
  console.log('📊 [OptimizedAdminDashboardMetrics] Gestor selecionado:', selectedManager)
  console.log('📊 [OptimizedAdminDashboardMetrics] Performance check - métricas recebidas:', {
    totalClientes: metrics.totalClientes,
    calculationTime: 'Pré-calculado via useMemo'
  })

  return (
    <div className="space-y-6">
      {/* Métricas Gerais */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-contrast">
          📊 Visão Geral {selectedManager ? `- ${selectedManager}` : '(Todos os Gestores)'}
        </h3>
        <GeneralMetricsGrid metrics={metrics} />
      </div>

      {/* Métricas Específicas do Admin */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-contrast">
          💳 Controle de Pagamentos (Admin)
        </h3>
        <PaymentControlGrid metrics={metrics} />
      </div>
    </div>
  )
})
