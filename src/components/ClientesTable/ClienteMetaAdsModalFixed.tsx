
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, CheckCircle, Loader2, BarChart3 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useClienteMetaAdsFixed } from '@/hooks/useClienteMetaAdsFixed'

// Use the same Cliente type as ClienteRow to avoid conflicts
interface Cliente {
  id: string
  nome_cliente: string
  email_cliente: string
  telefone_cliente?: string
  nome_gestor?: string
  data_venda?: string
  status_cliente?: string
}

interface ClienteMetaAdsModalFixedProps {
  isOpen: boolean
  onClose: () => void
  cliente: Cliente
}

export function ClienteMetaAdsModalFixed({ isOpen, onClose, cliente }: ClienteMetaAdsModalFixedProps) {
  const [config, setConfig] = useState({
    api_id: '',
    app_secret: '',
    access_token: '',
    ad_account_id: ''
  })

  const {
    saveConfig,
    testConnection,
    loading,
    testing,
    error,
    success,
    connectionStatus
  } = useClienteMetaAdsFixed(cliente.id)

  const handleSave = async () => {
    const result = await saveConfig(config)
    if (result.success) {
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }

  const handleTest = async () => {
    await testConnection(config)
  }

  const isFormValid = config.api_id && config.app_secret && config.access_token && config.ad_account_id

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Configurar Meta Ads - {cliente.nome_cliente}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {connectionStatus && (
            <Alert className={connectionStatus.includes('sucesso') ? 'border-green-500 bg-green-50' : 'border-amber-500 bg-amber-50'}>
              <AlertCircle className={`h-4 w-4 ${connectionStatus.includes('sucesso') ? 'text-green-600' : 'text-amber-600'}`} />
              <AlertDescription className={connectionStatus.includes('sucesso') ? 'text-green-800' : 'text-amber-800'}>
                {connectionStatus}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="api_id">App ID *</Label>
              <Input
                id="api_id"
                value={config.api_id}
                onChange={(e) => setConfig(prev => ({ ...prev, api_id: e.target.value }))}
                placeholder="Ex: 123456789012345"
              />
            </div>

            <div>
              <Label htmlFor="app_secret">App Secret *</Label>
              <Input
                id="app_secret"
                type="password"
                value={config.app_secret}
                onChange={(e) => setConfig(prev => ({ ...prev, app_secret: e.target.value }))}
                placeholder="Digite o App Secret"
              />
            </div>

            <div>
              <Label htmlFor="access_token">Access Token *</Label>
              <Input
                id="access_token"
                type="password"
                value={config.access_token}
                onChange={(e) => setConfig(prev => ({ ...prev, access_token: e.target.value }))}
                placeholder="Digite o Access Token"
              />
            </div>

            <div>
              <Label htmlFor="ad_account_id">Ad Account ID *</Label>
              <Input
                id="ad_account_id"
                value={config.ad_account_id}
                onChange={(e) => setConfig(prev => ({ ...prev, ad_account_id: e.target.value }))}
                placeholder="Ex: act_123456789"
              />
            </div>
          </div>

          <Separator />

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={!isFormValid || testing}
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                'Testar Conexão'
              )}
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isFormValid || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Configuração'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
