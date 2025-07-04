
import { TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Folder, Mail, AtSign } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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
import { toast } from '@/hooks/use-toast'
import { ClienteOrigemIndicator } from './ClienteOrigemIndicator'
import { useClienteOrigem } from '@/hooks/useClienteOrigem'
import { tableLogger } from '@/utils/logger'
import { MESSAGES } from '@/constants'
import type { ClienteBasicInfo, StatusComponentProps, EditableFieldProps } from '@/types/shared'

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
  getStatusColor: (status: string) => string
  onStatusChange: (clienteId: string, newStatus: StatusCampanha) => void
  onSiteStatusChange: (clienteId: string, newStatus: string) => void
  onLinkEdit: (clienteId: string, field: string, currentValue: string) => void
  onLinkSave: (clienteId: string) => Promise<boolean>
  onLinkCancel: () => void
  onBMEdit: (clienteId: string, currentValue: string) => void
  onBMSave: (clienteId: string) => void
  onBMCancel: () => void
  onComissionUpdate: () => void
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
  getStatusColor,
  onStatusChange,
  onSiteStatusChange,
  onLinkEdit,
  onLinkSave,
  onLinkCancel,
  onBMEdit,
  onBMSave,
  onBMCancel,
  onComissionUpdate,
  onSitePagoChange
}: ClienteRowProps) {
  const { getClienteOrigem } = useClienteOrigem()
  
  const formatDate = (dateString: string) => {
    if (!dateString || dateString.trim() === '') return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    } catch (error) {
      tableLogger.error('Erro ao formatar data', { dateString, error })
      return 'N/A'
    }
  }

  const handleGestorClick = () => {
    if (!isAdmin) {
      toast({
        title: MESSAGES.ERROR.PERMISSION,
        variant: "destructive"
      })
      tableLogger.warn('Tentativa de edição de gestor sem permissão', { userType: 'non-admin' })
    } else {
      toast({
        title: "Funcionalidade de edição em desenvolvimento"
      })
      tableLogger.info('Funcionalidade de edição de gestor solicitada')
    }
  }

  const clienteOrigem = getClienteOrigem(cliente.id!.toString())

  // Dados básicos do cliente para componentes
  const clienteInfo: ClienteBasicInfo = {
    clienteId: cliente.id!.toString(),
    nomeCliente: cliente.nome_cliente || '',
    emailCliente: cliente.email_cliente || '',
    telefone: cliente.telefone || '',
    emailGestor: cliente.email_gestor || ''
  }

  return (
    <TooltipProvider>
      <TableRow 
        className="border-border hover:bg-muted/20" 
        style={{ backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)' }}
      >
        <TableCell className="text-white text-xs p-1 sticky left-0 bg-card z-10 border-r border-border">
          {formatDate(cliente.data_venda || cliente.created_at)}
        </TableCell>

        <TableCell className="text-white text-xs p-1 max-w-[80px] sticky left-16 bg-card z-10 border-r border-border">
          <ClienteRowName 
            clienteId={clienteInfo.clienteId}
            nomeCliente={clienteInfo.nomeCliente}
          />
        </TableCell>

        <TableCell className="text-white text-xs p-1">
          <ClienteOrigemIndicator
            origem={clienteOrigem.origem}
            createdAt={clienteOrigem.created_at}
            pedidoId={clienteOrigem.pedido_id}
            compact={true}
          />
        </TableCell>

        <TableCell className="text-white text-xs p-1">
          <ClienteRowPhone 
            telefone={clienteInfo.telefone}
            nomeCliente={clienteInfo.nomeCliente}
          />
        </TableCell>

        <TableCell className="text-white text-xs p-1">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center justify-center">
                <Mail className="h-3 w-3 text-blue-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs break-all">{clienteInfo.emailCliente || 'Não informado'}</p>
            </TooltipContent>
          </Tooltip>
        </TableCell>

        {(isAdmin || showEmailGestor) && (
          <TableCell className="text-white text-xs p-1">
            <Tooltip>
              <TooltipTrigger 
                onClick={handleGestorClick}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-center">
                  <AtSign className="h-3 w-3 text-green-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs break-all">{clienteInfo.emailGestor || 'Não informado'}</p>
              </TooltipContent>
            </Tooltip>
          </TableCell>
        )}

        <TableCell className="p-1">
          <StatusSelect
            value={(cliente.status_campanha || 'Cliente Novo') as StatusCampanha}
            onValueChange={(newStatus) => onStatusChange(clienteInfo.clienteId, newStatus as StatusCampanha)}
            disabled={updatingStatus === clienteInfo.clienteId}
            isUpdating={updatingStatus === clienteInfo.clienteId}
            getStatusColor={getStatusColor}
            compact={false}
          />
        </TableCell>

        <TableCell className="p-1">
          <SiteStatusSelect
            value={cliente.site_status || 'pendente'}
            onValueChange={(newStatus) => onSiteStatusChange(clienteInfo.clienteId, newStatus)}
            disabled={updatingStatus === clienteInfo.clienteId}
            isUpdating={updatingStatus === clienteInfo.clienteId}
            compact={false}
          />
        </TableCell>

        <ClienteRowDataLimite
          dataVenda={cliente.data_venda || ''}
          createdAt={cliente.created_at}
          statusCampanha={cliente.status_campanha || 'Cliente Novo'}
          nomeCliente={clienteInfo.nomeCliente}
          compact={true}
        />

        <TableCell className="p-1">
          <BriefingMaterialsModal 
            emailCliente={clienteInfo.emailCliente}
            clienteName={clienteInfo.nomeCliente}
            trigger={
              <Button
                size="sm"
                variant="outline"
                className="h-5 w-5 p-0 bg-blue-600 hover:bg-blue-700 border-blue-600"
              >
                <Folder className="h-2.5 w-2.5" />
              </Button>
            }
          />
        </TableCell>

        <TableCell className="p-1">
          <ClienteRowSite
            clienteId={clienteInfo.clienteId}
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
            compact={true}
          />
        </TableCell>

        <TableCell className="p-1">
          <ClienteRowBM
            clienteId={clienteInfo.clienteId}
            numeroBM={cliente.numero_bm || ''}
            nomeCliente={clienteInfo.nomeCliente}
            editingBM={editingBM}
            bmValue={bmValue}
            setBmValue={setBmValue}
            onBMEdit={onBMEdit}
            onBMSave={onBMSave}
            onBMCancel={onBMCancel}
            compact={true}
          />
        </TableCell>

        <TableCell className="p-1">
          <ComissaoButton
            cliente={cliente}
            isGestorDashboard={!isAdmin && selectedManager?.includes('@') && selectedManager !== 'Todos os Clientes'}
            isAdmin={isAdmin}
            onComissionUpdate={onComissionUpdate}
            compact={true}
          />
        </TableCell>
      </TableRow>
    </TooltipProvider>
  )
}
