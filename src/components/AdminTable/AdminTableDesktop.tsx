
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import { Cliente, STATUS_CAMPANHA } from '@/lib/supabase'
import { getDataLimiteDisplayForGestor } from '@/utils/dateUtils'
import { TransferirModal } from './TransferirModal'

interface AdminTableDesktopProps {
  clientes: Cliente[]
  gestores: Array<{ email: string, nome: string }>
  transferindoCliente: string | null
  onTransferirCliente: (clienteId: string, novoEmailGestor: string) => void
  onStatusChange: (id: string, newStatus: string) => void
  formatDate: (dateString: string | null) => string
  getStatusColor: (status: string) => string
}

export function AdminTableDesktop({ 
  clientes, 
  gestores, 
  transferindoCliente, 
  onTransferirCliente, 
  onStatusChange, 
  formatDate, 
  getStatusColor 
}: AdminTableDesktopProps) {
  return (
    <div className="overflow-x-auto">
      <Table className="table-dark">
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/20">
            <TableHead className="w-16 text-muted-foreground">ID</TableHead>
            <TableHead className="min-w-[100px] text-muted-foreground">Data Venda</TableHead>
            <TableHead className="min-w-[200px] text-muted-foreground">Nome Cliente</TableHead>
            <TableHead className="min-w-[120px] text-muted-foreground">Telefone</TableHead>
            <TableHead className="min-w-[180px] text-muted-foreground">Email Gestor</TableHead>
            <TableHead className="min-w-[180px] text-muted-foreground">Status Campanha</TableHead>
            <TableHead className="min-w-[180px] text-muted-foreground">Data Limite</TableHead>
            <TableHead className="min-w-[120px] text-muted-foreground">Transferir</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente, index) => {
            const dataLimiteDisplay = getDataLimiteDisplayForGestor(
              cliente.data_venda || '', 
              cliente.created_at, 
              cliente.status_campanha || ''
            )
            
            return (
              <TableRow 
                key={cliente.id} 
                className="border-border hover:bg-muted/20 transition-colors"
              >
                <TableCell className="font-mono text-xs text-foreground">
                  {String(index + 1).padStart(3, '0')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-foreground">{formatDate(cliente.data_venda)}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="max-w-[200px] truncate text-foreground">
                    {cliente.nome_cliente}
                  </div>
                </TableCell>
                <TableCell className="text-foreground">{cliente.telefone}</TableCell>
                <TableCell>
                  <div className="max-w-[180px] truncate text-foreground">
                    {cliente.email_gestor}
                  </div>
                </TableCell>
                <TableCell>
                  <Select 
                    value={cliente.status_campanha || ''}
                    onValueChange={(value) => onStatusChange(cliente.id, value)}
                  >
                    <SelectTrigger className="h-8 w-48 bg-background border-border text-foreground">
                      <SelectValue>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(cliente.status_campanha || '')}`}>
                          {cliente.status_campanha || 'Sem status'}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border z-50">
                      {STATUS_CAMPANHA.map(status => (
                        <SelectItem key={status} value={status}>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge className={`${dataLimiteDisplay.classeCor} rounded-md`}>
                    {dataLimiteDisplay.texto}
                  </Badge>
                </TableCell>
                <TableCell>
                  <TransferirModal
                    cliente={cliente}
                    onTransferirCliente={onTransferirCliente}
                    isLoading={transferindoCliente === cliente.id}
                    gestores={gestores}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
