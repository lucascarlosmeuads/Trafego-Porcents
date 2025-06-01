
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
    // Considera pendente: null, undefined, string vazia, "Pendente", ou qualquer valor que não seja "Pago"
    if (!comissao || comissao.trim() === '' || comissao === 'Pendente') {
      return true
    }
    // Valores numéricos como "20", "60" etc também são considerados pendentes (valores antigos)
    if (/^\d+(\.\d+)?$/.test(comissao.trim())) {
      return true
    }
    // Qualquer coisa que não seja explicitamente "Pago" é considerada pendente
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
      </div>

      {/* Métricas Específicas do Admin */}
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
              <div className="text-2xl font-bold text-orange-600">{clientesParaPagar.length}</div>
              <p className="text-xs text-contrast-secondary">
                {formatCurrency(clientesParaPagar.length * 60)} aguardando pagamento
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-contrast">✅ Já Paguei</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{clientesJaPagos.length}</div>
              <p className="text-xs text-contrast-secondary">
                {formatCurrency(clientesJaPagos.length * 60)} já pagos pelo admin
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
