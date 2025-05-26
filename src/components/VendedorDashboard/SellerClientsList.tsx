
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cliente } from '@/lib/supabase'
import { Calendar, Mail, Phone, User, Clock } from 'lucide-react'

interface SellerClientsListProps {
  clientes: Cliente[]
  loading: boolean
}

export function SellerClientsList({ clientes, loading }: SellerClientsListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus Clientes</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
          <CardTitle>Meus Clientes</CardTitle>
          <CardDescription>
            Você ainda não possui clientes cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <User className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                Nenhum cliente encontrado em sua lista
              </p>
              <p className="text-sm text-blue-600">
                Use o formulário acima para adicionar seu primeiro cliente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'No Ar': return 'bg-green-100 text-green-800'
      case 'Problema': return 'bg-red-100 text-red-800'
      case 'Brief': return 'bg-blue-100 text-blue-800'
      case 'Criativo': return 'bg-yellow-100 text-yellow-800'
      case 'Site': return 'bg-purple-100 text-purple-800'
      case 'Preenchimento do Formulário': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Separar clientes de hoje
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
        </CardTitle>
        <CardDescription>
          {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} cadastrado{clientes.length !== 1 ? 's' : ''}
          {clientesHoje.length > 0 && (
            <span className="ml-2 text-green-600 font-medium">
              • {clientesHoje.length} cadastrado{clientesHoje.length !== 1 ? 's' : ''} hoje
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Clientes de hoje */}
          {clientesHoje.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold text-green-800">Cadastrados Hoje ({clientesHoje.length})</h3>
              </div>
              <div className="space-y-3">
                {clientesHoje.map((cliente) => (
                  <div key={cliente.id} className="border border-green-200 bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <h4 className="font-semibold">{cliente.nome_cliente}</h4>
                          <Badge className={getStatusColor(cliente.status_campanha || '')}>
                            {cliente.status_campanha}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Hoje
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-3 w-3" />
                            <span>{cliente.email_cliente}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-3 w-3" />
                            <span>{cliente.telefone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {cliente.created_at ? 
                                new Date(cliente.created_at).toLocaleString('pt-BR') : 
                                'N/A'
                              }
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs">
                              Gestor: {cliente.email_gestor}
                            </span>
                          </div>
                        </div>

                        {cliente.comissao_paga && (
                          <div className="mt-2">
                            <Badge className="bg-green-100 text-green-800">
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

          {/* Clientes anteriores */}
          {clientesAnteriores.length > 0 && (
            <div>
              {clientesHoje.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-800">Clientes Anteriores ({clientesAnteriores.length})</h3>
                </div>
              )}
              <div className="space-y-3">
                {clientesAnteriores.map((cliente) => (
                  <div key={cliente.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <h4 className="font-semibold">{cliente.nome_cliente}</h4>
                          <Badge className={getStatusColor(cliente.status_campanha || '')}>
                            {cliente.status_campanha}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-3 w-3" />
                            <span>{cliente.email_cliente}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-3 w-3" />
                            <span>{cliente.telefone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Cadastrado: {cliente.created_at ? 
                                new Date(cliente.created_at).toLocaleDateString('pt-BR') : 
                                'N/A'
                              }
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs">
                              Gestor: {cliente.email_gestor}
                            </span>
                          </div>
                        </div>

                        {cliente.comissao_paga && (
                          <div className="mt-2">
                            <Badge className="bg-green-100 text-green-800">
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
