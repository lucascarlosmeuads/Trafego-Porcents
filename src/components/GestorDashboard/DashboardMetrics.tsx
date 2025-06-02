
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CheckCircle, AlertTriangle, CircleDollarSign, XCircle } from 'lucide-react'
import type { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface DashboardMetricsProps {
  clientes: Cliente[]
}

export function DashboardMetrics({ clientes }: DashboardMetricsProps) {
  console.log('📊 [DashboardMetrics] Calculando métricas para', clientes.length, 'clientes')

  // FUNÇÃO CORRIGIDA: Determinar se uma comissão é considerada pendente
  const isComissaoPendente = (comissao: string | null | undefined): boolean => {
    // Considera pendente TODOS os casos que NÃO são explicitamente "Pago":
    if (!comissao || comissao.trim() === '') {
      return true // null, undefined, string vazia
    }
    
    const comissaoTrimmed = comissao.trim()
    
    // Explicitamente "Pago" = NÃO pendente
    if (comissaoTrimmed === 'Pago') {
      return false
    }
    
    // TODOS os outros casos são pendentes:
    // - "Pendente"
    // - "Solicitado" 
    // - Valores numéricos antigos: "20", "60", "80", etc.
    // - Qualquer outro status
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

  // VALIDAÇÃO DOS CÁLCULOS: Log detalhado para auditoria
  console.log('📈 [DashboardMetrics] === AUDITORIA DE CÁLCULOS GESTOR ===')
  console.log('📊 [DashboardMetrics] Breakdown por status de comissão:')
  
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

  console.log('📊 [DashboardMetrics] Breakdown detalhado:', comissaoBreakdown)
  
  console.log('📈 [DashboardMetrics] Métricas calculadas:')
  console.log('   🔢 Total clientes:', totalClientes)
  console.log('   🟢 Campanhas no ar:', clientesNoAr.length)
  console.log('   🔴 Pendentes (count):', clientesPendentes.length)
  console.log('   🔴 Pendentes (valor):', formatCurrency(totalPendente))
  console.log('   ✅ Pagos (count):', clientesPagos.length)
  console.log('   ✅ Pagos (valor):', formatCurrency(totalRecebido))
  console.log('   ⚠️ Problemas:', clientesProblemas.length)

  // Validação cruzada dos totais
  const totalValorCalculado = totalPendente + totalRecebido
  const totalValorEsperado = clientes.reduce((total, cliente) => total + (cliente.valor_comissao || 60.00), 0)
  
  console.log('💰 [DashboardMetrics] Validação de valores:')
  console.log('   📊 Total calculado (pendente + pago):', formatCurrency(totalValorCalculado))
  console.log('   📊 Total esperado (soma de todos):', formatCurrency(totalValorEsperado))
  console.log('   ✅ Valores batem?', totalValorCalculado === totalValorEsperado ? 'SIM' : 'NÃO')

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-contrast">Total de Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-contrast">{totalClientes}</div>
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
          <div className="text-2xl font-bold text-green-600">{clientesNoAr.length}</div>
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
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalPendente)}</div>
          <p className="text-xs text-contrast-secondary">
            {clientesPendentes.length} comissões pendentes
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-contrast">🟢 Total Já Recebido</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRecebido)}</div>
          <p className="text-xs text-contrast-secondary">
            {clientesPagos.length} comissões pagas
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-contrast">⚠️ Problemas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{clientesProblemas.length}</div>
          <p className="text-xs text-contrast-secondary">
            requer atenção
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
