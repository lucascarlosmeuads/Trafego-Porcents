
import { TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getDataLimiteDisplayForGestor } from '@/utils/dateUtils'

interface ClienteRowDataLimiteProps {
  dataVenda: string
  createdAt: string
  statusCampanha: string
  nomeCliente: string
}

export function ClienteRowDataLimite({ 
  dataVenda, 
  createdAt, 
  statusCampanha, 
  nomeCliente 
}: ClienteRowDataLimiteProps) {
  console.log(`📅 [ClienteRowDataLimite] Renderizando Data Limite para: ${nomeCliente}`)
  console.log(`📅 [ClienteRowDataLimite] Dados:`, {
    dataVenda,
    createdAt,
    statusCampanha
  })
  
  const dataLimiteDisplay = getDataLimiteDisplayForGestor(
    dataVenda || '', 
    createdAt, 
    statusCampanha || 'Cliente Novo'
  )
  
  console.log(`📅 [ClienteRowDataLimite] Resultado:`, dataLimiteDisplay)
  
  return (
    <TableCell className="text-white text-sm">
      <Badge className={`${dataLimiteDisplay.classeCor} rounded-md`}>
        {dataLimiteDisplay.texto}
      </Badge>
    </TableCell>
  )
}
