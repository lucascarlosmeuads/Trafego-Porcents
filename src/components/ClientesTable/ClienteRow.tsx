
import { useState } from 'react'
import { Calendar, RefreshCw, Check, X, Edit2, ExternalLink } from 'lucide-react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import type { Cliente } from '@/lib/supabase'
import { calculateDataLimite, getDataLimiteMensagem } from '@/utils/dateUtils'

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
  const clienteId = String(cliente.id || '')

  if (!clienteId || clienteId.trim() === '' || clienteId === 'undefined') {
    console.warn(`⚠️ Cliente ${index + 1} tem ID completamente inválido, não será renderizado:`, cliente)
    return null
  }

  const formatPhoneForWhatsApp = (phone: string) => {
    if (!phone) return ''
    
    const numbersOnly = phone.replace(/\D/g, '')
    
    if (!numbersOnly.startsWith('55') && numbersOnly.length >= 10) {
      return `55${numbersOnly}`
    }
    
    return numbersOnly
  }

  const openWhatsApp = (phone: string) => {
    const formattedPhone = formatPhoneForWhatsApp(phone)
    if (formattedPhone) {
      window.open(`https://wa.me/${formattedPhone}`, '_blank')
    }
  }

  const openLink = (url: string) => {
    if (!url) return
    
    let formattedUrl = url.trim()
    
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`
    }
    
    console.log(`🔗 Abrindo link: ${formattedUrl}`)
    window.open(formattedUrl, '_blank')
  }

  const renderLinkField = (field: string) => {
    const currentValue = cliente[field as keyof Cliente] as string
    const isEditing = editingLink?.clienteId === clienteId && editingLink?.field === field

    if (isEditing) {
      return (
        <div className="flex items-center gap-1 min-w-[120px]">
          <Input
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            placeholder="Cole o link aqui..."
            className="h-6 text-xs px-2"
            autoFocus
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onLinkSave(clienteId, field)}
          >
            <Check className="w-3 h-3 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onLinkCancel}
          >
            <X className="w-3 h-3 text-red-600" />
          </Button>
        </div>
      )
    }

    if (!currentValue) {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onLinkEdit(clienteId, field, currentValue)}
        >
          Adicionar link
        </Button>
      )
    }
    
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 dark:border-blue-800 dark:text-blue-300 dark:hover:text-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
          onClick={() => openLink(currentValue)}
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Ver
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
          onClick={() => onLinkEdit(clienteId, field, currentValue)}
        >
          <Edit2 className="w-3 h-3" />
        </Button>
      </div>
    )
  }

  const renderBMField = () => {
    const currentValue = cliente.numero_bm
    const isEditing = editingBM === clienteId

    if (isEditing) {
      return (
        <div className="flex items-center gap-1 min-w-[120px]">
          <Input
            value={bmValue}
            onChange={(e) => setBmValue(e.target.value)}
            placeholder="Número BM..."
            className="h-6 text-xs px-2"
            autoFocus
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onBMSave(clienteId)}
          >
            <Check className="w-3 h-3 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onBMCancel}
          >
            <X className="w-3 h-3 text-red-600" />
          </Button>
        </div>
      )
    }

    if (!currentValue) {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onBMEdit(clienteId, currentValue)}
        >
          Adicionar número
        </Button>
      )
    }
    
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-white">{currentValue}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
          onClick={() => onBMEdit(clienteId, currentValue)}
        >
          <Edit2 className="w-3 h-3" />
        </Button>
      </div>
    )
  }

  const renderComissionField = () => {
    const isPaid = cliente.comissao_paga
    const isUpdating = updatingComission === clienteId

    if (isPaid) {
      return (
        <div className="flex items-center gap-1">
          <Check className="w-3 h-3 text-green-600" />
          <span className="text-xs text-green-600 font-medium">R$ 60,00</span>
        </div>
      )
    }

    return (
      <Button
        variant="outline"
        size="sm"
        className="h-6 px-2 text-xs"
        onClick={() => onComissionToggle(clienteId, isPaid)}
        disabled={isUpdating}
      >
        {isUpdating && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
        Não Pago
      </Button>
    )
  }

  const renderWhatsAppButton = (phone: string) => {
    if (!phone) {
      return <span className="text-white text-xs">-</span>
    }

    return (
      <Button
        variant="outline"
        size="sm"
        className="h-6 px-2 text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 dark:bg-green-950/50 dark:hover:bg-green-900/50 dark:border-green-800 dark:text-green-300 dark:hover:text-green-200 transition-all duration-200 shadow-sm hover:shadow-md"
        onClick={() => openWhatsApp(phone)}
      >
        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
        WhatsApp
      </Button>
    )
  }

  const renderDataLimite = () => {
    const dataLimiteCalculada = cliente.data_venda ? calculateDataLimite(cliente.data_venda) : cliente.data_limite
    
    if (!dataLimiteCalculada) {
      return <span className="text-white">-</span>
    }
    
    const { texto, estilo } = getDataLimiteMensagem(dataLimiteCalculada, cliente.status_campanha)
    
    return (
      <span className={estilo}>
        {texto}
      </span>
    )
  }

  return (
    <TableRow 
      key={`${selectedManager}-${clienteId}-${index}`}
      className="border-border hover:bg-muted/10 transition-colors"
    >
      {/* ID */}
      <TableCell className="font-mono text-xs">
        <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/30 rounded px-2 py-1 shadow-sm">
          <span className="text-slate-400 mr-1">#</span>
          <span className="text-white font-medium">{clienteId}</span>
        </div>
      </TableCell>
      
      {/* Data Venda */}
      <TableCell>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-white">{cliente.data_venda || '-'}</span>
        </div>
      </TableCell>
      
      {/* Nome Cliente */}
      <TableCell className="font-medium">
        <div className="max-w-[200px] truncate text-white">
          {cliente.nome_cliente || '-'}
        </div>
      </TableCell>
      
      {/* Telefone */}
      <TableCell>
        {renderWhatsAppButton(cliente.telefone)}
      </TableCell>
      
      {/* Email Cliente */}
      <TableCell>
        <div className="max-w-[150px] truncate text-white text-xs">
          {cliente.email_cliente || '-'}
        </div>
      </TableCell>
      
      {/* Vendedor */}
      <TableCell>
        <div className="max-w-[150px] truncate text-white text-xs">
          {cliente.vendedor || '-'}
        </div>
      </TableCell>
      
      {/* Email Gestor */}
      <TableCell>
        <div className="max-w-[150px] truncate text-white text-xs">
          {cliente.email_gestor || '-'}
        </div>
      </TableCell>
      
      {/* Status Campanha */}
      <TableCell>
        <Select 
          value={cliente.status_campanha || ''}
          onValueChange={(value) => onStatusChange(clienteId, value)}
          disabled={updatingStatus === clienteId}
        >
          <SelectTrigger className="h-8 w-48 bg-background border-border text-white z-[400]">
            <SelectValue>
              <div className="flex items-center gap-2">
                {updatingStatus === clienteId && (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                )}
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(cliente.status_campanha || '')}`}>
                  {cliente.status_campanha || 'Selecionar Status'}
                </span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-card border-border z-[500]">
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
        {renderDataLimite()}
      </TableCell>
      
      {/* Grupo */}
      <TableCell className="hidden lg:table-cell">
        {renderLinkField('link_grupo')}
      </TableCell>
      
      {/* Briefing */}
      <TableCell className="hidden lg:table-cell">
        {renderLinkField('link_briefing')}
      </TableCell>
      
      {/* Criativo */}
      <TableCell className="hidden lg:table-cell">
        {renderLinkField('link_criativo')}
      </TableCell>
      
      {/* Site */}
      <TableCell className="hidden lg:table-cell">
        {renderLinkField('link_site')}
      </TableCell>
      
      {/* Número BM */}
      <TableCell className="hidden xl:table-cell">
        {renderBMField()}
      </TableCell>
      
      {/* Comissão */}
      <TableCell>
        {renderComissionField()}
      </TableCell>
    </TableRow>
  )
}
