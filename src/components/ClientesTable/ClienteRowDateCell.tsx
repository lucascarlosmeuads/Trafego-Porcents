
import { TableCell } from '@/components/ui/table'
import { formatDate } from '@/utils/dateFormatters'

interface ClienteRowDateCellProps {
  dataVenda?: string
  createdAt: string
  index: number
}

export function ClienteRowDateCell({ dataVenda, createdAt, index }: ClienteRowDateCellProps) {
  return (
    <TableCell 
      className="text-white text-xs p-1 sticky left-0 bg-card z-10 border-r border-border"
      style={{ backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)' }}
    >
      {formatDate(dataVenda || createdAt)}
    </TableCell>
  )
}
