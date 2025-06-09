
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Copy
} from 'lucide-react'
import { toast } from 'sonner'

interface PermissionsGuideProps {
  errorType?: string
  onClose?: () => void
}

export function PermissionsGuide({ errorType, onClose }: PermissionsGuideProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado para a área de transferência!')
  }

  const isPermissionError = errorType === 'INSUFFICIENT_PERMISSIONS' || errorType === 'INVALID_TOKEN'

  return (
    <Card className="bg-gray-900 border-gray-800 mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-400" />
          Guia de Configuração - Meta Ads API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Passo 1: Access Token */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <h3 className="text-lg font-semibold text-white">Gerar Access Token com Permissões Corretas</h3>
          </div>
          
          {isPermissionError && (
            <Alert className="border-red-800 bg-red-950/50">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                <strong>Problema Detectado:</strong> Seu Access Token não possui as permissões necessárias para acessar dados de campanhas.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
              <li>
                Acesse o{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-400 hover:text-blue-300"
                  onClick={() => window.open('https://developers.facebook.com/tools/explorer/', '_blank')}
                >
                  Graph API Explorer <ExternalLink className="h-3 w-3 inline ml-1" />
                </Button>
              </li>
              <li>Selecione seu App no dropdown</li>
              <li>Clique em <Badge variant="outline" className="text-xs">Generate Access Token</Badge></li>
              <li>
                <strong>IMPORTANTE:</strong> Selecione estas permissões:
                <div className="mt-2 flex gap-2">
                  <Badge 
                    variant="outline" 
                    className="text-green-400 border-green-400 cursor-pointer hover:bg-green-950"
                    onClick={() => copyToClipboard('ads_read')}
                  >
                    ads_read <Copy className="h-3 w-3 ml-1" />
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="text-green-400 border-green-400 cursor-pointer hover:bg-green-950"
                    onClick={() => copyToClipboard('ads_management')}
                  >
                    ads_management <Copy className="h-3 w-3 ml-1" />
                  </Badge>
                </div>
              </li>
              <li>Clique em <Badge variant="outline" className="text-xs">Generate Access Token</Badge></li>
              <li>Copie o token gerado (deve ter centenas de caracteres)</li>
            </ol>
          </div>
        </div>

        {/* Passo 2: Ad Account */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <h3 className="text-lg font-semibold text-white">Verificar Ad Account ID</h3>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
              <li>
                Acesse o{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-400 hover:text-blue-300"
                  onClick={() => window.open('https://adsmanager.facebook.com', '_blank')}
                >
                  Facebook Ads Manager <ExternalLink className="h-3 w-3 inline ml-1" />
                </Button>
              </li>
              <li>Na URL, procure um número após "/accounts/"</li>
              <li>
                Formato correto: 
                <Badge variant="outline" className="text-green-400 border-green-400 ml-2">
                  act_1234567890
                </Badge>
              </li>
              <li>Se não começar com "act_", adicione automaticamente</li>
            </ol>
          </div>
        </div>

        {/* Passo 3: Permissões do Ad Account */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <h3 className="text-lg font-semibold text-white">Verificar Permissões do Ad Account</h3>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-300 mb-3">
              Certifique-se de que você tem acesso ao Ad Account:
            </p>
            <ul className="space-y-1 text-sm text-gray-300 list-disc list-inside">
              <li>Você deve ser <Badge variant="outline" className="text-xs">Admin</Badge> ou <Badge variant="outline" className="text-xs">Advertiser</Badge> do Ad Account</li>
              <li>O Ad Account deve estar ativo e não suspenso</li>
              <li>Se o Ad Account pertence a outra pessoa/empresa, solicite acesso</li>
            </ul>
          </div>
        </div>

        {/* Checklist Final */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Checklist Final
          </h3>
          
          <div className="bg-green-950/30 p-4 rounded-lg border border-green-800">
            <ul className="space-y-2 text-sm text-green-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Access Token gerado com permissões <code>ads_read</code> e <code>ads_management</code>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Ad Account ID no formato correto (<code>act_1234567890</code>)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Acesso confirmado ao Ad Account no Ads Manager
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                App ID e App Secret do Facebook Developers
              </li>
            </ul>
          </div>
        </div>

        {onClose && (
          <div className="pt-4 border-t border-gray-700">
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
              Entendi, Fechar Guia
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
