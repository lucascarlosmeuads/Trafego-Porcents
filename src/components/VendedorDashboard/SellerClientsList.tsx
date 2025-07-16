
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Mail, Phone, User, Clock, RefreshCw, DollarSign } from 'lucide-react'
import { DateFilters } from './DateFilters'
import { useClientFilters } from '@/hooks/useClientFilters'

interface ClienteSimples {
  id: string
  nome_cliente: string
  telefone: string
  email_cliente: string
  vendedor: string
  email_gestor: string
  status_campanha: string
  created_at: string
}

interface SellerClientsListProps {
  clientes: ClienteSimples[]
  loading: boolean
  onRefresh?: () => void
}

export function SellerClientsList({ clientes, loading, onRefresh }: SellerClientsListProps) {
  // Convert ClienteSimples to Cliente format for the filter hook
  const clientesFormatted = clientes.map(cliente => ({
    ...cliente,
    data_venda: '',
    data_limite: '',
    link_grupo: '',
    link_briefing: '',
    link_criativo: '',
    link_site: '',
    link_campanha: '',
    numero_bm: '',
    comissao_paga: false,
    valor_comissao: 60,
    site_status: 'pendente' as const,
    descricao_problema: '',
    saque_solicitado: false,
    comissao: 'Pendente',
    site_pago: false,
    cor_marcacao: null,
    // Novas propriedades do sistema avançado de comissões
    ultimo_pagamento_em: null,
    ultimo_valor_pago: null,
    total_pago_comissao: 0,
    eh_ultimo_pago: false
  }))

  const { dateFilter, setDateFilter, organizedClientes } = useClientFilters(clientesFormatted)

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

  // Função para formatar data usando created_at
  const formatDate = (dateString: string) => {
    if (!dateString || dateString.trim() === '') {
      return 'Data não disponível'
    }
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Data inválida'
      }
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      return 'Data inválida'
    }
  }

  // Calcular comissões (R$ 60,00 por cliente)
  const comissaoPorCliente = 60.00

  const renderClienteCard = (cliente: ClienteSimples, isToday = false) => (
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
              R$ 60,00
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
                📅 Cadastro: {formatDate(cliente.created_at)}
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
            Cada cliente cadastrado gera R$ 60,00 de comissão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Hoje</p>
                  <p className="text-2xl font-bold text-green-900">R$ {(organizedClientes.hoje.length * comissaoPorCliente).toFixed(2)}</p>
                  <p className="text-xs text-green-600">{organizedClientes.hoje.length} cliente{organizedClientes.hoje.length !== 1 ? 's' : ''}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Ontem</p>
                  <p className="text-2xl font-bold text-blue-900">R$ {(organizedClientes.ontem.length * comissaoPorCliente).toFixed(2)}</p>
                  <p className="text-xs text-blue-600">{organizedClientes.ontem.length} cliente{organizedClientes.ontem.length !== 1 ? 's' : ''}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Últimos 7 dias</p>
                  <p className="text-2xl font-bold text-purple-900">R$ {(organizedClientes.ultimos7Dias.length * comissaoPorCliente).toFixed(2)}</p>
                  <p className="text-xs text-purple-600">{organizedClientes.ultimos7Dias.length} cliente{organizedClientes.ultimos7Dias.length !== 1 ? 's' : ''}</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Total Filtrado</p>
                  <p className="text-2xl font-bold text-gray-900">R$ {(organizedClientes.total.length * comissaoPorCliente).toFixed(2)}</p>
                  <p className="text-xs text-gray-600">{organizedClientes.total.length} cliente{organizedClientes.total.length !== 1 ? 's' : ''}</p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros de Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Lista de Clientes
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
            Filtre e visualize seus clientes por data de cadastro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DateFilters 
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            clientsCount={organizedClientes.total.length}
          />
        </CardContent>
      </Card>

      {/* Lista de Clientes Organizada por Data */}
      {organizedClientes.total.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Clientes Cadastrados</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-4">
                <span>
                  {organizedClientes.total.length} cliente{organizedClientes.total.length !== 1 ? 's' : ''} encontrado{organizedClientes.total.length !== 1 ? 's' : ''}
                </span>
                <Badge className="bg-green-100 text-green-800">
                  R$ 60,00 por cliente
                </Badge>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Clientes de Hoje */}
              {organizedClientes.hoje.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-green-600" />
                    <h3 className="font-semibold text-green-800">
                      📅 Hoje ({organizedClientes.hoje.length}) - R$ {(organizedClientes.hoje.length * comissaoPorCliente).toFixed(2)}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {organizedClientes.hoje.map((cliente) => renderClienteCard(cliente, true))}
                  </div>
                </div>
              )}

              {/* Clientes de Ontem */}
              {organizedClientes.ontem.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">
                      📅 Ontem ({organizedClientes.ontem.length}) - R$ {(organizedClientes.ontem.length * comissaoPorCliente).toFixed(2)}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {organizedClientes.ontem.map((cliente) => renderClienteCard(cliente))}
                  </div>
                </div>
              )}

              {/* Clientes dos Últimos 7 dias */}
              {organizedClientes.ultimos7Dias.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-4 w-4 text-purple-600" />
                    <h3 className="font-semibold text-purple-800">
                      📅 Últimos 7 dias ({organizedClientes.ultimos7Dias.length}) - R$ {(organizedClientes.ultimos7Dias.length * comissaoPorCliente).toFixed(2)}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {organizedClientes.ultimos7Dias.map((cliente) => renderClienteCard(cliente))}
                  </div>
                </div>
              )}

              {/* Clientes Anteriores */}
              {organizedClientes.anteriores.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <h3 className="font-semibold text-gray-800">
                      📅 Anteriores ({organizedClientes.anteriores.length}) - R$ {(organizedClientes.anteriores.length * comissaoPorCliente).toFixed(2)}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {organizedClientes.anteriores.map((cliente) => renderClienteCard(cliente))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="bg-blue-50 rounded-lg p-8 max-w-md mx-auto">
              <Calendar className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum cliente encontrado para este período
              </h3>
              <p className="text-muted-foreground mb-4">
                Tente selecionar um período diferente ou limpar o filtro.
              </p>
              <Button onClick={() => setDateFilter('all')} variant="outline">
                Ver todos os clientes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
