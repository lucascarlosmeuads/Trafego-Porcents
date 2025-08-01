
import { TableRow, TableCell } from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Cliente, type StatusCampanha } from '@/lib/supabase'
import { ClienteOrigemIndicator } from './ClienteOrigemIndicator'
import { ClienteRowName } from './ClienteRowName'
import { ClienteRowPhone } from './ClienteRowPhone'
import { ClienteRowDataLimite } from './ClienteRowDataLimite'
import { ClienteRowBM } from './ClienteRowBM'
import { ClienteRowSite } from './ClienteRowSite'
import { ComissaoButton } from './ComissaoButton'
import { ClienteRowDateCell } from './ClienteRowDateCell'
import { ClienteRowEmailCell } from './ClienteRowEmailCell'
import { ClienteRowGestorCell } from './ClienteRowGestorCell'
import { ClienteRowStatusCells } from './ClienteRowStatusCells'
import { ClienteRowBriefingCell } from './ClienteRowBriefingCell'
import { ColorSelect, type ColorMarcacao } from './ColorSelect'
import { useClienteOrigem } from '@/hooks/useClienteOrigem'
import { ClienteRowValorVenda } from './ClienteRowValorVenda'
import type { ClienteBasicInfo } from '@/types/shared'

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
  onColorChange?: (clienteId: string, newColor: ColorMarcacao) => void
  updatingColor?: string | null
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
  onSitePagoChange,
  onColorChange,
  updatingColor
}: ClienteRowProps) {
  const { getClienteOrigem } = useClienteOrigem()
  
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
        <ClienteRowDateCell
          dataVenda={cliente.data_venda || ''}
          createdAt={cliente.created_at}
          index={index}
        />

        <TableCell 
          className="text-white text-xs p-1 w-8 sticky left-16 bg-card z-10 border-r border-border"
          style={{ backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)' }}
        >
          {onColorChange && (
            <ColorSelect
              value={(cliente as any).cor_marcacao as ColorMarcacao}
              onValueChange={(newColor) => onColorChange(cliente.id!.toString(), newColor)}
              disabled={false}
              isUpdating={updatingColor === cliente.id!.toString()}
            />
          )}
        </TableCell>

        <TableCell className="text-white text-xs p-1 max-w-[80px] sticky left-24 bg-card z-10 border-r border-border">
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

        <ClienteRowEmailCell emailCliente={clienteInfo.emailCliente} />

        <ClienteRowGestorCell 
          emailGestor={clienteInfo.emailGestor}
          isAdmin={isAdmin}
          showEmailGestor={showEmailGestor}
        />

        <ClienteRowStatusCells
          statusCampanha={cliente.status_campanha || 'Cliente Novo'}
          siteStatus={cliente.site_status || 'pendente'}
          clienteId={clienteInfo.clienteId}
          updatingStatus={updatingStatus}
          getStatusColor={getStatusColor}
          onStatusChange={onStatusChange}
          onSiteStatusChange={onSiteStatusChange}
        />

        <ClienteRowDataLimite
          dataVenda={cliente.data_venda || ''}
          createdAt={cliente.created_at}
          statusCampanha={cliente.status_campanha || 'Cliente Novo'}
          nomeCliente={clienteInfo.nomeCliente}
          compact={true}
        />

        <ClienteRowBriefingCell 
          emailCliente={clienteInfo.emailCliente}
          nomeCliente={clienteInfo.nomeCliente}
        />

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

        <ClienteRowValorVenda 
          valorVendaInicial={cliente.valor_venda_inicial}
        />
      </TableRow>
    </TooltipProvider>
  )
}
