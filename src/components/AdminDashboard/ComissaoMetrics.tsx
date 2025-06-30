
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  Star,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react'

interface ComissaoMetricsProps {
  clientes: Cliente[]
  onFilterChange: (filter: string) => void
  selectedFilter: string
}

export function ComissaoMetrics({ clientes, onFilterChange, selectedFilter }: ComissaoMetricsProps) {
  const metricas = useMemo(() => {
    const agora = new Date()
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
    const inicioSemana = new Date(hoje)
    inicioSemana.setDate(hoje.getDate() - hoje.getDay())
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)

    // Separar pagos e pendentes
    const clientesPagos = clientes.filter(c => c.comissao === 'Pago')
    const clientesPendentes = clientes.filter(c => c.comissao === 'Pendente')
    const clientesEstrela = clientes.filter(c => c.eh_ultimo_pago)

    // Calcular valores
    const totalPago = clientesPagos.reduce((sum, c) => sum + (c.valor_comissao || 60), 0)
    const totalPendente = clientesPendentes.reduce((sum, c) => sum + (c.valor_comissao || 60), 0)

    // Pagamentos por período
    const pagosHoje = clientesPagos.filter(c => {
      if (!c.ultimo_pagamento_em) return false
      const dataPagamento = new Date(c.ultimo_pagamento_em)
      return dataPagamento >= hoje
    })

    const pagosSemana = clientesPagos.filter(c => {
      if (!c.ultimo_pagamento_em) return false
      const dataPagamento = new Date(c.ultimo_pagamento_em)
      return dataPagamento >= inicioSemana
    })

    const pagosMes = clientesPagos.filter(c => {
      if (!c.ultimo_pagamento_em) return false
      const dataPagamento = new Date(c.ultimo_pagamento_em)
      return dataPagamento >= inicioMes
    })

    // Ranking de gestores
    const gestorMap = new Map<string, { pagos: number, pendentes: number, valorPago: number, valorPendente: number }>()
    
    clientes.forEach(cliente => {
      const gestor = cliente.email_gestor || 'Sem gestor'
      if (!gestorMap.has(gestor)) {
        gestorMap.set(gestor, { pagos: 0, pendentes: 0, valorPago: 0, valorPendente: 0 })
      }
      
      const stats = gestorMap.get(gestor)!
      const valor = cliente.valor_comissao || 60
      
      if (cliente.comissao === 'Pago') {
        stats.pagos++
        stats.valorPago += valor
      } else {
        stats.pendentes++
        stats.valorPendente += valor
      }
    })

    const rankingGestores = Array.from(gestorMap.entries())
      .map(([email, stats]) => ({
        email,
        nome: email.split('@')[0],
        ...stats,
        total: stats.valorPago + stats.valorPendente
      }))
      .sort((a, b) => b.valorPago - a.valorPago)
      .slice(0, 5)

    return {
      totalPago,
      totalPendente,
      clientesPagos: clientesPagos.length,
      clientesPendentes: clientesPendentes.length,
      clientesEstrela: clientesEstrela.length,
      pagosHoje: pagosHoje.length,
      valorPagosHoje: pagosHoje.reduce((sum, c) => sum + (c.valor_comissao || 60), 0),
      pagosSemana: pagosSemana.length,
      valorPagosSemana: pagosSemana.reduce((sum, c) => sum + (c.valor_comissao || 60), 0),
      pagosMes: pagosMes.length,
      valorPagosMes: pagosMes.reduce((sum, c) => sum + (c.valor_comissao || 60), 0),
      rankingGestores
    }
  }, [clientes])

  const filtros = [
    { key: 'todos', label: 'Todos', icon: Users, count: clientes.length },
    { key: 'pagos', label: 'Pagos', icon: CheckCircle, count: metricas.clientesPagos },
    { key: 'pendentes', label: 'Pendentes', icon: Clock, count: metricas.clientesPendentes },
    { key: 'estrela', label: 'Últimos Pagos', icon: Star, count: metricas.clientesEstrela },
    { key: 'hoje', label: 'Pagos Hoje', icon: Calendar, count: metricas.pagosHoje }
  ]

  return (
    <div className="space-y-6">
      {/* Filtros Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Filtros Rápidos - Comissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {filtros.map((filtro) => (
              <Button
                key={filtro.key}
                variant={selectedFilter === filtro.key ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange(filtro.key)}
                className="flex items-center gap-2"
              >
                <filtro.icon className="h-4 w-4" />
                {filtro.label}
                <Badge variant="secondary" className="ml-1">
                  {filtro.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">💰 Total Pago</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{formatCurrency(metricas.totalPago)}</div>
            <p className="text-xs text-green-700">
              {metricas.clientesPagos} cliente{metricas.clientesPagos !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">⏳ Total Pendente</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{formatCurrency(metricas.totalPendente)}</div>
            <p className="text-xs text-red-700">
              {metricas.clientesPendentes} cliente{metricas.clientesPendentes !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">📅 Pago Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(metricas.valorPagosHoje)}</div>
            <p className="text-xs text-blue-700">
              {metricas.pagosHoje} pagamento{metricas.pagosHoje !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">⭐ Últimos Pagos</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{metricas.clientesEstrela}</div>
            <p className="text-xs text-yellow-700">
              marcados com estrela
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas por Período */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📊 Esta Semana</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metricas.valorPagosSemana)}</div>
            <p className="text-xs text-muted-foreground">
              {metricas.pagosSemana} pagamento{metricas.pagosSemana !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📈 Este Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metricas.valorPagosMes)}</div>
            <p className="text-xs text-muted-foreground">
              {metricas.pagosMes} pagamento{metricas.pagosMes !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">💯 Taxa de Conversão</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientes.length > 0 ? Math.round((metricas.clientesPagos / clientes.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              clientes com comissão paga
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Gestores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            🏆 Top 5 Gestores - Comissões Pagas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metricas.rankingGestores.map((gestor, index) => (
              <div key={gestor.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                      index === 1 ? 'bg-gray-400 text-gray-900' : 
                      index === 2 ? 'bg-orange-400 text-orange-900' : 
                      'bg-blue-100 text-blue-900'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{gestor.nome}</div>
                    <div className="text-sm text-gray-600">{gestor.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{formatCurrency(gestor.valorPago)}</div>
                  <div className="text-sm text-gray-600">
                    {gestor.pagos} pagos / {gestor.pendentes} pendentes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
