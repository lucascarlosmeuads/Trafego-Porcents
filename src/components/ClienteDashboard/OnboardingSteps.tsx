
import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClienteProgresso } from '@/hooks/useClienteProgresso'
import { useProfileData } from '@/hooks/useProfileData'
import { useClienteData } from '@/hooks/useClienteData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ProfileAvatarUpload } from '../ProfileAvatarUpload'
import { 
  User, 
  MessageCircle, 
  FileText, 
  Upload, 
  Play,
  CreditCard,
  BarChart3,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ChevronRight,
  Camera
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
  const { profileData, updateProfileData } = useProfileData('cliente')
  const { briefing, arquivos } = useClienteData(user?.email || '')
  const { progresso, loading, togglePasso } = useClienteProgresso(user?.email || '')

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
      action: () => {},
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
  ], [profileData, briefing, arquivos, onTabChange])

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

  const handleBackToOverview = () => {
    onTabChange('overview')
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
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToOverview}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-teal-500" />
                Guia de Configuração
              </CardTitle>
              <CardDescription className="text-gray-400">
                Siga estes passos para configurar sua campanha corretamente
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant={completedSteps === totalSteps ? "default" : "secondary"}
            className="text-sm"
          >
            {completedSteps}/{totalSteps} concluídos
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progresso geral</span>
            <span className="text-teal-400 font-medium">{progressPercentage}%</span>
          </div>
          {typeof progressPercentage === 'number' && !isNaN(progressPercentage) && (
            <Progress 
              value={progressPercentage} 
              className="h-2"
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
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

        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = progresso.has(step.id)
            const isNext = step.id === nextStep?.id
            
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
                  {/* Checkbox sempre visível */}
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => handleStepToggle(step.id)}
                    className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600 w-5 h-5"
                  />
                  
                  {/* Numeração sempre visível */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                    isCompleted 
                      ? 'bg-teal-600 border-teal-600 text-white' 
                      : isNext
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* Ícone do passo */}
                  <div className={`${isCompleted ? 'bg-teal-600' : isNext ? 'bg-blue-600' : 'bg-gray-600'} p-2 rounded-lg`}>
                    <step.icon className="h-4 w-4 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${isCompleted ? 'text-teal-300' : 'text-white'}`}>
                        {step.title}
                      </h4>
                      {/* Indicador de conclusão separado */}
                      {isCompleted && (
                        <CheckCircle2 className="h-4 w-4 text-teal-400" />
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                    {step.chatMessage && (
                      <p className="text-xs text-teal-400 mt-1 italic">
                        💬 Mensagem será enviada automaticamente no chat
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Botões de ação */}
                <div className="flex items-center gap-2">
                  {step.id === 1 ? (
                    <div className="flex items-center gap-2">
                      <ProfileAvatarUpload
                        currentAvatarUrl={profileData?.avatar_url}
                        userName={profileData?.nome_display || user?.email || 'Cliente'}
                        userType="cliente"
                        onAvatarChange={handleAvatarChange}
                        size="sm"
                        showEditButton={true}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={step.action}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        {profileData?.avatar_url ? 'Trocar' : 'Adicionar'}
                      </Button>
                    </div>
                  ) : (
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
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                  
                  {/* Botão explícito de marcar/desmarcar */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStepToggle(step.id)}
                    className={`text-xs ${
                      isCompleted 
                        ? 'border-teal-600 text-teal-400 hover:bg-teal-600 hover:text-white' 
                        : 'border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white'
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
          <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 border border-green-800/50 rounded-lg p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <h3 className="text-green-300 font-semibold mb-1">Parabéns! 🎉</h3>
            <p className="text-gray-300 text-sm">
              Você completou todos os passos! Agora suas campanhas estão prontas para decolar!
            </p>
            <div className="mt-3">
              <Button
                onClick={() => onTabChange('vendas')}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                Ver Métricas da Campanha
              </Button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={handleBackToOverview}
            className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel Principal
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
