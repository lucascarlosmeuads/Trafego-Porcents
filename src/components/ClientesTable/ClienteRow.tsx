
import { TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, ArrowRight, Copy, Mail, Phone } from 'lucide-react'
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { STATUS_DISPLAY_MAP } from '@/lib/supabase'
import { StatusSelect } from './StatusSelect'
import { useToast } from '@/hooks/use-toast'
import { ClienteRowPhone } from './ClienteRowPhone'
import { ClienteRowValorVenda } from './ClienteRowValorVenda'
import { formatCurrency } from '@/utils/currencyUtils'

interface ClienteRowProps {
  cliente: any
  userEmail: string
  isAdmin: boolean
  onUpdate: (id: string, field: string, value: string | boolean | number) => Promise<boolean>
  showComissaoAvancada?: boolean
  showComissaoSimples?: boolean
}

export function ClienteRow({ 
  cliente, 
  userEmail, 
  isAdmin, 
  onUpdate,
  showComissaoAvancada,
  showComissaoSimples 
}: ClienteRowProps) {
  const { toast } = useToast()

  const handleStatusChange = (newStatus: string) => {
    onUpdate(String(cliente.id), 'status_campanha', newStatus)
  }

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    toast({
      title: "Copiado!",
      description: "Email copiado para a área de transferência",
    })
  }

  return (
    <TableRow key={cliente.id} className="hover:bg-gray-50">
      <TableCell className="font-medium">{cliente.nome_cliente}</TableCell>
      
      <TableCell>
        <a href={`mailto:${cliente.email_cliente}`} className="hover:underline flex items-center gap-1">
          {cliente.email_cliente}
          <Mail className="w-3 h-3 opacity-60" />
        </a>
        <Button variant="ghost" size="icon" className="ml-1 p-1" onClick={() => handleCopyEmail(cliente.email_cliente)}>
          <Copy className="w-3 h-3" />
        </Button>
      </TableCell>
      
      <TableCell>
        <ClienteRowPhone 
          telefone={cliente.telefone} 
          nomeCliente={cliente.nome_cliente}
        />
      </TableCell>
      
      <TableCell>
        <ClienteRowValorVenda
          clienteId={String(cliente.id)}
          valorAtual={cliente.valor_venda_inicial}
          isAdmin={isAdmin}
          onUpdate={onUpdate}
        />
      </TableCell>
      
      <TableCell>
        <StatusSelect
          currentStatus={cliente.status_campanha}
          onStatusChange={handleStatusChange}
          userEmail={userEmail}
          isAdmin={isAdmin}
        />
      </TableCell>

      {showComissaoAvancada && (
        <>
          <TableCell>{cliente.comissao}</TableCell>
          <TableCell>{cliente.comissao_paga ? 'Pago' : 'Pendente'}</TableCell>
        </>
      )}

      {showComissaoSimples && (
        <TableCell>
          {cliente.comissao}
        </TableCell>
      )}

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              Ver detalhes <ArrowRight className="ml-auto h-4 w-4" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
