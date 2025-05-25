
import { useState } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Calendar, ExternalLink, Loader2, Edit, Check, X, MapPin } from 'lucide-react'
import type { Cliente } from '@/lib/supabase'
import { BriefingMaterialsModal } from './BriefingMaterialsModal'
import { ComissaoButton } from './ComissaoButton'
import { useGestorStatusRestrictions } from '@/hooks/useGestorStatusRestrictions'
import { STATUS_CAMPANHA } from '@/lib/supabase'

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
  onComissionValueCancel,
}: ClienteRowProps) {
  const [siteLinkInput, setSiteLinkInput] = useState('')
  const { podeEditarStatus } = useGestorStatusRestrictions()

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  const handleSiteLinkSave = async () => {
    const success = await onLinkSave(cliente.id, 'link_site')
    if (success) {
      setSiteLinkInput('')
    }
  }

  const handleSiteLinkCancel = () => {
    setSiteLinkInput('')
    onLinkCancel()
  }

  const handleSiteLinkEdit = (currentValue: string) => {
    setSiteLinkInput(currentValue || '')
    onLinkEdit(cliente.id, 'link_site', currentValue)
  }

  const canEditStatus = podeEditarStatus(cliente.id, cliente.status_campanha || '')

  return (
    <TableRow className="border-border hover:bg-muted/20 transition-colors group">
      {/* ID */}
      <TableCell className="font-mono text-xs text-white">
        {String(index + 1).padStart(3, '0')}
      </TableCell>

      {/* Data Venda */}
      <TableCell>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-white">{formatDate(cliente.data_venda)}</span>
        </div>
      </TableCell>

      {/* Nome Cliente */}
      <TableCell className="font-medium">
        <div className="max-w-[200px] truncate text-white">
          {cliente.nome_cliente || 'Cliente sem nome'}
        </div>
      </TableCell>

      {/* Telefone */}
      <TableCell className="text-white">{cliente.telefone || '-'}</TableCell>

      {/* Email Gestor */}
      <TableCell>
        <div className="max-w-[180px] truncate text-white">
          {cliente.email_gestor || '-'}
        </div>
      </TableCell>

      {/* Status Campanha */}
      <TableCell>
        <Select 
          value={cliente.status_campanha || ''}
          onValueChange={(value) => onStatusChange(cliente.id, value)}
          disabled={updatingStatus === cliente.id || !canEditStatus}
        >
          <SelectTrigger className="h-8 w-48 bg-slate-700 border-slate-600 text-white">
            <SelectValue>
              {updatingStatus === cliente.id ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Atualizando...</span>
                </div>
              ) : (
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(cliente.status_campanha || '')}`}>
                  {cliente.status_campanha || 'Sem status'}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600 z-50">
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
      <TableCell>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-orange-400" />
          <span className="text-xs text-white">{formatDate(cliente.data_limite)}</span>
        </div>
      </TableCell>

      {/* Materiais (formerly Criativos) - Using filterType='all' to show everything */}
      <TableCell className="hidden lg:table-cell">
        <BriefingMaterialsModal
          clienteEmail={cliente.email_cliente || ''}
          clienteNome={cliente.nome_cliente || ''}
          filterType="all"
          trigger={
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 px-2 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              <ExternalLink className="w-3 h-3 mr-1 text-purple-400" />
              Ver
            </Button>
          }
        />
      </TableCell>

      {/* Site */}
      <TableCell className="hidden lg:table-cell">
        <div className="flex items-center gap-1">
          {editingLink?.clienteId === cliente.id && editingLink?.field === 'link_site' ? (
            <div className="flex items-center gap-1 w-full">
              <Input
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                placeholder="Cole o link do site aqui..."
                className="h-7 text-xs bg-slate-700 border-slate-600 text-white flex-1"
                autoFocus
              />
              <Button
                onClick={handleSiteLinkSave}
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 bg-green-600 border-green-500 hover:bg-green-500"
              >
                <Check className="w-3 h-3 text-white" />
              </Button>
              <Button
                onClick={handleSiteLinkCancel}
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 bg-red-600 border-red-500 hover:bg-red-500"
              >
                <X className="w-3 h-3 text-white" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => handleSiteLinkEdit(cliente.link_site || '')}
              variant="outline" 
              size="sm"
              className="h-7 px-2 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              <ExternalLink className="w-3 h-3 mr-1 text-orange-400" />
              {cliente.link_site ? 'Ver' : 'Add'}
            </Button>
          )}
        </div>
      </TableCell>

      {/* Número BM */}
      <TableCell className="hidden xl:table-cell">
        <div className="flex items-center gap-1">
          {editingBM === cliente.id ? (
            <div className="flex items-center gap-1 w-full">
              <Input
                value={bmValue}
                onChange={(e) => setBmValue(e.target.value)}
                placeholder="Número BM"
                className="h-7 text-xs bg-slate-700 border-slate-600 text-white flex-1"
                autoFocus
              />
              <Button
                onClick={() => onBMSave(cliente.id)}
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 bg-green-600 border-green-500 hover:bg-green-500"
              >
                <Check className="w-3 h-3 text-white" />
              </Button>
              <Button
                onClick={onBMCancel}
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 bg-red-600 border-red-500 hover:bg-red-500"
              >
                <X className="w-3 h-3 text-white" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => onBMEdit(cliente.id, cliente.numero_bm || '')}
              variant="outline"
              size="sm"
              className="h-7 px-2 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              <Edit className="w-3 h-3 mr-1 text-yellow-400" />
              <span className="text-xs">{cliente.numero_bm || 'Add'}</span>
            </Button>
          )}
        </div>
      </TableCell>

      {/* Comissão */}
      <TableCell>
        <ComissaoButton
          cliente={cliente}
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
