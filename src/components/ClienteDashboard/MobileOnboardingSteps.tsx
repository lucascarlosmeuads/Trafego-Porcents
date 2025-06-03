
import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClienteProgresso } from '@/hooks/useClienteProgresso'
import { useProfileData } from '@/hooks/useProfileData'
import { useClienteData } from '@/hooks/useClienteData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { MobilePhotoUpload } from './MobilePhotoUpload'
import { 
  User, 
  MessageCircle, 
  FileText, 
  Upload, 
  Play,
  CreditCard,
  BarChart3,
  CheckCircle2,
  Clock,
  ChevronRight,
  Camera,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface MobileOnboardingStepsProps {
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

export function MobileOnboardingSteps({ onTabChange }: MobileOnboardingStepsProps) {
  const { user } = useAuth()
  const { profileData, updateProfileData } = useProfileData('cliente')
  const { briefing, arquivos } = useClienteData(user?.email || '')
  const { progresso, loading, togglePasso } = useClienteProgresso(user?.email || '')
  const [expandedStep, setExpandedStep] = React.useState<number | null>(null)

  const handleAvatarChange = (newUrl: string | null) => {
    updateProfileData({ avatar_url: newUrl })
  }

  const openChatWithMessage = (message: string) => {
    onTabChange('chat')
    console.log('Mensagem para enviar no chat:', message)
  }

  const steps: Step[] = React.useMemo(() => [
    {
      id: 1,
      title: 'Adicionar Foto de Perfil',
      description: 'Adicione sua foto de perfil para personalizar sua conta',
      icon: Camera,
      action: () => setExpandedStep(expandedStep === 1 ? null : 1),
      actionText: 'Adicionar Foto',
      canCheck: true,
      autoCheck: !!(profileData?.avatar_url)
    },
    {
      id: 2,
      title: 'Preencher Formulário',
      description: 'Complete todas as informações sobre seu produto/serviço',
      icon: FileText,
      action: () => onTabChange('briefing'),
      actionText: 'Preencher Formulário',
      canCheck: true,
      autoCheck: !!(briefing && briefing.nome_produto && briefing.descricao_resumida)
    },
    {
      id: 3,
      title: 'Enviar Materiais Criativos',
      description: 'Envie logos, fotos e materiais para criação dos criativos',
      icon: Upload,
      action: () => onTabChange('arquivos'),
      actionText: 'Enviar Materiais',
      canCheck: true,
      autoCheck: !!(arquivos && arquivos.length > 0)
    },
    {
      id: 4,
      title: 'Conversar sobre Business Manager',
      description: 'Converse com seu gestor sobre configuração da BM e forneça email para liberação',
      icon: MessageCircle,
      action: () => openChatWithMessage('Olá! Preciso configurar minha Business Manager. Qual email devo usar para liberar o acesso?'),
      actionText: 'Conversar no Chat',
      canCheck: true,
      chatMessage: 'Olá! Preciso configurar minha Business Manager. Qual email devo usar para liberar o acesso?'
    },
    {
      id: 5,
      title: 'Assistir Tutorial da BM',
      description: 'Aprenda como liberar status da BM e pré-configurar sua conta',
      icon: Play,
      action: () => onTabChange('tutoriais'),
      actionText: 'Ver Tutoriais',
      canCheck: true
    },
    {
      id: 6,
      title: 'Recarregar Saldo de Tráfego',
      description: 'Recarregue o saldo para tráfego pago na Business Manager',
      icon: CreditCard,
      action: () => openChatWithMessage('Já configurei minha BM conforme o tutorial. Como faço para recarregar o saldo de tráfego pago?'),
      actionText: 'Conversar sobre Saldo',
      canCheck: true,
      chatMessage: 'Já configurei minha BM conforme o tutorial. Como faço para recarregar o saldo de tráfego pago?'
    },
    {
      id: 7,
      title: 'Finalizar Configurações',
      description: 'Finalize configurações e tire dúvidas com seu gestor',
      icon: MessageCircle,
      action: () => openChatWithMessage('Finalizei as configurações anteriores. Estou pronto para iniciar as campanhas. Há mais alguma coisa que preciso fazer?'),
      actionText: 'Conversar com Gestor',
      canCheck: true,
      chatMessage: 'Finalizei as configurações anteriores. Estou pronto para iniciar as campanhas. Há mais alguma coisa que preciso fazer?'
    },
    {
      id: 8,
      title: 'Analisar Métricas',
      description: 'Acompanhe o desempenho da sua campanha',
      icon: BarChart3,
      action: () => onTabChange('vendas'),
      actionText: 'Ver Métricas',
      canCheck: true
    }
  ], [profileData, briefing, arquivos, onTabChange, expandedStep])

  // Auto-marcar passos baseado em dados existentes
  const checkAutoSteps = React.useCallback(() => {
    steps.forEach(step => {
      if (step.autoCheck && !progresso.has(step.id)) {
        togglePasso(step.id)
      }
    })
  }, [steps, progresso, togglePasso])

  React.useEffect(() => {
    if (!loading && (briefing || arquivos || profileData)) {
      checkAutoSteps()
    }
  }, [loading, briefing, arquivos, profileData, checkAutoSteps])

  const totalSteps = steps.length
  const completedSteps = progresso.size
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100)

  const nextStep = React.useMemo(() => {
    return steps.find(step => !progresso.has(step.id))
  }, [steps, progresso])

  const handleStepToggle = React.useCallback(async (stepId: number) => {
    await togglePasso(stepId)
  }, [togglePasso])

  if (loading) {
    return (
      <div className="p-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
              <span className="ml-2 text-gray-400">Carregando progresso...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header de Progresso */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-3">
            <CardTitle className="text-white text-lg">
              Configuração da Campanha
            </CardTitle>
            <Badge 
              variant={completedSteps === totalSteps ? "default" : "secondary"}
              className="text-sm"
            >
              {completedSteps}/{totalSteps}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progresso</span>
              <span className="text-teal-400 font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardHeader>
      </Card>

      {/* Próximo Passo em Destaque */}
      {nextStep && (
        <Card className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-teal-400" />
              <span className="text-sm text-teal-400 font-medium">Próximo passo:</span>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="text-white font-medium text-lg">{nextStep.title}</h4>
                <p className="text-gray-300 text-sm mt-1">{nextStep.description}</p>
              </div>
              <Button
                onClick={nextStep.action}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-base"
                size="lg"
              >
                {nextStep.actionText}
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Passos */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = progresso.has(step.id)
          const isNext = step.id === nextStep?.id
          const isExpanded = expandedStep === step.id
          
          return (
            <Card
              key={step.id}
              className={`transition-all duration-200 ${
                isCompleted 
                  ? 'bg-teal-900/20 border-teal-800/50' 
                  : isNext
                  ? 'bg-blue-900/20 border-blue-800/50'
                  : 'bg-gray-800/50 border-gray-700/50'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-700 text-white text-sm flex items-center justify-center font-bold">
                      {isCompleted ? <CheckCircle2 className="h-4 w-4 text-teal-400" /> : index + 1}
                    </div>
                    <div className={`${isCompleted ? 'bg-teal-600' : isNext ? 'bg-blue-600' : 'bg-gray-600'} p-2 rounded-lg`}>
                      <step.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm ${isCompleted ? 'text-teal-300' : 'text-white'}`}>
                      {step.title}
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">{step.description}</p>
                  </div>
                  
                  {step.id === 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={step.action}
                      className="flex-shrink-0"
                    >
                      {isExpanded ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    </Button>
                  )}
                </div>

                {/* Upload de Foto Expandido */}
                {step.id === 1 && isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <MobilePhotoUpload
                      currentAvatarUrl={profileData?.avatar_url}
                      userName={profileData?.nome_display || user?.email || 'Cliente'}
                      userType="cliente"
                      onAvatarChange={handleAvatarChange}
                      onComplete={() => {
                        setExpandedStep(null)
                        if (!progresso.has(1)) {
                          handleStepToggle(1)
                        }
                      }}
                    />
                  </div>
                )}

                {/* Botão de Ação */}
                {step.id !== 1 && (
                  <div className="mt-3">
                    <Button
                      onClick={step.action}
                      className="w-full"
                      variant={isCompleted ? "outline" : "default"}
                      size="sm"
                    >
                      {step.actionText}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}

                {/* Indicador de Mensagem de Chat */}
                {step.chatMessage && (
                  <p className="text-xs text-teal-400 mt-2 italic">
                    💬 Mensagem será enviada automaticamente
                  </p>
                )}

                {/* Toggle de Conclusão */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {isCompleted ? '✅ Concluído' : 'Pendente'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStepToggle(step.id)}
                    className="text-xs"
                  >
                    {isCompleted ? 'Desmarcar' : 'Marcar como feito'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Mensagem de Conclusão */}
      {completedSteps === totalSteps && (
        <Card className="bg-gradient-to-r from-green-900/30 to-teal-900/30 border border-green-800/50">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-green-300 font-semibold text-lg mb-2">Parabéns! 🎉</h3>
            <p className="text-gray-300 text-sm mb-4">
              Você completou todos os passos! Agora suas campanhas estão prontas para decolar!
            </p>
            <Button
              onClick={() => onTabChange('vendas')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              size="lg"
            >
              Ver Métricas da Campanha
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
