
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
  isAdmin?: boolean
  userEmail: string
  refetchData: () => void
  comissaoButton: React.ReactElement
  onBriefingClick: (clienteEmail: string) => void
  onMaterialsClick: (clienteEmail: string) => void
  onComentariosClick: (clienteId: string, clienteNome: string) => void
}

export function ClienteRow({
  cliente,
  isAdmin = false,
  userEmail,
  refetchData,
  comissaoButton,
  onBriefingClick,
  onMaterialsClick,
  onComentariosClick
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
    <div className="table-row border-b border-border hover:bg-muted/20">
      <div className="table-cell p-3 align-middle text-sm">
        {formatDate(cliente.data_venda || cliente.created_at)}
      </div>

      <div className="table-cell p-3 align-middle text-sm max-w-[150px]">
        <ClienteRowName 
          clienteId={cliente.id!.toString()}
          nomeCliente={cliente.nome_cliente || ''}
        />
      </div>

      <div className="table-cell p-3 align-middle text-sm">
        <ClienteRowPhone 
          telefone={cliente.telefone || ''}
          nomeCliente={cliente.nome_cliente || ''}
        />
      </div>

      <div className="table-cell p-3 align-middle text-sm max-w-[180px]">
        <div className="truncate" title={cliente.email_cliente || ''}>
          {cliente.email_cliente || 'Não informado'}
        </div>
      </div>

      <div className="table-cell p-3 align-middle text-sm">
        {cliente.vendedor || 'Não informado'}
      </div>

      {isAdmin && (
        <div className="table-cell p-3 align-middle text-sm max-w-[180px]">
          <div className="truncate" title={cliente.email_gestor || ''}>
            {cliente.email_gestor || 'Não informado'}
          </div>
        </div>
      )}

      <div className="table-cell p-3 align-middle">
        <StatusSelect
          value={(cliente.status_campanha || 'Cliente Novo') as StatusCampanha}
          onValueChange={(newStatus) => {
            console.log('Status change:', newStatus)
          }}
          disabled={false}
          isUpdating={false}
          getStatusColor={(status) => 'bg-blue-100 text-blue-800'}
        />
      </div>

      <div className="table-cell p-3 align-middle">
        <SiteStatusSelect
          value={cliente.site_status || 'pendente'}
          onValueChange={(newStatus) => {
            console.log('Site status change:', newStatus)
          }}
          disabled={false}
          isUpdating={false}
        />
      </div>

      <ClienteRowDataLimite
        dataVenda={cliente.data_venda || ''}
        createdAt={cliente.created_at}
        statusCampanha={cliente.status_campanha || 'Cliente Novo'}
        nomeCliente={cliente.nome_cliente || ''}
      />

      <div className="table-cell p-3 align-middle">
        <Button
          size="sm"
          variant="outline"
          className="h-8 bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
          onClick={() => onBriefingClick(cliente.email_cliente || '')}
        >
          <Eye className="h-3 w-3 mr-1" />
          Briefing
        </Button>
      </div>

      <div className="table-cell p-3 align-middle">
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
      </div>

      <div className="table-cell p-3 align-middle">
        <ClienteRowSite
          clienteId={cliente.id!.toString()}
          linkSite={cliente.link_site || ''}
          sitePago={cliente.site_pago || false}
          showSitePagoCheckbox={isAdmin}
          editingLink={null}
          linkValue=""
          setLinkValue={() => {}}
          onLinkEdit={() => {}}
          onLinkSave={() => Promise.resolve(true)}
          onLinkCancel={() => {}}
          onSitePagoChange={() => {}}
        />
      </div>

      <div className="table-cell p-3 align-middle">
        <ClienteRowBM
          clienteId={cliente.id!.toString()}
          numeroBM={cliente.numero_bm || ''}
          editingBM={null}
          bmValue=""
          setBmValue={() => {}}
          onBMEdit={() => {}}
          onBMSave={() => {}}
          onBMCancel={() => {}}
        />
      </div>

      <div className="table-cell p-3 align-middle">
        {comissaoButton}
      </div>

      <div className="table-cell p-3 align-middle">
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => onComentariosClick(cliente.id!.toString(), cliente.nome_cliente || '')}
        >
          <Eye className="h-3 w-3 mr-1" />
          Comentários
        </Button>
      </div>
    </div>
  )
}
