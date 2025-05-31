
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ClienteRow } from './ClienteRow'
import { Cliente, type StatusCampanha } from '@/lib/supabase'

interface ClientesTableDesktopProps {
  clientes: Cliente[]
  isAdmin: boolean
  selectedManager: string
  showEmailGestor: boolean
  showSitePagoCheckbox: boolean
  updatingStatus: string | null
  editingLink: { clienteId: string, field: string } | null
  linkValue: string
  setLinkValue: (value: string) => void
  editingBM: string | null
  bmValue: string
  setBmValue: (value: string) => void
  updatingComission: string | null
  editingComissionValue: string | null
  comissionValueInput: string
  setComissionValueInput: (value: string) => void
  getStatusColor: (status: string) => string
  onStatusChange: (clienteId: string, newStatus: StatusCampanha) => void
  onSiteStatusChange: (clienteId: string, newStatus: string) => void
  onLinkEdit: (clienteId: string, field: string, currentValue: string) => void
  onLinkSave: (clienteId: string) => Promise<boolean>
  onLinkCancel: () => void
  onBMEdit: (clienteId: string, currentValue: string) => void
  onBMSave: (clienteId: string) => void
  onBMCancel: () => void
  onComissionToggle: (clienteId: string, currentStatus: boolean) => Promise<boolean>
  onComissionValueEdit: (clienteId: string, currentValue: number) => void
  onComissionValueSave: (clienteId: string, newValue: number) => void
  onComissionValueCancel: () => void
  onSitePagoChange?: (clienteId: string, newValue: boolean) => void
  formatDate: (dateString: string) => string
}

export function ClientesTableDesktop({
  clientes,
  isAdmin,
  selectedManager,
  showEmailGestor,
  showSitePagoCheckbox,
  updatingStatus,
  editingLink,
  linkValue,
  setLinkValue,
  editingBM,
  bmValue,
  setBmValue,
  updatingComission,
  editingComissionValue,
  comissionValueInput,
  setComissionValueInput,
  getStatusColor,
  onStatusChange,
  onSiteStatusChange,
  onLinkEdit,
  onLinkSave,
  onLinkCancel,
  onBMEdit,
  onBMSave,
  onBMCancel,
  onComissionToggle,
  onComissionValueEdit,
  onComissionValueSave,
  onComissionValueCancel,
  onSitePagoChange,
  formatDate
}: ClientesTableDesktopProps) {
  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/5">
            <TableHead className="text-muted-foreground font-medium">Data Venda</TableHead>
            <TableHead className="text-muted-foreground font-medium">Nome</TableHead>
            <TableHead className="text-muted-foreground font-medium">Telefone</TableHead>
            <TableHead className="text-muted-foreground font-medium">Email</TableHead>
            {showEmailGestor && (
              <TableHead className="text-muted-foreground font-medium">Email Gestor</TableHead>
            )}
            <TableHead className="text-muted-foreground font-medium">Status Campanha</TableHead>
            <TableHead className="text-muted-foreground font-medium">Status Site</TableHead>
            <TableHead className="text-muted-foreground font-medium">Data Limite</TableHead>
            <TableHead className="text-muted-foreground font-medium">Materiais</TableHead>
            <TableHead className="text-muted-foreground font-medium">Site</TableHead>
            <TableHead className="text-muted-foreground font-medium">BM</TableHead>
            <TableHead className="text-muted-foreground font-medium">Comissão</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente, index) => (
            <ClienteRow
              key={cliente.id}
              cliente={cliente}
              selectedManager={selectedManager}
              index={index}
              isAdmin={isAdmin}
              showEmailGestor={showEmailGestor}
              showSitePagoCheckbox={showSitePagoCheckbox}
              updatingStatus={updatingStatus}
              editingLink={editingLink}
              linkValue={linkValue}
              setLinkValue={setLinkValue}
              editingBM={editingBM}
              bmValue={bmValue}
              setBmValue={setBmValue}
              updatingComission={updatingComission}
              editingComissionValue={editingComissionValue}
              comissionValueInput={comissionValueInput}
              setComissionValueInput={setComissionValueInput}
              getStatusColor={getStatusColor}
              onStatusChange={onStatusChange}
              onSiteStatusChange={onSiteStatusChange}
              onLinkEdit={onLinkEdit}
              onLinkSave={onLinkSave}
              onLinkCancel={onLinkCancel}
              onBMEdit={onBMEdit}
              onBMSave={onBMSave}
              onBMCancel={onBMCancel}
              onComissionToggle={onComissionToggle}
              onComissionValueEdit={onComissionValueEdit}
              onComissionValueSave={onComissionValueSave}
              onComissionValueCancel={onComissionValueCancel}
              onSitePagoChange={onSitePagoChange}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
