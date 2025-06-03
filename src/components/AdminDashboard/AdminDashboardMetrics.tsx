
import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CheckCircle, AlertTriangle, CircleDollarSign, XCircle, Clock, CreditCard } from 'lucide-react'
import type { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface AdminDashboardMetricsProps {
  clientes: Cliente[]
  selectedManager?: string | null
}

export const AdminDashboardMetrics = React.memo(function AdminDashboardMetrics({ 
  clientes, 
  selectedManager 
}: AdminDashboardMetricsProps) {
  console.log('📊 [AdminDashboardMetrics] Calculando métricas para', clientes.length, 'clientes')
  console.log('📊 [AdminDashboardMetrics] Gestor selecionado:', selectedManager)

  // MEMOIZAÇÃO DOS CÁLCULOS PESADOS
  const metricas = useMemo(() => {
    console.log('🧮 [AdminDashboardMetrics] Recalculando métricas (memoizado)')
    
    // FUNÇÃO CORRIGIDA: Determinar se uma comissão é considerada pendente
    const isComissaoPendente = (comissao: string | null | undefined): boolean => {
      if (!comissao || comissao.trim() === '') {
        return true
      }
      
      const comissaoTrimmed = comissao.trim()
      
      if (comissaoTrimmed === 'Pago') {
        return false
      }
      
      return true
    }

    // Total de clientes
    const totalClientes = clientes.length

    // Campanhas no ar (status "Campanha no Ar" ou "Otimização")
    const clientesNoAr = clientes.filter(cliente => 
      cliente.status_campanha === 'Campanha no Ar' || cliente.status_campanha === 'Otimização'
    )

    // CÁLCULO CORRIGIDO: Total pendente - SOMA OS VALORES REAIS de valor_comissao
    const clientesPendentes = clientes.filter(cliente => 
      isComissaoPendente(cliente.comissao)
    )
    const totalPendente = clientesPendentes.reduce((total, cliente) => 
      total + (cliente.valor_comissao || 60.00), 0
    )

    // CÁLCULO CORRIGIDO: Total já recebido - SOMA OS VALORES REAIS de valor_comissao
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

    return {
      totalClientes,
      clientesNoAr,
      clientesPendentes,
      totalPendente,
      clientesPagos,
      totalRecebido,
      clientesProblemas
    }
  }, [clientes]) // Só recalcula quando a lista de clientes muda

  // VALIDAÇÃO DOS CÁLCULOS (também memoizada)
  const debugInfo = useMemo(() => {
    console.log('📈 [AdminDashboardMetrics] === AUDITORIA DE CÁLCULOS ===')
    console.log('📊 [AdminDashboardMetrics] Breakdown por status de comissão:')
    
    // Agrupar por status de comissão para debug
    const comissaoBreakdown = clientes.reduce((acc, cliente) => {
      const status = cliente.comissao || 'null/undefined'
      if (!acc[status]) {
        acc[status] = { count: 0, total: 0 }
      }
      acc[status].count++
      acc[status].total += (cliente.valor_comissao || 60.00)
      return acc
    }, {} as Record<string, { count: number, total: number }>)

    console.log('📊 [AdminDashboardMetrics] Breakdown detalhado:', comissaoBreakdown)
    
    console.log('📈 [AdminDashboardMetrics] Métricas calculadas:')
    console.log('   🔢 Total clientes:', metricas.totalClientes)
    console.log('   🟢 Campanhas no ar:', metricas.clientesNoAr.length)
    console.log('   🔴 Pendentes (count):', metricas.clientesPendentes.length)
    console.log('   🔴 Pendentes (valor):', formatCurrency(metricas.totalPendente))
    console.log('   ✅ Pagos (count):', metricas.clientesPagos.length)
    console.log('   ✅ Pagos (valor):', formatCurrency(metricas.totalRecebido))
    console.log('   ⚠️ Problemas:', metricas.clientesProblemas.length)

    // Validação cruzada dos totais
    const totalValorCalculado = metricas.totalPendente + metricas.totalRecebido
    const totalValorEsperado = clientes.reduce((total, cliente) => total + (cliente.valor_comissao || 60.00), 0)
    
    console.log('💰 [AdminDashboardMetrics] Validação de valores:')
    console.log('   📊 Total calculado (pendente + pago):', formatCurrency(totalValorCalculado))
    console.log('   📊 Total esperado (soma de todos):', formatCurrency(totalValorEsperado))
    console.log('   ✅ Valores batem?', totalValorCalculado === totalValorEsperado ? 'SIM' : 'NÃO')

    return { comissaoBreakdown, totalValorCalculado, totalValorEsperado }
  }, [clientes, metricas])

  return (
    <div className="space-y-6">
      {/* Métricas Gerais */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-contrast">
          📊 Visão Geral {selectedManager ? `- ${selectedManager}` : '(Todos os Gestores)'}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-contrast">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-contrast">{metricas.totalClientes}</div>
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
              <div className="text-2xl font-bold text-green-600">{metricas.clientesNoAr.length}</div>
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
              <div className="text-2xl font-bold text-red-600">{formatCurrency(metricas.totalPendente)}</div>
              <p className="text-xs text-contrast-secondary">
                {metricas.clientesPendentes.length} comissões pendentes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-contrast">🟢 Total Já Recebido</CardTitle>
              <CircleDollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(metricas.totalRecebido)}</div>
              <p className="text-xs text-contrast-secondary">
                {metricas.clientesPagos.length} comissões pagas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-contrast">⚠️ Problemas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{metricas.clientesProblemas.length}</div>
              <p className="text-xs text-contrast-secondary">
                requer atenção
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Métricas Específicas do Admin - CÁLCULOS CORRIGIDOS */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-contrast">
          💳 Controle de Pagamentos (Admin)
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-contrast">⏰ Pendentes para Pagar</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{metricas.clientesPendentes.length}</div>
              <p className="text-xs text-contrast-secondary">
                {formatCurrency(metricas.totalPendente)} aguardando pagamento
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-contrast">✅ Já Paguei</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metricas.clientesPagos.length}</div>
              <p className="text-xs text-contrast-secondary">
                {formatCurrency(metricas.totalRecebido)} já pagos pelo admin
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
})
