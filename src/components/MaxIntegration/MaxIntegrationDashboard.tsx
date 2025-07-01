
import { useState } from 'react'
import { useMaxIntegration } from '@/hooks/useMaxIntegration'
import { useGestores } from '@/hooks/useGestores'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { LoadingFallback } from '@/components/LoadingFallback'
import { MaxIntegrationLogs } from './MaxIntegrationLogs'
import { MaxIntegrationStats } from './MaxIntegrationStats'
import { 
  Settings, 
  User, 
  Activity, 
  TestTube, 
  AlertCircle,
  CheckCircle,
  Globe,
  RefreshCw,
  FileText,
  Construction
} from 'lucide-react'

export function MaxIntegrationDashboard() {
  const { config, logs, loading, updating, changeActiveGestor, toggleIntegration, testWebhook, refetch } = useMaxIntegration()
  const { gestores, loading: gestoresLoading } = useGestores()
  const [testingWebhook, setTestingWebhook] = useState(false)

  // Funcionalidade temporariamente em manutenção
  return (
    <div className="space-y-6 p-4 lg:p-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Integração App Max</h1>
          <p className="text-gray-400">
            Configure e monitore a integração automática de pedidos do App Max
          </p>
        </div>
      </div>

      {/* Aviso de Manutenção */}
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardHeader className="text-center">
          <Construction className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
          <CardTitle className="text-yellow-400">Funcionalidade em Desenvolvimento</CardTitle>
          <CardDescription className="text-gray-300">
            A integração com o App Max está sendo finalizada e testada. 
            Esta funcionalidade estará disponível em breve.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-700/30">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Status Atual:</h3>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                EM DESENVOLVIMENTO
              </Badge>
            </div>
            
            <div className="text-sm text-gray-400">
              <p>
                Estamos trabalhando para disponibilizar esta integração o mais breve possível.
                Ela permitirá o recebimento automático de pedidos do App Max diretamente no sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
