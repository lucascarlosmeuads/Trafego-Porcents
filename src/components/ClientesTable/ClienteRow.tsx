
import { useState } from 'react'
import { TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import { Check, X, Edit, Loader, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'

interface Cliente {
  id: string
  nome_cliente?: string
  telefone?: string
  email_cliente?: string
  vendedor?: string
  email_gestor?: string
  status_campanha?: string
  site_status?: string
  data_limite?: string
  data_venda?: string
  link_grupo?: string
  link_briefing?: string
  link_criativo?: string
  link_site?: string
  numero_bm?: string
  comissao_paga?: boolean
  valor_comissao?: number
  descricao_problema?: string
}

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
  onComissionValueSave: (clienteId: string, newValue: number) => Promise<void>
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
  const [siteLinkInput, setSiteLinkInput] = useState('')

  const handleSiteLinkEdit = () => {
    setSiteLinkInput(cliente.link_site || '')
    onLinkEdit(cliente.id, 'link_site', cliente.link_site || '')
  }

  const handleSiteLinkSave = async () => {
    setLinkValue(siteLinkInput)
    const success = await onLinkSave(cliente.id, 'link_site')
    if (success) {
      setSiteLinkInput('')
    }
  }

  const handleSiteLinkCancel = () => {
    setSiteLinkInput('')
    onLinkCancel()
  }

  const handleComissionValueSave = async () => {
    const newValue = parseFloat(comissionValueInput)
    if (isNaN(newValue) || newValue < 0) {
      return
    }
    await onComissionValueSave(cliente.id, newValue)
  }

  const renderLinkCell = (field: string, currentValue: string) => {
    const isEditing = editingLink?.clienteId === cliente.id && editingLink?.field === field
    
    if (field === 'link_site') {
      const isEditingSiteLink = editingLink?.clienteId === cliente.id && editingLink?.field === 'link_site'
      
      if (isEditingSiteLink) {
        return (
          <div className="flex items-center gap-2">
            <Input
              value={siteLinkInput}
              onChange={(e) => setSiteLinkInput(e.target.value)}
              className="h-8 text-xs bg-background border-border text-white"
              placeholder="https://"
            />
            <Button
              size="sm"
              onClick={handleSiteLinkSave}
              className="h-8 px-2"
            >
              <Check className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSiteLinkCancel}
              className="h-8 px-2"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )
      }

      return (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 break-all">
            {currentValue || 'Não definido'}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSiteLinkEdit}
            className="h-6 w-6 p-0"
          >
            <Edit className="w-3 h-3" />
          </Button>
        </div>
      )
    }
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            className="h-8 text-xs bg-background border-border text-white"
            placeholder="https://"
          />
          <Button
            size="sm"
            onClick={() => onLinkSave(cliente.id, field)}
            className="h-8 px-2"
          >
            <Check className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onLinkCancel}
            className="h-8 px-2"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 break-all">
          {currentValue || 'Não definido'}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onLinkEdit(cliente.id, field, currentValue)}
          className="h-6 w-6 p-0"
        >
          <Edit className="w-3 h-3" />
        </Button>
      </div>
    )
  }

  return (
    <TableRow className="border-border hover:bg-muted/20">
      {/* ID Column */}
      <TableCell className="text-white text-xs">{index + 1}</TableCell>
      
      {/* Data Venda */}
      <TableCell className="text-white text-xs">
        {cliente.data_venda ? format(new Date(cliente.data_venda), 'dd/MM/yyyy') : 'N/A'}
      </TableCell>
      
      {/* Nome Cliente */}
      <TableCell className="text-white text-xs font-medium">
        {cliente.nome_cliente || 'N/A'}
      </TableCell>
      
      {/* Telefone */}
      <TableCell className="text-white text-xs">
        {cliente.telefone || 'N/A'}
      </TableCell>
      
      {/* Email Cliente */}
      <TableCell className="text-white text-xs break-all">
        {cliente.email_cliente || 'N/A'}
      </TableCell>
      
      {/* Vendedor */}
      <TableCell className="text-white text-xs">
        {cliente.vendedor || 'N/A'}
      </TableCell>
      
      {/* Email Gestor */}
      <TableCell className="text-white text-xs break-all">
        {cliente.email_gestor || 'N/A'}
      </TableCell>
      
      {/* Status Campanha */}
      <TableCell className="text-white">
        <Select
          value={cliente.status_campanha || ''}
          onValueChange={(value) => onStatusChange(cliente.id, value)}
          disabled={updatingStatus === cliente.id}
        >
          <SelectTrigger className="w-40 h-8 text-xs bg-background border-border text-white">
            {updatingStatus === cliente.id ? (
              <div className="flex items-center gap-2">
                <Loader className="w-3 h-3 animate-spin" />
                <span>Atualizando...</span>
              </div>
            ) : (
              <SelectValue placeholder="Sem status" />
            )}
          </SelectTrigger>
          <SelectContent className="bg-card border-border max-h-60 overflow-y-auto">
            {STATUS_CAMPANHA.map(status => (
              <SelectItem key={status} value={status}>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                  {status}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      
      {/* Data Limite */}
      <TableCell className="text-white text-xs">
        {cliente.data_limite || 'N/A'}
      </TableCell>
      
      {/* Link Grupo */}
      <TableCell className="min-w-40">
        {renderLinkCell('link_grupo', cliente.link_grupo || '')}
      </TableCell>
      
      {/* Link Briefing */}
      <TableCell className="min-w-40">
        {renderLinkCell('link_briefing', cliente.link_briefing || '')}
      </TableCell>
      
      {/* Link Criativo */}
      <TableCell className="min-w-40">
        {renderLinkCell('link_criativo', cliente.link_criativo || '')}
      </TableCell>
      
      {/* Link Site */}
      <TableCell className="min-w-40">
        {renderLinkCell('link_site', cliente.link_site || '')}
      </TableCell>
      
      {/* Número BM */}
      <TableCell className="text-white">
        {editingBM === cliente.id ? (
          <div className="flex items-center gap-2">
            <Input
              value={bmValue}
              onChange={(e) => setBmValue(e.target.value)}
              className="h-8 w-32 text-xs bg-background border-border text-white"
              placeholder="Número BM"
            />
            <Button
              size="sm"
              onClick={() => onBMSave(cliente.id)}
              className="h-8 px-2"
            >
              <Check className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onBMCancel}
              className="h-8 px-2"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {cliente.numero_bm || 'Não definido'}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onBMEdit(cliente.id, cliente.numero_bm || '')}
              className="h-6 w-6 p-0"
            >
              <Edit className="w-3 h-3" />
            </Button>
          </div>
        )}
      </TableCell>
      
      {/* Comissão */}
      <TableCell className="text-white">
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            variant={cliente.comissao_paga ? "default" : "outline"}
            onClick={() => onComissionToggle(cliente.id, cliente.comissao_paga || false)}
            disabled={updatingComission === cliente.id}
            className="h-7 text-xs"
          >
            {updatingComission === cliente.id ? (
              <Loader className="w-3 h-3 animate-spin" />
            ) : (
              cliente.comissao_paga ? 'Pago' : 'Não Pago'
            )}
          </Button>
          
          <div className="flex items-center gap-1">
            {editingComissionValue === cliente.id ? (
              <div className="flex items-center gap-1">
                <Input
                  value={comissionValueInput}
                  onChange={(e) => setComissionValueInput(e.target.value)}
                  className="h-6 w-20 text-xs bg-background border-border text-white"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  min="0"
                />
                <Button
                  size="sm"
                  onClick={handleComissionValueSave}
                  className="h-6 px-1"
                >
                  <Check className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onComissionValueCancel}
                  className="h-6 px-1"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">
                  R$ {(cliente.valor_comissao || 60).toFixed(2)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onComissionValueEdit(cliente.id, cliente.valor_comissao || 60)}
                  className="h-4 w-4 p-0"
                >
                  <Edit className="w-2 h-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}
