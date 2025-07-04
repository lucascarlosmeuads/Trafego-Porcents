
import { TableCell } from '@/components/ui/table'
import { StatusSelect } from './StatusSelect'
import { SiteStatusSelect } from './SiteStatusSelect'
import type { StatusCampanha } from '@/lib/supabase'

interface ClienteRowStatusCellsProps {
  statusCampanha: string
  siteStatus: string
  clienteId: string
  updatingStatus: string | null
  getStatusColor: (status: string) => string
  onStatusChange: (clienteId: string, newStatus: StatusCampanha) => void
  onSiteStatusChange: (clienteId: string, newStatus: string) => void
}

export function ClienteRowStatusCells({
  statusCampanha,
  siteStatus,
  clienteId,
  updatingStatus,
  getStatusColor,
  onStatusChange,
  onSiteStatusChange
}: ClienteRowStatusCellsProps) {
  return (
    <>
      <TableCell className="p-1">
        <StatusSelect
          value={(statusCampanha || 'Cliente Novo') as StatusCampanha}
          onValueChange={(newStatus) => onStatusChange(clienteId, newStatus as StatusCampanha)}
          disabled={updatingStatus === clienteId}
          isUpdating={updatingStatus === clienteId}
          getStatusColor={getStatusColor}
          compact={false}
        />
      </TableCell>

      <TableCell className="p-1">
        <SiteStatusSelect
          value={siteStatus || 'pendente'}
          onValueChange={(newStatus) => onSiteStatusChange(clienteId, newStatus)}
          disabled={updatingStatus === clienteId}
          isUpdating={updatingStatus === clienteId}
          compact={false}
        />
      </TableCell>
    </>
  )
}
