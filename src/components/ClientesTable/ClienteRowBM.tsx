
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Save, X, Edit, Settings, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState, useEffect } from 'react'
import { ClienteMetaAdsModalSimplified } from './ClienteMetaAdsModalSimplified'
import { ClienteMetaAdsModal } from './ClienteMetaAdsModal'
import { useAuth } from '@/hooks/useAuth'
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
  const [refreshing, setRefreshing] = useState(false)
  const { isGestor, isAdmin } = useAuth()

  // Determinar se deve usar o modal completo (para gestores) ou simplificado (para clientes)
  const useFullModal = isGestor || isAdmin

  // Verificar se cliente tem configuração Meta Ads
  const checkMetaAdsConfig = async () => {
    try {
      setRefreshing(true)
      console.log('🔍 [ClienteRowBM] Verificando config Meta Ads para cliente:', clienteId)
      
      // Verificar config específica do cliente
      const { data: configData, error } = await supabase
        .from('meta_ads_configs')
        .select('id, api_id, access_token, ad_account_id')
        .eq('cliente_id', parseInt(clienteId))
        .maybeSingle()

      console.log('🔍 [ClienteRowBM] Config resultado:', { configData, error })

      if (configData && configData.api_id && configData.access_token && configData.ad_account_id) {
        setHasMetaAdsConfig(true)
        console.log('✅ [ClienteRowBM] Cliente tem Meta Ads configurado')
      } else {
        setHasMetaAdsConfig(false)
        console.log('❌ [ClienteRowBM] Cliente não tem Meta Ads configurado')
      }
    } catch (error) {
      console.error('❌ [ClienteRowBM] Erro ao verificar config:', error)
      setHasMetaAdsConfig(false)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    checkMetaAdsConfig()
  }, [clienteId])

  // Refresh depois que o modal fecha
  const handleModalClose = (open: boolean) => {
    setMetaAdsModalOpen(open)
    if (!open) {
      // Aguardar um pouco e verificar novamente
      setTimeout(() => {
        checkMetaAdsConfig()
      }, 1000)
    }
  }

  const handleBMClick = () => {
    setMetaAdsModalOpen(true)
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
          tooltip: 'Meta Ads configurado - Clique para ver métricas',
          className: 'bg-green-600 hover:bg-green-700 text-white border-green-600'
        }
      case 'legacy':
        return {
          icon: <Edit className="h-3 w-3" />,
          text: 'BM',
          variant: 'outline' as const,
          tooltip: `BM: ${numeroBM} - Clique para configurar Meta Ads`,
          className: 'text-orange-600 border-orange-600 hover:bg-orange-50'
        }
      case 'loading':
        return {
          icon: refreshing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Settings className="h-3 w-3 animate-spin" />,
          text: '...',
          variant: 'outline' as const,
          tooltip: 'Verificando configuração...',
          className: 'text-blue-600 border-blue-600'
        }
      default:
        return {
          icon: <WifiOff className="h-3 w-3" />,
          text: 'BM',
          variant: 'outline' as const,
          tooltip: 'Clique para configurar Meta Ads',
          className: 'text-gray-600 border-gray-600 hover:bg-gray-50'
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
                    className={`h-6 w-6 p-0 text-xs font-bold ${getBMDisplay().className || ''}`}
                    disabled={loading}
                  >
                    {getBMDisplay().icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getBMDisplay().tooltip}</p>
                </TooltipContent>
              </Tooltip>

              {/* Botão de refresh simplificado */}
              {!loading && (
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => checkMetaAdsConfig()}
                      className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                      disabled={refreshing}
                    >
                      <RefreshCw className={`h-2 w-2 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Atualizar status</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}

          {/* Renderizar modal baseado no tipo de usuário */}
          {useFullModal ? (
            <ClienteMetaAdsModal
              open={metaAdsModalOpen}
              onOpenChange={handleModalClose}
              clienteId={clienteId}
              nomeCliente={nomeCliente}
            />
          ) : (
            <ClienteMetaAdsModalSimplified
              open={metaAdsModalOpen}
              onOpenChange={handleModalClose}
              clienteId={clienteId}
              nomeCliente={nomeCliente}
            />
          )}
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
              className={`h-8 flex items-center gap-2 ${getBMDisplay().className || ''}`}
              disabled={loading}
            >
              {getBMDisplay().icon}
              {hasMetaAdsConfig ? 'Ver Métricas' : 'Configurar Meta Ads'}
            </Button>

            {/* Botão de refresh */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => checkMetaAdsConfig()}
              className="h-8 w-8 p-0 opacity-50 hover:opacity-100"
              disabled={refreshing}
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Renderizar modal baseado no tipo de usuário */}
          {useFullModal ? (
            <ClienteMetaAdsModal
              open={metaAdsModalOpen}
              onOpenChange={handleModalClose}
              clienteId={clienteId}
              nomeCliente={nomeCliente}
            />
          ) : (
            <ClienteMetaAdsModalSimplified
              open={metaAdsModalOpen}
              onOpenChange={handleModalClose}
              clienteId={clienteId}
              nomeCliente={nomeCliente}
            />
          )}
        </>
      )}
    </div>
  )
}
