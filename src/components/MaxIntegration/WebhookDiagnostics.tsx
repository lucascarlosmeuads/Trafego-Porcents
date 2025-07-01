
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Globe,
  Zap,
  Activity,
  Copy,
  RefreshCw
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface DiagnosticTest {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'success' | 'error'
  result?: string
  details?: string
}

export function WebhookDiagnostics() {
  const [tests, setTests] = useState<DiagnosticTest[]>([
    {
      id: 'connectivity',
      name: 'Teste de Conectividade',
      description: 'Verifica se o webhook está acessível pela internet',
      status: 'pending'
    },
    {
      id: 'payload-format',
      name: 'Teste de Formato de Payload',
      description: 'Simula diferentes formatos de dados do AppMax',
      status: 'pending'
    },
    {
      id: 'headers-test',
      name: 'Teste de Headers',
      description: 'Verifica se o webhook aceita diferentes combinações de headers',
      status: 'pending'
    },
    {
      id: 'empty-payload',
      name: 'Teste de Payload Vazio',
      description: 'Testa como o webhook lida com requisições vazias',
      status: 'pending'
    }
  ])

  const [customTest, setCustomTest] = useState({
    url: '',
    payload: '{\n  "cliente": "Teste Manual",\n  "telefone": "(11) 99999-9999",\n  "email": "teste@exemplo.com",\n  "produto": "Produto Teste",\n  "valor": 100.00\n}',
    headers: 'Content-Type: application/json\nUser-Agent: AppMax-Test'
  })

  const [webhookUrl] = useState('https://rxpgqunqsegypssoqpyf.supabase.co/functions/v1/max-webhook')

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: "URL copiada para a área de transferência",
      duration: 2000
    })
  }

  const runDiagnosticTest = async (testId: string) => {
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status: 'running' as const }
        : test
    ))

    try {
      let result = ''
      let details = ''

      switch (testId) {
        case 'connectivity':
          // Teste básico de conectividade
          const connectResponse = await fetch(webhookUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          })
          result = connectResponse.ok ? 'Webhook acessível' : 'Webhook inacessível'
          details = `Status: ${connectResponse.status} ${connectResponse.statusText}`
          break

        case 'payload-format':
          // Teste com payload padrão AppMax
          const payloadResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cliente: 'Teste Diagnóstico',
              telefone: '(11) 99999-9999',
              email: 'diagnostico@teste.com',
              produto: 'Teste AppMax',
              valor: 50.00,
              _diagnostico: true
            })
          })
          result = payloadResponse.ok ? 'Payload aceito' : 'Payload rejeitado'
          details = `Status: ${payloadResponse.status} - ${await payloadResponse.text()}`
          break

        case 'headers-test':
          // Teste com diferentes headers
          const headersResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'AppMax/1.0'
            },
            body: 'cliente=Teste&telefone=11999999999'
          })
          result = headersResponse.ok ? 'Headers aceitos' : 'Headers rejeitados'
          details = `Status: ${headersResponse.status}`
          break

        case 'empty-payload':
          // Teste com payload vazio
          const emptyResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: ''
          })
          result = 'Payload vazio processado'
          details = `Status: ${emptyResponse.status} - Webhook lidou com requisição vazia`
          break
      }

      setTests(prev => prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'success' as const, result, details }
          : test
      ))

    } catch (error) {
      setTests(prev => prev.map(test => 
        test.id === testId 
          ? { 
              ...test, 
              status: 'error' as const, 
              result: 'Erro no teste',
              details: error instanceof Error ? error.message : 'Erro desconhecido'
            }
          : test
      ))
    }
  }

  const runAllTests = async () => {
    for (const test of tests) {
      await runDiagnosticTest(test.id)
      // Aguardar um pouco entre os testes
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const runCustomTest = async () => {
    try {
      const headers: Record<string, string> = {}
      customTest.headers.split('\n').forEach(line => {
        const [key, value] = line.split(': ')
        if (key && value) headers[key.trim()] = value.trim()
      })

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: customTest.payload
      })

      const responseText = await response.text()
      
      toast({
        title: response.ok ? "Teste Personalizado - Sucesso" : "Teste Personalizado - Erro",
        description: `Status: ${response.status} - ${response.statusText}`,
        duration: 5000
      })

      console.log('Resposta do teste personalizado:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      })

    } catch (error) {
      toast({
        title: "Erro no Teste Personalizado",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
        duration: 5000
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'running':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'running':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* URL do Webhook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            URL do Webhook
          </CardTitle>
          <CardDescription>
            Esta é a URL que deve estar configurada no AppMax
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input 
              value={webhookUrl} 
              readOnly 
              className="font-mono text-sm"
            />
            <Button 
              onClick={() => copyToClipboard(webhookUrl)}
              variant="outline"
              size="sm"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Testes Automáticos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Testes Automáticos de Diagnóstico
          </CardTitle>
          <CardDescription>
            Execute testes para identificar possíveis problemas com o webhook
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runAllTests} className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Executar Todos os Testes
            </Button>
          </div>

          <div className="space-y-3">
            {tests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(test.status)}
                  <div>
                    <div className="font-medium">{test.name}</div>
                    <div className="text-sm text-gray-400">{test.description}</div>
                    {test.result && (
                      <div className="text-sm mt-1">
                        <Badge variant="outline" className={getStatusColor(test.status)}>
                          {test.result}
                        </Badge>
                        {test.details && (
                          <div className="text-xs text-gray-500 mt-1">{test.details}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => runDiagnosticTest(test.id)}
                  disabled={test.status === 'running'}
                  variant="outline"
                  size="sm"
                >
                  {test.status === 'running' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teste Personalizado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Teste Personalizado
          </CardTitle>
          <CardDescription>
            Simule exatamente como o AppMax enviaria os dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Headers HTTP</label>
            <Textarea
              value={customTest.headers}
              onChange={(e) => setCustomTest(prev => ({ ...prev, headers: e.target.value }))}
              placeholder="Content-Type: application/json&#10;User-Agent: AppMax/1.0"
              className="font-mono text-sm"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Payload JSON</label>
            <Textarea
              value={customTest.payload}
              onChange={(e) => setCustomTest(prev => ({ ...prev, payload: e.target.value }))}
              placeholder="Cole aqui o JSON que o AppMax deveria enviar"
              className="font-mono text-sm"
              rows={8}
            />
          </div>

          <Button onClick={runCustomTest} className="w-full">
            <TestTube className="w-4 h-4 mr-2" />
            Executar Teste Personalizado
          </Button>
        </CardContent>
      </Card>

      {/* Instruções de Verificação no AppMax */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Checklist para verificar no AppMax:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Webhook está marcado como "ATIVO" ou "HABILITADO"</li>
            <li>URL do webhook está correta (copie da caixa acima)</li>
            <li>Método está configurado como "POST"</li>
            <li>Não há filtros por produto, valor ou condição</li>
            <li>Está configurado para "Todos os produtos"</li>
            <li>Verificar se há logs/histórico de tentativas no AppMax</li>
            <li>Testar com uma venda real de valor baixo (R$ 1,00)</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
