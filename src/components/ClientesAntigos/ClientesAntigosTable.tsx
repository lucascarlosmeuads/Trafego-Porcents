
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Edit, Trash2, ExternalLink } from 'lucide-react'
import { useClientesAntigos, type ClienteAntigo } from '@/hooks/useClientesAntigos'
import { AddClienteAntigoModal } from './AddClienteAntigoModal'
import { formatDate } from '@/utils/dateUtils'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

export function ClientesAntigosTable() {
  const { clientesAntigos, loading, deleteClienteAntigo } = useClientesAntigos()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredClientes = clientesAntigos.filter(cliente => {
    const matchesSearch = 
      cliente.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.vendedor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || cliente.comissao === statusFilter

    return matchesSearch && matchesStatus
  })

  const getComissaoColor = (status: string) => {
    switch (status) {
      case 'Pago':
        return 'bg-green-100 text-green-800'
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSiteStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-100 text-green-800'
      case 'em_desenvolvimento':
        return 'bg-blue-100 text-blue-800'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDelete = async (id: string) => {
    await deleteClienteAntigo(id)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Clientes Antigos ({filteredClientes.length})</CardTitle>
          <AddClienteAntigoModal />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, email ou vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Pago">Pago</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredClientes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum cliente antigo encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Gestor</TableHead>
                  <TableHead>Data Venda</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Links</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{cliente.nome_cliente}</div>
                        <div className="text-sm text-muted-foreground">{cliente.email_cliente}</div>
                        <div className="text-sm text-muted-foreground">{cliente.telefone}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>{cliente.vendedor}</TableCell>
                    
                    <TableCell>
                      <div className="text-sm">{cliente.email_gestor}</div>
                    </TableCell>
                    
                    <TableCell>
                      {formatDate(cliente.data_venda)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={getComissaoColor(cliente.comissao)}>
                          {cliente.comissao}
                        </Badge>
                        <div className="text-sm">R$ {cliente.valor_comissao}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={getSiteStatusColor(cliente.site_status)}>
                          {cliente.site_status}
                        </Badge>
                        {cliente.site_pago && (
                          <div className="text-xs text-green-600">Pago</div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-1">
                        {cliente.link_briefing && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={cliente.link_briefing} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                        {cliente.link_criativo && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={cliente.link_criativo} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                        {cliente.link_site && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={cliente.link_site} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este cliente antigo? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(cliente.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
