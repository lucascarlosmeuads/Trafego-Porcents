
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Cliente } from '@/lib/supabase'
import { Calendar, Mail, Phone, User, Clock, RefreshCw } from 'lucide-react'

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

  // Separate today's clients
  const today = new Date().toISOString().split('T')[0]
  const clientesHoje = clientes.filter(c => {
    if (!c.created_at) return false
    const clientDate = new Date(c.created_at).toISOString().split('T')[0]
    return clientDate === today
  })

  const clientesAnteriores = clientes.filter(c => {
    if (!c.created_at) return true
    const clientDate = new Date(c.created_at).toISOString().split('T')[0]
    return clientDate !== today
  })

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
          <div className="flex items-center gap-4">
            <span>
              {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} cadastrado{clientes.length !== 1 ? 's' : ''}
            </span>
            {clientesHoje.length > 0 && (
              <Badge className="bg-green-100 text-green-800">
                {clientesHoje.length} hoje
              </Badge>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Today's clients */}
          {clientesHoje.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold text-green-800">
                  Cadastrados Hoje ({clientesHoje.length})
                </h3>
              </div>
              <div className="space-y-3">
                {clientesHoje.map((cliente) => (
                  <div key={cliente.id} className="border-2 border-green-200 bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          <User className="h-4 w-4 text-gray-500" />
                          <h4 className="font-semibold text-lg">{cliente.nome_cliente}</h4>
                          <Badge className={`${getStatusColor(cliente.status_campanha || '')} border`}>
                            {cliente.status_campanha}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Hoje
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

                        {cliente.comissao_paga && (
                          <div className="mt-3">
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              💰 Comissão Paga: R$ {(cliente.valor_comissao || 0).toFixed(2)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previous clients */}
          {clientesAnteriores.length > 0 && (
            <div>
              {clientesHoje.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-800">
                    Clientes Anteriores ({clientesAnteriores.length})
                  </h3>
                </div>
              )}
              <div className="space-y-3">
                {clientesAnteriores.map((cliente) => (
                  <div key={cliente.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          <User className="h-4 w-4 text-gray-500" />
                          <h4 className="font-semibold text-lg">{cliente.nome_cliente}</h4>
                          <Badge className={`${getStatusColor(cliente.status_campanha || '')} border`}>
                            {cliente.status_campanha}
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
                              <strong>Cadastrado:</strong> {cliente.created_at ? 
                                new Date(cliente.created_at).toLocaleDateString('pt-BR') : 
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

                        {cliente.comissao_paga && (
                          <div className="mt-3">
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              💰 Comissão Paga: R$ {(cliente.valor_comissao || 0).toFixed(2)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
