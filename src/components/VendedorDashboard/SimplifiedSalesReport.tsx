import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays, TrendingUp, Users, DollarSign } from 'lucide-react'
import { calculateDualCommission, isClienteNovoSale, hasValidSaleValue } from '@/utils/dualCommissionCalculator'

interface ClienteSimples {
  id: string
  nome_cliente: string
  telefone: string
  email_cliente: string
  vendedor: string
  email_gestor: string
  status_campanha: string
  created_at: string
  valor_venda_inicial?: number | null
  valor_comissao?: number | null
}

interface SimplifiedSalesReportProps {
  clientes: ClienteSimples[]
  loading: boolean
}

type DateFilter = 'hoje' | 'ontem' | 'ultimos7' | 'ultimos30' | 'todos'

export function SimplifiedSalesReport({ clientes, loading }: SimplifiedSalesReportProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('hoje')

  // Função para calcular comissão correta do vendedor
  const getSellerCommission = (cliente: ClienteSimples): number => {
    // Se é Cliente Novo com valor de venda válido, usar sistema dual
    if (isClienteNovoSale(cliente.status_campanha) && hasValidSaleValue(cliente.valor_venda_inicial)) {
      return calculateDualCommission(cliente.valor_venda_inicial!, 'seller')
    }
    
    // Senão, usar valor padrão do banco ou 60
    return cliente.valor_comissao || 60
  }

  // Filtrar clientes por período
  const filteredClientes = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return clientes.filter(cliente => {
      if (!cliente.created_at) return false
      
      const clientDate = new Date(cliente.created_at)
      
      switch (dateFilter) {
        case 'hoje':
          const clientDateOnly = new Date(clientDate.getFullYear(), clientDate.getMonth(), clientDate.getDate())
          return clientDateOnly.getTime() === today.getTime()
        
        case 'ontem':
          const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
          const clientDateOnlyYesterday = new Date(clientDate.getFullYear(), clientDate.getMonth(), clientDate.getDate())
          return clientDateOnlyYesterday.getTime() === yesterday.getTime()
        
        case 'ultimos7':
          const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return clientDate >= sevenDaysAgo
        
        case 'ultimos30':
          const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          return clientDate >= thirtyDaysAgo
        
        case 'todos':
        default:
          return true
      }
    })
  }, [clientes, dateFilter])

  // Calcular métricas
  const totalVendas = filteredClientes.length
  const totalComissao = filteredClientes.reduce((sum, cliente) => sum + getSellerCommission(cliente), 0)
  const vendasClienteNovo = filteredClientes.filter(c => isClienteNovoSale(c.status_campanha)).length
  const vendasComValor = filteredClientes.filter(c => hasValidSaleValue(c.valor_venda_inicial)).length

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFilterLabel = (filter: DateFilter) => {
    switch (filter) {
      case 'hoje': return 'Hoje'
      case 'ontem': return 'Ontem'
      case 'ultimos7': return 'Últimos 7 dias'
      case 'ultimos30': return 'Últimos 30 dias'
      case 'todos': return 'Todos os períodos'
      default: return 'Período'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando relatório...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Filtro de Período
            </CardTitle>
            <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="ontem">Ontem</SelectItem>
                <SelectItem value="ultimos7">Últimos 7 dias</SelectItem>
                <SelectItem value="ultimos30">Últimos 30 dias</SelectItem>
                <SelectItem value="todos">Todos os períodos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendas}</div>
            <p className="text-xs text-muted-foreground">
              {getFilterLabel(dateFilter)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comissão</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalComissao)}</div>
            <p className="text-xs text-muted-foreground">
              Sua comissão total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliente Novo</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{vendasClienteNovo}</div>
            <p className="text-xs text-muted-foreground">
              Vendas R$ 350/500
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Valor</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{vendasComValor}</div>
            <p className="text-xs text-muted-foreground">
              Vendas com valor definido
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes das Vendas - {getFilterLabel(dateFilter)}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClientes.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma venda encontrada no período selecionado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClientes.map((cliente) => {
                const comissaoVendedor = getSellerCommission(cliente)
                const valorVenda = cliente.valor_venda_inicial
                const isClienteNovo = isClienteNovoSale(cliente.status_campanha)
                
                return (
                  <div
                    key={cliente.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{cliente.nome_cliente}</h3>
                            <p className="text-sm text-muted-foreground">{cliente.email_cliente}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Cadastrado em: {formatDate(cliente.created_at)}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <div className="space-y-1">
                              {valorVenda && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Valor da Venda: </span>
                                  <span className="font-semibold text-blue-600">
                                    {formatCurrency(valorVenda)}
                                  </span>
                                </div>
                              )}
                              
                              <div className="text-sm">
                                <span className="text-muted-foreground">Sua Comissão: </span>
                                <span className="font-bold text-green-600 text-lg">
                                  {formatCurrency(comissaoVendedor)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  isClienteNovo 
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                                }`}>
                                  {cliente.status_campanha}
                                </span>
                                
                                {isClienteNovo && hasValidSaleValue(valorVenda) && (
                                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                    Comissão Dupla
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo Final */}
      {filteredClientes.length > 0 && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200">
              💰 Resumo Financeiro - {getFilterLabel(dateFilter)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {totalVendas}
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Total de Vendas
                </p>
              </div>
              
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {vendasClienteNovo}
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Cliente Novo (R$ 350/500)
                </p>
              </div>
              
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(totalComissao)}
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Total da Sua Comissão
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}