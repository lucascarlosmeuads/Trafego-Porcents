
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
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"

import { Cliente } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast as useToastHook } from '@/hooks/use-toast'
import { useSupabase } from '@/hooks/useSupabase'
import { useRealtime } from '@/hooks/useRealtime'
import { useManagerData } from '@/hooks/useManagerData'
import { formatCliente } from '@/utils/clienteFormatter'
import { ComissaoButton } from './ClientesTable/ComissaoButton'
import { TableActions } from './ClientesTable/TableActions'
import { ClienteTableColumns } from './ClientesTable/ClienteTableColumns'
import { ClienteTableOperations } from './ClientesTable/ClienteTableOperations'

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

  const operations = useMemo(() => new ClienteTableOperations(supabase, toast, setData), [supabase, toast])

  const columns = useMemo<ColumnDef<Cliente>[]>(() => 
    ClienteTableColumns.getColumns(isAdmin || false, handleRefresh, operations),
    [isAdmin, handleRefresh, operations]
  )

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
