
import { TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { StatusSelect } from './StatusSelect'
import { SiteStatusSelect } from './SiteStatusSelect'
import { ComissaoButton } from './ComissaoButton'
import { BriefingMaterialsModal } from './BriefingMaterialsModal'
import { ClienteRowName } from './ClienteRowName'
import { ClienteRowPhone } from './ClienteRowPhone'
import { ClienteRowDataLimite } from './ClienteRowDataLimite'
import { ClienteRowBM } from './ClienteRowBM'
import { ClienteRowSite } from './ClienteRowSite'
import { Cliente, type StatusCampanha } from '@/lib/supabase'

interface ClienteRowProps {
  cliente: Cliente
  selectedManager: string
  index: number
  isAdmin?: boolean
  showEmailGestor?: boolean
  showSitePagoCheckbox?: boolean
  updatingStatus: string | null
  editingLink: { clienteId: string, field: string } | null
  linkValue: string
  setLinkValue: (value: string) => void
  editingBM: string | null
  bmValue: string
  setBmValue: (value: string) => void
  updatingComission: string | null
  editingComissionValue: string | null
  comissionValueInput: string
  setComissionValueInput: (value: string) => void
  getStatusColor: (status: string) => string
  onStatusChange: (clienteId: string, newStatus: StatusCampanha) => void
  onSiteStatusChange: (clienteId: string, newStatus: string) => void
  onLinkEdit: (clienteId: string, field: string, currentValue: string) => void
  onLinkSave: (clienteId: string) => Promise<boolean>
  onLinkCancel: () => void
  onBMEdit: (clienteId: string, currentValue: string) => void
  onBMSave: (clienteId: string) => void
  onBMCancel: () => void
  onComissionToggle: (clienteId: string, currentStatus: boolean) => Promise<boolean>
  onComissionValueEdit: (clienteId: string, currentValue: number) => void
  onComissionValueSave: (clienteId: string, newValue: number) => void
  onComissionValueCancel: () => void
  onSitePagoChange?: (clienteId: string, newValue: boolean) => void
}

export function ClienteRow({
  cliente,
  selectedManager,
  index,
  isAdmin = false,
  showEmailGestor = false,
  showSitePagoCheckbox = false,
  updatingStatus,
  editingLink,
  linkValue,
  setLinkValue,
  editingBM,
  bmValue,
  setBmValue,
  updatingComission,
  editingComissionValue,
  comissionValueInput,
  setComissionValueInput,
  getStatusColor,
  onStatusChange,
  onSiteStatusChange,
  onLinkEdit,
  onLinkSave,
  onLinkCancel,
  onBMEdit,
  onBMSave,
  onBMCancel,
  onComissionToggle,
  onComissionValueEdit,
  onComissionValueSave,
  onComissionValueCancel,
  onSitePagoChange
}: ClienteRowProps) {
  const formatDate = (dateString: string) => {
    if (!dateString || dateString.trim() === '') return 'Não informado'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  return (
    <TableRow 
      className="border-border hover:bg-muted/20" 
      style={{ backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)' }}
    >
      <TableCell className="text-white text-sm">
        {formatDate(cliente.data_venda || cliente.created_at)}
      </TableCell>

      <TableCell className="text-white text-sm max-w-[150px]">
        <ClienteRowName 
          clienteId={cliente.id!.toString()}
          nomeCliente={cliente.nome_cliente || ''}
        />
      </TableCell>

      <TableCell className="text-white text-sm">
        <ClienteRowPhone 
          telefone={cliente.telefone || ''}
          nomeCliente={cliente.nome_cliente || ''}
        />
      </TableCell>

      <TableCell className="text-white text-sm max-w-[180px]">
        <div className="truncate" title={cliente.email_cliente || ''}>
          {cliente.email_cliente || 'Não informado'}
        </div>
      </TableCell>

      {(isAdmin || showEmailGestor) && (
        <TableCell className="text-white text-sm max-w-[180px]">
          <div className="truncate" title={cliente.email_gestor || ''}>
            {cliente.email_gestor || 'Não informado'}
          </div>
        </TableCell>
      )}

      <TableCell>
        <StatusSelect
          value={(cliente.status_campanha || 'Cliente Novo') as StatusCampanha}
          onValueChange={(newStatus) => onStatusChange(cliente.id!.toString(), newStatus as StatusCampanha)}
          disabled={updatingStatus === cliente.id!.toString()}
          isUpdating={updatingStatus === cliente.id!.toString()}
          getStatusColor={getStatusColor}
        />
      </TableCell>

      <TableCell>
        <SiteStatusSelect
          value={cliente.site_status || 'pendente'}
          onValueChange={(newStatus) => onSiteStatusChange(cliente.id!.toString(), newStatus)}
          disabled={updatingStatus === cliente.id!.toString()}
          isUpdating={updatingStatus === cliente.id!.toString()}
        />
      </TableCell>

      <ClienteRowDataLimite
        dataVenda={cliente.data_venda || ''}
        createdAt={cliente.created_at}
        statusCampanha={cliente.status_campanha || 'Cliente Novo'}
        nomeCliente={cliente.nome_cliente || ''}
      />

      <TableCell>
        <BriefingMaterialsModal 
          emailCliente={cliente.email_cliente || ''}
          nomeCliente={cliente.nome_cliente || ''}
          trigger={
            <Button
              size="sm"
              variant="outline"
              className="h-8 bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver materiais
            </Button>
          }
        />
      </TableCell>

      <TableCell>
        <ClienteRowSite
          clienteId={cliente.id!.toString()}
          linkSite={cliente.link_site || ''}
          sitePago={cliente.site_pago || false}
          showSitePagoCheckbox={showSitePagoCheckbox}
          editingLink={editingLink}
          linkValue={linkValue}
          setLinkValue={setLinkValue}
          onLinkEdit={onLinkEdit}
          onLinkSave={onLinkSave}
          onLinkCancel={onLinkCancel}
          onSitePagoChange={onSitePagoChange}
        />
      </TableCell>

      <TableCell>
        <ClienteRowBM
          clienteId={cliente.id!.toString()}
          numeroBM={cliente.numero_bm || ''}
          editingBM={editingBM}
          bmValue={bmValue}
          setBmValue={setBmValue}
          onBMEdit={onBMEdit}
          onBMSave={onBMSave}
          onBMCancel={onBMCancel}
        />
      </TableCell>

      <TableCell>
        <ComissaoButton
          cliente={cliente}
          isGestorDashboard={!isAdmin && selectedManager?.includes('@') && selectedManager !== 'Todos os Clientes'}
          updatingComission={updatingComission}
          editingComissionValue={editingComissionValue}
          comissionValueInput={comissionValueInput}
          setComissionValueInput={setComissionValueInput}
          onComissionToggle={onComissionToggle}
          onComissionValueEdit={onComissionValueEdit}
          onComissionValueSave={onComissionValueSave}
          onComissionValueCancel={onComissionValueCancel}
        />
      </TableCell>
    </TableRow>
  )
}
