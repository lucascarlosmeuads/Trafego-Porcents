
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp,
  Calendar,
  CheckCircle
} from 'lucide-react'
import type { Cliente } from '@/lib/supabase'
import { addBusinessDays, getBusinessDaysBetween } from '@/utils/dateUtils'

interface DashboardMetricsProps {
  clientes: Cliente[]
  currentManager: string
}

export function DashboardMetrics({ clientes, currentManager }: DashboardMetricsProps) {
  // Função para verificar se cliente está em atraso
  const isAtrasado = (dataVenda: string): boolean => {
    if (!dataVenda) return false
    
    try {
      const venda = new Date(dataVenda)
      const limite = addBusinessDays(venda, 15)
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      limite.setHours(0, 0, 0, 0)
      
      return hoje > limite
    } catch {
      return false
    }
  }

  // Função para verificar se cliente está quase atrasando
  const isQuaseAtrasando = (dataVenda: string): boolean => {
    if (!dataVenda) return false
    
    try {
      const venda = new Date(dataVenda)
      const limite = addBusinessDays(venda, 15)
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      limite.setHours(0, 0, 0, 0)
      
      const diasRestantes = getBusinessDaysBetween(hoje, limite) - 1
      return diasRestantes === 1
    } catch {
      return false
    }
  }

  // Calcular métricas
  const totalClientes = clientes.length
  
  // Contagem por status
  const statusCounts = clientes.reduce((acc, cliente) => {
    const status = cliente.status_campanha || 'Sem Status'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Clientes em atraso (apenas os que não estão 'No Ar' ou 'Otimização' ou 'Off' ou 'Reembolso')
  const clientesAtrasados = clientes.filter(cliente => {
    const statusEntregue = ['No Ar', 'Otimização', 'Off', 'Reembolso'].includes(cliente.status_campanha)
    return !statusEntregue && isAtrasado(cliente.data_venda)
  }).length

  // Clientes quase atrasando
  const clientesQuaseAtrasando = clientes.filter(cliente => {
    const statusEntregue = ['No Ar', 'Otimização', 'Off', 'Reembolso'].includes(cliente.status_campanha)
    return !statusEntregue && isQuaseAtrasando(cliente.data_venda)
  }).length

  // Comissões pagas
  const comissoesPagas = clientes.filter(cliente => cliente.comissao_paga).length
  const valorTotalComissoes = clientes
    .filter(cliente => cliente.comissao_paga)
    .reduce((total, cliente) => total + (cliente.valor_comissao || 60), 0)

  // Dados para gráfico de barras (status)
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    status: status.length > 15 ? status.substring(0, 15) + '...' : status,
    count,
    fullStatus: status
  }))

  // Dados para gráfico de pizza (resumo)
  const pieData = [
    { name: 'Em Andamento', value: clientes.filter(c => !['Off', 'Reembolso'].includes(c.status_campanha)).length, color: '#3b82f6' },
    { name: 'Finalizados', value: clientes.filter(c => ['Off', 'Reembolso'].includes(c.status_campanha)).length, color: '#64748b' }
  ]

  const chartConfig = {
    count: {
      label: "Quantidade",
      color: "#3b82f6",
    },
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              Clientes atribuídos a {currentManager}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{clientesAtrasados}</div>
            <p className="text-xs text-muted-foreground">
              Ultrapassaram 15 dias úteis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quase Atrasando</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{clientesQuaseAtrasando}</div>
            <p className="text-xs text-muted-foreground">
              Falta 1 dia útil
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{comissoesPagas}</div>
            <p className="text-xs text-muted-foreground">
              R$ {valorTotalComissoes.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Status das Campanhas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <XAxis 
                    dataKey="status" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name, props) => [
                      value,
                      props.payload?.fullStatus || name
                    ]}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Resumo Geral */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Resumo Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento por Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Detalhamento por Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="text-center">
                <Badge variant="outline" className="mb-2">
                  {status}
                </Badge>
                <div className="text-xl font-bold">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
