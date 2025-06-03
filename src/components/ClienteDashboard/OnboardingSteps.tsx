import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClienteProgresso } from '@/hooks/useClienteProgresso'
import { useClienteData } from '@/hooks/useClienteData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  FileText, 
  Upload, 
  Play,
  CreditCard,
  BarChart3,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react'

interface OnboardingStepsProps {
  onTabChange: (tab: string) => void
}

interface Step {
  id: number
  title: string
  description: string
  icon: any
  action: () => void
  actionText: string
  canCheck: boolean
  autoCheck?: boolean
  chatMessage?: string
}

export function OnboardingSteps({ onTabChange }: OnboardingStepsProps) {
  const { user } = useAuth()
  const { briefing, arquivos } = useClienteData(user?.email || '')
  const { progresso, loading, togglePasso } = useClienteProgresso(user?.email || '')

  const openChatWithMessage = (message: string) => {
    onTabChange('chat')
    console.log('Mensagem para enviar no chat:', message)
  }

  const steps: Step[] = React.useMemo(() => [
    {
      id: 1,
      title: 'Preencher Formulário',
      description: 'Complete todas as informações sobre seu produto/serviço',
      icon: FileText,
      action: () => onTabChange('briefing'),
      actionText: 'Preencher Formulário',
      canCheck: true,
      autoCheck: !!(briefing && briefing.nome_produto && briefing.descricao_resumida)
    },
    {
      id: 2,
      title: 'Enviar Materiais Criativos',
      description: 'Envie logos, fotos e materiais para criação dos criativos',
      icon: Upload,
      action: () => onTabChange('arquivos'),
      actionText: 'Enviar Materiais',
      canCheck: true,
      autoCheck: !!(arquivos && arquivos.length > 0)
    },
    {
      id: 3,
      title: 'Conversar sobre Business Manager',
      description: 'Converse com seu gestor sobre configuração da BM e forneça email para liberação',
      icon: MessageCircle,
      action: () => openChatWithMessage('Olá! Preciso configurar minha Business Manager. Qual email devo usar para liberar o acesso?'),
      actionText: 'Conversar no Chat',
      canCheck: true,
      chatMessage: 'Olá! Preciso configurar minha Business Manager. Qual email devo usar para liberar o acesso?'
    },
    {
      id: 4,
      title: 'Assistir Tutorial da BM',
      description: 'Aprenda como liberar status da BM e pré-configurar sua conta',
      icon: Play,
      action: () => onTabChange('tutoriais'),
      actionText: 'Ver Tutoriais',
      canCheck: true
    },
    {
      id: 5,
      title: 'Recarregar Saldo de Tráfego',
      description: 'Recarregue o saldo para tráfego pago na Business Manager',
      icon: CreditCard,
      action: () => openChatWithMessage('Já configurei minha BM conforme o tutorial. Como faço para recarregar o saldo de tráfego pago?'),
      actionText: 'Conversar sobre Saldo',
      canCheck: true,
      chatMessage: 'Já configurei minha BM conforme o tutorial. Como faço para recarregar o saldo de tráfego pago?'
    },
    {
      id: 6,
      title: 'Finalizar Configurações',
      description: 'Finalize configurações e tire dúvidas com seu gestor',
      icon: MessageCircle,
      action: () => openChatWithMessage('Finalizei as configurações anteriores. Estou pronto para iniciar as campanhas. Há mais alguma coisa que preciso fazer?'),
      actionText: 'Conversar com Gestor',
      canCheck: true,
      chatMessage: 'Finalizei as configurações anteriores. Estou pronto para iniciar as campanhas. Há mais alguma coisa que preciso fazer?'
    },
    {
      id: 7,
      title: 'Analisar Métricas',
      description: 'Acompanhe o desempenho da sua campanha',
      icon: BarChart3,
      action: () => onTabChange('vendas'),
      actionText: 'Ver Métricas',
      canCheck: true
    }
  ], [briefing, arquivos, onTabChange])

  const checkAutoSteps = React.useCallback(() => {
    steps.forEach(step => {
      if (step.autoCheck && !progresso.has(step.id)) {
        togglePasso(step.id)
      }
    })
  }, [steps, progresso, togglePasso])

  React.useEffect(() => {
    if (!loading && (briefing || arquivos)) {
      checkAutoSteps()
    }
  }, [loading, briefing, arquivos, checkAutoSteps])

  const totalSteps = steps.length
  const completedSteps = progresso.size
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100)

  const nextStep = React.useMemo(() => {
    return steps.find(step => !progresso.has(step.id))
  }, [steps, progresso])

  const handleStepToggle = React.useCallback(async (stepId: number) => {
    await togglePasso(stepId)
  }, [togglePasso])

  const handleBackToOverview = () => {
    onTabChange('overview')
  }

  if (loading) {
    return (
      <Card className="bg-white border-gray-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando progresso...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-gray-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToOverview}
              className="text-gray-800 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
            <div>
              <CardTitle className="text-gray-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                Guia de Configuração
              </CardTitle>
              <CardDescription className="text-gray-600">
                Siga estes passos para configurar sua campanha corretamente
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant={completedSteps === totalSteps ? "default" : "secondary"}
            className={`text-sm ${
              completedSteps === totalSteps 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
            }`}
          >
            {completedSteps}/{totalSteps} concluídos
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progresso geral</span>
            <span className="text-blue-600 font-medium">{progressPercentage}%</span>
          </div>
          {typeof progressPercentage === 'number' && !isNaN(progressPercentage) && (
            <Progress 
              value={progressPercentage} 
              className="h-3 bg-gray-200"
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {nextStep && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Próximo passo:</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-gray-800 font-medium">{nextStep.title}</h4>
                <p className="text-gray-600 text-sm">{nextStep.description}</p>
              </div>
              <Button
                onClick={nextStep.action}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                size="sm"
              >
                {nextStep.actionText}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = progresso.has(step.id)
            const isNext = step.id === nextStep?.id
            
            return (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                  isCompleted 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                    : isNext
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                } shadow-sm hover:shadow-md`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  {/* Checkbox sempre visível */}
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => handleStepToggle(step.id)}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 w-5 h-5 border-2"
                  />
                  
                  {/* Numeração sempre visível */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                    isCompleted 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : isNext
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-600 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* Ícone do passo */}
                  <div className={`p-2 rounded-lg ${
                    isCompleted 
                      ? 'bg-green-600' 
                      : isNext 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                      : 'bg-gray-400'
                  }`}>
                    <step.icon className="h-4 w-4 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${isCompleted ? 'text-green-700' : 'text-gray-800'}`}>
                        {step.title}
                      </h4>
                      {/* Indicador de conclusão separado */}
                      {isCompleted && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                    {step.chatMessage && (
                      <p className="text-xs text-blue-700 mt-1 italic font-medium">
                        💬 Mensagem será enviada automaticamente no chat
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Botões de ação com melhor contraste */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={step.action}
                    className={`${
                      isCompleted 
                        ? 'text-green-800 hover:text-green-900 hover:bg-green-100 font-medium' 
                        : isNext
                        ? 'text-blue-800 hover:text-blue-900 hover:bg-blue-100 font-medium'
                        : 'text-gray-800 hover:text-gray-900 hover:bg-gray-100 font-medium'
                    }`}
                  >
                    {step.actionText}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                  
                  {/* Botão explícito de marcar/desmarcar com melhor contraste */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStepToggle(step.id)}
                    className={`text-xs border-2 font-medium ${
                      isCompleted 
                        ? 'border-green-700 text-green-800 hover:bg-green-700 hover:text-white hover:border-green-700' 
                        : 'border-blue-700 text-blue-800 hover:bg-blue-700 hover:text-white hover:border-blue-700'
                    }`}
                  >
                    {isCompleted ? 'Desmarcar' : 'Marcar'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {completedSteps === totalSteps && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-green-700 font-semibold text-lg mb-2">Parabéns! 🎉</h3>
            <p className="text-gray-700 text-sm mb-4">
              Você completou todos os passos! Agora suas campanhas estão prontas para decolar!
            </p>
            <Button
              onClick={() => onTabChange('vendas')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              size="sm"
            >
              Ver Métricas da Campanha
            </Button>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleBackToOverview}
            className="w-full border-gray-300 text-gray-800 hover:text-gray-900 hover:bg-gray-100 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel Principal
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
