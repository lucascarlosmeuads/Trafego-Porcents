
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Save, X, Edit, Settings, Wifi, WifiOff } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState, useEffect } from 'react'
import { ClienteMetaAdsModal } from './ClienteMetaAdsModal'
import { supabase } from '@/lib/supabase'

interface ClienteRowBMProps {
  clienteId: string
  numeroBM: string
  nomeCliente: string
  editingBM: string | null
  bmValue: string
  setBmValue: (value: string) => void
  onBMEdit: (clienteId: string, currentValue: string) => void
  onBMSave: (clienteId: string) => void
  onBMCancel: () => void
  compact?: boolean
}

export function ClienteRowBM({
  clienteId,
  numeroBM,
  nomeCliente,
  editingBM,
  bmValue,
  setBmValue,
  onBMEdit,
  onBMSave,
  onBMCancel,
  compact = false
}: ClienteRowBMProps) {
  const isEditing = editingBM === clienteId
  const [metaAdsModalOpen, setMetaAdsModalOpen] = useState(false)
  const [hasMetaAdsConfig, setHasMetaAdsConfig] = useState(false)
  const [loading, setLoading] = useState(true)

  // Verificar se cliente tem configuração Meta Ads
  useEffect(() => {
    const checkMetaAdsConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('meta_ads_configs')
          .select('id, api_id, access_token, ad_account_id')
          .eq('cliente_id', clienteId)
          .single()

        if (data && data.api_id && data.access_token && data.ad_account_id) {
          setHasMetaAdsConfig(true)
        } else {
          setHasMetaAdsConfig(false)
        }
      } catch (error) {
        console.log('Cliente sem configuração Meta Ads')
        setHasMetaAdsConfig(false)
      } finally {
        setLoading(false)
      }
    }

    checkMetaAdsConfig()
  }, [clienteId])

  const handleBMClick = () => {
    // Se já tem configuração do Meta Ads, abrir modal
    if (hasMetaAdsConfig) {
      setMetaAdsModalOpen(true)
    } else {
      // Se não tem, abrir modal para configurar pela primeira vez
      setMetaAdsModalOpen(true)
    }
  }

  const getBMStatus = () => {
    if (loading) return 'loading'
    if (hasMetaAdsConfig) return 'configured'
    if (numeroBM && numeroBM.trim() !== '') return 'legacy'
    return 'empty'
  }

  const getBMDisplay = () => {
    const status = getBMStatus()
    
    switch (status) {
      case 'configured':
        return {
          icon: <Wifi className="h-3 w-3" />,
          text: 'ADS',
          variant: 'default' as const,
          tooltip: 'Meta Ads configurado - Clique para ver métricas'
        }
      case 'legacy':
        return {
          icon: <Edit className="h-3 w-3" />,
          text: 'BM',
          variant: 'outline' as const,
          tooltip: `BM: ${numeroBM} - Clique para configurar Meta Ads`
        }
      case 'loading':
        return {
          icon: <Settings className="h-3 w-3 animate-spin" />,
          text: '...',
          variant: 'outline' as const,
          tooltip: 'Verificando configuração...'
        }
      default:
        return {
          icon: <WifiOff className="h-3 w-3" />,
          text: 'BM',
          variant: 'outline' as const,
          tooltip: 'Clique para configurar Meta Ads'
        }
    }
  }

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <Input
                value={bmValue}
                onChange={(e) => setBmValue(e.target.value)}
                placeholder="BM"
                className="h-6 w-16 bg-background text-white text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onBMSave(clienteId)
                  }
                  if (e.key === 'Escape') {
                    onBMCancel()
                  }
                }}
              />
              <Button 
                size="sm" 
                onClick={() => onBMSave(clienteId)}
                className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
              >
                <Save className="h-2 w-2" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onBMCancel}
                className="h-6 w-6 p-0"
              >
                <X className="h-2 w-2" />
              </Button>
            </>
          ) : (
            <>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    size="sm"
                    variant={getBMDisplay().variant}
                    onClick={handleBMClick}
                    className={`h-6 w-6 p-0 text-xs font-bold ${
                      hasMetaAdsConfig 
                        ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                        : ''
                    }`}
                  >
                    {getBMDisplay().icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getBMDisplay().tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}

          <ClienteMetaAdsModal
            open={metaAdsModalOpen}
            onOpenChange={setMetaAdsModalOpen}
            clienteId={clienteId}
            nomeCliente={nomeCliente}
          />
        </div>
      </TooltipProvider>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <>
          <Input
            value={bmValue}
            onChange={(e) => setBmValue(e.target.value)}
            placeholder="Número BM"
            className="h-8 w-32 bg-background text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onBMSave(clienteId)
              }
              if (e.key === 'Escape') {
                onBMCancel()
              }
            }}
          />
          <Button 
            size="sm" 
            onClick={() => onBMSave(clienteId)}
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
          <div className="flex items-center gap-2">
            {/* Badge do BM legado se existir */}
            {numeroBM && numeroBM.trim() !== '' && (
              <Badge variant="outline" className="text-white border-white">
                {numeroBM}
              </Badge>
            )}
            
            {/* Botão principal do Meta Ads */}
            <Button
              size="sm"
              variant={getBMDisplay().variant}
              onClick={handleBMClick}
              className={`h-8 flex items-center gap-2 ${
                hasMetaAdsConfig 
                  ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                  : 'text-white'
              }`}
            >
              {getBMDisplay().icon}
              {hasMetaAdsConfig ? 'Ver Métricas' : 'Configurar Meta Ads'}
            </Button>
          </div>

          <ClienteMetaAdsModal
            open={metaAdsModalOpen}
            onOpenChange={setMetaAdsModalOpen}
            clienteId={clienteId}
            nomeCliente={nomeCliente}
          />
        </>
      )}
    </div>
  )
}
