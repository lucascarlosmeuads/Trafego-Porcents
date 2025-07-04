
import { TableCell } from '@/components/ui/table'
import { AtSign } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from '@/hooks/use-toast'
import { tableLogger } from '@/utils/logger'
import { MESSAGES } from '@/constants'

interface ClienteRowGestorCellProps {
  emailGestor: string
  isAdmin: boolean
  showEmailGestor: boolean
}

export function ClienteRowGestorCell({ emailGestor, isAdmin, showEmailGestor }: ClienteRowGestorCellProps) {
  const handleGestorClick = () => {
    if (!isAdmin) {
      toast({
        title: MESSAGES.ERROR.PERMISSION,
        variant: "destructive"
      })
      tableLogger.warn('Tentativa de edição de gestor sem permissão', { userType: 'non-admin' })
    } else {
      toast({
        title: "Funcionalidade de edição em desenvolvimento"
      })
      tableLogger.info('Funcionalidade de edição de gestor solicitada')
    }
  }

  if (!isAdmin && !showEmailGestor) {
    return null
  }

  return (
    <TableCell className="text-white text-xs p-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger 
            onClick={handleGestorClick}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-center">
              <AtSign className="h-3 w-3 text-green-400" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs break-all">{emailGestor || 'Não informado'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  )
}
