
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar } from 'lucide-react'
import { Cliente } from '@/lib/supabase'
import { getDataLimiteDisplayForGestor } from '@/utils/dateUtils'
import { TransferirModal } from './TransferirModal'
import { StatusSelect } from '../ClientesTable/StatusSelect'
import { SiteStatusSelect } from '../ClientesTable/SiteStatusSelect'
import { ClienteRowPhone } from '../ClientesTable/ClienteRowPhone'
import { ClienteRowName } from '../ClientesTable/ClienteRowName'
import { ClienteRowDataLimite } from '../ClientesTable/ClienteRowDataLimite'
import { ClienteRowSite } from '../ClientesTable/ClienteRowSite'
import { ClienteRowBM } from '../ClientesTable/ClienteRowBM'
import { ComissaoButton } from '../ClientesTable/ComissaoButton'

interface AdminTableDesktopProps {
  clientes: Cliente[]
  gestores: Array<{ email: string, nome: string }>
  transferindoCliente: string | null
  updatingComission: string | null
  editingComissionValue: string | null
  editingBM: string | null
  editingLink: { clienteId: string, field: string } | null
  comissionValueInput: string
  bmValue: string
  linkValue: string
  onTransferirCliente: (clienteId: string, novoEmailGestor: string) => void
  onStatusChange: (id: string, newStatus: string) => void
  onSiteStatusChange: (id: string, newStatus: string) => void
  onComissionToggle: (clienteId: string, currentStatus: boolean) => Promise<boolean>
  onComissionValueEdit: (clienteId: string, currentValue: number) => void
  onComissionValueSave: (clienteId: string, newValue: number) => void
  onComissionValueCancel: () => void
  onBMEdit: (clienteId: string, currentValue: string) => void
  onBMSave: (clienteId: string) => void
  onBMCancel: () => void
  onLinkEdit: (clienteId: string, field: string, currentValue: string) => void
  onLinkSave: (clienteId: string) => Promise<boolean>
  onLinkCancel: () => void
  onSitePagoChange: (clienteId: string, newValue: boolean) => void
  setComissionValueInput: (value: string) => void
  setBmValue: (value: string) => void
  setLinkValue: (value: string) => void
  formatDate: (dateString: string | null) => string
}

export function AdminTableDesktop({ 
  clientes, 
  gestores, 
  transferindoCliente,
  updatingComission,
  editingComissionValue,
  editingBM,
  editingLink,
  comissionValueInput,
  bmValue,
  linkValue,
  onTransferirCliente, 
  onStatusChange,
  onSiteStatusChange,
  onComissionToggle,
  onComissionValueEdit,
  onComissionValueSave,
  onComissionValueCancel,
  onBMEdit,
  onBMSave,
  onBMCancel,
  onLinkEdit,
  onLinkSave,
  onLinkCancel,
  onSitePagoChange,
  setComissionValueInput,
  setBmValue,
  setLinkValue,
  formatDate 
}: AdminTableDesktopProps) {
  return (
    <div className="overflow-x-auto">
      <Table className="table-dark">
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/20">
            <TableHead className="w-16 text-muted-foreground">ID</TableHead>
            <TableHead className="min-w-[100px] text-muted-foreground">Data Venda</TableHead>
            <TableHead className="min-w-[200px] text-muted-foreground">Nome Cliente</TableHead>
            <TableHead className="min-w-[120px] text-muted-foreground">Telefone</TableHead>
            <TableHead className="min-w-[180px] text-muted-foreground">Email Cliente</TableHead>
            <TableHead className="min-w-[180px] text-muted-foreground">Email Gestor</TableHead>
            <TableHead className="min-w-[180px] text-muted-foreground">Status Campanha</TableHead>
            <TableHead className="min-w-[150px] text-muted-foreground">Status Site</TableHead>
            <TableHead className="min-w-[140px] text-muted-foreground">Data Limite</TableHead>
            <TableHead className="min-w-[120px] text-muted-foreground">Materiais</TableHead>
            <TableHead className="min-w-[180px] text-muted-foreground">Site</TableHead>
            <TableHead className="min-w-[150px] text-muted-foreground">Número BM</TableHead>
            <TableHead className="min-w-[180px] text-muted-foreground">Comissão</TableHead>
            <TableHead className="min-w-[120px] text-muted-foreground">Transferir</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente, index) => {
            const dataLimiteDisplay = getDataLimiteDisplayForGestor(
              cliente.data_venda || '', 
              cliente.created_at, 
              cliente.status_campanha || ''
            )
            
            return (
              <TableRow 
                key={cliente.id} 
                className="border-border hover:bg-muted/20 transition-colors"
              >
                <TableCell className="font-mono text-xs text-foreground">
                  {String(index + 1).padStart(3, '0')}
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-foreground">{formatDate(cliente.data_venda)}</span>
                  </div>
                </TableCell>
                
                <TableCell className="font-medium">
                  <ClienteRowName 
                    clienteId={cliente.id}
                    nomeCliente={cliente.nome_cliente || 'Cliente sem nome'}
                  />
                </TableCell>
                
                <TableCell>
                  <ClienteRowPhone 
                    telefone={cliente.telefone || ''}
                    nomeCliente={cliente.nome_cliente || 'Cliente'}
                  />
                </TableCell>
                
                <TableCell>
                  <div className="max-w-[180px] truncate text-foreground">
                    {cliente.email_cliente || '-'}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="max-w-[180px] truncate text-foreground">
                    {cliente.email_gestor}
                  </div>
                </TableCell>
                
                <TableCell>
                  <StatusSelect
                    clienteId={cliente.id}
                    currentStatus={cliente.status_campanha || ''}
                    onStatusChange={onStatusChange}
                  />
                </TableCell>
                
                <TableCell>
                  <SiteStatusSelect
                    clienteId={cliente.id}
                    currentStatus={cliente.site_status || 'pendente'}
                    onStatusChange={onSiteStatusChange}
                  />
                </TableCell>
                
                <TableCell>
                  <ClienteRowDataLimite
                    dataVenda={cliente.data_venda || ''}
                    createdAt={cliente.created_at}
                    statusCampanha={cliente.status_campanha || ''}
                    nomeCliente={cliente.nome_cliente || 'Cliente'}
                  />
                </TableCell>
                
                <TableCell>
                  <div className="flex gap-1">
                    {cliente.link_briefing && (
                      <a 
                        href={cliente.link_briefing} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs bg-blue-900/30 px-2 py-1 rounded border border-blue-700"
                      >
                        Briefing
                      </a>
                    )}
                    {cliente.link_criativo && (
                      <a 
                        href={cliente.link_criativo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 text-xs bg-green-900/30 px-2 py-1 rounded border border-green-700"
                      >
                        Criativo
                      </a>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <ClienteRowSite
                    clienteId={cliente.id}
                    linkSite={cliente.link_site || ''}
                    sitePago={cliente.site_pago || false}
                    showSitePagoCheckbox={true}
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
                    clienteId={cliente.id}
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
                    isGestorDashboard={false}
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
                
                <TableCell>
                  <TransferirModal
                    cliente={cliente}
                    onTransferirCliente={onTransferirCliente}
                    isLoading={transferindoCliente === cliente.id}
                    gestores={gestores}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
