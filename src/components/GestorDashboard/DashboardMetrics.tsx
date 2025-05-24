
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Cliente } from '@/lib/supabase'
import { isDataLimiteVencida, getBusinessDaysBetween } from '@/utils/dateUtils'

interface DashboardMetricsProps {
  clientes: Cliente[]
}

const STATUS_COLORS = {
  'Preenchimento do Formulário': '#ef4444', // red-500
  'Brief': '#f97316', // orange-500
  'Criativo': '#eab308', // yellow-500
  'Site': '#84cc16', // lime-500
  'Agendamento': '#22c55e', // green-500
  'No Ar': '#06b6d4', // cyan-500
  'Otimização': '#3b82f6', // blue-500
  'Off': '#6b7280', // gray-500
  'Reembolso': '#dc2626' // red-600
}

export function DashboardMetrics({ clientes }: DashboardMetricsProps) {
  // Cálculo do total de clientes
  const totalClientes = clientes.length

  // Cálculo dos status da campanha
  const statusCounts = clientes.reduce((acc, cliente) => {
    const status = cliente.status_campanha || 'Sem Status'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Dados para o funil horizontal de status
  const statusSequence = [
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

  const statusData = statusSequence.map(status => ({
    name: status,
    count: statusCounts[status] || 0,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS]
  }))

  // Cálculo de atrasos
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const atrasados = clientes.filter(cliente => {
    if (!cliente.data_venda) return false
    
    const dataVenda = new Date(cliente.data_venda)
    const diasUteis = getBusinessDaysBetween(dataVenda, hoje)
    
    // Consideramos atrasado se passou de 15 dias úteis
    return diasUteis > 15
  })

  const quaseAtrasados = clientes.filter(cliente => {
    if (!cliente.data_venda) return false
    
    const dataVenda = new Date(cliente.data_venda)
    const diasUteis = getBusinessDaysBetween(dataVenda, hoje)
    
    // Quase atrasado se falta 1 dia útil (está no 14º dia útil)
    return diasUteis === 14
  })

  // Cálculo de comissões
  const comissoesPagas = clientes.filter(cliente => cliente.comissao_paga === true)
  const totalComissoesPagas = comissoesPagas.reduce((total, cliente) => {
    return total + (cliente.valor_comissao || 0)
  }, 0)

  // Dados para gráfico de barras dos status
  const chartData = statusData.filter(item => item.count > 0).map(item => ({
    status: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    count: item.count,
    fill: item.color
  }))

  // Dados para gráfico de pizza dos atrasos
  const delayData = [
    { name: 'Em dia', value: totalClientes - atrasados.length - quaseAtrasados.length, fill: '#22c55e' },
    { name: 'Quase atrasados', value: quaseAtrasados.length, fill: '#eab308' },
    { name: 'Atrasados', value: atrasados.length, fill: '#ef4444' }
  ].filter(item => item.value > 0)

  const chartConfig = {
    count: {
      label: "Quantidade"
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Comissões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalComissoesPagas.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {comissoesPagas.length} comissões pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{atrasados.length}</div>
            <p className="text-xs text-muted-foreground">
              Mais de 15 dias úteis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quase Atrasados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{quaseAtrasados.length}</div>
            <p className="text-xs text-muted-foreground">
              14 dias úteis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funil de Status da Campanha */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso das Campanhas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
            {statusData.map((status, index) => (
              <div key={status.name} className="text-center">
                <div 
                  className="w-full h-16 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-2 shadow-sm"
                  style={{ backgroundColor: status.color }}
                >
                  {status.count}
                </div>
                <p className="text-xs text-muted-foreground leading-tight">
                  {status.name}
                </p>
                {index < statusData.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráficos Secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras dos Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status por Quantidade</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="status" type="category" width={120} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza dos Atrasos */}
        <Card>
          <CardHeader>
            <CardTitle>Situação dos Prazos</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={delayData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {delayData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center gap-4 mt-4">
              {delayData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.fill }}
                  />
                  <span className="text-sm">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Status Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Detalhado por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">{status}</p>
                  <p className="text-xs text-muted-foreground">clientes</p>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
