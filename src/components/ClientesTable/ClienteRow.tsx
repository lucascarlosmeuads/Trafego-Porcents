
import { useState } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { Calendar, Eye, EyeOff, Smartphone, Monitor, ExternalLink, Edit, Save, X } from 'lucide-react'
import { BriefingMaterialsModal } from './BriefingMaterialsModal'
import { ComissaoButton } from './ComissaoButton'
import { ProblemaDescricao } from './ProblemaDescricao'
import { STATUS_CAMPANHA, type Cliente, type StatusCampanha } from '@/lib/supabase'

interface ClienteRowProps {
  cliente: Cliente
  onUpdateCliente: (id: string, field: string, value: string | boolean | number) => Promise<boolean>
  briefings: { [key: string]: boolean }
  arquivos: { [key: string]: number }
  isAdmin?: boolean
  userEmail?: string
  index: number
  viewMode: 'table' | 'cards'
}

export function ClienteRow({ 
  cliente, 
  onUpdateCliente, 
  briefings, 
  arquivos, 
  isAdmin = false,
  userEmail = '',
  index, 
  viewMode 
}: ClienteRowProps) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  // Simple permission check - admins can always change, managers can change their own clients
  const canChangeStatus = isAdmin || cliente.email_gestor === userEmail

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Preenchimento do Formulário':
        return 'bg-gray-500/20 text-gray-700 border border-gray-500/30'
      case 'Brief':
        return 'bg-blue-500/20 text-blue-700 border border-blue-500/30'
      case 'Criativo':
        return 'bg-purple-500/20 text-purple-700 border border-purple-500/30'
      case 'Site':
        return 'bg-orange-500/20 text-orange-700 border border-orange-500/30'
      case 'Agendamento':
        return 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30'
      case 'No Ar':
        return 'bg-green-500/20 text-green-700 border border-green-500/30'
      case 'Otimização':
        return 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
      case 'Off':
        return 'bg-slate-500/20 text-slate-700 border border-slate-500/30'
      case 'Reembolso':
        return 'bg-red-500/20 text-red-700 border border-red-500/30'
      default:
        return 'bg-muted text-muted-foreground border border-border'
    }
  }

  const handleStatusChange = (newStatus: string) => {
    console.log(`Alterando status do cliente ${cliente.id} para: ${newStatus}`)
    onUpdateCliente(cliente.id, 'status_campanha', newStatus)
  }

  const startEdit = (field: string, currentValue: string) => {
    setEditingField(field)
    setEditValue(currentValue || '')
  }

  const saveEdit = async () => {
    if (editingField && editValue !== (cliente as any)[editingField]) {
      const success = await onUpdateCliente(cliente.id, editingField, editValue)
      if (success) {
        setEditingField(null)
        setEditValue('')
      }
    } else {
      setEditingField(null)
      setEditValue('')
    }
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValue('')
  }

  const hasOnClick = (url: string | null) => {
    return url && url.trim() !== '' && url !== '-'
  }

  const handleLinkClick = (url: string | null, e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasOnClick(url)) {
      let finalUrl = url!.trim()
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl
      }
      window.open(finalUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const renderEditableCell = (field: string, value: string | null, placeholder: string = '') => {
    const displayValue = value || '-'
    
    if (editingField === field) {
      return (
        <div className="flex items-center gap-1 min-w-0">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 text-xs min-w-0 flex-1"
            placeholder={placeholder}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') cancelEdit()
            }}
          />
          <div className="flex gap-1 flex-shrink-0">
            <Button onClick={saveEdit} size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Save className="w-3 h-3" />
            </Button>
            <Button onClick={cancelEdit} size="sm" variant="ghost" className="h-6 w-6 p-0">
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1 min-w-0">
        <span className="text-xs text-foreground truncate flex-1">{displayValue}</span>
        {isAdmin && (
          <Button
            onClick={() => startEdit(field, value || '')}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 flex-shrink-0"
          >
            <Edit className="w-3 h-3" />
          </Button>
        )}
      </div>
    )
  }

  const renderLinkCell = (field: string, value: string | null, label: string) => {
    const displayValue = value || '-'
    const hasValidLink = hasOnClick(value)
    
    if (editingField === field) {
      return (
        <div className="flex items-center gap-1 min-w-0">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 text-xs min-w-0 flex-1"
            placeholder={`URL do ${label}`}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') cancelEdit()
            }}
          />
          <div className="flex gap-1 flex-shrink-0">
            <Button onClick={saveEdit} size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Save className="w-3 h-3" />
            </Button>
            <Button onClick={cancelEdit} size="sm" variant="ghost" className="h-6 w-6 p-0">
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1 min-w-0">
        <Button
          onClick={(e) => handleLinkClick(value, e)}
          variant="ghost"
          size="sm"
          className={`h-6 px-2 text-xs justify-start min-w-0 flex-1 ${
            hasValidLink 
              ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' 
              : 'text-muted-foreground cursor-default hover:bg-transparent'
          }`}
          disabled={!hasValidLink}
        >
          <span className="truncate">{displayValue}</span>
          {hasValidLink && <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />}
        </Button>
        {isAdmin && (
          <Button
            onClick={() => startEdit(field, value || '')}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 flex-shrink-0"
          >
            <Edit className="w-3 h-3" />
          </Button>
        )}
      </div>
    )
  }

  // Check if client has briefing or creative materials
  const hasBriefing = briefings[cliente.email_cliente || ''] || false
  const hasCreative = (arquivos[cliente.email_cliente || ''] || 0) > 0

  if (viewMode === 'cards') {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              #{String(index + 1).padStart(3, '0')}
            </span>
            <span className="font-medium text-sm truncate">
              {cliente.nome_cliente || 'Cliente sem nome'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formatDate(cliente.data_venda)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Telefone:</span>
            <div className="mt-1">
              {renderEditableCell('telefone', cliente.telefone, 'Telefone')}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Email Gestor:</span>
            <div className="mt-1">
              {renderEditableCell('email_gestor', cliente.email_gestor, 'Email do gestor')}
            </div>
          </div>
        </div>

        <div>
          <span className="text-muted-foreground text-sm">Status:</span>
          <div className="mt-2">
            <Select 
              value={cliente.status_campanha || ''}
              onValueChange={handleStatusChange}
              disabled={!canChangeStatus}
            >
              <SelectTrigger className="h-8 w-full bg-background border-border text-foreground">
                <SelectValue>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(cliente.status_campanha || '')}`}>
                    {cliente.status_campanha || 'Sem status'}
                  </span>
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
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <BriefingMaterialsModal
                      emailCliente={cliente.email_cliente || ''}
                      nomeCliente={cliente.nome_cliente || 'Cliente'}
                      filterType="briefing"
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!hasBriefing}
                          className={hasBriefing ? '' : 'opacity-50'}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Briefing
                        </Button>
                      }
                    />
                  </div>
                </TooltipTrigger>
                {!hasBriefing && (
                  <TooltipContent>
                    <p>Aguardando envio do cliente</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <BriefingMaterialsModal
                      emailCliente={cliente.email_cliente || ''}
                      nomeCliente={cliente.nome_cliente || 'Cliente'}
                      filterType="creative"
                      allowManagerUpload={isAdmin}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!hasCreative && !isAdmin}
                          className={hasCreative || isAdmin ? '' : 'opacity-50'}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Criativo
                        </Button>
                      }
                    />
                  </div>
                </TooltipTrigger>
                {!hasCreative && !isAdmin && (
                  <TooltipContent>
                    <p>Aguardando envio do cliente</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          <ComissaoButton 
            cliente={cliente} 
            onUpdateCliente={onUpdateCliente}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    )
  }

  return (
    <TableRow className="border-border hover:bg-muted/20 transition-colors group">
      <TableCell className="font-mono text-xs text-foreground">
        {String(index + 1).padStart(3, '0')}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-foreground">{formatDate(cliente.data_venda)}</span>
        </div>
      </TableCell>
      <TableCell className="min-w-[200px]">
        {renderEditableCell('nome_cliente', cliente.nome_cliente, 'Nome do cliente')}
      </TableCell>
      <TableCell className="min-w-[120px]">
        {renderEditableCell('telefone', cliente.telefone, 'Telefone')}
      </TableCell>
      <TableCell className="min-w-[180px]">
        {renderEditableCell('email_gestor', cliente.email_gestor, 'Email do gestor')}
      </TableCell>
      <TableCell className="min-w-[180px]">
        <Select 
          value={cliente.status_campanha || ''}
          onValueChange={handleStatusChange}
          disabled={!canChangeStatus}
        >
          <SelectTrigger className="h-8 w-48 bg-background border-border text-foreground">
            <SelectValue>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(cliente.status_campanha || '')}`}>
                {cliente.status_campanha || 'Sem status'}
              </span>
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
      <TableCell className="min-w-[100px]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <BriefingMaterialsModal
                  emailCliente={cliente.email_cliente || ''}
                  nomeCliente={cliente.nome_cliente || 'Cliente'}
                  filterType="briefing"
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!hasBriefing}
                      className={hasBriefing ? '' : 'opacity-50'}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  }
                />
              </div>
            </TooltipTrigger>
            {!hasBriefing && (
              <TooltipContent>
                <p>Aguardando envio do cliente</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="min-w-[100px]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <BriefingMaterialsModal
                  emailCliente={cliente.email_cliente || ''}
                  nomeCliente={cliente.nome_cliente || 'Cliente'}
                  filterType="creative"
                  allowManagerUpload={isAdmin}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!hasCreative && !isAdmin}
                      className={hasCreative || isAdmin ? '' : 'opacity-50'}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  }
                />
              </div>
            </TooltipTrigger>
            {!hasCreative && !isAdmin && (
              <TooltipContent>
                <p>Aguardando envio do cliente</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="min-w-[120px]">
        {renderLinkCell('link_grupo', cliente.link_grupo, 'grupo')}
      </TableCell>
      <TableCell className="min-w-[120px]">
        {renderLinkCell('link_briefing', cliente.link_briefing, 'briefing')}
      </TableCell>
      <TableCell className="min-w-[120px]">
        {renderLinkCell('link_criativo', cliente.link_criativo, 'criativo')}
      </TableCell>
      <TableCell className="min-w-[120px]">
        {renderLinkCell('link_site', cliente.link_site, 'site')}
      </TableCell>
      <TableCell className="min-w-[120px]">
        {renderEditableCell('numero_bm', cliente.numero_bm, 'Número BM')}
      </TableCell>
      <TableCell className="min-w-[100px]">
        <ComissaoButton 
          cliente={cliente} 
          onUpdateCliente={onUpdateCliente}
          isAdmin={isAdmin}
        />
      </TableCell>
      <TableCell className="min-w-[200px]">
        <ProblemaDescricao 
          clienteId={cliente.id} 
          descricaoAtual={cliente.descricao_problema}
          onSave={async (clienteId: string, descricao: string) => {
            const statusSuccess = await onUpdateCliente(clienteId, 'status_campanha', 'Problema')
            if (!statusSuccess) return false
            
            const descricaoSuccess = await onUpdateCliente(clienteId, 'descricao_problema', descricao)
            return descricaoSuccess
          }}
          onCancel={() => {}}
        />
      </TableCell>
    </TableRow>
  )
}
