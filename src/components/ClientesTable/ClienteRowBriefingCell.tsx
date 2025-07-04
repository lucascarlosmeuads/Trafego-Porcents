
import { TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Folder } from 'lucide-react'
import { BriefingMaterialsModal } from './BriefingMaterialsModal'

interface ClienteRowBriefingCellProps {
  emailCliente: string
  nomeCliente: string
}

export function ClienteRowBriefingCell({ emailCliente, nomeCliente }: ClienteRowBriefingCellProps) {
  return (
    <TableCell className="p-1">
      <BriefingMaterialsModal 
        emailCliente={emailCliente}
        nomeCliente={nomeCliente}
        trigger={
          <Button
            size="sm"
            variant="outline"
            className="h-5 w-5 p-0 bg-blue-600 hover:bg-blue-700 border-blue-600"
          >
            <Folder className="h-2.5 w-2.5" />
          </Button>
        }
      />
    </TableCell>
  )
}
