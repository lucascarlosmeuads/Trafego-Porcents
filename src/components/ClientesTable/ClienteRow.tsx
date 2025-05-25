
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, X, Edit2, Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ComissaoButton } from './ComissaoButton'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import type { Cliente } from '@/lib/supabase'

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
  onLinkSave: (clienteId: string, field: string) => void
  onLinkCancel: () => void
  onBMEdit: (clienteId: string, currentValue: string) => void
  onBMSave: (clienteId: string) => void
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
  const isEditingBM = editingBM === cliente.id
  const isGestorDashboard = selectedManager !== 'Todos os Clientes'
  
  // Função para exibir Data Limite
  const getDataLimiteDisplay = () => {
    if (isGestorDashboard && cliente.status_campanha === 'No Ar') {
      return (
        <span className="text-green-600 font-semibold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-xs">
          ✅ Cumprido
        </span>
      )
    }
    return cliente.data_limite || 'Não definida'
  }

  const renderLinkCell = (field: keyof Cliente, currentValue: string) => {
    const isEditing = editingLink?.clienteId === cliente.id && editingLink?.field === field
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-1 min-w-0">
          <Input
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            className="h-6 text-xs min-w-0 flex-1"
            placeholder="Cole o link aqui"
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 flex-shrink-0"
            onClick={() => onLinkSave(cliente.id, field)}
          >
            <Check className="w-3 h-3 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 flex-shrink-0"
            onClick={onLinkCancel}
          >
            <X className="w-3 h-3 text-red-600" />
          </Button>
        </div>
      )
    }

    return (
      <div 
        className="cursor-pointer hover:bg-muted/50 p-1 rounded text-xs min-w-0"
        onClick={() => onLinkEdit(cliente.id, field, currentValue || '')}
      >
        {currentValue ? (
          <a 
            href={currentValue.startsWith('http') ? currentValue : `https://${currentValue}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {currentValue.length > 30 ? `${currentValue.substring(0, 30)}...` : currentValue}
          </a>
        ) : (
          <span className="text-muted-foreground">Clique para adicionar</span>
        )}
      </div>
    )
  }

  return (
    <TableRow className="border-border hover:bg-muted/20">
      <TableCell className="font-mono text-xs text-muted-foreground">
        {String(index + 1).padStart(3, '0')}
      </TableCell>
      
      <TableCell className="text-xs">{cliente.data_venda || 'Não informada'}</TableCell>
      
      <TableCell className="font-medium text-xs">
        {cliente.nome_cliente || 'Nome não informado'}
      </TableCell>
      
      <TableCell className="text-xs">{cliente.telefone || 'Não informado'}</TableCell>
      
      <TableCell className="text-xs">
        {cliente.email_cliente ? (
          <a 
            href={`mailto:${cliente.email_cliente}`}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {cliente.email_cliente}
          </a>
        ) : 'Não informado'}
      </TableCell>
      
      <TableCell className="text-xs">{cliente.vendedor || 'Não informado'}</TableCell>
      
      <TableCell className="text-xs">
        <Select
          value={cliente.status_campanha || 'Preenchimento do Formulário'}
          onValueChange={(value) => onStatusChange(cliente.id, value)}
          disabled={updatingStatus === cliente.id}
        >
          <SelectTrigger className={`h-7 text-xs w-40 ${getStatusColor(cliente.status_campanha || '')}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_CAMPANHA.map((status) => (
              <SelectItem key={status} value={status} className="text-xs">
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {updatingStatus === cliente.id && (
          <Loader2 className="w-3 h-3 animate-spin ml-2 inline" />
        )}
      </TableCell>
      
      <TableCell className="text-xs">
        {getDataLimiteDisplay()}
      </TableCell>
      
      <TableCell className="text-xs max-w-32">
        {renderLinkCell('link_grupo', cliente.link_grupo || '')}
      </TableCell>
      
      <TableCell className="text-xs max-w-32">
        {renderLinkCell('link_briefing', cliente.link_briefing || '')}
      </TableCell>
      
      <TableCell className="text-xs max-w-32">
        {renderLinkCell('link_criativo', cliente.link_criativo || '')}
      </TableCell>
      
      <TableCell className="text-xs max-w-32">
        {renderLinkCell('link_site', cliente.link_site || '')}
      </TableCell>
      
      <TableCell className="text-xs">
        {isEditingBM ? (
          <div className="flex items-center gap-1">
            <Input
              value={bmValue}
              onChange={(e) => setBmValue(e.target.value)}
              className="h-6 text-xs w-24"
              placeholder="Ex: 123456"
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
        ) : (
          <div 
            className="cursor-pointer hover:bg-muted/50 p-1 rounded text-xs flex items-center gap-1"
            onClick={() => onBMEdit(cliente.id, cliente.numero_bm || '')}
          >
            {cliente.numero_bm || (
              <span className="text-muted-foreground">Clique para adicionar</span>
            )}
            <Edit2 className="w-3 h-3 text-muted-foreground ml-auto" />
          </div>
        )}
      </TableCell>
      
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
