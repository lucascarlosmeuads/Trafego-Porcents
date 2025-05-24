
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
  CheckCircle,
  ArrowRight
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
  
  // Ordem do fluxo de campanha
  const statusFluxo = [
    'Preenchimento do Formulário',
    'Brief', 
    'Criativo',
    'Site',
    'Agendamento',
    'No Ar',
    'Otimização',
    'Off',
    'Reembolso'
  ]

  // Contagem por status seguindo o fluxo
  const statusCounts = clientes.reduce((acc, cliente) => {
    const status = cliente.status_campanha || 'Sem Status'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Contar clientes sem status definido
  const clientesSemStatus = clientes.filter(cliente => 
    !cliente.status_campanha || cliente.status_campanha.trim() === ''
  ).length

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

  // Dados para gráfico de barras (todos os status)
  const statusData = Object.entries(statusCounts)
    .filter(([status]) => status !== 'Sem Status')
    .map(([status, count]) => ({
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
    <div className="space-y-8">
      {/* Cards de Resumo - Linha Superior */}
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
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {valorTotalComissoes.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {comissoesPagas} cliente{comissoesPagas !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fluxo de Status - Elemento Principal */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Fluxo de Progresso das Campanhas
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Acompanhe o andamento dos seus clientes ao longo do processo
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Fluxo Principal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {statusFluxo.map((status, index) => {
                const count = statusCounts[status] || 0
                const isLast = index === statusFluxo.length - 1
                
                // Cores diferentes para cada etapa
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'Preenchimento do Formulário': return 'bg-slate-500/20 text-slate-700'
                    case 'Brief': return 'bg-blue-500/20 text-blue-700'
                    case 'Criativo': return 'bg-purple-500/20 text-purple-700'
                    case 'Site': return 'bg-orange-500/20 text-orange-700'
                    case 'Agendamento': return 'bg-yellow-500/20 text-yellow-700'
                    case 'No Ar': return 'bg-green-500/20 text-green-700'
                    case 'Otimização': return 'bg-emerald-500/20 text-emerald-700'
                    case 'Off': return 'bg-gray-500/20 text-gray-700'
                    case 'Reembolso': return 'bg-red-500/20 text-red-700'
                    default: return 'bg-muted text-muted-foreground'
                  }
                }

                return (
                  <div key={status} className="relative">
                    <div className={`
                      p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md
                      ${count > 0 ? 'border-primary/30' : 'border-muted'}
                      ${getStatusColor(status)}
                    `}>
                      <div className="text-center space-y-2">
                        <div className="text-3xl font-bold">
                          {count}
                        </div>
                        <div className="text-sm font-semibold leading-tight">
                          {status}
                        </div>
                      </div>
                    </div>
                    
                    {/* Seta conectora */}
                    {!isLast && (
                      <div className="hidden xl:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            
            {/* Clientes Sem Status */}
            {clientesSemStatus > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Sem Status:</span>
                  <span className="text-xl font-bold text-yellow-900">{clientesSemStatus}</span>
                  <span className="text-sm text-yellow-700">cliente{clientesSemStatus !== 1 ? 's' : ''} sem status definido</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gráficos - Seção Secundária */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              Distribuição por Status
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
            <CardTitle className="flex items-center gap-2 text-lg">
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
    </div>
  )
}
