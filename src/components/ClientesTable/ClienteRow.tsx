import { useState, useEffect } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertTriangle, Calendar, Check, X, Edit2, ExternalLink, Loader2, MessageCircle, Eye } from 'lucide-react'
import { STATUS_CAMPANHA, type Cliente, supabase } from '@/lib/supabase'
import { ComissaoButton } from './ComissaoButton'
import { BriefingMaterialsModal } from './BriefingMaterialsModal'

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

  // Validação robusta dos dados do cliente
  if (!cliente || typeof cliente !== 'object') {
    console.error('❌ [ClienteRow] Cliente inválido:', cliente)
    return (
      <TableRow className="border-border hover:bg-muted/20 transition-colors">
        <TableCell colSpan={12} className="text-center text-red-500 py-4">
          ❌ Dados do cliente inválidos
        </TableCell>
      </TableRow>
    )
  }

  // Verificar campos obrigatórios com fallbacks seguros - incluindo TODOS os campos do tipo Cliente
  const safeCliente: Cliente = {
    id: cliente.id || `temp-${index}`,
    nome_cliente: cliente.nome_cliente || 'Nome não informado',
    telefone: cliente.telefone || '',
    email_cliente: cliente.email_cliente || '',
    vendedor: cliente.vendedor || '',
    email_gestor: cliente.email_gestor || '',
    data_venda: cliente.data_venda || '',
    status_campanha: cliente.status_campanha || 'Preenchimento do Formulário',
    data_limite: cliente.data_limite || '',
    link_grupo: cliente.link_grupo || '',
    link_briefing: cliente.link_briefing || '',
    link_criativo: cliente.link_criativo || '',
    site_status: cliente.site_status || 'pendente',
    link_site: cliente.link_site || '',
    numero_bm: cliente.numero_bm || '',
    comissao_paga: Boolean(cliente.comissao_paga),
    valor_comissao: Number(cliente.valor_comissao || 60),
    created_at: cliente.created_at || '',
    descricao_problema: cliente.descricao_problema || '',
    saque_solicitado: Boolean(cliente.saque_solicitado || false)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  const calculateDateLimit = (dataVenda: string | null) => {
    if (!dataVenda) return { text: '-', style: '' }
    
    try {
      const venda = new Date(dataVenda)
      if (isNaN(venda.getTime())) return { text: '-', style: '' }
      
      const limite = new Date(venda)
      limite.setDate(limite.getDate() + 15)
      
      const hoje = new Date()
      const diffTime = limite.getTime() - hoje.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (safeCliente.status_campanha === 'No Ar' || safeCliente.status_campanha === 'Otimização') {
        return {
          text: '✅ Cumprido',
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
    } catch (error) {
      console.error('❌ [ClienteRow] Erro ao calcular data limite:', error)
      return { text: '-', style: '' }
    }
  }

  const renderWhatsAppButton = (telefone: string) => {
    if (!telefone || telefone.trim() === '') {
      return <span className="text-xs text-contrast">-</span>
    }
    
    try {
      const cleanPhone = telefone.replace(/\D/g, '')
      if (cleanPhone.length < 8) {
        return <span className="text-xs text-contrast">Tel. inválido</span>
      }
      
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
    } catch (error) {
      console.error('❌ [ClienteRow] Erro ao renderizar WhatsApp:', error)
      return <span className="text-xs text-contrast">Erro</span>
    }
  }

  const renderLinkCell = (url: string, field: string, label: string) => {
    const isEditing = editingLink?.clienteId === safeCliente.id && editingLink?.field === field
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            value={linkValue || ''}
            onChange={(e) => setLinkValue(e.target.value)}
            className="h-6 text-xs"
            placeholder="https://..."
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => onLinkSave(safeCliente.id, field)}
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

    if (!url || url.trim() === '') {
      return (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => onLinkEdit(safeCliente.id, field, url || '')}
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
          onClick={() => {
            try {
              window.open(url, '_blank')
            } catch (error) {
              console.error('❌ [ClienteRow] Erro ao abrir link:', error)
            }
          }}
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Ver
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => onLinkEdit(safeCliente.id, field, url)}
        >
          <Edit2 className="w-3 h-3 text-muted-foreground" />
        </Button>
      </div>
    )
  }

  const renderSiteCell = () => {
    const siteStatus = safeCliente.site_status
    const siteUrl = safeCliente.link_site
    
    const isEditingLink = editingLink?.clienteId === safeCliente.id && editingLink?.field === 'link_site'
    if (isEditingLink) {
      return (
        <div className="flex items-center gap-1">
          <Input
            value={linkValue || ''}
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
              onClick={() => {
                onLinkEdit(safeCliente.id, 'link_site', '')
              }}
            >
              <Edit2 className="w-3 h-3 text-muted-foreground" />
            </Button>
          </div>
        )

      case 'finalizado':
        if (siteUrl && siteUrl.trim() !== '') {
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
                onClick={() => {
                  try {
                    let urlToOpen = siteUrl.trim()
                    
                    if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
                      urlToOpen = `https://${urlToOpen}`
                    }
                    
                    window.open(urlToOpen, '_blank')
                  } catch (error) {
                    console.error('❌ [ClienteRow] Erro ao abrir site:', error)
                  }
                }}
              >
                🌐 Ver site
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
                onClick={() => {
                  onLinkEdit(safeCliente.id, 'link_site', '')
                }}
              >
                <Edit2 className="w-3 h-3 text-muted-foreground" />
              </Button>
            </div>
          )
        }

      default:
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
    try {
      console.log('🎯 Selecionando opção do site:', { clienteId: safeCliente.id, option })
      
      await onStatusChange(safeCliente.id, option)
      setShowSiteOptions(false)
      
      if (option === 'aguardando_link') {
        console.log('🧹 Limpando link_site existente')
        if (safeCliente.link_site) {
          await onLinkSave(safeCliente.id, 'link_site')
        }
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar opção do site:', error)
    }
  }

  const handleSiteLinkSave = async () => {
    try {
      console.log('💾 Salvando link do site:', linkValue)
      
      if (!linkValue || linkValue.trim() === '') {
        console.error('❌ Link do site está vazio')
        return
      }
      
      const linkSuccess = await onLinkSave(safeCliente.id, 'link_site')
      
      if (linkSuccess) {
        await onStatusChange(safeCliente.id, 'finalizado')
        console.log('✅ Link salvo e status atualizado para finalizado')
      } else {
        console.error('❌ Falha ao salvar o link')
      }
    } catch (error) {
      console.error('❌ Erro ao salvar link do site:', error)
    }
  }

  const renderBMCell = () => {
    const isEditing = editingBM === safeCliente.id
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            value={bmValue || ''}
            onChange={(e) => setBmValue(e.target.value)}
            className="h-6 text-xs"
            placeholder="Número BM"
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => onBMSave(safeCliente.id)}
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
        <span className="text-xs text-contrast">
          {safeCliente.numero_bm || '-'}
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => onBMEdit(safeCliente.id, safeCliente.numero_bm)}
        >
          <Edit2 className="w-3 h-3 text-muted-foreground" />
        </Button>
      </div>
    )
  }

  const isGestorDashboard = window.location.pathname.includes('gestor') || selectedManager !== 'Todos os Clientes'
  const dateLimit = calculateDateLimit(safeCliente.data_venda)

  try {
    return (
      <TableRow className="border-border hover:bg-muted/20 transition-colors">
        <TableCell className="font-mono text-xs text-contrast">
          {String(index + 1).padStart(3, '0')}
        </TableCell>
        
        <TableCell>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-contrast">{formatDate(safeCliente.data_venda)}</span>
          </div>
        </TableCell>
        
        <TableCell className="font-medium">
          <div className="max-w-[200px] truncate text-contrast">
            {safeCliente.nome_cliente}
          </div>
        </TableCell>
        
        <TableCell>{renderWhatsAppButton(safeCliente.telefone)}</TableCell>
        
        <TableCell>
          <div className="max-w-[150px] truncate text-contrast">
            {safeCliente.email_gestor}
          </div>
        </TableCell>
        
        <TableCell>
          <Select 
            value={safeCliente.status_campanha}
            onValueChange={(value) => onStatusChange(safeCliente.id, value)}
            disabled={updatingStatus === safeCliente.id}
          >
            <SelectTrigger className="h-8 w-48 bg-background border-border text-foreground">
              <SelectValue>
                {updatingStatus === safeCliente.id ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Atualizando...</span>
                  </div>
                ) : (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(safeCliente.status_campanha)}`}>
                    {safeCliente.status_campanha || 'Sem status'}
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
          <BriefingMaterialsModal
            emailCliente={safeCliente.email_cliente}
            nomeCliente={safeCliente.nome_cliente}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
              >
                <Eye className="w-3 h-3 mr-1" />
                Ver
              </Button>
            }
          />
        </TableCell>
        
        <TableCell className="hidden lg:table-cell">
          {renderSiteCell()}
        </TableCell>
        
        <TableCell className="hidden xl:table-cell">
          {renderBMCell()}
        </TableCell>
        
        <TableCell>
          <ComissaoButton
            cliente={safeCliente}
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
  } catch (renderError) {
    console.error('❌ [ClienteRow] Erro crítico na renderização:', renderError, safeCliente)
    return (
      <TableRow className="border-border hover:bg-muted/20 transition-colors">
        <TableCell colSpan={12} className="text-center text-red-500 py-4">
          ❌ Erro ao renderizar cliente: {safeCliente.nome_cliente} (ID: {safeCliente.id})
        </TableCell>
      </TableRow>
    )
  }
}
