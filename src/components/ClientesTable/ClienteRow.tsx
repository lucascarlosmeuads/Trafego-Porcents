
import { useState } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertTriangle, Calendar, Check, X, Edit2, ExternalLink, Loader2, MessageCircle } from 'lucide-react'
import { STATUS_CAMPANHA, type Cliente } from '@/lib/supabase'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  onComissionValueEdit: (clienteId: string, currentValue: number) => void
  onComissionValueSave: (clienteId: string, newValue: number) => void
  onComissionValueCancel: () => void
  editingComissionValue: string | null
  comissionValueInput: string
  setComissionValueInput: (value: string) => void
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
  onComissionToggle,
  onComissionValueEdit,
  onComissionValueSave,
  onComissionValueCancel,
  editingComissionValue,
  comissionValueInput,
  setComissionValueInput
}: ClienteRowProps) {
  // Estado local para controlar edição do site
  const [editingSiteLink, setEditingSiteLink] = useState(false)
  const [siteUrl, setSiteUrl] = useState('')

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

  const formatWhatsAppNumber = (phone: string | null) => {
    if (!phone) return null
    
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '')
    
    // Se não começar com 55, adiciona o código do Brasil
    if (!cleaned.startsWith('55')) {
      return `55${cleaned}`
    }
    
    return cleaned
  }

  const renderPhoneCell = () => {
    if (!cliente.telefone) {
      return <span className="text-xs text-white">-</span>
    }

    const whatsappNumber = formatWhatsAppNumber(cliente.telefone)
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-white">{cliente.telefone}</span>
        {whatsappNumber && (
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs bg-green-600 border-green-600 text-white hover:bg-green-700"
            onClick={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank')}
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            WhatsApp
          </Button>
        )}
      </div>
    )
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

  const renderSiteCell = () => {
    console.log(`🔍 Renderizando site cell para cliente ${cliente.id}:`, {
      site_status: (cliente as any).site_status,
      link_site: cliente.link_site
    })

    // Determinar o status do site baseado nos dados existentes
    const siteStatus = (cliente as any).site_status || 'pendente'
    const siteLink = cliente.link_site

    // Estado: Editando o link do site
    if (editingSiteLink) {
      return (
        <div className="flex items-center gap-1">
          <Input
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            className="h-6 text-xs"
            placeholder="https://..."
            autoFocus
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={async () => {
              if (siteUrl) {
                console.log(`💾 Salvando URL do site: ${siteUrl}`)
                // Primeiro salvar o link usando a função existente
                setLinkValue(siteUrl)
                await onLinkSave(cliente.id, 'link_site')
                setEditingSiteLink(false)
                setSiteUrl('')
              }
            }}
          >
            <Check className="w-3 h-3 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => {
              setEditingSiteLink(false)
              setSiteUrl('')
            }}
          >
            <X className="w-3 h-3 text-red-600" />
          </Button>
        </div>
      )
    }

    // Estado: Site finalizado com link
    if (siteStatus === 'finalizado' && siteLink) {
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            onClick={() => window.open(siteLink, '_blank')}
          >
            🌐 Ver site
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => {
              setSiteUrl(siteLink)
              setEditingSiteLink(true)
            }}
          >
            <Edit2 className="w-3 h-3 text-muted-foreground" />
          </Button>
        </div>
      )
    }

    // Estado: Aguardando link
    if (siteStatus === 'aguardando_link') {
      return (
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
          onClick={() => {
            console.log(`🟡 Clicou em aguardando link para cliente ${cliente.id}`)
            setSiteUrl('')
            setEditingSiteLink(true)
          }}
        >
          🟡 Aguardando link
        </Button>
      )
    }

    // Estado: Não precisa de site
    if (siteStatus === 'nao_precisa') {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
            >
              ❌ Não precisa
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuItem
              onClick={async () => {
                console.log(`✅ Mudando para "aguardando_link" para cliente ${cliente.id}`)
                await onStatusChange(cliente.id, 'aguardando_link')
              }}
            >
              ✅ Sim, precisa de site
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    // Estado: Pendente (padrão) - "Precisa de site?"
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            ⚪️ Precisa de site?
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuItem
            onClick={async () => {
              console.log(`✅ Clicou em "Sim, precisa de site" para cliente ${cliente.id}`)
              await onStatusChange(cliente.id, 'aguardando_link')
            }}
          >
            ✅ Sim, precisa de site
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              console.log(`❌ Clicou em "Não precisa de site" para cliente ${cliente.id}`)
              await onStatusChange(cliente.id, 'nao_precisa')
            }}
          >
            ❌ Não precisa de site
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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

  const renderComissionCell = () => {
    const isEditingValue = editingComissionValue === cliente.id
    const valorComissao = cliente.valor_comissao || 0
    
    if (isEditingValue) {
      return (
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            <span className="text-green-400 text-xs mr-1">R$</span>
            <Input
              value={comissionValueInput}
              onChange={(e) => setComissionValueInput(e.target.value)}
              className="h-6 text-xs w-20"
              placeholder="0.00"
              type="number"
              step="0.01"
            />
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => onComissionValueSave(cliente.id, parseFloat(comissionValueInput) || 0)}
          >
            <Check className="w-3 h-3 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={onComissionValueCancel}
          >
            <X className="w-3 h-3 text-red-600" />
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1">
        <Button
          variant={cliente.comissao_paga ? "default" : "outline"}
          size="sm"
          className={`h-7 text-xs flex items-center gap-1 ${
            cliente.comissao_paga 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'border-red-600 bg-red-800 text-red-100 hover:bg-red-700'
          }`}
          onClick={() => onComissionToggle(cliente.id, cliente.comissao_paga || false)}
          disabled={updatingComission === cliente.id}
        >
          {updatingComission === cliente.id ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : cliente.comissao_paga ? (
            <Check className="w-3 h-3 mr-1" />
          ) : null}
          <span>R$ {valorComissao.toFixed(2)}</span>
          {cliente.comissao_paga && <span className="ml-1">✓ Pago</span>}
          {!cliente.comissao_paga && <span className="ml-1">Pendente</span>}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => onComissionValueEdit(cliente.id, valorComissao)}
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
      
      <TableCell>
        {renderPhoneCell()}
      </TableCell>
      
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
        {renderSiteCell()}
      </TableCell>
      
      <TableCell className="hidden xl:table-cell">
        {renderBMCell()}
      </TableCell>
      
      <TableCell>
        {renderComissionCell()}
      </TableCell>
    </TableRow>
  )
}
