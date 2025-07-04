
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
  FileText, 
  Upload, 
  BarChart3,
  Headphones,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ChevronRight,
  Calendar,
  DollarSign,
  Globe
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
}

export function OnboardingSteps({ onTabChange }: OnboardingStepsProps) {
  const { user } = useAuth()
  const { briefing, arquivos, clienteInfo } = useClienteData(user?.email || '')
  const { progresso, loading, togglePasso } = useClienteProgresso(user?.email || '')
  const [userManuallyUnchecked, setUserManuallyUnchecked] = React.useState<Set<number>>(new Set())

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
      title: 'Contatar Suporte se Necessário',
      description: 'Entre em contato com seu gestor para esclarecimentos ou suporte adicional',
      icon: Headphones,
      action: () => onTabChange('suporte'),
      actionText: 'Acessar Suporte',
      canCheck: true
    },
    {
      id: 4,
      title: 'Confirmar Valor da Comissão',
      description: 'Visualize e confirme o valor da comissão mensal calculada para seu negócio',
      icon: DollarSign,
      action: () => onTabChange('comissao'),
      actionText: 'Confirmar Comissão',
      canCheck: true,
      autoCheck: !!(clienteInfo?.comissao_confirmada)
    },
    {
      id: 5,
      title: 'Descrever Como Deseja o Site',
      description: 'Opcional: Descreva como você deseja que seja o seu site personalizado',
      icon: Globe,
      action: () => onTabChange('site'),
      actionText: 'Descrever Site',
      canCheck: true,
      autoCheck: !!(clienteInfo?.site_descricao_personalizada)
    },
    {
      id: 6,
      title: 'Visualizar Métricas da Campanha',
      description: 'Acompanhe o desempenho da sua campanha em tempo real',
      icon: BarChart3,
      action: () => onTabChange('vendas'),
      actionText: 'Ver Métricas',
      canCheck: true
    }
  ], [briefing, arquivos, clienteInfo, onTabChange])

  const checkAutoSteps = React.useCallback(() => {
    steps.forEach(step => {
      if (step.autoCheck && !progresso.has(step.id) && !userManuallyUnchecked.has(step.id)) {
        togglePasso(step.id)
      }
    })
  }, [steps, progresso, togglePasso, userManuallyUnchecked])

  React.useEffect(() => {
    if (!loading && (briefing || arquivos || clienteInfo)) {
      checkAutoSteps()
    }
  }, [loading, briefing, arquivos, clienteInfo, checkAutoSteps])

  const totalSteps = steps.length
  const completedSteps = progresso.size
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100)

  const handleStepToggle = React.useCallback(async (stepId: number) => {
    const step = steps.find(s => s.id === stepId)
    if (step?.autoCheck && progresso.has(stepId)) {
      setUserManuallyUnchecked(prev => new Set(prev).add(stepId))
    }
    await togglePasso(stepId)
  }, [togglePasso, steps, progresso])

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
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
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
                Siga estes 6 passos para configurar sua campanha corretamente
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
            <span className="text-gray-800 font-medium">Progresso geral</span>
            <span className="text-blue-600 font-bold">{progressPercentage}%</span>
          </div>
          {typeof progressPercentage === 'number' && !isNaN(progressPercentage) && (
            <Progress 
              value={progressPercentage} 
              className="h-3"
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = progresso.has(step.id)
            
            return (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                  isCompleted 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                } shadow-sm hover:shadow-md`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => handleStepToggle(step.id)}
                    className="w-6 h-6 border-2"
                  />
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                    isCompleted 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className={`p-2 rounded-lg ${
                    isCompleted 
                      ? 'bg-green-600' 
                      : 'bg-gray-400'
                  }`}>
                    <step.icon className="h-4 w-4 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${isCompleted ? 'text-green-700' : 'text-gray-800'}`}>
                        {step.title}
                      </h4>
                      {isCompleted && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      {step.id === 5 && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          Opcional
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Button
                    onClick={step.action}
                    className={`${
                      isCompleted 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    } shadow-md`}
                    size="sm"
                  >
                    {step.actionText}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mensagem de Tranquilização */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium">Fique tranquilo!</span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            Sua campanha estará no ar em até <strong>15 dias úteis</strong> após a conclusão dos passos obrigatórios. 
            É melhor fazer bem feito do que na pressa - isso garante os melhores resultados para o seu negócio.
          </p>
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
            className="w-full border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel Principal
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
