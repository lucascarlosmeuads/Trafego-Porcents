
import { TableCell } from '@/components/ui/table'
import { Mail } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ClienteRowEmailCellProps {
  emailCliente: string
}

export function ClienteRowEmailCell({ emailCliente }: ClienteRowEmailCellProps) {
  return (
    <TableCell className="text-white text-xs p-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center justify-center">
              <Mail className="h-3 w-3 text-blue-400" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs break-all">{emailCliente || 'Não informado'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  )
}
