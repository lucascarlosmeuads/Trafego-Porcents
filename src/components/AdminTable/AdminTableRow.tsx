
import { memo } from 'react'
import { TableRow, TableCell } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from 'lucide-react'
import { Cliente, STATUS_CAMPANHA } from '@/lib/supabase'
import { getDataLimiteDisplayForGestor } from '@/utils/dateUtils'
import { TransferirModal } from './TransferirModal'

interface AdminTableRowProps {
  cliente: Cliente
  index: number
  gestores: Array<{ email: string, nome: string }>
  transferindoCliente: string | null
  onTransferirCliente: (clienteId: string, novoEmailGestor: string) => void
  onStatusChange: (id: string, newStatus: string) => void
  formatDate: (dateString: string | null) => string
  getStatusColor: (status: string) => string
}

export const AdminTableRow = memo(function AdminTableRow({
  cliente,
  index,
  gestores,
  transferindoCliente,
  onTransferirCliente,
  onStatusChange,
  formatDate,
  getStatusColor
}: AdminTableRowProps) {
  const dataLimiteDisplay = getDataLimiteDisplayForGestor(
    cliente.data_venda || '', 
    cliente.created_at, 
    cliente.status_campanha || ''
  )
  
  return (
    <TableRow className="border-border hover:bg-muted/20 transition-colors">
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
        <span className={`text-xs font-medium ${dataLimiteDisplay.classeCor}`}>
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
})
