
import { TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Folder } from 'lucide-react'
import { BriefingMaterialsModal } from './BriefingMaterialsModal'
import { useClienteData } from '@/hooks/useClienteData'

interface ClienteRowBriefingCellProps {
  emailCliente: string
  nomeCliente: string
}

export function ClienteRowBriefingCell({ emailCliente, nomeCliente }: ClienteRowBriefingCellProps) {
  const { briefing } = useClienteData(emailCliente)
  
  // Determinar cor da pasta baseado se o formulário foi preenchido
  const formularioCompleto = briefing?.formulario_completo === true
  
  const buttonClasses = formularioCompleto 
    ? "h-5 w-5 p-0 bg-blue-600 hover:bg-blue-700 border-blue-600"
    : "h-5 w-5 p-0 bg-red-600 hover:bg-red-700 border-red-600"

  return (
    <TableCell className="p-1">
      <BriefingMaterialsModal 
        emailCliente={emailCliente}
        nomeCliente={nomeCliente}
        trigger={
          <Button
            size="sm"
            variant="outline"
            className={buttonClasses}
          >
            <Folder className="h-2.5 w-2.5" />
          </Button>
        }
      />
    </TableCell>
  )
}
