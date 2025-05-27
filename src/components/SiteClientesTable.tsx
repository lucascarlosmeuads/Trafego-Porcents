
import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'
import { ClienteRow } from './ClientesTable/ClienteRow'
import { TableHeader } from './ClientesTable/TableHeader'
import { TableFilters } from './ClientesTable/TableFilters'
import { useClienteOperations } from '@/hooks/useClienteOperations'
import { useAuth } from '@/hooks/useAuth'
import type { Cliente } from '@/lib/supabase'

interface SiteClientesTableProps {
  clientes: Cliente[]
  onUpdate: () => void
}

export function SiteClientesTable({ clientes, onUpdate }: SiteClientesTableProps) {
  const { user, isAdmin } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [editingLink, setEditingLink] = useState<{ clienteId: string, field: string } | null>(null)
  const [linkValue, setLinkValue] = useState('')
  const [editingBM, setEditingBM] = useState<string | null>(null)
  const [bmValue, setBmValue] = useState('')
  const [updatingComission, setUpdatingComission] = useState<string | null>(null)
  const [editingComissionValue, setEditingComissionValue] = useState<string | null>(null)
  const [comissionValueInput, setComissionValueInput] = useState('')

  const { updateCliente } = useClienteOperations(user?.email || '', true, onUpdate)

  const getFilteredClientes = () => {
    return clientes.filter(cliente => 
      cliente.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone?.includes(searchTerm) ||
      cliente.vendedor?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const getStatusColor = (status: string) => {
    // Site status colors
    switch (status) {
      case 'aguardando_link':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
      case 'finalizado':
        return 'bg-green-500/20 text-green-300 border border-green-500/30'
      case 'nao_precisa':
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
      default:
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
    }
  }

  const handleStatusChange = async (clienteId: string, newStatus: string) => {
    setUpdatingStatus(clienteId)
    
    try {
      const success = await updateCliente(clienteId, 'site_status', newStatus)
      
      if (success) {
        toast({
          title: "Sucesso",
          description: `Status do site atualizado para: ${newStatus}`,
        })
        onUpdate()
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar status do site",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Erro na atualização:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleLinkSave = async (clienteId: string, field: string) => {
    try {
      const success = await updateCliente(clienteId, field, linkValue)
      
      if (success) {
        // Se salvou o link do site, também atualizar o status para finalizado
        if (field === 'link_site' && linkValue.trim()) {
          await updateCliente(clienteId, 'site_status', 'finalizado')
        }
        
        toast({
          title: "Sucesso",
          description: field === 'link_site' ? "Link do site salvo e status atualizado!" : "Link atualizado com sucesso",
        })
        setEditingLink(null)
        setLinkValue('')
        onUpdate()
        return true
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar link",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error('Erro ao salvar link:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar link",
        variant: "destructive",
      })
      return false
    }
  }

  const handleLinkEdit = (clienteId: string, field: string, currentValue: string) => {
    setEditingLink({ clienteId, field })
    setLinkValue(currentValue || '')
  }

  const handleLinkCancel = () => {
    setEditingLink(null)
    setLinkValue('')
  }

  const handleBMEdit = (clienteId: string, currentValue: string) => {
    setEditingBM(clienteId)
    setBmValue(currentValue || '')
  }

  const handleBMSave = async (clienteId: string) => {
    try {
      const success = await updateCliente(clienteId, 'numero_bm', bmValue)
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Número BM atualizado com sucesso",
        })
        setEditingBM(null)
        setBmValue('')
        onUpdate()
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar número BM",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Erro ao salvar BM:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar número BM",
        variant: "destructive",
      })
    }
  }

  const handleBMCancel = () => {
    setEditingBM(null)
    setBmValue('')
  }

  const handleComissionToggle = async (clienteId: string, currentStatus: boolean) => {
    // Not applicable for site creators
    return
  }

  const handleComissionValueEdit = (clienteId: string, currentValue: number) => {
    // Not applicable for site creators
    return
  }

  const handleComissionValueSave = async (clienteId: string, newValue: number) => {
    // Not applicable for site creators
    return
  }

  const handleComissionValueCancel = () => {
    // Not applicable for site creators
    return
  }

  const filteredClientes = getFilteredClientes()

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-contrast">
            Sites Pendentes ({filteredClientes.length})
          </h2>
          <Button
            onClick={onUpdate}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome, email, telefone ou vendedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border border-input bg-background text-foreground rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      
      <div className="border rounded-lg overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <Table className="table-dark">
            <TableHeader />
            <TableBody>
              {filteredClientes.length === 0 ? (
                <TableRow className="border-border hover:bg-muted/20">
                  <TableCell colSpan={12} className="text-center py-8 text-white">
                    Nenhum cliente aguardando criação de site
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente, index) => (
                  <ClienteRow
                    key={`site-${cliente.id}-${index}`}
                    cliente={cliente}
                    selectedManager="Sites"
                    index={index}
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
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
