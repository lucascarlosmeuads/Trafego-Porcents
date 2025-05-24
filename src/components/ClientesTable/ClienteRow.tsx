
import { useState } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertTriangle, Calendar, Check, X, Edit2, ExternalLink, Loader2 } from 'lucide-react'
import { STATUS_CAMPANHA, type Cliente } from '@/lib/supabase'

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
  getStatusColor: (status: string) => string
  onStatusChange: (clienteId: string, newStatus: string) => void
  onLinkEdit: (clienteId: string, field: string, currentValue: string) => void
  onLinkSave: (clienteId: string, field: string) => void
  onLinkCancel: () => void
  onBMEdit: (clienteId: string, currentValue: string) => void
  onBMSave: (clienteId: string) => void
  onBMCancel: () => void
  onComissionToggle: (clienteId: string, currentStatus: boolean) => void
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
  getStatusColor,
  onStatusChange,
  onLinkEdit,
  onLinkSave,
  onLinkCancel,
  onBMEdit,
  onBMSave,
  onBMCancel,
  onComissionToggle
}: ClienteRowProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  const calculateDateLimit = (dataVenda: string | null) => {
    if (!dataVenda) return { text: '-', style: '' }
    
    const venda = new Date(dataVenda)
    const limite = new Date(venda)
    limite.setDate(limite.getDate() + 15)
    
    const hoje = new Date()
    const diffTime = limite.getTime() - hoje.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // Se o status é "No Ar" ou "Otimização", mostrar como cumprido
    if (cliente.status_campanha === 'No Ar' || cliente.status_campanha === 'Otimização') {
      return {
        text: 'Cumprido',
        style: 'bg-green-100 text-green-800 border-green-300'
      }
    }
    
    if (diffDays < 0) {
      return {
        text: `Atrasado ${Math.abs(diffDays)} dias`,
        style: 'bg-red-100 text-red-800 border-red-300'
      }
    } else {
      return {
        text: `Faltam ${diffDays} dias`,
        style: 'bg-blue-100 text-blue-800 border-blue-300'
      }
    }
  }

  const renderLinkCell = (url: string, field: string, label: string) => {
    const isEditing = editingLink?.clienteId === cliente.id && editingLink?.field === field
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            className="h-6 text-xs"
            placeholder="https://..."
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

    if (!url) {
      return (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => onLinkEdit(cliente.id, field, url)}
        >
          <Edit2 className="w-3 h-3 text-muted-foreground" />
        </Button>
      )
    }

    return (
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => window.open(url, '_blank')}
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Ver
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => onLinkEdit(cliente.id, field, url)}
        >
          <Edit2 className="w-3 h-3 text-muted-foreground" />
        </Button>
      </div>
    )
  }

  const renderBMCell = () => {
    const isEditing = editingBM === cliente.id
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            value={bmValue}
            onChange={(e) => setBmValue(e.target.value)}
            className="h-6 text-xs"
            placeholder="Número BM"
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
        <span className="text-xs text-white">
          {cliente.numero_bm || '-'}
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

  const dateLimit = calculateDateLimit(cliente.data_venda)

  return (
    <TableRow className="border-border hover:bg-muted/20 transition-colors">
      <TableCell className="font-mono text-xs text-white">
        {String(index + 1).padStart(3, '0')}
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-white">{formatDate(cliente.data_venda)}</span>
        </div>
      </TableCell>
      
      <TableCell className="font-medium">
        <div className="max-w-[200px] truncate text-white">
          {cliente.nome_cliente}
        </div>
      </TableCell>
      
      <TableCell className="text-white">{cliente.telefone}</TableCell>
      
      <TableCell>
        <div className="max-w-[150px] truncate text-white">
          {cliente.email_gestor}
        </div>
      </TableCell>
      
      <TableCell>
        <Select 
          value={cliente.status_campanha || ''}
          onValueChange={(value) => onStatusChange(cliente.id, value)}
          disabled={updatingStatus === cliente.id}
        >
          <SelectTrigger className="h-8 w-48 bg-background border-border text-foreground">
            <SelectValue>
              {updatingStatus === cliente.id ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Atualizando...</span>
                </div>
              ) : (
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(cliente.status_campanha || '')}`}>
                  {cliente.status_campanha || 'Selecionar Status'}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-card border-border z-50">
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
      
      <TableCell>
        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${dateLimit.style}`}>
          {dateLimit.text.includes('Faltam') && (
            <Calendar className="w-3 h-3" />
          )}
          {dateLimit.text.includes('Atrasado') && (
            <AlertTriangle className="w-3 h-3" />
          )}
          <span>{dateLimit.text}</span>
        </div>
      </TableCell>
      
      <TableCell className="hidden lg:table-cell">
        {renderLinkCell(cliente.link_grupo || '', 'link_grupo', 'Grupo')}
      </TableCell>
      
      <TableCell className="hidden lg:table-cell">
        {renderLinkCell(cliente.link_briefing || '', 'link_briefing', 'Briefing')}
      </TableCell>
      
      <TableCell className="hidden lg:table-cell">
        {renderLinkCell(cliente.link_criativo || '', 'link_criativo', 'Criativo')}
      </TableCell>
      
      <TableCell className="hidden lg:table-cell">
        {renderLinkCell(cliente.link_site || '', 'link_site', 'Site')}
      </TableCell>
      
      <TableCell className="hidden xl:table-cell">
        {renderBMCell()}
      </TableCell>
      
      <TableCell>
        <Button
          variant={cliente.comissao_paga ? "default" : "outline"}
          size="sm"
          className={`h-7 text-xs ${
            cliente.comissao_paga 
              ? 'bg-green-600 hover:bg-green-700 text-white cursor-default' 
              : 'border-green-600 text-green-600 hover:bg-green-50'
          }`}
          onClick={() => onComissionToggle(cliente.id, cliente.comissao_paga || false)}
          disabled={cliente.comissao_paga || updatingComission === cliente.id}
        >
          {updatingComission === cliente.id ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : cliente.comissao_paga ? (
            <Check className="w-3 h-3 mr-1" />
          ) : null}
          {cliente.comissao_paga 
            ? `Pago - R$ ${(cliente.valor_comissao || 60.00).toFixed(2)}`
            : `Marcar Pago - R$ ${(cliente.valor_comissao || 60.00).toFixed(2)}`
          }
        </Button>
      </TableCell>
    </TableRow>
  )
}
