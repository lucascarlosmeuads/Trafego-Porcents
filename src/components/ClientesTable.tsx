
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { useClientFilters } from '@/hooks/useClientFilters'
import { AddClientModal } from './ClientesTable/AddClientModal'
import { ClientesTableCards } from './ClientesTable/ClientesTableCards'
import { ClientesTableDesktop } from './ClientesTable/ClientesTableDesktop'
import { TableFilters } from './ClientesTable/TableFilters'
import { LoadingFallback } from '@/components/LoadingFallback'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Smartphone, Monitor } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useClienteOperations } from '@/hooks/useClienteOperations'
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
    selectedManager
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

  const { updateCliente: updateClienteOperation } = useClienteOperations(user?.email || '', isAdmin, refetch)

  // Handlers for cliente actions
  const handleStatusChange = async (clienteId: string, newStatus: any) => {
    setUpdatingStatus(clienteId)
    try {
      const success = await updateClienteOperation(clienteId, 'status_campanha', newStatus)
      if (success) {
        toast({
          title: "Status atualizado",
          description: "Status da campanha foi atualizado com sucesso"
        })
        refetch()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status",
        variant: "destructive"
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleSiteStatusChange = async (clienteId: string, newStatus: string) => {
    setUpdatingStatus(clienteId)
    try {
      const success = await updateClienteOperation(clienteId, 'site_status', newStatus)
      if (success) {
        toast({
          title: "Status do site atualizado",
          description: "Status do site foi atualizado com sucesso"
        })
        refetch()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do site",
        variant: "destructive"
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleLinkEdit = (clienteId: string, field: string, currentValue: string) => {
    setEditingLink({ clienteId, field })
    setLinkValue(currentValue)
  }

  const handleLinkSave = async (clienteId: string) => {
    try {
      const success = await updateClienteOperation(clienteId, 'link_site', linkValue)
      if (success) {
        toast({
          title: "Link atualizado",
          description: "Link do site foi atualizado com sucesso"
        })
        setEditingLink(null)
        setLinkValue('')
        refetch()
        return true
      }
      return false
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar link",
        variant: "destructive"
      })
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
      const success = await updateClienteOperation(clienteId, 'numero_bm', bmValue)
      if (success) {
        toast({
          title: "BM atualizada",
          description: "Número da BM foi atualizado com sucesso"
        })
        setEditingBM(null)
        setBmValue('')
        refetch()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar BM",
        variant: "destructive"
      })
    }
  }

  const handleBMCancel = () => {
    setEditingBM(null)
    setBmValue('')
  }

  const handleComissionToggle = async (clienteId: string, currentStatus: boolean) => {
    setUpdatingComission(clienteId)
    try {
      const success = await updateClienteOperation(clienteId, 'comissao_paga', !currentStatus)
      if (success) {
        toast({
          title: "Comissão atualizada",
          description: `Comissão marcada como ${!currentStatus ? 'paga' : 'não paga'}`
        })
        refetch()
        return true
      }
      return false
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar comissão",
        variant: "destructive"
      })
      return false
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
      const success = await updateClienteOperation(clienteId, 'valor_comissao', newValue)
      if (success) {
        toast({
          title: "Valor da comissão atualizado",
          description: "Valor da comissão foi atualizado com sucesso"
        })
        setEditingComissionValue(null)
        setComissionValueInput('')
        refetch()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar valor da comissão",
        variant: "destructive"
      })
    }
  }

  const handleComissionValueCancel = () => {
    setEditingComissionValue(null)
    setComissionValueInput('')
  }

  const handleSitePagoChange = async (clienteId: string, newValue: boolean) => {
    try {
      const success = await updateClienteOperation(clienteId, 'site_pago', newValue)
      if (success) {
        refetch()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status de pagamento do site",
        variant: "destructive"
      })
    }
  }

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
                <AddClientModal onClienteAdicionado={refetch} />
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
