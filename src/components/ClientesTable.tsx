import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { useRealtimeSubscription } from '@/utils/realtimeUtils'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw } from 'lucide-react'
import { Table, TableBody } from '@/components/ui/table'
import { ClienteRow } from './ClientesTable/ClienteRow'
import { TableHeader } from './ClientesTable/TableHeader'
import { TableActions } from './ClientesTable/TableActions'
import { TableFilters } from './ClientesTable/TableFilters'
import { RealtimeStatus } from './ClientesTable/RealtimeStatus'
import { AddClientModal } from './ClientesTable/AddClientModal'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { exportClientesToCSV } from '@/utils/clienteFormatter'

interface ClientesTableProps {
  selectedManager: string | null
  filterType?: 'ativos' | 'inativos' | 'problemas' | 'saques-pendentes' | 'all'
  hideAddButton?: boolean
}

export function ClientesTable({ selectedManager, filterType = 'all', hideAddButton = false }: ClientesTableProps) {
  const { user, isAdmin } = useAuth()
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [comissaoFilter, setComissaoFilter] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('email_gestor', selectedManager)

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        toast({
          title: "Erro",
          description: "Falha ao buscar clientes",
          variant: "destructive"
        })
      } else {
        setClientes(data || [])
      }
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchData()
  }

  useEffect(() => {
    if (selectedManager) {
      fetchData()
    }
  }, [selectedManager])

  useRealtimeSubscription(selectedManager || '', setRealtimeConnected, refetch)

  const filteredClientes = useMemo(() => {
    let filtered = [...clientes]

    if (filterType === 'ativos') {
      filtered = filtered.filter(cliente =>
        cliente.status_campanha !== 'Off' &&
        cliente.status_campanha !== 'Reembolso' &&
        cliente.status_campanha !== 'Problema' &&
        cliente.status_campanha !== 'Saque Pendente'
      )
    } else if (filterType === 'inativos') {
      filtered = filtered.filter(cliente =>
        cliente.status_campanha === 'Off' ||
        cliente.status_campanha === 'Reembolso'
      )
    } else if (filterType === 'problemas') {
      filtered = filtered.filter(cliente =>
        cliente.status_campanha === 'Problema'
      )
    } else if (filterType === 'saques-pendentes') {
      filtered = filtered.filter(cliente =>
        cliente.status_campanha === 'Saque Pendente'
      )
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (cliente) =>
          cliente.nome_cliente.toLowerCase().includes(lowerSearchTerm) ||
          cliente.email_cliente.toLowerCase().includes(lowerSearchTerm) ||
          cliente.telefone.toLowerCase().includes(lowerSearchTerm)
      )
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((cliente) => cliente.status_campanha === statusFilter)
    }

    if (comissaoFilter === 'pendentes') {
      filtered = filtered.filter((cliente) => cliente.comissao_paga === false)
    } else if (comissaoFilter === 'pagas') {
      filtered = filtered.filter((cliente) => cliente.comissao_paga === true)
    }

    return filtered
  }, [clientes, searchTerm, statusFilter, comissaoFilter, filterType])

  const handleExport = () => {
    if (filteredClientes.length === 0) {
      toast({
        title: "Atenção",
        description: "Nenhum cliente para exportar.",
        variant: "warning"
      })
      return
    }

    exportClientesToCSV(filteredClientes)
  }

  return (
    <div className="space-y-4">
      <TableActions
        selectedManager={selectedManager || 'Todos'}
        filteredClientesCount={filteredClientes.length}
        realtimeConnected={realtimeConnected}
        onRefresh={refetch}
        onExport={handleExport}
        onClienteAdicionado={selectedManager && !hideAddButton ? refetch : undefined}
        hideAddButton={hideAddButton}
      />

      <TableFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        comissaoFilter={comissaoFilter}
        onComissaoFilterChange={setComissaoFilter}
      />

      <div className="rounded-lg border border-border overflow-hidden shadow-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Table>
          <TableHeader />
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-border">
                  {Array.from({ length: 11 }).map((_, cellIndex) => (
                    <td key={cellIndex} className="p-4">
                      <Skeleton className="h-4 w-full bg-slate-700" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredClientes.length === 0 ? (
              <tr className="border-border hover:bg-muted/50">
                <td colSpan={11} className="text-center p-8 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">📭</span>
                    <span>Nenhum cliente encontrado</span>
                    {searchTerm && (
                      <span className="text-sm">
                        Busca por: "{searchTerm}"
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredClientes.map((cliente) => (
                <ClienteRow
                  key={cliente.id}
                  cliente={cliente}
                  onClienteUpdated={refetch}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
