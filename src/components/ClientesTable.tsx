import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { useClientFilters } from '@/hooks/useClientFilters'
import { AddClientModal } from './AddClientModal'
import { ClientesTableCards } from './ClientesTable/ClientesTableCards'
import { ClientesTableDesktop } from './ClientesTable/ClientesTableDesktop'
import { TableFilters } from './ClientesTable/TableFilters'
import { ClienteRow } from './ClientesTable/ClienteRow'
import { LoadingFallback } from '@/components/LoadingFallback'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Smartphone, Monitor } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useClienteActions } from '@/hooks/useClienteActions'
import { useMultipleCreativeFiles } from '@/hooks/useMultipleCreativeFiles'

interface ClientesTableProps {
  selectedManager?: string
}

export function ClientesTable({ selectedManager }: ClientesTableProps) {
  const { user, isAdmin } = useAuth()
  
  const isGestor = !isAdmin && selectedManager?.includes('@') && selectedManager !== 'Todos os Clientes'

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  
  const [siteStatusFilter, setSiteStatusFilter] = useState<string>('all')
  const [creativeFilter, setCreativeFilter] = useState<string>('all')
  const [bmFilter, setBmFilter] = useState<string>('all')

  const { toast } = useToast()

  const {
    clientes,
    loading,
    error,
    refetch,
    updateCliente
  } = useManagerData(
    user?.email || '',
    isAdmin,
    selectedManager,
    isAdmin ? undefined : 'all'
  )

  const { clientesWithCreatives, loading: creativesLoading } = useMultipleCreativeFiles(clientes)
  
  const {
    dateFilter,
    setDateFilter,
    organizedClientes
  } = useClientFilters(clientes, clientesWithCreatives)

  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [editingLink, setEditingLink] = useState<{ clienteId: string, field: string } | null>(null)
  const [linkValue, setLinkValue] = useState<string>('')
  const [editingBM, setEditingBM] = useState<string | null>(null)
  const [bmValue, setBmValue] = useState<string>('')
  const [updatingComission, setUpdatingComission] = useState<string | null>(null)
  const [editingComissionValue, setEditingComissionValue] = useState<string | null>(null)
  const [comissionValueInput, setComissionValueInput] = useState<string>('')

  const {
    handleStatusChange,
    handleSiteStatusChange,
    handleLinkEdit,
    handleLinkSave,
    handleLinkCancel,
    handleBMEdit,
    handleBMSave,
    handleBMCancel,
    handleComissionToggle,
    handleComissionValueEdit,
    handleComissionValueSave,
    handleComissionValueCancel,
    handleSitePagoChange
  } = useClienteActions({
    clientes,
    setClientes: (updatedClientes) => {
      // Update the local state with the updated clients
      // This assumes that `clientes` state is managed locally in this component
      // If `clientes` is managed in a parent component, you'll need to adjust this accordingly
      // For example, if you're using a context or Zustand/Redux store, you'd dispatch an action to update the state there
      // Here's a simple example of updating the local state:
      // setClientes(updatedClientes);
    },
    updateCliente,
    setUpdatingStatus,
    setEditingLink,
    setLinkValue,
    setEditingBM,
    setBmValue,
    setUpdatingComission,
    setEditingComissionValue,
    setComissionValueInput,
    toast,
    refetch
  })

  // Apply all filters including the new ones
  const filteredClientes = useMemo(() => {
    let result = organizedClientes.total

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      result = result.filter(cliente =>
        (cliente.nome_cliente?.toLowerCase().includes(term)) ||
        (cliente.email_cliente?.toLowerCase().includes(term)) ||
        (cliente.telefone?.toLowerCase().includes(term)) ||
        (cliente.vendedor?.toLowerCase().includes(term))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(cliente => 
        (cliente.status_campanha || 'Cliente Novo') === statusFilter
      )
    }

    // Apply site status filter
    if (siteStatusFilter !== 'all') {
      result = result.filter(cliente => 
        (cliente.site_status || 'pendente') === siteStatusFilter
      )
    }

    // Apply creative filter (only for admin/gestor)
    if ((isAdmin || isGestor) && creativeFilter !== 'all' && !creativesLoading) {
      switch (creativeFilter) {
        case 'falta_fazer':
          result = result.filter(cliente => !clientesWithCreatives[cliente.email_cliente || ''])
          break
        case 'criativo_feito':
          result = result.filter(cliente => clientesWithCreatives[cliente.email_cliente || ''])
          break
      }
    }

    // Apply BM filter (only for admin/gestor)
    if ((isAdmin || isGestor) && bmFilter !== 'all') {
      switch (bmFilter) {
        case 'bm_configurada':
          result = result.filter(cliente => cliente.numero_bm && cliente.numero_bm.trim() !== '')
          break
        case 'bm_nao_configurada':
          result = result.filter(cliente => !cliente.numero_bm || cliente.numero_bm.trim() === '')
          break
      }
    }

    return result
  }, [
    organizedClientes.total, 
    searchTerm, 
    statusFilter, 
    siteStatusFilter, 
    creativeFilter, 
    bmFilter, 
    isAdmin, 
    isGestor, 
    clientesWithCreatives, 
    creativesLoading
  ])

  const getTableTitle = () => {
    if (isAdmin) {
      if (selectedManager === 'Todos os Clientes' || !selectedManager) {
        return 'Todos os Clientes'
      } else {
        return `Clientes de ${selectedManager}`
      }
    } else {
      return 'Meus Clientes'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Cliente Novo': return 'bg-gray-500 text-white'
      case 'Em Contato': return 'bg-yellow-500 text-white'
      case 'Agendado': return 'bg-blue-500 text-white'
      case 'Aprovado': return 'bg-green-500 text-white'
      case 'Rejeitado': return 'bg-red-500 text-white'
      case 'Desistente': return 'bg-red-700 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const canAddClients = isAdmin || isGestor

  if (loading || creativesLoading) {
    return <LoadingFallback />
  }

  return (
    <Card className="w-full bg-card border-border">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg sm:text-xl text-card-foreground">
              {getTableTitle()}
            </CardTitle>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                variant="outline"
                size="sm"
                className="lg:hidden"
              >
                {viewMode === 'table' ? <Smartphone className="w-4 h-4 mr-2" /> : <Monitor className="w-4 h-4 mr-2" />}
                {viewMode === 'table' ? 'Cartões' : 'Tabela'}
              </Button>
              
              {canAddClients && (
                <AddClientModal onClientAdded={refetch} />
              )}
            </div>
          </div>

          <TableFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            siteStatusFilter={siteStatusFilter}
            setSiteStatusFilter={setSiteStatusFilter}
            showSiteStatusFilter={true}
            creativeFilter={creativeFilter}
            setCreativeFilter={setCreativeFilter}
            bmFilter={bmFilter}
            setBmFilter={setBmFilter}
            showCreativeAndBmFilters={isAdmin || isGestor}
            getStatusColor={getStatusColor}
          />
        </div>
      </CardHeader>

      <CardContent className="p-0 sm:p-6">
        {/* Visualização em cartões para mobile */}
        {viewMode === 'cards' && (
          <ClientesTableCards
            clientes={filteredClientes}
            getStatusColor={getStatusColor}
            formatDate={(dateString: string) => {
              if (!dateString || dateString.trim() === '') return 'Não informado'
              try {
                const date = new Date(dateString)
                return date.toLocaleDateString('pt-BR')
              } catch {
                return dateString
              }
            }}
          />
        )}

        {/* Tabela para desktop */}
        <div className={`${viewMode === 'cards' ? 'hidden lg:block' : 'block'}`}>
          <ClientesTableDesktop
            clientes={filteredClientes}
            isAdmin={isAdmin}
            selectedManager={selectedManager || ''}
            showEmailGestor={isAdmin}
            showSitePagoCheckbox={isAdmin}
            updatingStatus={updatingStatus}
            editingLink={editingLink}
            linkValue={linkValue}
            setLinkValue={setLinkValue}
            editingBM={editingBM}
            bmValue={bmValue}
            setBmValue={setBmValue}
            updatingComission={updatingComission}
            editingComissionValue={editingComissionValue}
            comissionValueInput={comissionValueInput}
            setComissionValueInput={setComissionValueInput}
            getStatusColor={getStatusColor}
            onStatusChange={handleStatusChange}
            onSiteStatusChange={handleSiteStatusChange}
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
            onSitePagoChange={handleSitePagoChange}
            formatDate={(dateString: string) => {
              if (!dateString || dateString.trim() === '') return 'Não informado'
              try {
                const date = new Date(dateString)
                return date.toLocaleDateString('pt-BR')
              } catch {
                return dateString
              }
            }}
          />
        </div>
        
        {filteredClientes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum cliente encontrado
          </div>
        )}
      </CardContent>
    </Card>
  )
}
