import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cliente } from '@/lib/supabase'
import { getDataLimiteDisplayForGestor } from '@/utils/dateUtils'
import { TransferirModal } from './TransferirModal'
import { StatusSelect } from '../ClientesTable/StatusSelect'
import { SiteStatusSelect } from '../ClientesTable/SiteStatusSelect'
import { ClienteRowPhone } from '../ClientesTable/ClienteRowPhone'
import { ClienteRowName } from '../ClientesTable/ClienteRowName'
import { ClienteRowSite } from '../ClientesTable/ClienteRowSite'
import { ClienteRowBM } from '../ClientesTable/ClienteRowBM'
import { ComissaoButton } from '../ClientesTable/ComissaoButton'

interface AdminTableCardsProps {
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

export function AdminTableCards({ 
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
}: AdminTableCardsProps) {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-2 lg:hidden">
      {clientes.map((cliente) => {
        const dataLimiteDisplay = getDataLimiteDisplayForGestor(
          cliente.data_venda || '', 
          cliente.created_at, 
          cliente.status_campanha || ''
        )
        
        return (
          <Card key={cliente.id} className="w-full bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between text-card-foreground">
                <ClienteRowName 
                  clienteId={cliente.id}
                  nomeCliente={cliente.nome_cliente || 'Cliente sem nome'}
                />
                <span className="text-xs font-mono text-muted-foreground">#{cliente.id}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-muted-foreground">Telefone:</span>
                  <div className="mt-1">
                    <ClienteRowPhone 
                      telefone={cliente.telefone || ''}
                      nomeCliente={cliente.nome_cliente || 'Cliente'}
                    />
                  </div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Email Cliente:</span>
                  <div className="ml-2 text-card-foreground text-xs truncate">
                    {cliente.email_cliente || '-'}
                  </div>
                </div>
              </div>
              
              <div>
                <span className="font-medium text-muted-foreground">Email Gestor:</span>
                <span className="ml-2 text-card-foreground">{cliente.email_gestor || '-'}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-muted-foreground">Status Campanha:</span>
                  <div className="mt-1">
                    <StatusSelect
                      clienteId={cliente.id}
                      currentStatus={cliente.status_campanha || ''}
                      onStatusChange={onStatusChange}
                    />
                  </div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Status Site:</span>
                  <div className="mt-1">
                    <SiteStatusSelect
                      clienteId={cliente.id}
                      currentStatus={cliente.site_status || 'pendente'}
                      onStatusChange={onSiteStatusChange}
                    />
                  </div>
                </div>
              </div>
              
              
              
              <div>
                <span className="font-medium text-muted-foreground">Data Venda:</span>
                <span className="ml-2 text-card-foreground">{formatDate(cliente.data_venda)}</span>
              </div>
              
              <div>
                <span className="font-medium text-muted-foreground">Data Limite:</span>
                <span className={`ml-2 text-xs font-medium ${dataLimiteDisplay.classeCor}`}>
                  {dataLimiteDisplay.texto}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-muted-foreground">Materiais:</span>
                <div className="flex gap-1 mt-1">
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
              </div>
              
              <div>
                <span className="font-medium text-muted-foreground">Site:</span>
                <div className="mt-1">
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
                </div>
              </div>
              
              <div>
                <span className="font-medium text-muted-foreground">Número BM:</span>
                <div className="mt-1">
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
                </div>
              </div>
              
              <div>
                <span className="font-medium text-muted-foreground">Comissão:</span>
                <div className="mt-1">
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
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <span className="font-medium text-muted-foreground">Transferir:</span>
                <div className="mt-1">
                  <TransferirModal
                    cliente={cliente}
                    onTransferirCliente={onTransferirCliente}
                    isLoading={transferindoCliente === cliente.id}
                    gestores={gestores}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
