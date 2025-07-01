
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Settings,
  Bug,
  Globe,
  Database
} from 'lucide-react'

interface TroubleshootingStep {
  id: string
  title: string
  description: string
  status: 'todo' | 'checking' | 'done' | 'failed'
  details: string[]
  solutions: string[]
}

export function WebhookTroubleshooting() {
  const [expandedSteps, setExpandedSteps] = useState<string[]>([])
  const [steps, setSteps] = useState<TroubleshootingStep[]>([
    {
      id: 'appmax-config',
      title: '1. Configuração no AppMax',
      description: 'Verificar se o webhook está corretamente configurado',
      status: 'todo',
      details: [
        'Webhook deve estar ATIVO/HABILITADO',
        'URL deve estar exatamente como mostrada no sistema',
        'Método deve ser POST',
        'Deve estar configurado para TODOS os produtos',
        'Não deve ter filtros por valor mínimo/máximo',
        'Não deve ter filtros por status de pagamento específico'
      ],
      solutions: [
        'Desative e reative o webhook no AppMax',
        'Remova todos os filtros e configure para "Todos os produtos"',
        'Verifique se não há caracteres extras na URL',
        'Teste com um produto específico primeiro'
      ]
    },
    {
      id: 'timing-issue',
      title: '2. Momento do Disparo',
      description: 'Verificar quando o AppMax envia o webhook',
      status: 'todo',
      details: [
        'Alguns sistemas enviam no momento do pedido',
        'Outros enviam apenas após confirmação de pagamento',
        'Pode haver delay de minutos ou horas',
        'Status do pagamento pode influenciar o envio'
      ],
      solutions: [
        'Aguardar até 24h após o pagamento',
        'Verificar se há configuração de "Enviar apenas pagamentos aprovados"',
        'Testar com diferentes formas de pagamento',
        'Verificar se há configuração de delay no envio'
      ]
    },
    {
      id: 'network-connectivity',
      title: '3. Conectividade de Rede',
      description: 'Verificar se o AppMax consegue acessar nosso webhook',
      status: 'todo',
      details: [
        'Firewall do AppMax pode estar bloqueando',
        'Problemas de DNS podem impedir acesso',
        'Certificado SSL pode estar causando problemas',
        'Rate limiting pode estar ativo'
      ],
      solutions: [
        'Contatar suporte do AppMax sobre conectividade',
        'Verificar se há whitelist de IPs necessária',
        'Testar com webhook alternativo (webhook.site)',
        'Verificar logs de erro no AppMax'
      ]
    },
    {
      id: 'payload-format',
      title: '4. Formato dos Dados',
      description: 'Verificar se o formato enviado está correto',
      status: 'todo',
      details: [
        'AppMax pode enviar em formato diferente do esperado',
        'Campos podem ter nomes diferentes',
        'Encoding pode estar incorreto',
        'Content-Type pode estar errado'
      ],
      solutions: [
        'Usar ferramenta de captura de webhook (webhook.site)',
        'Modificar o webhook para aceitar formatos alternativos',
        'Verificar documentação específica da versão do AppMax',
        'Contatar suporte do AppMax sobre formato de dados'
      ]
    },
    {
      id: 'appmax-version',
      title: '5. Versão do AppMax',
      description: 'Verificar compatibilidade da versão',
      status: 'todo',
      details: [
        'Versões mais antigas podem ter bugs',
        'Versões muito novas podem ter mudanças',
        'Alguns recursos podem não estar disponíveis',
        'Configurações podem ser diferentes'
      ],
      solutions: [
        'Verificar versão atual do AppMax',
        'Consultar changelog de atualizações',
        'Verificar se webhooks funcionam em outras versões',
        'Contatar suporte sobre problemas conhecidos'
      ]
    }
  ])

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    )
  }

  const updateStepStatus = (stepId: string, status: TroubleshootingStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ))
  }

  const getStatusIcon = (status: TroubleshootingStep['status']) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'checking':
        return <Settings className="w-5 h-5 text-yellow-500 animate-spin" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: TroubleshootingStep['status']) => {
    switch (status) {
      case 'done':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'checking':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Diagnóstico de Problemas do Webhook
          </CardTitle>
          <CardDescription>
            Siga este guia passo a passo para identificar e resolver problemas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {steps.filter(s => s.status === 'done').length} Concluídos
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              {steps.filter(s => s.status === 'failed').length} Com Problemas
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gray-500" />
              {steps.filter(s => s.status === 'todo').length} Pendentes
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Passos de Troubleshooting */}
      <div className="space-y-4">
        {steps.map((step) => (
          <Card key={step.id}>
            <Collapsible 
              open={expandedSteps.includes(step.id)}
              onOpenChange={() => toggleStep(step.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(step.status)}
                      <div>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                        <CardDescription>{step.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(step.status)}>
                        {step.status === 'todo' ? 'Pendente' :
                         step.status === 'checking' ? 'Verificando' :
                         step.status === 'done' ? 'Concluído' : 'Problema'}
                      </Badge>
                      {expandedSteps.includes(step.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Itens para Verificar */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Itens para Verificar:
                      </h4>
                      <ul className="space-y-1">
                        {step.details.map((detail, index) => (
                          <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Soluções Possíveis */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Soluções Possíveis:
                      </h4>
                      <ul className="space-y-1">
                        {step.solutions.map((solution, index) => (
                          <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                            <span className="text-green-400 mt-1">→</span>
                            {solution}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => updateStepStatus(step.id, 'checking')}
                        disabled={step.status === 'checking'}
                        variant="outline"
                        size="sm"
                      >
                        Verificando...
                      </Button>
                      <Button
                        onClick={() => updateStepStatus(step.id, 'done')}
                        variant="outline"
                        size="sm"
                        className="text-green-400 border-green-500/30"
                      >
                        Marcar como OK
                      </Button>
                      <Button
                        onClick={() => updateStepStatus(step.id, 'failed')}
                        variant="outline"
                        size="sm"
                        className="text-red-400 border-red-500/30"
                      >
                        Marcar Problema
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Próximos Passos */}
      <Alert>
        <Globe className="h-4 w-4" />
        <AlertDescription>
          <strong>Próximos Passos Recomendados:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>Execute todos os testes automáticos na aba "Monitor"</li>
            <li>Use o webhook.site para capturar dados do AppMax diretamente</li>
            <li>Faça uma venda de teste de R$ 1,00 e monitore por 24h</li>
            <li>Entre em contato com o suporte do AppMax com os logs deste sistema</li>
            <li>Se necessário, configure webhook alternativo temporariamente</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  )
}
