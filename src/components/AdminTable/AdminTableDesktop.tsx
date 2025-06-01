
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
    <div className="overflow-x-auto rounded-lg border border-admin-border">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="border-admin-border bg-admin-border/10 hover:bg-admin-border/20">
            <TableHead className="w-16 text-admin-text-info font-semibold">ID</TableHead>
            <TableHead className="min-w-[100px] text-admin-text-info font-semibold">Data Venda</TableHead>
            <TableHead className="min-w-[200px] text-admin-text-info font-semibold">Nome Cliente</TableHead>
            <TableHead className="min-w-[120px] text-admin-text-info font-semibold">Telefone</TableHead>
            <TableHead className="min-w-[180px] text-admin-text-info font-semibold">Email Gestor</TableHead>
            <TableHead className="min-w-[180px] text-admin-text-info font-semibold">Status Campanha</TableHead>
            <TableHead className="min-w-[180px] text-admin-text-info font-semibold">Data Limite</TableHead>
            <TableHead className="min-w-[120px] text-admin-text-info font-semibold">Transferir</TableHead>
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
                className="border-admin-border hover:bg-admin-border/10 transition-colors duration-200"
              >
                <TableCell className="font-mono text-xs text-admin-text-secondary">
                  {String(index + 1).padStart(3, '0')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-admin-text-secondary" />
                    <span className="text-xs text-admin-text-primary">{formatDate(cliente.data_venda)}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="max-w-[200px] truncate text-admin-text-primary">
                    {cliente.nome_cliente}
                  </div>
                </TableCell>
                <TableCell className="text-admin-text-primary">{cliente.telefone}</TableCell>
                <TableCell>
                  <div className="max-w-[180px] truncate text-admin-text-primary bg-admin-border/10 px-2 py-1 rounded text-xs">
                    {cliente.email_gestor}
                  </div>
                </TableCell>
                <TableCell>
                  <Select 
                    value={cliente.status_campanha || ''}
                    onValueChange={(value) => onStatusChange(cliente.id, value)}
                  >
                    <SelectTrigger className="h-8 w-48 bg-admin-card border-admin-border text-admin-text-primary hover:bg-admin-border/10 transition-colors">
                      <SelectValue>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(cliente.status_campanha || '')}`}>
                          {cliente.status_campanha || 'Sem status'}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-admin-card border-admin-border max-h-60 overflow-y-auto">
                      {STATUS_CAMPANHA.map(status => (
                        <SelectItem key={status} value={status} className="text-admin-text-primary hover:bg-admin-border/20">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${dataLimiteDisplay.classeCor}`}>
                    {dataLimiteDisplay.texto}
                  </span>
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
