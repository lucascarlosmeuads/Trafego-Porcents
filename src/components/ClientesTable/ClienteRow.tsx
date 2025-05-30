import { useState } from 'react'
import { TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Phone, 
  Save, 
  X, 
  Edit, 
  ExternalLink, 
  MessageCircle,
  Eye
} from 'lucide-react'
import { StatusSelect } from './StatusSelect'
import { SiteStatusSelect } from './SiteStatusSelect'
import { ComissaoButton } from './ComissaoButton'
import { BriefingMaterialsModal } from './BriefingMaterialsModal'
import { Cliente, type StatusCampanha } from '@/lib/supabase'
import { getDataLimiteDisplayForGestor } from '@/utils/dateUtils'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

interface ClienteRowProps {
  cliente: Cliente
  selectedManager: string
  index: number
  isAdmin?: boolean
  showEmailGestor?: boolean
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
  onStatusChange: (clienteId: string, newStatus: StatusCampanha) => void
  onSiteStatusChange: (clienteId: string, newStatus: string) => void
  onLinkEdit: (clienteId: string, field: string, currentValue: string) => void
  onLinkSave: (clienteId: string) => Promise<boolean>
  onLinkCancel: () => void
  onBMEdit: (clienteId: string, currentValue: string) => void
  onBMSave: (clienteId: string) => void
  onBMCancel: () => void
  onComissionToggle: (clienteId: string, currentStatus: boolean) => Promise<boolean>
  onComissionValueEdit: (clienteId: string, currentValue: number) => void
  onComissionValueSave: (clienteId: string, newValue: number) => void
  onComissionValueCancel: () => void
  onSitePagoChange?: (clienteId: string, newValue: boolean) => void
}

export function ClienteRow({
  cliente,
  selectedManager,
  index,
  isAdmin = false,
  showEmailGestor = false,
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
  onSiteStatusChange,
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
  onSitePagoChange
}: ClienteRowProps) {
  const [siteLinkInput, setSiteLinkInput] = useState('')
  const [updatingSitePago, setUpdatingSitePago] = useState(false)

  const formatDate = (dateString: string) => {
    if (!dateString || dateString.trim() === '') return 'Não informado'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  const formatPhone = (phone: string) => {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  const openWhatsApp = (phone: string, name: string) => {
    if (!phone) return
    const cleanPhone = phone.replace(/\D/g, '')
    const message = `Olá ${name}! Sou da equipe de tráfego pago. Como posso te ajudar?`
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const openSiteLink = (link: string) => {
    if (!link || link.trim() === '') {
      toast({
        title: "Erro",
        description: "Link do site não encontrado",
        variant: "destructive"
      })
      return
    }

    let formattedLink = link.trim()
    
    // Verificar se o link tem protocolo (http:// ou https://)
    if (!formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
      formattedLink = 'https://' + formattedLink
    }

    console.log('🌐 [ClienteRow] Abrindo link do site:', {
      linkOriginal: link,
      linkFormatado: formattedLink,
      cliente: cliente.nome_cliente
    })

    try {
      window.open(formattedLink, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('❌ [ClienteRow] Erro ao abrir link:', error)
      toast({
        title: "Erro",
        description: "Não foi possível abrir o link do site",
        variant: "destructive"
      })
    }
  }

  const handleSiteLinkSave = async () => {
    setLinkValue(siteLinkInput)
    const success = await onLinkSave(cliente.id!.toString())
    if (success) {
      setSiteLinkInput('')
    }
  }

  const handleSitePagoToggle = async () => {
    setUpdatingSitePago(true)
    try {
      const newSitePagoValue = !cliente.site_pago
      
      const { error } = await supabase
        .from('todos_clientes')
        .update({ site_pago: newSitePagoValue })
        .eq('id', parseInt(cliente.id!.toString()))

      if (error) {
        console.error('❌ Erro ao atualizar site_pago:', error)
        toast({
          title: "Erro",
          description: "Falha ao atualizar status de pagamento do site",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Sucesso",
          description: newSitePagoValue ? "Site marcado como pago" : "Site marcado como não pago"
        })
        
        // Atualizar o estado local via callback
        if (onSitePagoChange) {
          onSitePagoChange(cliente.id!.toString(), newSitePagoValue)
        }
      }
    } catch (error) {
      console.error('💥 Erro ao atualizar site_pago:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status de pagamento",
        variant: "destructive"
      })
    } finally {
      setUpdatingSitePago(false)
    }
  }

  const isEditingSiteLink = editingLink?.clienteId === cliente.id!.toString() && editingLink?.field === 'link_site'
  
  // Renderização da célula Data Limite - PADRONIZADA
  const renderDataLimiteCell = () => {
    console.log(`📅 [ClienteRow] Renderizando Data Limite para: ${cliente.nome_cliente}`)
    console.log(`📅 [ClienteRow] Dados do cliente:`, {
      selectedManager,
      clienteId: cliente.id,
      dataVenda: cliente.data_venda,
      createdAt: cliente.created_at,
      statusCampanha: cliente.status_campanha
    })
    
    // Usar sempre a função padronizada para ambos os contextos
    const dataLimiteDisplay = getDataLimiteDisplayForGestor(
      cliente.data_venda || '', 
      cliente.created_at, 
      cliente.status_campanha || 'Cliente Novo'
    )
    
    console.log(`📅 [ClienteRow] Resultado da visualização:`, dataLimiteDisplay)
    
    return (
      <TableCell className="text-white text-sm">
        <Badge className={`${dataLimiteDisplay.classeCor} rounded-md`}>
          {dataLimiteDisplay.texto}
        </Badge>
      </TableCell>
    )
  }

  return (
    <TableRow 
      className="border-border hover:bg-muted/20" 
      style={{ backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)' }}
    >
      <TableCell className="text-white text-sm">
        {formatDate(cliente.data_venda || cliente.created_at)}
      </TableCell>

      <TableCell className="text-white text-sm max-w-[150px]">
        <div className="truncate" title={cliente.nome_cliente || ''}>
          {cliente.nome_cliente || 'Não informado'}
        </div>
      </TableCell>

      <TableCell className="text-white text-sm">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">
            {formatPhone(cliente.telefone || '')}
          </span>
          {cliente.telefone && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700 border-green-600"
              onClick={() => openWhatsApp(cliente.telefone!, cliente.nome_cliente || 'Cliente')}
              title="Abrir WhatsApp"
            >
              <MessageCircle className="h-3 w-3 text-white" />
            </Button>
          )}
        </div>
      </TableCell>

      <TableCell className="text-white text-sm max-w-[180px]">
        <div className="truncate" title={cliente.email_cliente || ''}>
          {cliente.email_cliente || 'Não informado'}
        </div>
      </TableCell>

      {(isAdmin || showEmailGestor) && (
        <TableCell className="text-white text-sm max-w-[180px]">
          <div className="truncate" title={cliente.email_gestor || ''}>
            {cliente.email_gestor || 'Não informado'}
          </div>
        </TableCell>
      )}

      <TableCell>
        <StatusSelect
          value={(cliente.status_campanha || 'Cliente Novo') as StatusCampanha}
          onValueChange={(newStatus) => onStatusChange(cliente.id!.toString(), newStatus as StatusCampanha)}
          disabled={updatingStatus === cliente.id!.toString()}
          isUpdating={updatingStatus === cliente.id!.toString()}
          getStatusColor={getStatusColor}
        />
      </TableCell>

      <TableCell>
        <SiteStatusSelect
          value={cliente.site_status || 'pendente'}
          onValueChange={(newStatus) => onSiteStatusChange(cliente.id!.toString(), newStatus)}
          disabled={updatingStatus === cliente.id!.toString()}
          isUpdating={updatingStatus === cliente.id!.toString()}
        />
      </TableCell>

      {renderDataLimiteCell()}

      <TableCell>
        <BriefingMaterialsModal 
          emailCliente={cliente.email_cliente || ''}
          nomeCliente={cliente.nome_cliente || ''}
          trigger={
            <Button
              size="sm"
              variant="outline"
              className="h-8 bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver materiais
            </Button>
          }
        />
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          {isEditingSiteLink ? (
            <>
              <Input
                value={siteLinkInput}
                onChange={(e) => setSiteLinkInput(e.target.value)}
                placeholder="https://exemplo.com"
                className="h-8 w-48 bg-background text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSiteLinkSave()
                  }
                  if (e.key === 'Escape') {
                    onLinkCancel()
                    setSiteLinkInput('')
                  }
                }}
              />
              <Button 
                size="sm" 
                onClick={handleSiteLinkSave}
                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
              >
                <Save className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  onLinkCancel()
                  setSiteLinkInput('')
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              {/* Botões de site */}
              <div className="flex items-center gap-2">
                {cliente.link_site && cliente.link_site.trim() !== '' ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openSiteLink(cliente.link_site!)}
                      className="h-8 bg-green-600 hover:bg-green-700 border-green-600 text-white"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ver Site
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSiteLinkInput(cliente.link_site || '')
                        onLinkEdit(cliente.id!.toString(), 'link_site', cliente.link_site || '')
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSiteLinkInput('')
                      onLinkEdit(cliente.id!.toString(), 'link_site', '')
                    }}
                    className="h-8 text-white"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Adicionar Site
                  </Button>
                )}
                
                {/* Checkbox "Pago" - SEMPRE VISÍVEL */}
                <div className="flex items-center gap-1 ml-2">
                  <Checkbox
                    checked={cliente.site_pago || false}
                    onCheckedChange={handleSitePagoToggle}
                    disabled={updatingSitePago}
                    className="h-4 w-4 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <span className="text-xs text-white">Pago</span>
                </div>
              </div>
            </>
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          {editingBM === cliente.id!.toString() ? (
            <>
              <Input
                value={bmValue}
                onChange={(e) => setBmValue(e.target.value)}
                placeholder="Número BM"
                className="h-8 w-32 bg-background text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onBMSave(cliente.id!.toString())
                  }
                  if (e.key === 'Escape') {
                    onBMCancel()
                  }
                }}
              />
              <Button 
                size="sm" 
                onClick={() => onBMSave(cliente.id!.toString())}
                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
              >
                <Save className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onBMCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              {cliente.numero_bm && cliente.numero_bm.trim() !== '' ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-white border-white">
                    {cliente.numero_bm}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onBMEdit(cliente.id!.toString(), cliente.numero_bm || '')}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onBMEdit(cliente.id!.toString(), '')}
                  className="h-8 text-white"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Adicionar BM
                </Button>
              )}
            </>
          )}
        </div>
      </TableCell>

      <TableCell>
        <ComissaoButton
          cliente={cliente}
          isGestorDashboard={selectedManager?.includes('@') && selectedManager !== 'Todos os Clientes'}
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
