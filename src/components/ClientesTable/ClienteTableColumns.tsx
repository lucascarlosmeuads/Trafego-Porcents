import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Copy, ChevronsUpDown } from 'lucide-react'
import { Cliente, StatusCampanha } from '@/lib/supabase'
import { getStatusDisplayLabel } from '@/lib/supabase'
import { ComissaoButton } from './ComissaoButton'
import { ClienteActionsCell } from './ClienteActionsCell'
import { ClienteIdCell } from './ClienteIdCell'
import { ClienteTableOperations } from './ClienteTableOperations'

export class ClienteTableColumns {
  static getColumns(
    isAdmin: boolean,
    handleRefresh: () => void,
    operations: ClienteTableOperations
  ): ColumnDef<Cliente>[] {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={Boolean(table.getIsAllPageRowsSelected())}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(Boolean(value))
            }}
            aria-label="Selecionar todos"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={Boolean(row.getIsSelected())}
            onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
            aria-label="Selecionar linha"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => {
          const clienteId = row.getValue('id') as string
          return <ClienteIdCell clienteId={clienteId} />
        },
      },
      {
        accessorKey: 'nome_cliente',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc' ? 'desc' : 'asc')}
            >
              Nome
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        accessorKey: 'telefone',
        header: 'Telefone',
      },
      {
        accessorKey: 'email_cliente',
        header: 'Email',
      },
      {
        accessorKey: 'vendedor',
        header: 'Vendedor',
      },
      {
        accessorKey: 'email_gestor',
        header: 'Gestor',
      },
      {
        accessorKey: 'status_campanha',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status_campanha') as StatusCampanha
          const label = getStatusDisplayLabel(status)

          // Determine badge color based on status
          let badgeColor = 'bg-gray-100 text-gray-800 border-gray-200' // Default color
          switch (status) {
            case 'Cliente Novo':
              badgeColor = 'bg-zinc-100 text-zinc-800 border-zinc-200'
              break
            case 'Formulário':
              badgeColor = 'bg-orange-100 text-orange-800 border-orange-200'
              break
            case 'Brief':
              badgeColor = 'bg-blue-100 text-blue-800 border-blue-200'
              break
            case 'Criativo':
              badgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-200'
              break
            case 'Site':
              badgeColor = 'bg-purple-100 text-purple-800 border-purple-200'
              break
            case 'Agendamento':
              badgeColor = 'bg-pink-100 text-pink-800 border-pink-200'
              break
            case 'Configurando BM':
              badgeColor = 'bg-teal-100 text-teal-800 border-teal-200'
              break
            case 'Subindo Campanha':
              badgeColor = 'bg-lime-100 text-lime-800 border-lime-200'
              break
            case 'Otimização':
              badgeColor = 'bg-green-100 text-green-800 border-green-200'
              break
            case 'Problema':
              badgeColor = 'bg-red-100 text-red-800 border-red-200'
              break
            case 'Cliente Sumiu':
              badgeColor = 'bg-stone-100 text-stone-800 border-stone-200'
              break
            case 'Reembolso':
              badgeColor = 'bg-rose-100 text-rose-800 border-rose-200'
              break
            case 'Saque Pendente':
              badgeColor = 'bg-indigo-100 text-indigo-800 border-indigo-200'
              break
            case 'Campanha Anual':
              badgeColor = 'bg-cyan-100 text-cyan-800 border-cyan-200'
              break
            case 'Urgente':
              badgeColor = 'bg-amber-100 text-amber-800 border-amber-200'
              break
            case 'Cliente Antigo':
              badgeColor = 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200'
              break
            default:
              badgeColor = 'bg-gray-100 text-gray-800 border-gray-200'
              break
          }

          return (
            <Badge className={badgeColor}>
              {label}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'data_venda',
        header: 'Data Venda',
      },
      {
        accessorKey: 'data_limite',
        header: 'Data Limite',
      },
      {
        accessorKey: 'created_at',
        header: 'Data Cadastro',
      },
      {
        accessorKey: 'valor_comissao',
        header: 'Comissão',
        cell: ({ row }) => {
          const cliente = row.original
          return <ComissaoButton cliente={cliente} onComissionUpdate={handleRefresh} isAdmin={isAdmin} />
        }
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const cliente = row.original
          return <ClienteActionsCell cliente={cliente} operations={operations} />
        },
      },
    ]
  }
}
