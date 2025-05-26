import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { supabase } from '@/lib/supabase'
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

interface ClientesTableProps {
  selectedManager: string | null
  filterType?: 'ativos' | 'inativos' | 'problemas' | 'saques-pendentes' | 'all'
  hideAddButton?: boolean
}

// Simple realtime subscription hook
const useRealtimeSubscription = (manager: string, setConnected: (connected: boolean) => void, refetch: () => void) => {
  useEffect(() => {
    if (!manager) return

    setConnected(true)
    const channel = supabase
      .channel(`public:todos_clientes-${manager}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos_clientes'
        },
        () => {
          refetch()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      setConnected(false)
    }
  }, [manager, setConnected, refetch])
}

// Simple CSV export function
const exportClientesToCSV = (clientes: any[]) => {
  const headers = ['Nome', 'Email', 'Telefone', 'Status', 'Vendedor', 'Data Venda']
  const csvContent = [
    headers.join(','),
    ...clientes.map(cliente => [
      cliente.nome_cliente,
      cliente.email_cliente,
      cliente.telefone,
      cliente.status_campanha,
      cliente.vendedor,
      cliente.data_venda
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `clientes-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

export function ClientesTable({ selectedManager, filterType = 'all', hideAddButton = false }: ClientesTableProps) {
  const { user, isAdmin } = useAuth()
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [comissaoFilter, setComissaoFilter] = useState('')
  
  // States for ClienteRow editing functionality
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [editingLink, setEditingLink] = useState<{ clienteId: string, field: string } | null>(null)
  const [linkValue, setLinkValue] = useState('')
  const [editingBM, setEditingBM] = useState<string | null>(null)
  const [bmValue, setBmValue] = useState('')
  const [updatingComission, setUpdatingComission] = useState<string | null>(null)
  const [editingComissionValue, setEditingComissionValue] = useState<string | null>(null)
  const [comissionValueInput, setComissionValueInput] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('todos_clientes')
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
        variant: "destructive"
      })
      return
    }

    exportClientesToCSV(filteredClientes)
  }

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'Preenchimento do Formulário': 'bg-gray-100 text-gray-800',
      'Brief': 'bg-blue-100 text-blue-800',
      'Criativo': 'bg-purple-100 text-purple-800',
      'Site': 'bg-yellow-100 text-yellow-800',
      'Agendamento': 'bg-orange-100 text-orange-800',
      'No Ar': 'bg-green-100 text-green-800',
      'Otimização': 'bg-cyan-100 text-cyan-800',
      'Problema': 'bg-red-100 text-red-800',
      'Off': 'bg-slate-100 text-slate-800',
      'Reembolso': 'bg-pink-100 text-pink-800',
      'Saque Pendente': 'bg-amber-100 text-amber-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  // Handler functions for ClienteRow
  const handleStatusChange = async (clienteId: string, newStatus: string) => {
    setUpdatingStatus(clienteId)
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ 
          status_campanha: newStatus,
          site_status: newStatus === 'aguardando_link' ? 'aguardando_link' : 
                      newStatus === 'nao_precisa' ? 'nao_precisa' :
                      newStatus === 'finalizado' ? 'finalizado' : undefined
        })
        .eq('id', clienteId)

      if (error) throw error
      refetch()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast({
        title: "Erro",
        description: "Falha ao atualizar status",
        variant: "destructive"
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleLinkEdit = (clienteId: string, field: string, currentValue: string) => {
    setEditingLink({ clienteId, field })
    setLinkValue(currentValue || '')
  }

  const handleLinkSave = async (clienteId: string, field: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ [field]: linkValue })
        .eq('id', clienteId)

      if (error) throw error
      
      setEditingLink(null)
      setLinkValue('')
      refetch()
      return true
    } catch (error) {
      console.error('Erro ao salvar link:', error)
      return false
    }
  }

  const handleLinkCancel = () => {
    setEditingLink(null)
    setLinkValue('')
  }

  const handleBMEdit = (clienteId: string, currentValue: string) => {
    setEditingBM(clienteId)
    setBmValue(currentValue)
  }

  const handleBMSave = async (clienteId: string) => {
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ numero_bm: bmValue })
        .eq('id', clienteId)

      if (error) throw error
      
      setEditingBM(null)
      setBmValue('')
      refetch()
    } catch (error) {
      console.error('Erro ao salvar BM:', error)
    }
  }

  const handleBMCancel = () => {
    setEditingBM(null)
    setBmValue('')
  }

  const handleComissionToggle = async (clienteId: string, currentStatus: boolean) => {
    setUpdatingComission(clienteId)
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ comissao_paga: !currentStatus })
        .eq('id', clienteId)

      if (error) throw error
      refetch()
    } catch (error) {
      console.error('Erro ao atualizar comissão:', error)
    } finally {
      setUpdatingComission(null)
    }
  }

  const handleComissionValueEdit = (clienteId: string, currentValue: number) => {
    setEditingComissionValue(clienteId)
    setComissionValueInput(currentValue.toString())
  }

  const handleComissionValueSave = async (clienteId: string, newValue: number) => {
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ valor_comissao: newValue })
        .eq('id', clienteId)

      if (error) throw error
      
      setEditingComissionValue(null)
      setComissionValueInput('')
      refetch()
    } catch (error) {
      console.error('Erro ao salvar valor da comissão:', error)
    }
  }

  const handleComissionValueCancel = () => {
    setEditingComissionValue(null)
    setComissionValueInput('')
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
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        comissaoFilter={comissaoFilter}
        setComissaoFilter={setComissaoFilter}
        getStatusColor={getStatusColor}
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
              filteredClientes.map((cliente, index) => (
                <ClienteRow
                  key={cliente.id}
                  cliente={cliente}
                  selectedManager={selectedManager || 'Todos'}
                  index={index}
                  updatingStatus={updatingStatus}
                  editingLink={editingLink}
                  linkValue={linkValue}
                  setLinkValue={setLinkValue}
                  editingBM={editingBM}
                  bmValue={bmValue}
                  setBmValue={setBmValue}
                  updatingComission={updatingComission}
                  getStatusColor={getStatusColor}
                  onStatusChange={handleStatusChange}
                  onLinkEdit={handleLinkEdit}
                  onLinkSave={handleLinkSave}
                  onLinkCancel={handleLinkCancel}
                  onBMEdit={handleBMEdit}
                  onBMSave={handleBMSave}
                  onBMCancel={handleBMCancel}
                  onComissionToggle={handleComissionToggle}
                  onComissionValueEdit={handleComissionValueEdit}
                  onComissionValueSave={handleComissionValueSave}
                  onComissionValueCancel={handleComissionValueCancel}
                  editingComissionValue={editingComissionValue}
                  comissionValueInput={comissionValueInput}
                  setComissionValueInput={setComissionValueInput}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
