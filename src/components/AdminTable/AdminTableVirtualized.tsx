
import { memo, useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminTableRow } from './AdminTableRow'
import { Cliente } from '@/lib/supabase'

interface AdminTableVirtualizedProps {
  clientes: Cliente[]
  gestores: Array<{ email: string, nome: string }>
  transferindoCliente: string | null
  onTransferirCliente: (clienteId: string, novoEmailGestor: string) => void
  onStatusChange: (id: string, newStatus: string) => void
  formatDate: (dateString: string | null) => string
  getStatusColor: (status: string) => string
  searchTerm?: string
  statusFilter?: string
  gestorFilter?: string
}

const ROW_HEIGHT = 60

export const AdminTableVirtualized = memo(function AdminTableVirtualized({
  clientes,
  gestores,
  transferindoCliente,
  onTransferirCliente,
  onStatusChange,
  formatDate,
  getStatusColor,
  searchTerm = '',
  statusFilter = '',
  gestorFilter = ''
}: AdminTableVirtualizedProps) {
  
  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => {
      const matchesSearch = !searchTerm || 
        cliente.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefone?.includes(searchTerm) ||
        cliente.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = !statusFilter || cliente.status_campanha === statusFilter
      const matchesGestor = !gestorFilter || cliente.email_gestor === gestorFilter
      
      return matchesSearch && matchesStatus && matchesGestor
    })
  }, [clientes, searchTerm, statusFilter, gestorFilter])

  const Row = memo(({ index, style }: { index: number, style: any }) => {
    const cliente = filteredClientes[index]
    return (
      <div style={style}>
        <AdminTableRow
          cliente={cliente}
          index={index}
          gestores={gestores}
          transferindoCliente={transferindoCliente}
          onTransferirCliente={onTransferirCliente}
          onStatusChange={onStatusChange}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
        />
      </div>
    )
  })

  if (filteredClientes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum cliente encontrado
      </div>
    )
  }

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
      </Table>
      
      <div className="relative">
        <List
          height={Math.min(filteredClientes.length * ROW_HEIGHT, 600)}
          width="100%"
          itemCount={filteredClientes.length}
          itemSize={ROW_HEIGHT}
          overscanCount={5}
        >
          {Row}
        </List>
      </div>
    </div>
  )
})
