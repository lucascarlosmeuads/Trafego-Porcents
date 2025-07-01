import {
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  FilterFn,
  SortingState,
  getSortedRowModel,
  OnChangeFn,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
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
import { MoreHorizontal, Edit, Trash2, Copy, ChevronsUpDown } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Cliente } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast as useToastHook } from '@/hooks/use-toast'
import { useSupabase } from '@/hooks/useSupabase'
import { useRealtime } from '@/hooks/useRealtime'
import { useManagerData } from '@/hooks/useManagerData'
import { formatCliente } from '@/utils/clienteFormatter'
import {
  STATUS_CAMPANHA,
  getStatusDisplayLabel
} from '@/lib/supabase'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from '@/components/ui/badge'
import { DatePicker } from "@/components/ui/date-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ComissaoButton } from './ClientesTable/ComissaoButton'
import { TableActions } from './ClientesTable/TableActions'

// Define a generic type for the filter value
type FilterValue = string | [Date | undefined, Date | undefined] | null

interface ClientesTableProps {
  selectedManager?: string | null
  initialClientes?: Cliente[]
}

export function ClientesTable({ selectedManager = null, initialClientes }: ClientesTableProps) {
  const { user, isAdmin } = useAuth()
  const { supabase } = useSupabase()
  const { toast } = useToastHook()
  const { isConnected: realtimeConnected } = useRealtime()

  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [isIdCopied, setIsIdCopied] = useState(false)
  const [isAllSelected, setIsAllSelected] = useState(false)

  // Date range state
  const [dateRange, setDateRange] = useState<[Date | undefined, Date | undefined]>([
    undefined,
    undefined,
  ])

  // Use initialClientes if provided, otherwise fetch normally
  const shouldFetchData = !initialClientes
  const { clientes: fetchedClientes, loading: dataLoading } = useManagerData(
    user?.email || '',
    isAdmin,
    selectedManager
  )

  // Use provided initial clientes or fetched clientes
  const clientes = initialClientes || fetchedClientes
  const loading = shouldFetchData ? dataLoading : false

  const [data, setData] = useState<Cliente[]>(clientes || [])

  useEffect(() => {
    setData(clientes || [])
  }, [clientes])

  const filteredClientesCount = data?.length || 0

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsIdCopied(true)
    toast({
      title: "Copiado!",
      description: "ID do cliente copiado para a área de transferência.",
    })
    setTimeout(() => setIsIdCopied(false), 2000)
  }

  const fetchData = useCallback(async () => {
    try {
      const { data: clientesData, error } = await supabase
        .from('todos_clientes')
        .select('*')

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        toast({
          title: "Erro ao buscar clientes",
          description: "Ocorreu um erro ao carregar os clientes. Por favor, tente novamente.",
          variant: "destructive",
        })
        return
      }

      const formattedClientes = clientesData.map(formatCliente)
      setData(formattedClientes)
    } catch (error) {
      console.error('Erro inesperado ao buscar clientes:', error)
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }, [supabase, toast])

  const handleRefresh = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  const handleExport = () => {
    if (!data || data.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há dados de clientes para exportar.",
      })
      return
    }

    const csvRows = []

    // Cabeçalho
    const headers = Object.keys(data[0])
    csvRows.push(headers.join(','))

    // Linhas de dados
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header as keyof Cliente]
        return typeof value === 'string' ? `"${value}"` : value
      })
      csvRows.push(values.join(','))
    }

    // Criar o conteúdo do arquivo CSV
    const csvData = csvRows.join('\n')

    // Criar um link temporário para download
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', 'clientes.csv')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Exportado!",
      description: "Dados dos clientes exportados para CSV.",
    })
  }

  const deleteCliente = async (clienteId: string) => {
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .delete()
        .eq('id', clienteId)

      if (error) {
        console.error('Erro ao deletar cliente:', error)
        toast({
          title: "Erro ao deletar cliente",
          description: "Ocorreu um erro ao deletar o cliente. Por favor, tente novamente.",
          variant: "destructive",
        })
        return
      }

      setData(data.filter(cliente => cliente.id !== clienteId))
      toast({
        title: "Cliente deletado",
        description: "O cliente foi deletado com sucesso.",
      })
    } catch (error) {
      console.error('Erro inesperado ao deletar cliente:', error)
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  const duplicateCliente = async (clienteId: string) => {
    try {
      const clienteToDuplicate = data.find(cliente => cliente.id === clienteId)

      if (!clienteToDuplicate) {
        toast({
          title: "Cliente não encontrado",
          description: "O cliente a ser duplicado não foi encontrado.",
          variant: "destructive",
        })
        return
      }

      // Remover o ID para que o Supabase gere um novo
      const { id, ...clienteData } = clienteToDuplicate

      const { data: duplicatedCliente, error } = await supabase
        .from('todos_clientes')
        .insert([clienteData])
        .select()

      if (error) {
        console.error('Erro ao duplicar cliente:', error)
        toast({
          title: "Erro ao duplicar cliente",
          description: "Ocorreu um erro ao duplicar o cliente. Por favor, tente novamente.",
          variant: "destructive",
        })
        return
      }

      if (duplicatedCliente && duplicatedCliente.length > 0) {
        setData([...data, formatCliente(duplicatedCliente[0])])
        toast({
          title: "Cliente duplicado",
          description: "O cliente foi duplicado com sucesso.",
        })
      } else {
        toast({
          title: "Erro ao duplicar cliente",
          description: "Ocorreu um erro ao duplicar o cliente. Por favor, tente novamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Erro inesperado ao duplicar cliente:', error)
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  const updateClienteStatus = async (clienteId: string, newStatus: keyof typeof STATUS_CAMPANHA | string) => {
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ status_campanha: newStatus })
        .eq('id', clienteId)

      if (error) {
        console.error('Erro ao atualizar status do cliente:', error)
        toast({
          title: "Erro ao atualizar status",
          description: "Ocorreu um erro ao atualizar o status do cliente. Por favor, tente novamente.",
          variant: "destructive",
        })
        return
      }

      setData(data.map(cliente =>
        cliente.id === clienteId ? { ...cliente, status_campanha: newStatus } : cliente
      ))

      toast({
        title: "Status atualizado",
        description: `Status do cliente atualizado para ${newStatus}.`,
      })
    } catch (error) {
      console.error('Erro inesperado ao atualizar status do cliente:', error)
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  const columns = useMemo<ColumnDef<Cliente>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value)
            setIsAllSelected(!!value)
          }}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <span className="max-w-[220px] truncate font-medium">{row.getValue('id')}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 data-[state=open]:bg-muted"
                  onClick={() => copyToClipboard(row.getValue('id'))}
                  disabled={isIdCopied}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copiar ID</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                {isIdCopied ? "ID copiado!" : "Copiar ID"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
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
        const status = row.getValue('status_campanha') as string
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
                onClick={() => copyToClipboard(cliente.id)}
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
                onClick={() => duplicateCliente(cliente.id)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Mudar Status</DropdownMenuLabel>
              {STATUS_CAMPANHA.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => updateClienteStatus(cliente.id, status)}
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
                      onClick={() => deleteCliente(cliente.id)}
                    >
                      Deletar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [copyToClipboard, isIdCopied, isAdmin, handleRefresh, updateClienteStatus, duplicateCliente, deleteCliente])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div className="w-full space-y-4">
      <TableActions
        selectedManager={selectedManager || 'Todos os Clientes'}
        filteredClientesCount={filteredClientesCount}
        realtimeConnected={realtimeConnected}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} de {table.getPreFilteredRowModel().rows.length} linhas
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}
