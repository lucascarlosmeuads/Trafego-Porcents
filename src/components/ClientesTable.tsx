import React, { useState, useCallback, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { useClientFilters } from '@/hooks/useClientFilters'
import { TableActions } from './ClientesTable/TableActions'
import { TableFilters } from './ClientesTable/TableFilters'
import { TableHeader } from './ClientesTable/TableHeader'
import { ClienteRowMemo } from './ClientesTable/ClienteRowMemo'
import { AddClientRow } from './ClientesTable/AddClientRow'
import { Table, TableBody } from '@/components/ui/table'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { exportToCSV } from '@/utils/clienteFormatter'
import { getStatusColor } from '@/utils/statusDisplayUtils'
import { type StatusCampanha } from '@/lib/supabase'

interface ClientesTableProps {
  selectedManager?: string | null
  filterType?: 'sites-pendentes' | 'sites-finalizados' | 'saques-pendentes'
  showAddClient?: boolean
  showEmailGestor?: boolean
  showSitePagoCheckbox?: boolean
}

export function ClientesTable({ 
  selectedManager = null, 
  filterType,
  showAddClient = true,
  showEmailGestor = false,
  showSitePagoCheckbox = false
}: ClientesTableProps) {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()

  // Estados de edição
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [editingLink, setEditingLink] = useState<{ clienteId: string, field: string } | null>(null)
  const [linkValue, setLinkValue] = useState('')
  const [editingBM, setEditingBM] = useState<string | null>(null)
  const [bmValue, setBmValue] = useState('')
  const [updatingComission, setUpdatingComission] = useState<string | null>(null)
  const [editingComissionValue, setEditingComissionValue] = useState<string | null>(null)
  const [comissionValueInput, setComissionValueInput] = useState('')

  // Determinar o email do gestor para a consulta
  const managerEmail = useMemo(() => {
    if (selectedManager && selectedManager !== 'Todos os Clientes' && selectedManager !== 'Todos os Gestores') {
      return selectedManager
    }
    return user?.email || ''
  }, [selectedManager, user?.email])

  // Hook de dados otimizado
  const { clientes, loading, error, updateCliente, addCliente, refetch } = useManagerData(
    managerEmail,
    isAdmin,
    selectedManager,
    filterType
  )

  // Hook de filtros com debounce
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    siteStatusFilter,
    setSiteStatusFilter,
    filteredClientes
  } = useClientFilters(clientes)

  // Funções memoizadas para evitar re-renders
  const handleStatusChange = useCallback(async (clienteId: string, newStatus: StatusCampanha) => {
    console.log(`🔄 Alterando status do cliente ${clienteId} para: ${newStatus}`)
    setUpdatingStatus(clienteId)
    
    try {
      const success = await updateCliente(clienteId, 'status_campanha', newStatus)
      if (success) {
        console.log('✅ Status atualizado com sucesso')
      }
    } finally {
      setUpdatingStatus(null)
    }
  }, [updateCliente])

  const handleSiteStatusChange = useCallback(async (clienteId: string, newStatus: string) => {
    console.log(`🌐 Alterando site_status do cliente ${clienteId} para: ${newStatus}`)
    setUpdatingStatus(clienteId)
    
    try {
      const success = await updateCliente(clienteId, 'site_status', newStatus)
      if (success) {
        console.log('✅ Site status atualizado com sucesso')
      }
    } finally {
      setUpdatingStatus(null)
    }
  }, [updateCliente])

  const handleLinkEdit = useCallback((clienteId: string, field: string, currentValue: string) => {
    setEditingLink({ clienteId, field })
    setLinkValue(currentValue)
  }, [])

  const handleLinkSave = useCallback(async (clienteId: string) => {
    if (!editingLink) return false

    try {
      const success = await updateCliente(clienteId, editingLink.field, linkValue)
      if (success) {
        toast({
          title: "Sucesso",
          description: "Link atualizado com sucesso"
        })
        setEditingLink(null)
        return true
      } else {
        toast({
          title: "Erro",
          description: "Erro ao atualizar link",
          variant: "destructive"
        })
        return false
      }
    } catch (error: any) {
      console.error("Erro ao salvar link:", error)
      toast({
        title: "Erro",
        description: `Erro ao salvar link: ${error.message}`,
        variant: "destructive"
      })
      return false
    }
  }, [editingLink, linkValue, updateCliente, toast])

  const handleLinkCancel = useCallback(() => {
    setEditingLink(null)
  }, [])

  const handleBMEdit = useCallback((clienteId: string, currentValue: string) => {
    setEditingBM(clienteId)
    setBmValue(currentValue)
  }, [])

  const handleBMSave = useCallback(async (clienteId: string) => {
    try {
      const success = await updateCliente(clienteId, 'numero_bm', bmValue)
      if (success) {
        toast({
          title: "Sucesso",
          description: "Número BM atualizado com sucesso"
        })
        setEditingBM(null)
      } else {
        toast({
          title: "Erro",
          description: "Erro ao atualizar número BM",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error("Erro ao salvar número BM:", error)
      toast({
        title: "Erro",
        description: `Erro ao salvar número BM: ${error.message}`,
        variant: "destructive"
      })
    }
  }, [bmValue, updateCliente, toast])

  const handleBMCancel = useCallback(() => {
    setEditingBM(null)
  }, [])

  const handleComissionToggle = useCallback(async (clienteId: string, currentStatus: boolean) => {
    setUpdatingComission(clienteId)
    try {
      const success = await updateCliente(clienteId, 'comissao_paga', !currentStatus)
      if (success) {
        toast({
          title: "Sucesso",
          description: `Comissão ${!currentStatus ? 'paga' : 'não paga'} com sucesso`
        })
        return true
      } else {
        toast({
          title: "Erro",
          description: "Erro ao atualizar status da comissão",
          variant: "destructive"
        })
        return false
      }
    } catch (error: any) {
      console.error("Erro ao atualizar status da comissão:", error)
      toast({
        title: "Erro",
        description: `Erro ao atualizar status da comissão: ${error.message}`,
        variant: "destructive"
      })
      return false
    } finally {
      setUpdatingComission(null)
    }
  }, [updateCliente, toast])

  const handleComissionValueEdit = useCallback((clienteId: string, currentValue: number) => {
    setEditingComissionValue(clienteId)
    setComissionValueInput(String(currentValue))
  }, [])

  const handleComissionValueSave = useCallback(async (clienteId: string, newValue: number) => {
    try {
      const success = await updateCliente(clienteId, 'valor_comissao', newValue)
      if (success) {
        toast({
          title: "Sucesso",
          description: "Valor da comissão atualizado com sucesso"
        })
        setEditingComissionValue(null)
      } else {
        toast({
          title: "Erro",
          description: "Erro ao atualizar valor da comissão",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error("Erro ao salvar valor da comissão:", error)
      toast({
        title: "Erro",
        description: `Erro ao salvar valor da comissão: ${error.message}`,
        variant: "destructive"
      })
    }
  }, [updateCliente, toast])

  const handleComissionValueCancel = useCallback(() => {
    setEditingComissionValue(null)
  }, [])

  const handleSitePagoChange = useCallback(async (clienteId: string, newValue: boolean) => {
    try {
      const success = await updateCliente(clienteId, 'site_pago', newValue)
      if (success) {
        toast({
          title: "Sucesso",
          description: `Status do site pago atualizado para ${newValue ? 'Pago' : 'Não Pago'}`
        })
      } else {
        toast({
          title: "Erro",
          description: "Erro ao atualizar status do site pago",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error("Erro ao salvar status do site pago:", error)
      toast({
        title: "Erro",
        description: `Erro ao salvar status do site pago: ${error.message}`,
        variant: "destructive"
      })
    }
  }, [updateCliente, toast])

  const handleExport = useCallback(() => {
    const dataToExport = filteredClientes.map(cliente => ({
      'Data Venda': cliente.data_venda || '',
      'Nome Cliente': cliente.nome_cliente || '',
      'Telefone': cliente.telefone || '',
      'Email Cliente': cliente.email_cliente || '',
      'Email Gestor': cliente.email_gestor || '',
      'Status Campanha': cliente.status_campanha || '',
      'Status Site': cliente.site_status || '',
      'Comissão Paga': cliente.comissao_paga ? 'Sim' : 'Não',
      'Valor Comissão': cliente.valor_comissao || '',
      'Site Pago': cliente.site_pago ? 'Sim' : 'Não'
    }))
    
    exportToCSV(dataToExport, `clientes-${selectedManager || 'todos'}-${new Date().toISOString().split('T')[0]}.csv`)
  }, [filteredClientes, selectedManager])

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-red-500">
            Erro ao carregar dados: {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <TableActions
        selectedManager={selectedManager || 'Todos os Clientes'}
        filteredClientesCount={filteredClientes.length}
        realtimeConnected={true}
        onRefresh={refetch}
        onExport={handleExport}
      />

      <TableFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        siteStatusFilter={siteStatusFilter}
        setSiteStatusFilter={setSiteStatusFilter}
        showSiteStatusFilter={!!filterType}
        getStatusColor={getStatusColor}
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={10} columns={showEmailGestor ? 12 : 11} />
          ) : (
            <Table>
              <TableHeader 
                showEmailGestor={showEmailGestor}
                showSitePagoCheckbox={showSitePagoCheckbox}
              />
              <TableBody>
                {showAddClient && (
                  <AddClientRow
                    selectedManager={selectedManager}
                    onAddCliente={addCliente}
                    showEmailGestor={showEmailGestor}
                  />
                )}
                {filteredClientes.map((cliente, index) => (
                  <ClienteRowMemo
                    key={cliente.id}
                    cliente={cliente}
                    selectedManager={selectedManager || ''}
                    index={index}
                    isAdmin={isAdmin}
                    showEmailGestor={showEmailGestor}
                    showSitePagoCheckbox={showSitePagoCheckbox}
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
                    onSitePagoChange={showSitePagoCheckbox ? handleSitePagoChange : undefined}
                  />
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && filteredClientes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Nenhum cliente encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
