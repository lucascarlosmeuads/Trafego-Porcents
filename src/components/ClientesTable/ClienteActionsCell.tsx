
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Trash2, Copy } from 'lucide-react'
import { Cliente, StatusCampanha } from '@/lib/supabase'
import { STATUS_CAMPANHA, getStatusDisplayLabel } from '@/lib/supabase'
import { ClienteTableOperations } from './ClienteTableOperations'

interface ClienteActionsCellProps {
  cliente: Cliente
  operations: ClienteTableOperations
}

export function ClienteActionsCell({ cliente, operations }: ClienteActionsCellProps) {
  const clienteId = cliente.id || ''

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => operations.copyToClipboard(clienteId)}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copiar ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => operations.duplicateCliente(clienteId)}
        >
          <Copy className="mr-2 h-4 w-4" />
          Duplicar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Mudar Status</DropdownMenuLabel>
        {STATUS_CAMPANHA.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => operations.updateClienteStatus(clienteId, status as StatusCampanha)}
          >
            {getStatusDisplayLabel(status)}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4 text-red-600" />
              Deletar
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá deletar o cliente permanentemente.
                Você tem certeza que deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-red-50"
                onClick={() => operations.deleteCliente(clienteId)}
              >
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
