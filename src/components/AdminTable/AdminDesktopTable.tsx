
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar } from 'lucide-react'
import { Cliente } from '@/lib/supabase'
import { DeleteClientButton } from '../ClientesTable/DeleteClientButton'
import { AdminStatusSelect } from './AdminStatusSelect'

interface AdminDesktopTableProps {
  clientes: Cliente[]
  onDeleteCliente: (clienteId: string) => Promise<boolean>
  deletingCliente: string | null
  onStatusChange: (id: string, newStatus: string) => void
  formatDate: (dateString: string | null) => string
}

export function AdminDesktopTable({
  clientes,
  onDeleteCliente,
  deletingCliente,
  onStatusChange,
  formatDate
}: AdminDesktopTableProps) {
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
            <TableHead className="w-20 text-muted-foreground">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente, index) => (
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
                <AdminStatusSelect
                  cliente={cliente}
                  onStatusChange={onStatusChange}
                />
              </TableCell>
              <TableCell>
                <DeleteClientButton
                  cliente={cliente}
                  onDelete={onDeleteCliente}
                  isDeleting={deletingCliente === cliente.id}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
