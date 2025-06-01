import { TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ClienteRowDataLimiteProps {
  dataVenda: string
  createdAt: string
  statusCampanha: string
  nomeCliente: string
  compact?: boolean
}

export function ClienteRowDataLimite({ 
  dataVenda, 
  createdAt, 
  statusCampanha, 
  nomeCliente,
  compact = false 
}: ClienteRowDataLimiteProps) {
  const calcularDataLimite = () => {
    try {
      const baseDate = dataVenda && dataVenda.trim() !== '' ? new Date(dataVenda) : new Date(createdAt)
      
      if (isNaN(baseDate.getTime())) {
        return { 
          data: 'Data inválida', 
          status: 'error',
          diasRestantes: 0,
          detalhes: 'Data base inválida'
        }
      }

      const dataLimite = new Date(baseDate)
      dataLimite.setDate(baseDate.getDate() + 30)
      
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      dataLimite.setHours(0, 0, 0, 0)
      
      const diffTime = dataLimite.getTime() - hoje.getTime()
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      let status = 'normal'
      if (diasRestantes < 0) {
        status = 'vencido'
      } else if (diasRestantes <= 5) {
        status = 'urgente'
      } else if (diasRestantes <= 10) {
        status = 'atencao'
      }

      const detalhes = `Data base: ${baseDate.toLocaleDateString('pt-BR')}\nData limite: ${dataLimite.toLocaleDateString('pt-BR')}\nDias restantes: ${diasRestantes}`

      return {
        data: compact ? 
          (diasRestantes < 0 ? `${Math.abs(diasRestantes)}d` : `${diasRestantes}d`) :
          dataLimite.toLocaleDateString('pt-BR'),
        status,
        diasRestantes,
        detalhes
      }
    } catch (error) {
      console.error('Erro ao calcular data limite:', error)
      return { 
        data: 'Erro', 
        status: 'error',
        diasRestantes: 0,
        detalhes: 'Erro no cálculo'
      }
    }
  }

  const { data, status, diasRestantes, detalhes } = calcularDataLimite()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vencido':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'urgente':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      case 'atencao':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'normal':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getPrefixIcon = (status: string) => {
    if (status === 'vencido') return '⚠️'
    if (status === 'urgente') return '🔥'
    if (status === 'atencao') return '⏰'
    return '✅'
  }

  if (compact) {
    return (
      <TableCell className="p-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge 
                variant="outline" 
                className={`${getStatusColor(status)} text-xs px-1 py-0 border`}
              >
                {getPrefixIcon(status)} {data}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p className="font-semibold">{nomeCliente}</p>
                <p className="whitespace-pre-line">{detalhes}</p>
                <p className="mt-1 text-xs opacity-80">Status: {statusCampanha}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    )
  }

  
  return (
    <TableCell className="text-white text-sm">
      <div className="flex flex-col gap-1">
        <Badge 
          variant="outline" 
          className={`${getStatusColor(status)} text-xs w-fit border`}
        >
          {data}
        </Badge>
        {diasRestantes <= 10 && (
          <span className="text-xs opacity-70">
            {diasRestantes < 0 
              ? `Vencido há ${Math.abs(diasRestantes)} dias` 
              : `${diasRestantes} dias restantes`
            }
          </span>
        )}
      </div>
    </TableCell>
  )
}
