
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Save, X, Edit, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

interface ClienteRowSiteProps {
  clienteId: string
  linkSite: string
  sitePago: boolean
  showSitePagoCheckbox: boolean
  editingLink: { clienteId: string, field: string } | null
  linkValue: string
  setLinkValue: (value: string) => void
  onLinkEdit: (clienteId: string, field: string, currentValue: string) => void
  onLinkSave: (clienteId: string) => Promise<boolean>
  onLinkCancel: () => void
  onSitePagoChange?: (clienteId: string, newValue: boolean) => void
}

export function ClienteRowSite({
  clienteId,
  linkSite,
  sitePago,
  showSitePagoCheckbox,
  editingLink,
  linkValue,
  setLinkValue,
  onLinkEdit,
  onLinkSave,
  onLinkCancel,
  onSitePagoChange
}: ClienteRowSiteProps) {
  const [siteLinkInput, setSiteLinkInput] = useState('')
  const [updatingSitePago, setUpdatingSitePago] = useState(false)

  const isEditingSiteLink = editingLink?.clienteId === clienteId && editingLink?.field === 'link_site'

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
    
    if (!formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
      formattedLink = 'https://' + formattedLink
    }

    console.log('🌐 [ClienteRowSite] Abrindo link do site:', {
      linkOriginal: link,
      linkFormatado: formattedLink
    })

    try {
      window.open(formattedLink, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('❌ [ClienteRowSite] Erro ao abrir link:', error)
      toast({
        title: "Erro",
        description: "Não foi possível abrir o link do site",
        variant: "destructive"
      })
    }
  }

  const handleSiteLinkSave = async () => {
    setLinkValue(siteLinkInput)
    const success = await onLinkSave(clienteId)
    if (success) {
      setSiteLinkInput('')
    }
  }

  const handleSitePagoToggle = async () => {
    setUpdatingSitePago(true)
    try {
      const newSitePagoValue = !sitePago
      
      const { error } = await supabase
        .from('todos_clientes')
        .update({ site_pago: newSitePagoValue })
        .eq('id', parseInt(clienteId))

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
        
        if (onSitePagoChange) {
          onSitePagoChange(clienteId, newSitePagoValue)
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

  return (
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
          <div className="flex items-center gap-2">
            {linkSite && linkSite.trim() !== '' ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openSiteLink(linkSite)}
                  className="h-8 bg-green-600 hover:bg-green-700 border-green-600 text-white"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ver Site
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSiteLinkInput(linkSite || '')
                    onLinkEdit(clienteId, 'link_site', linkSite || '')
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
                  onLinkEdit(clienteId, 'link_site', '')
                }}
                className="h-8 text-white"
              >
                <Edit className="h-3 w-3 mr-1" />
                Adicionar Site
              </Button>
            )}
            
            {showSitePagoCheckbox && (
              <div className="flex items-center gap-1 ml-2">
                <Checkbox
                  checked={sitePago || false}
                  onCheckedChange={handleSitePagoToggle}
                  disabled={updatingSitePago}
                  className="h-4 w-4 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <span className="text-xs text-white">Pago</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
