
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Cliente } from '@/lib/supabase'
import { Calendar, Mail, Phone, User, Clock, RefreshCw, DollarSign } from 'lucide-react'

interface SellerClientsListProps {
  clientes: Cliente[]
  loading: boolean
  onRefresh?: () => void
}

export function SellerClientsList({ clientes, loading, onRefresh }: SellerClientsListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Meus Clientes
            <div className="ml-auto">
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </CardTitle>
          <CardDescription>Carregando lista de clientes...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg mb-2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (clientes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Meus Clientes
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="ml-auto"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Você ainda não possui clientes cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="bg-blue-50 rounded-lg p-8 max-w-md mx-auto">
              <User className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum cliente encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não cadastrou nenhum cliente em sua lista.
              </p>
              <p className="text-sm text-blue-600">
                Use a aba "Adicionar Cliente" para cadastrar seu primeiro cliente no sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'No Ar': return 'bg-green-100 text-green-800 border-green-200'
      case 'Problema': return 'bg-red-100 text-red-800 border-red-200'
      case 'Brief': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Criativo': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Site': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Preenchimento do Formulário': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Organizar clientes por data
  const hoje = new Date()
  const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000)
  const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000)

  const clientesHoje = clientes.filter(c => {
    if (!c.created_at) return false
    const clientDate = new Date(c.created_at)
    return clientDate.toDateString() === hoje.toDateString()
  })

  const clientesOntem = clientes.filter(c => {
    if (!c.created_at) return false
    const clientDate = new Date(c.created_at)
    return clientDate.toDateString() === ontem.toDateString()
  })

  const clientesUltimos7Dias = clientes.filter(c => {
    if (!c.created_at) return false
    const clientDate = new Date(c.created_at)
    return clientDate >= seteDiasAtras && clientDate < ontem && clientDate.toDateString() !== hoje.toDateString()
  })

  const clientesAnteriores = clientes.filter(c => {
    if (!c.created_at) return true
    const clientDate = new Date(c.created_at)
    return clientDate < seteDiasAtras
  })

  // Calcular comissões (R$ 20,00 por cliente)
  const comissaoPorCliente = 20.00
  const totalComissaoHoje = clientesHoje.length * comissaoPorCliente
  const totalComissaoOntem = clientesOntem.length * comissaoPorCliente
  const totalComissaoUltimos7Dias = clientesUltimos7Dias.length * comissaoPorCliente
  const totalComissaoGeral = clientes.length * comissaoPorCliente

  const renderClienteCard = (cliente: Cliente, isToday = false) => (
    <div key={cliente.id} className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${isToday ? 'border-2 border-green-200 bg-green-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <User className="h-4 w-4 text-gray-500" />
            <h4 className="font-semibold text-lg">{cliente.nome_cliente}</h4>
            <Badge className={`${getStatusColor(cliente.status_campanha || '')} border`}>
              {cliente.status_campanha}
            </Badge>
            {isToday && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Clock className="h-3 w-3 mr-1" />
                Hoje
              </Badge>
            )}
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <DollarSign className="h-3 w-3 mr-1" />
              R$ 20,00
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2 text-gray-700">
              <Mail className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{cliente.email_cliente}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <Phone className="h-4 w-4 text-green-500" />
              <span className="font-medium">{cliente.telefone}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {cliente.created_at ? 
                  new Date(cliente.created_at).toLocaleString('pt-BR') : 
                  'Data não disponível'
                }
              </span>
            </div>
            {cliente.email_gestor && (
              <div className="flex items-center space-x-2 text-gray-600">
                <span className="text-xs">
                  <strong>Gestor:</strong> {cliente.email_gestor}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Resumo de Comissões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            💰 Resumo de Comissões
          </CardTitle>
          <CardDescription>
            Cada cliente cadastrado gera R$ 20,00 de comissão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Hoje</p>
                  <p className="text-2xl font-bold text-green-900">R$ {totalComissaoHoje.toFixed(2)}</p>
                  <p className="text-xs text-green-600">{clientesHoje.length} cliente{clientesHoje.length !== 1 ? 's' : ''}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Ontem</p>
                  <p className="text-2xl font-bold text-blue-900">R$ {totalComissaoOntem.toFixed(2)}</p>
                  <p className="text-xs text-blue-600">{clientesOntem.length} cliente{clientesOntem.length !== 1 ? 's' : ''}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Últimos 7 dias</p>
                  <p className="text-2xl font-bold text-purple-900">R$ {totalComissaoUltimos7Dias.toFixed(2)}</p>
                  <p className="text-xs text-purple-600">{clientesUltimos7Dias.length} cliente{clientesUltimos7Dias.length !== 1 ? 's' : ''}</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Total Geral</p>
                  <p className="text-2xl font-bold text-gray-900">R$ {totalComissaoGeral.toFixed(2)}</p>
                  <p className="text-xs text-gray-600">{clientes.length} cliente{clientes.length !== 1 ? 's' : ''}</p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes Organizada por Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Meus Clientes
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="ml-auto"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            <div className="flex items-center gap-4">
              <span>
                {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} cadastrado{clientes.length !== 1 ? 's' : ''}
              </span>
              <Badge className="bg-green-100 text-green-800">
                R$ 20,00 por cliente
              </Badge>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Clientes de Hoje */}
            {clientesHoje.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-green-600" />
                  <h3 className="font-semibold text-green-800">
                    📅 Hoje ({clientesHoje.length}) - R$ {totalComissaoHoje.toFixed(2)}
                  </h3>
                </div>
                <div className="space-y-3">
                  {clientesHoje.map((cliente) => renderClienteCard(cliente, true))}
                </div>
              </div>
            )}

            {/* Clientes de Ontem */}
            {clientesOntem.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">
                    📅 Ontem ({clientesOntem.length}) - R$ {totalComissaoOntem.toFixed(2)}
                  </h3>
                </div>
                <div className="space-y-3">
                  {clientesOntem.map((cliente) => renderClienteCard(cliente))}
                </div>
              </div>
            )}

            {/* Clientes dos Últimos 7 dias */}
            {clientesUltimos7Dias.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-4 w-4 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">
                    📅 Últimos 7 dias ({clientesUltimos7Dias.length}) - R$ {totalComissaoUltimos7Dias.toFixed(2)}
                  </h3>
                </div>
                <div className="space-y-3">
                  {clientesUltimos7Dias.map((cliente) => renderClienteCard(cliente))}
                </div>
              </div>
            )}

            {/* Clientes Anteriores */}
            {clientesAnteriores.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-800">
                    📅 Anteriores ({clientesAnteriores.length}) - R$ {(clientesAnteriores.length * comissaoPorCliente).toFixed(2)}
                  </h3>
                </div>
                <div className="space-y-3">
                  {clientesAnteriores.map((cliente) => renderClienteCard(cliente))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
