
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, DollarSign, Calendar } from 'lucide-react'
import { SellerMetrics as SellerMetricsType } from '@/hooks/useSellerData'
import { formatCurrency } from '@/lib/utils'

interface SellerMetricsProps {
  metrics: SellerMetricsType
  loading: boolean
}

export function SellerMetrics({ metrics, loading }: SellerMetricsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Comissão fixa de R$ 60,00 por cliente cadastrado
  const comissaoPorCliente = 60.00

  return (
    <div className="space-y-6">
      {/* Client Registration Report */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          📈 Relatório de Cadastros de Clientes
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.clientsToday}</div>
              <p className="text-xs text-muted-foreground">
                clientes cadastrados hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.clientsThisWeek}</div>
              <p className="text-xs text-muted-foreground">
                clientes nos últimos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.clientsThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                clientes este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Ano</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.clientsThisYear}</div>
              <p className="text-xs text-muted-foreground">
                clientes este ano
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Commission Report */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          💰 Relatório de Comissões (R$ 60,00 por cliente)
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoje</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.clientsToday * comissaoPorCliente)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.clientsToday} cliente{metrics.clientsToday !== 1 ? 's' : ''} hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.clientsThisWeek * comissaoPorCliente)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.clientsThisWeek} cliente{metrics.clientsThisWeek !== 1 ? 's' : ''} esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.clientsThisMonth * comissaoPorCliente)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.clientsThisMonth} cliente{metrics.clientsThisMonth !== 1 ? 's' : ''} este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.clientsThisYear * comissaoPorCliente)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.clientsThisYear} cliente{metrics.clientsThisYear !== 1 ? 's' : ''} no total
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Legacy Sales Report (mantido para compatibilidade) */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          💰 Relatório de Vendas (Sistema Antigo - Comissões Pagas)
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoje</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.salesToday)}</div>
              <p className="text-xs text-muted-foreground">
                em comissões pagas hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ontem</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.salesYesterday)}</div>
              <p className="text-xs text-muted-foreground">
                em comissões pagas ontem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.salesThisMonth)}</div>
              <p className="text-xs text-muted-foreground">
                em comissões pagas este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.salesAllTime)}</div>
              <p className="text-xs text-muted-foreground">
                total de comissões pagas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
