
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CheckCircle, AlertTriangle, CircleDollarSign, XCircle, Clock, CreditCard } from 'lucide-react'
import type { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface AdminDashboardMetricsProps {
  clientes: Cliente[]
  selectedManager?: string | null
}

export function AdminDashboardMetrics({ clientes, selectedManager }: AdminDashboardMetricsProps) {
  console.log('📊 [AdminDashboardMetrics] Calculando métricas para', clientes.length, 'clientes')
  console.log('📊 [AdminDashboardMetrics] Gestor selecionado:', selectedManager)

  // Função para determinar se uma comissão é considerada pendente
  const isComissaoPendente = (comissao: string | null | undefined): boolean => {
    if (!comissao || comissao.trim() === '' || comissao === 'Pendente') {
      return true
    }
    if (/^\d+(\.\d+)?$/.test(comissao.trim())) {
      return true
    }
    return comissao.trim() !== 'Pago'
  }

  // Total de clientes
  const totalClientes = clientes.length

  // Campanhas no ar (status "Campanha no Ar" ou "Otimização")
  const clientesNoAr = clientes.filter(cliente => 
    cliente.status_campanha === 'Campanha no Ar' || cliente.status_campanha === 'Otimização'
  )

  // Total pendente - usando nova lógica que considera todos os casos
  const clientesPendentes = clientes.filter(cliente => 
    isComissaoPendente(cliente.comissao)
  )
  const totalPendente = clientesPendentes.reduce((total, cliente) => 
    total + (cliente.valor_comissao || 60.00), 0
  )

  // Total já recebido (comissao = "Pago" explicitamente)
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

  // Métricas específicas do admin (usando a mesma lógica corrigida)
  const clientesParaPagar = clientes.filter(cliente => 
    isComissaoPendente(cliente.comissao)
  )

  const clientesJaPagos = clientes.filter(cliente => 
    cliente.comissao === 'Pago'
  )

  console.log('📈 [AdminDashboardMetrics] Métricas calculadas:', {
    totalClientes,
    campanhasNoAr: clientesNoAr.length,
    pendentes: clientesPendentes.length,
    pagos: clientesPagos.length,
    problemas: clientesProblemas.length,
    totalPendente,
    totalRecebido,
    paraPagar: clientesParaPagar.length,
    jaPagos: clientesJaPagos.length
  })

  // Log detalhado dos valores de comissão para debug
  const comissaoValues = clientes.map(c => c.comissao).filter((value, index, self) => self.indexOf(value) === index)
  console.log('📊 [AdminDashboardMetrics] Valores únicos de comissão encontrados:', comissaoValues)

  return (
    <div className="space-y-8 bg-admin-bg min-h-screen p-6">
      {/* Métricas Gerais */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-admin-text-primary">
          📊 Visão Geral {selectedManager ? `- ${selectedManager}` : '(Todos os Gestores)'}
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Card className="bg-admin-card border-admin-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-admin-text-info">Total de Clientes</CardTitle>
              <Users className="h-5 w-5 text-admin-text-secondary" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-admin-text-primary mb-2">{totalClientes}</div>
              <p className="text-xs text-admin-text-secondary">
                clientes cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-admin-card border-admin-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-admin-text-info">Campanhas No Ar</CardTitle>
              <CheckCircle className="h-5 w-5 text-admin-green" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-admin-green mb-2">{clientesNoAr.length}</div>
              <p className="text-xs text-admin-text-secondary">
                campanhas ativas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-admin-card border-admin-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-admin-text-info">🔴 Total Pendente</CardTitle>
              <CircleDollarSign className="h-5 w-5 text-admin-orange" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-admin-orange mb-2">{formatCurrency(totalPendente)}</div>
              <p className="text-xs text-admin-text-secondary">
                {clientesPendentes.length} comissões pendentes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-admin-card border-admin-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-admin-text-info">🟢 Total Já Recebido</CardTitle>
              <CircleDollarSign className="h-5 w-5 text-admin-green" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-admin-green mb-2">{formatCurrency(totalRecebido)}</div>
              <p className="text-xs text-admin-text-secondary">
                {clientesPagos.length} comissões pagas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-admin-card border-admin-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-admin-text-info">⚠️ Problemas</CardTitle>
              <AlertTriangle className="h-5 w-5 text-admin-orange" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-admin-orange mb-2">{clientesProblemas.length}</div>
              <p className="text-xs text-admin-text-secondary">
                requer atenção
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Métricas Específicas do Admin */}
      <div>
        <h3 className="text-xl font-semibold mb-6 text-admin-text-primary">
          💳 Controle de Pagamentos (Admin)
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-admin-card border-admin-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-admin-text-info">⏰ Pendentes para Pagar</CardTitle>
              <Clock className="h-5 w-5 text-admin-purple" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-admin-purple mb-2">{clientesParaPagar.length}</div>
              <p className="text-xs text-admin-text-secondary">
                {formatCurrency(clientesParaPagar.length * 60)} aguardando pagamento
              </p>
            </CardContent>
          </Card>

          <Card className="bg-admin-card border-admin-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-admin-text-info">✅ Já Paguei</CardTitle>
              <CreditCard className="h-5 w-5 text-admin-purple-light" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-admin-purple-light mb-2">{clientesJaPagos.length}</div>
              <p className="text-xs text-admin-text-secondary">
                {formatCurrency(clientesJaPagos.length * 60)} já pagos pelo admin
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
