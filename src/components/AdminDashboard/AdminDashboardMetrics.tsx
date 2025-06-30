
import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { useFiltrosComissao, type FiltroComissao } from '@/hooks/useFiltrosComissao'
import { FiltrosComissaoAvancados } from '@/components/ClientesTable/FiltrosComissaoAvancados'
import { Cliente } from '@/lib/supabase'
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
  Star,
  AlertCircle
} from 'lucide-react'

interface AdminDashboardMetricsProps {
  clientes: Cliente[]
  selectedManager: string | null
}

export function AdminDashboardMetrics({ clientes, selectedManager }: AdminDashboardMetricsProps) {
  const { 
    filtros, 
    setFiltros, 
    clientesFiltrados, 
    estatisticas 
  } = useFiltrosComissao(clientes)

  // Lista de gestores únicos para o filtro
  const gestores = useMemo(() => {
    const gestoresUnicos = Array.from(
      new Set(clientes.map(c => c.email_gestor).filter(Boolean))
    ).map(email => ({
      email,
      nome: email.split('@')[0] // Simplificado - você pode melhorar isso
    }))
    
    return gestoresUnicos
  }, [clientes])

  // Métricas detalhadas
  const metricas = useMemo(() => {
    const clientesDoMes = clientes.filter(c => {
      const created = new Date(c.created_at)
      const agora = new Date()
      return created.getMonth() === agora.getMonth() && 
             created.getFullYear() === agora.getFullYear()
    })

    const pagamentosDoMes = clientes.filter(c => {
      if (!c.ultimo_pagamento_em) return false
      const pagamento = new Date(c.ultimo_pagamento_em)
      const agora = new Date()
      return pagamento.getMonth() === agora.getMonth() && 
             pagamento.getFullYear() === agora.getFullYear()
    })

    return {
      clientesDoMes: clientesDoMes.length,
      pagamentosDoMes: pagamentosDoMes.length,
      ticketMedio: estatisticas.total > 0 ? 
        (estatisticas.valorTotalPago + estatisticas.valorTotalPendente) / estatisticas.total : 0
    }
  }, [clientes, estatisticas])

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <FiltrosComissaoAvancados
        clientes={clientes}
        filtros={filtros}
        onFiltrosChange={setFiltros}
        gestores={gestores}
      />

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total}</div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.filtrados} após filtros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(estatisticas.valorTotalPago)}
            </div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.pagos} cliente(s) - {metricas.pagamentosDoMes} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(estatisticas.valorTotalPendente)}
            </div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.pendentes} cliente(s) pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Últimos Pagos</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {estatisticas.ultimosPagos}
            </div>
            <p className="text-xs text-muted-foreground">
              Marcados como últimos pagos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metricas.ticketMedio)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor médio por cliente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes este Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.clientesDoMes}</div>
            <p className="text-xs text-muted-foreground">
              Novos clientes em {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.total > 0 ? 
                Math.round((estatisticas.pagos / estatisticas.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes que geraram comissão
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Gestor Selecionado */}
      {selectedManager && selectedManager !== '__GESTORES__' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Filtro Ativo: {selectedManager}
            </CardTitle>
            <CardDescription>
              Métricas específicas do gestor selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Badge variant="outline">
                {clientes.filter(c => c.email_gestor === selectedManager).length} clientes
              </Badge>
              <Badge variant="outline">
                {formatCurrency(
                  clientes
                    .filter(c => c.email_gestor === selectedManager && c.comissao === 'Pago')
                    .reduce((sum, c) => sum + (c.valor_comissao || 60), 0)
                )} pagos
              </Badge>
              <Badge variant="outline">
                {formatCurrency(
                  clientes
                    .filter(c => c.email_gestor === selectedManager && c.comissao !== 'Pago')
                    .reduce((sum, c) => sum + (c.valor_comissao || 60), 0)
                )} pendentes
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
