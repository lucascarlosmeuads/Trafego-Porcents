import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, Phone, Mail, UserCheck, DollarSign } from 'lucide-react'
import { formatDate } from '@/utils/dateFormatters'
import { useClienteNovoDateFilters } from '@/hooks/useClienteNovoDateFilters'
import { ClienteNovoDateFilters } from './ClienteNovoDateFilters'

interface Cliente {
  id: number
  nome_cliente: string
  telefone: string
  email_cliente: string
  vendedor: string
  email_gestor: string
  status_campanha: string
  created_at: string
}

interface ClienteNovoClientsListProps {
  clientes: Cliente[]
  loading: boolean
  totalClientes: number
}

export function ClienteNovoClientsList({ clientes, loading, totalClientes }: ClienteNovoClientsListProps) {
  const {
    dateFilter,
    setDateFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    filteredClientes,
    clientsCount
  } = useClienteNovoDateFilters(clientes)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Lista de Clientes</h2>
        <p className="text-muted-foreground">
          Total de {totalClientes} cliente{totalClientes !== 1 ? 's' : ''} cadastrado{totalClientes !== 1 ? 's' : ''}
        </p>
      </div>

      <ClienteNovoDateFilters
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        clientsCount={clientsCount}
      />

      {filteredClientes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {clientes.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado para este filtro'}
              </h3>
              <p className="text-gray-500">
                {clientes.length === 0 
                  ? 'Comece criando seu primeiro cliente através da aba "Adicionar Cliente"'
                  : 'Tente ajustar os filtros de data para encontrar os clientes desejados'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredClientes.map((cliente) => (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{cliente.nome_cliente}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      Cadastrado em {formatDate(cliente.created_at)}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {cliente.status_campanha}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{cliente.email_cliente}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{cliente.telefone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                    <span>Gestor: {cliente.email_gestor}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-green-600 font-medium">
                      Comissão automática conforme valor da venda
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}