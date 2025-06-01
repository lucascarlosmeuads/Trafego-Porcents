
import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ResponsiveTableWrapper } from './ClientesTable/ResponsiveTableWrapper'
import { ClienteRow } from './ClientesTable/ClienteRow'
import { Cliente } from '@/lib/supabase'

interface ClientesTableProps {
  selectedManager: string | null
}

export function ClientesTable({ selectedManager }: ClientesTableProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [editingLink, setEditingLink] = useState<{ clienteId: string; field: string } | null>(null)
  const [linkValue, setLinkValue] = useState<string>('')
  const [editingBM, setEditingBM] = useState<string | null>(null)
  const [bmValue, setBmValue] = useState<string>('')
  const [updatingComission, setUpdatingComission] = useState<string | null>(null)
  const [showEmailGestor, setShowEmailGestor] = useState<boolean>(false)
  const [showSitePagoCheckbox, setShowSitePagoCheckbox] = useState<boolean>(false)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)

  // Fetch clientes data based on selectedManager
  useEffect(() => {
    async function fetchClientes() {
      setLoading(true)
      try {
        // Fetch logic here, e.g. from supabase or API
        // For example:
        // const { data, error } = await supabase.from('todos_clientes').select('*').eq('gestor_email', selectedManager || '')
        // if (error) throw error
        // setClientes(data || [])
        // For now, empty array:
        setClientes([])
      } catch (error) {
        console.error('Error fetching clientes:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchClientes()
  }, [selectedManager])

  // Example function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Cliente Novo':
        return 'blue'
      case 'Em Andamento':
        return 'yellow'
      case 'Concluído':
        return 'green'
      default:
        return 'gray'
    }
  }

  // Handlers for status change, site status change, link edit/save/cancel, BM edit/save/cancel, comission toggle, site pago change
  const handleStatusChange = (clienteId: string, newStatus: string) => {
    setUpdatingStatus(clienteId)
    // Update logic here
    setTimeout(() => {
      setClientes((prev) =>
        prev.map((c) => (c.id?.toString() === clienteId ? { ...c, status_campanha: newStatus } : c))
      )
      setUpdatingStatus(null)
    }, 1000)
  }

  const handleSiteStatusChange = (clienteId: string, newStatus: string) => {
    setUpdatingStatus(clienteId)
    // Update logic here
    setTimeout(() => {
      setClientes((prev) =>
        prev.map((c) => (c.id?.toString() === clienteId ? { ...c, site_status: newStatus } : c))
      )
      setUpdatingStatus(null)
    }, 1000)
  }

  const handleLinkEdit = (clienteId: string, field: string, currentValue: string) => {
    setEditingLink({ clienteId, field })
    setLinkValue(currentValue)
  }

  const handleLinkSave = async (clienteId: string) => {
    // Save logic here
    setEditingLink(null)
    return true
  }

  const handleLinkCancel = () => {
    setEditingLink(null)
  }

  const handleBMEdit = (clienteId: string, currentValue: string) => {
    setEditingBM(clienteId)
    setBmValue(currentValue)
  }

  const handleBMSave = (clienteId: string) => {
    // Save logic here
    setEditingBM(null)
  }

  const handleBMCancel = () => {
    setEditingBM(null)
  }

  const handleComissionToggle = async (clienteId: string, currentStatus: boolean) => {
    setUpdatingComission(clienteId)
    // Toggle logic here
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setClientes((prev) =>
      prev.map((c) =>
        c.id?.toString() === clienteId
          ? { ...c, comissao: currentStatus ? 'Pendente' : 'Pago' }
          : c
      )
    )
    setUpdatingComission(null)
    return true
  }

  const handleSitePagoChange = (clienteId: string, newValue: boolean) => {
    setClientes((prev) =>
      prev.map((c) => (c.id?.toString() === clienteId ? { ...c, site_pago: newValue } : c))
    )
  }

  // Filter clientes based on selectedManager if needed
  const currentClientes = clientes

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveTableWrapper>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Data Venda</TableHeader>
            <TableHeader>Nome Cliente</TableHeader>
            <TableHeader>Telefone</TableHeader>
            <TableHeader>Email Cliente</TableHeader>
            {(isAdmin || showEmailGestor) && <TableHeader>Email Gestor</TableHeader>}
            <TableHeader>Status Campanha</TableHeader>
            <TableHeader>Status Site</TableHeader>
            <TableHeader>Data Limite</TableHeader>
            <TableHeader>Briefing</TableHeader>
            <TableHeader>Link Site</TableHeader>
            <TableHeader>BM</TableHeader>
            <TableHeader>Comissão</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentClientes.map((cliente, index) => (
            <ClienteRow
              key={cliente.id?.toString() || index.toString()}
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
              onSitePagoChange={handleSitePagoChange}
            />
          ))}
        </TableBody>
      </Table>
    </ResponsiveTableWrapper>
  )
}
