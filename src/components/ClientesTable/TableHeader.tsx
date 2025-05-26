
import { TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function ClientesTableHeader() {
  return (
    <TableHeader>
      <TableRow className="border-border bg-muted/50">
        <TableHead className="w-12 text-foreground">#</TableHead>
        <TableHead className="text-foreground">Data Venda</TableHead>
        <TableHead className="text-foreground">Cliente</TableHead>
        <TableHead className="text-foreground">WhatsApp</TableHead>
        <TableHead className="text-foreground">Gestor</TableHead>
        <TableHead className="text-foreground">Status</TableHead>
        <TableHead className="text-foreground">Prazo</TableHead>
        <TableHead className="hidden lg:table-cell text-foreground">Briefing</TableHead>
        <TableHead className="hidden lg:table-cell text-foreground">Materiais</TableHead>
        <TableHead className="hidden lg:table-cell text-foreground">Site</TableHead>
        <TableHead className="hidden xl:table-cell text-foreground">BM</TableHead>
        <TableHead className="text-foreground">Comissão</TableHead>
      </TableRow>
    </TableHeader>
  )
}
