
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Globe,
  Copy,
  ExternalLink,
  TestTube,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function AlternativeWebhookTest() {
  const [webhookSiteUrl, setWebhookSiteUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'waiting' | 'received' | 'timeout'>('idle')

  const generateWebhookSite = async () => {
    setIsGenerating(true)
    try {
      // Simular chamada para webhook.site ou similar
      // Na implementação real, você faria uma chamada para criar um webhook temporário
      const timestamp = Date.now()
      const testUrl = `https://webhook.site/${timestamp.toString(36)}`
      setWebhookSiteUrl(testUrl)
      
      toast({
        title: "URL de Teste Gerada",
        description: "Use esta URL temporária no AppMax para capturar dados",
        duration: 5000
      })
    } catch (error) {
      toast({
        title: "Erro ao Gerar URL",
        description: "Não foi possível gerar URL de teste",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyUrl = () => {
    if (webhookSiteUrl) {
      navigator.clipboard.writeText(webhookSiteUrl)
      toast({
        title: "URL Copiada",
        description: "Cole esta URL no campo webhook do AppMax",
        duration: 3000
      })
    }
  }

  const startTest = () => {
    setTestStatus('waiting')
    // Simular timeout após 5 minutos
    setTimeout(() => {
      if (testStatus === 'waiting') {
        setTestStatus('timeout')
      }
    }, 300000) // 5 minutos
  }

  const getStatusDisplay = () => {
    switch (testStatus) {
      case 'waiting':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Aguardando dados...
          </Badge>
        )
      case 'received':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Dados recebidos!
          </Badge>
        )
      case 'timeout':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Timeout - Nenhum dado recebido
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Teste com Webhook Alternativo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Teste com Webhook Alternativo
          </CardTitle>
          <CardDescription>
            Use um webhook temporário para capturar dados direto do AppMax
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!webhookSiteUrl ? (
            <div className="text-center py-8">
              <Button 
                onClick={generateWebhookSite}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                {isGenerating ? 'Gerando...' : 'Gerar URL de Teste'}
              </Button>
              <p className="text-sm text-gray-400 mt-2">
                Isso criará uma URL temporária para capturar dados do AppMax
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  URL Temporária de Teste:
                </label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={webhookSiteUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={copyUrl} variant="outline" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => window.open(webhookSiteUrl, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {testStatus === 'idle' && (
                <Button onClick={startTest} className="w-full">
                  <TestTube className="w-4 h-4 mr-2" />
                  Iniciar Monitoramento
                </Button>
              )}

              {testStatus !== 'idle' && (
                <div className="flex items-center justify-center py-4">
                  {getStatusDisplay()}
                </div>
              )}

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Como usar:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                    <li>Copie a URL acima</li>
                    <li>Cole no campo webhook do AppMax</li>
                    <li>Clique em "Iniciar Monitoramento"</li>
                    <li>Faça uma venda de teste no AppMax</li>
                    <li>Verifique se os dados chegaram na URL</li>
                    <li>Compare o formato com o que nosso sistema espera</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instruções Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle>Passo a Passo Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">1. Preparação no AppMax</h4>
              <p className="text-sm text-gray-400">
                Vá nas configurações de webhook do AppMax e substitua temporariamente 
                a URL atual pela URL de teste gerada acima.
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-medium">2. Teste de Venda</h4>
              <p className="text-sm text-gray-400">
                Faça uma venda de teste de valor baixo (R$ 1,00) e aguarde alguns minutos 
                para ver se os dados aparecem na URL de teste.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium">3. Análise dos Dados</h4>
              <p className="text-sm text-gray-400">
                Se os dados chegaram na URL de teste, compare o formato com o que 
                nosso sistema espera. Se não chegaram, o problema está na configuração do AppMax.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-medium">4. Próximos Passos</h4>
              <p className="text-sm text-gray-400">
                Com base no resultado, podemos ajustar nosso sistema para aceitar 
                o formato que o AppMax está enviando, ou identificar problemas na configuração.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
