
import { TableHead, TableHeader as TableHeaderComponent, TableRow } from '@/components/ui/table'

interface TableHeaderProps {
  isAdmin?: boolean
  showEmailGestor?: boolean
}

export function TableHeader({ isAdmin = false, showEmailGestor = false }: TableHeaderProps) {
  return (
    <TableHeaderComponent>
      <TableRow className="border-border hover:bg-transparent">
        <TableHead className="text-white font-semibold">Data Venda</TableHead>
        <TableHead className="text-white font-semibold">Nome Cliente</TableHead>
        <TableHead className="text-white font-semibold">Telefone</TableHead>
        <TableHead className="text-white font-semibold">Email Cliente</TableHead>
        {(isAdmin || showEmailGestor) && (
          <TableHead className="text-white font-semibold">Email Gestor</TableHead>
        )}
        <TableHead className="text-white font-semibold">Status Campanha</TableHead>
        <TableHead className="text-white font-semibold">Status Site</TableHead>
        <TableHead className="text-white font-semibold">Data Limite</TableHead>
        <TableHead className="text-white font-semibold">Materiais</TableHead>
        <TableHead className="text-white font-semibold">Site</TableHead>
        <TableHead className="text-white font-semibold">Número BM</TableHead>
        <TableHead className="text-white font-semibold">Comissão</TableHead>
      </TableRow>
    </TableHeaderComponent>
  )
}
