
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface ErrorDiagnosticsProps {
  error: string
  errorType: string
  onRetry?: () => void
  onShowGuide?: () => void
}

export function ErrorDiagnostics({ error, errorType, onRetry, onShowGuide }: ErrorDiagnosticsProps) {
  const getErrorConfig = (type: string) => {
    switch (type) {
      case 'INSUFFICIENT_PERMISSIONS':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-red-400" />,
          severity: 'critical',
          bgColor: 'bg-red-950/50 border-red-800',
          textColor: 'text-red-300',
          title: 'Permissões Insuficientes',
          solution: 'Regenerar Access Token com permissões ads_read e ads_management'
        }
      case 'INVALID_TOKEN':
        return {
          icon: <XCircle className="h-4 w-4 text-red-400" />,
          severity: 'critical',
          bgColor: 'bg-red-950/50 border-red-800',
          textColor: 'text-red-300',
          title: 'Token Inválido',
          solution: 'Gerar novo Access Token no Facebook Developers'
        }
      case 'AD_ACCOUNT_NOT_FOUND':
        return {
          icon: <AlertCircle className="h-4 w-4 text-yellow-400" />,
          severity: 'warning',
          bgColor: 'bg-yellow-950/50 border-yellow-800',
          textColor: 'text-yellow-300',
          title: 'Ad Account Não Encontrado',
          solution: 'Verificar ID do Ad Account e permissões de acesso'
        }
      case 'RATE_LIMIT':
        return {
          icon: <AlertCircle className="h-4 w-4 text-blue-400" />,
          severity: 'info',
          bgColor: 'bg-blue-950/50 border-blue-800',
          textColor: 'text-blue-300',
          title: 'Limite de API Atingido',
          solution: 'Aguardar alguns minutos antes de tentar novamente'
        }
      default:
        return {
          icon: <AlertCircle className="h-4 w-4 text-gray-400" />,
          severity: 'info',
          bgColor: 'bg-gray-950/50 border-gray-800',
          textColor: 'text-gray-300',
          title: 'Erro Desconhecido',
          solution: 'Verificar configurações e tentar novamente'
        }
    }
  }

  const config = getErrorConfig(errorType)

  const getQuickActions = () => {
    const actions = []
    
    if (errorType === 'INSUFFICIENT_PERMISSIONS' || errorType === 'INVALID_TOKEN') {
      actions.push(
        <Button
          key="developers"
          variant="outline"
          size="sm"
          onClick={() => window.open('https://developers.facebook.com/tools/explorer/', '_blank')}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Graph API Explorer
        </Button>
      )
    }

    if (errorType === 'AD_ACCOUNT_NOT_FOUND') {
      actions.push(
        <Button
          key="adsmanager"
          variant="outline"
          size="sm"
          onClick={() => window.open('https://adsmanager.facebook.com', '_blank')}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Ads Manager
        </Button>
      )
    }

    if (onShowGuide) {
      actions.push(
        <Button
          key="guide"
          variant="outline"
          size="sm"
          onClick={onShowGuide}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Ver Guia Completo
        </Button>
      )
    }

    if (onRetry) {
      actions.push(
        <Button
          key="retry"
          size="sm"
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Tentar Novamente
        </Button>
      )
    }

    return actions
  }

  return (
    <Alert className={`mb-6 border-gray-800 ${config.bgColor}`}>
      {config.icon}
      <AlertDescription className={config.textColor}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${config.textColor} border-current`}>
              {config.title}
            </Badge>
          </div>
          
          <div className="whitespace-pre-line text-sm">
            {error}
          </div>
          
          <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
            <p className="text-sm font-medium mb-1">💡 Solução Recomendada:</p>
            <p className="text-sm">{config.solution}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {getQuickActions()}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
