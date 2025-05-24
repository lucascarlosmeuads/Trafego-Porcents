import { useState } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertTriangle, Calendar, Check, X, Edit2, ExternalLink, Loader2, MessageCircle } from 'lucide-react'
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
  onLinkSave: (clienteId: string, field: string) => Promise<boolean>
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
  const [showSiteOptions, setShowSiteOptions] = useState(false)

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

  const renderWhatsAppButton = (telefone: string) => {
    if (!telefone) return <span className="text-xs text-white">-</span>
    
    // Limpar o número removendo caracteres especiais
    const cleanPhone = telefone.replace(/\D/g, '')
    
    // Se não tiver DDD, assumir 55 (Brasil)
    const phoneWithCountry = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone
    
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700 text-white border-green-600"
        onClick={() => window.open(`https://wa.me/${phoneWithCountry}`, '_blank')}
      >
        <MessageCircle className="w-3 h-3 mr-1" />
        WhatsApp
      </Button>
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
    const siteStatus = cliente.site_status || 'pendente'
    const siteUrl = cliente.link_site || ''
    
    // Se está editando o link do site
    const isEditingLink = editingLink?.clienteId === cliente.id && editingLink?.field === 'link_site'
    if (isEditingLink) {
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
            onClick={handleSiteLinkSave}
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

    // Se está mostrando as opções Sim/Não
    if (showSiteOptions) {
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
            onClick={() => handleSiteOptionSelect('aguardando_link')}
          >
            ✅ Precisa de site
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
            onClick={() => handleSiteOptionSelect('nao_precisa')}
          >
            ❌ Não precisa
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => setShowSiteOptions(false)}
          >
            <X className="w-3 h-3 text-red-600" />
          </Button>
        </div>
      )
    }

    // Estados do site com ícone de edição sempre presente
    switch (siteStatus) {
      case 'nao_precisa':
        return (
          <div className="flex items-center gap-1">
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
              ❌ Não precisa
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setShowSiteOptions(true)}
            >
              <Edit2 className="w-3 h-3 text-muted-foreground" />
            </Button>
          </div>
        )

      case 'aguardando_link':
        return (
          <div className="flex items-center gap-1">
            <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">
              🟡 Aguardando link
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => onLinkEdit(cliente.id, 'link_site', siteUrl)}
            >
              <Edit2 className="w-3 h-3 text-muted-foreground" />
            </Button>
          </div>
        )

      case 'finalizado':
        if (siteUrl) {
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
                onClick={() => {
                  // Corrigir a abertura do link: usar exatamente o valor salvo
                  let urlToOpen = siteUrl.trim()
                  
                  // Se não começar com http:// ou https://, adicionar https://
                  if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
                    urlToOpen = `https://${urlToOpen}`
                  }
                  
                  window.open(urlToOpen, '_blank')
                }}
              >
                🌐 Ver site
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => onLinkEdit(cliente.id, 'link_site', siteUrl)}
              >
                <Edit2 className="w-3 h-3 text-muted-foreground" />
              </Button>
            </div>
          )
        } else {
          return (
            <div className="flex items-center gap-1">
              <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">
                🟡 Aguardando link
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => onLinkEdit(cliente.id, 'link_site', siteUrl)}
              >
                <Edit2 className="w-3 h-3 text-muted-foreground" />
              </Button>
            </div>
          )
        }

      default:
        // Estado inicial - traço cinza com opção de editar
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-gray-400 hover:text-gray-600"
              onClick={() => setShowSiteOptions(true)}
            >
              —
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setShowSiteOptions(true)}
            >
              <Edit2 className="w-3 h-3 text-muted-foreground" />
            </Button>
          </div>
        )
    }
  }

  const handleSiteOptionSelect = async (option: string) => {
    console.log('🎯 Selecionando opção do site:', { clienteId: cliente.id, option })
    
    try {
      // Atualizar o site_status
      await onStatusChange(cliente.id, option)
      setShowSiteOptions(false)
    } catch (error) {
      console.error('❌ Erro ao atualizar opção do site:', error)
    }
  }

  const handleSiteLinkSave = async () => {
    console.log('💾 Salvando link do site:', linkValue)
    
    if (!linkValue.trim()) {
      console.error('❌ Link do site está vazio')
      return
    }
    
    try {
      // Salvar o link do site
      const linkSuccess = await onLinkSave(cliente.id, 'link_site')
      
      if (linkSuccess) {
        // Atualizar o status para finalizado
        await onStatusChange(cliente.id, 'finalizado')
        console.log('✅ Link salvo e status atualizado para finalizado')
      } else {
        console.error('❌ Falha ao salvar o link')
      }
    } catch (error) {
      console.error('❌ Erro ao salvar link do site:', error)
    }
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
      
      <TableCell>{renderWhatsAppButton(cliente.telefone || '')}</TableCell>
      
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
