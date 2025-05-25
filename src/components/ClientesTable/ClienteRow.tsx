import { TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, X, Edit2, ExternalLink, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STATUS_CAMPANHA, type Cliente } from '@/lib/supabase'
import { ComissaoButton } from './ComissaoButton'
import { DataLimiteDisplay } from './DataLimiteDisplay'
import { useAuth } from '@/hooks/useAuth'

interface ClienteRowProps {
  cliente: Cliente
  selectedManager: string
  index: number
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
  onStatusChange: (clienteId: string, newStatus: string) => void
  onLinkEdit: (clienteId: string, field: string, currentValue: string) => void
  onLinkSave: (clienteId: string, field: string) => Promise<boolean>
  onLinkCancel: () => void
  onBMEdit: (clienteId: string, currentValue: string) => void
  onBMSave: (clienteId: string) => Promise<void>
  onBMCancel: () => void
  onComissionToggle: (clienteId: string, currentStatus: boolean) => void
  onComissionValueEdit: (clienteId: string, currentValue: number) => void
  onComissionValueSave: (clienteId: string, newValue: number) => void
  onComissionValueCancel: () => void
}

export function ClienteRow({
  cliente,
  selectedManager,
  index,
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
  onLinkEdit,
  onLinkSave,
  onLinkCancel,
  onBMEdit,
  onBMSave,
  onBMCancel,
  onComissionToggle,
  onComissionValueEdit,
  onComissionValueSave,
  onComissionValueCancel
}: ClienteRowProps) {
  const { isAdmin } = useAuth()
  
  // Determinar se estamos no painel do gestor (não admin)
  const isGestorDashboard = !isAdmin

  const renderLinkCell = (linkValue: string, field: string, placeholder: string) => {
    const isEditing = editingLink?.clienteId === cliente.id && editingLink?.field === field

    if (isEditing) {
      return (
        <div className="flex items-center gap-1 min-w-[120px]">
          <Input
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            className="h-6 text-xs"
            placeholder={placeholder}
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => onLinkSave(cliente.id, field)}
          >
            <Check className="w-3 h-3 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={onLinkCancel}
          >
            <X className="w-3 h-3 text-red-600" />
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1 min-w-[100px]">
        {linkValue ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 p-1 text-xs text-blue-400 hover:text-blue-300"
            onClick={() => window.open(linkValue, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Link
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">Sem link</span>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => onLinkEdit(cliente.id, field, linkValue || '')}
        >
          <Edit2 className="w-3 h-3 text-muted-foreground" />
        </Button>
      </div>
    )
  }

  const renderBMCell = () => {
    const isEditingBM = editingBM === cliente.id

    if (isEditingBM) {
      return (
        <div className="flex items-center gap-1">
          <Input
            value={bmValue}
            onChange={(e) => setBmValue(e.target.value)}
            className="h-6 text-xs w-24"
            placeholder="BM número"
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => onBMSave(cliente.id)}
          >
            <Check className="w-3 h-3 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={onBMCancel}
          >
            <X className="w-3 h-3 text-red-600" />
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-contrast min-w-[60px]">
          {cliente.numero_bm || 'Não definido'}
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => onBMEdit(cliente.id, cliente.numero_bm || '')}
        >
          <Edit2 className="w-3 h-3 text-muted-foreground" />
        </Button>
      </div>
    )
  }

  return (
    <TableRow className="border-border hover:bg-muted/20">
      <TableCell className="text-xs text-contrast font-mono">{cliente.id}</TableCell>
      <TableCell className="text-xs text-contrast">{cliente.data_venda || 'N/A'}</TableCell>
      <TableCell className="text-xs text-contrast font-medium">{cliente.nome_cliente}</TableCell>
      <TableCell className="text-xs text-contrast">{cliente.telefone}</TableCell>
      <TableCell className="text-xs text-contrast">{cliente.email_cliente}</TableCell>
      <TableCell className="text-xs text-contrast">{cliente.vendedor}</TableCell>
      <TableCell className="text-xs text-contrast">{cliente.email_gestor}</TableCell>
      
      <TableCell>
        <Select
          value={cliente.status_campanha || ''}
          onValueChange={(value) => onStatusChange(cliente.id, value)}
          disabled={updatingStatus === cliente.id}
        >
          <SelectTrigger 
            className={`h-8 text-xs border-0 ${getStatusColor(cliente.status_campanha || '')} min-w-[140px]`}
          >
            {updatingStatus === cliente.id ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Atualizando...</span>
              </div>
            ) : (
              <SelectValue placeholder="Selecionar status" />
            )}
          </SelectTrigger>
          <SelectContent>
            {STATUS_CAMPANHA.map((status) => (
              <SelectItem key={status} value={status} className="text-xs">
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      <TableCell>
        <DataLimiteDisplay cliente={cliente} isGestorDashboard={isGestorDashboard} />
      </TableCell>

      <TableCell>{renderLinkCell(cliente.link_grupo, 'link_grupo', 'Link do grupo')}</TableCell>
      <TableCell>{renderLinkCell(cliente.link_briefing, 'link_briefing', 'Link do briefing')}</TableCell>
      <TableCell>{renderLinkCell(cliente.link_criativo, 'link_criativo', 'Link do criativo')}</TableCell>
      <TableCell>{renderLinkCell(cliente.link_site, 'link_site', 'Link do site')}</TableCell>
      <TableCell>{renderBMCell()}</TableCell>
      
      <TableCell>
        <ComissaoButton
          cliente={cliente}
          isGestorDashboard={isGestorDashboard}
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
