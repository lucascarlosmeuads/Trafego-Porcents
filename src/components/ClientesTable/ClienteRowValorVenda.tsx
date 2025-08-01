import { TableCell } from '@/components/ui/table'

interface ClienteRowValorVendaProps {
  valorVendaInicial?: number | null
}

export function ClienteRowValorVenda({ valorVendaInicial }: ClienteRowValorVendaProps) {
  const formatarValor = (valor: number | null | undefined) => {
    if (!valor || (valor !== 350 && valor !== 500)) {
      return (
        <span className="text-xs text-muted-foreground">
          Não informado
        </span>
      )
    }
    
    return (
      <span className="text-xs font-medium text-green-600">
        R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </span>
    )
  }

  return (
    <TableCell className="w-20 text-center">
      {formatarValor(valorVendaInicial)}
    </TableCell>
  )
}