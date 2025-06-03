
import { useAuth } from '@/hooks/useAuth'
import { useClienteProgresso } from '@/hooks/useClienteProgresso'
import { useProfileData } from '@/hooks/useProfileData'
import { useClienteData } from '@/hooks/useClienteData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  MessageCircle, 
  FileText, 
  Upload, 
  Users, 
  Play,
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
}

export function OnboardingSteps({ onTabChange }: OnboardingStepsProps) {
  const { user } = useAuth()
  const { profileData } = useProfileData('cliente')
  const { briefing, arquivos } = useClienteData(user?.email || '')
  const { progresso, loading, togglePasso } = useClienteProgresso(user?.email || '')

  // Definir os passos do onboarding
  const steps: Step[] = [
    {
      id: 1,
      title: 'Configurar Perfil Completo',
      description: 'Complete suas informações e adicione uma foto de perfil',
      icon: User,
      action: () => onTabChange('overview'),
      actionText: 'Configurar Perfil',
      canCheck: true,
      autoCheck: !!(profileData?.avatar_url && profileData?.nome_display)
    },
    {
      id: 2,
      title: 'Primeiro Contato via Chat',
      description: 'Entre em contato com seu gestor para iniciar o acompanhamento',
      icon: MessageCircle,
      action: () => onTabChange('chat'),
      actionText: 'Abrir Chat',
      canCheck: true
    },
    {
      id: 3,
      title: 'Preencher Briefing Completo',
      description: 'Forneça todas as informações sobre seu produto e estratégia',
      icon: FileText,
      action: () => onTabChange('briefing'),
      actionText: 'Preencher Briefing',
      canCheck: true,
      autoCheck: !!(briefing && briefing.nome_produto && briefing.descricao_resumida)
    },
    {
      id: 4,
      title: 'Enviar Materiais',
      description: 'Faça upload de logos, fotos do produto e outros materiais',
      icon: Upload,
      action: () => onTabChange('arquivos'),
      actionText: 'Enviar Arquivos',
      canCheck: true,
      autoCheck: !!(arquivos && arquivos.length > 0)
    },
    {
      id: 5,
      title: 'Aguardar Criação do Grupo',
      description: 'Seu gestor criará o grupo de acompanhamento (máximo 1 dia)',
      icon: Users,
      action: () => onTabChange('chat'),
      actionText: 'Verificar Status',
      canCheck: true
    },
    {
      id: 6,
      title: 'Assistir Tutoriais',
      description: 'Assista aos vídeos explicativos para entender o processo',
      icon: Play,
      action: () => onTabChange('tutoriais'),
      actionText: 'Ver Tutoriais',
      canCheck: true
    }
  ]

  // Auto-marcar passos baseado em dados existentes
  const checkAutoSteps = () => {
    steps.forEach(step => {
      if (step.autoCheck && !progresso.has(step.id)) {
        togglePasso(step.id)
      }
    })
  }

  // Executar auto-check quando dados carregarem
  React.useEffect(() => {
    if (!loading && (briefing || arquivos || profileData)) {
      checkAutoSteps()
    }
  }, [loading, briefing, arquivos, profileData])

  // Calcular progresso
  const totalSteps = steps.length
  const completedSteps = progresso.size
  const progressPercentage = (completedSteps / totalSteps) * 100

  // Encontrar próximo passo
  const nextStep = steps.find(step => !progresso.has(step.id))

  const handleStepToggle = async (stepId: number) => {
    await togglePasso(stepId)
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
            <span className="ml-2 text-gray-400">Carregando progresso...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-teal-500" />
              Guia de Configuração
            </CardTitle>
            <CardDescription className="text-gray-400">
              Siga estes passos para configurar sua campanha corretamente
            </CardDescription>
          </div>
          <Badge 
            variant={completedSteps === totalSteps ? "default" : "secondary"}
            className="text-sm"
          >
            {completedSteps}/{totalSteps} concluídos
          </Badge>
        </div>
        
        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progresso geral</span>
            <span className="text-teal-400 font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Próximo passo em destaque */}
        {nextStep && (
          <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-800/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-teal-400" />
              <span className="text-sm text-teal-400 font-medium">Próximo passo:</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">{nextStep.title}</h4>
                <p className="text-gray-300 text-sm">{nextStep.description}</p>
              </div>
              <Button
                onClick={nextStep.action}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                size="sm"
              >
                {nextStep.actionText}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Lista de todos os passos */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = progresso.has(step.id)
            const isNext = step.id === nextStep?.id
            const isPrevious = index < steps.findIndex(s => s.id === nextStep?.id)
            
            return (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  isCompleted 
                    ? 'bg-teal-900/20 border-teal-800/50' 
                    : isNext
                    ? 'bg-blue-900/20 border-blue-800/50'
                    : 'bg-gray-800/50 border-gray-700/50'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => handleStepToggle(step.id)}
                      className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                    />
                    <div className="w-6 h-6 rounded-full bg-gray-700 text-white text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className={`${isCompleted ? 'bg-teal-600' : isNext ? 'bg-blue-600' : 'bg-gray-600'} p-2 rounded-lg`}>
                    <step.icon className="h-4 w-4 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-medium ${isCompleted ? 'text-teal-300' : 'text-white'}`}>
                      {step.title}
                    </h4>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={step.action}
                  className={`${
                    isCompleted 
                      ? 'text-teal-400 hover:text-teal-300' 
                      : isNext
                      ? 'text-blue-400 hover:text-blue-300'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {step.actionText}
                </Button>
              </div>
            )
          })}
        </div>

        {/* Mensagem de conclusão */}
        {completedSteps === totalSteps && (
          <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 border border-green-800/50 rounded-lg p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <h3 className="text-green-300 font-semibold mb-1">Parabéns! 🎉</h3>
            <p className="text-gray-300 text-sm">
              Você completou todos os passos iniciais. Agora é só aguardar seu gestor configurar sua campanha!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
