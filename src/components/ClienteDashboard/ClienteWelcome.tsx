
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, FileText, Folder, BarChart3, DollarSign, Users, ArrowRight, Loader2, MessageCircle } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useClienteProgresso } from '@/hooks/useClienteProgresso'
import { useAuth } from '@/hooks/useAuth'

interface ClienteWelcomeProps {
  onTabChange: (tab: string) => void
}

export function ClienteWelcome({ onTabChange }: ClienteWelcomeProps) {
  const { user } = useAuth()
  const { progresso, loading, saving, togglePasso } = useClienteProgresso(user?.email || '')
  const isMobile = useIsMobile()

  const steps = [
    {
      id: 1,
      title: 'Conversar com seu Gestor Auxiliar',
      description: 'Entre em contato via chat para ser atendido pelo seu gestor auxiliar que vai montar sua estratégia personalizada baseada na estratégia oficial da Tráfego Porcents.',
      icon: MessageCircle,
      menuAction: () => onTabChange('chat'),
      actionLabel: 'Ir para Chat'
    },
    {
      id: 2,
      title: 'Preencher Formulário',
      description: 'Clique no menu lateral em "Briefing" e preencha com seus dados.',
      icon: FileText,
      menuAction: () => onTabChange('briefing'),
      actionLabel: 'Ir para Briefing'
    },
    {
      id: 3,
      title: 'Enviar Materiais',
      description: 'Você pode anexar imagens, vídeos ou textos no menu "Criativos".',
      icon: Folder,
      menuAction: () => onTabChange('arquivos'),
      actionLabel: 'Ir para Criativos'
    },
    {
      id: 4,
      title: 'Configurar sua BM com o Gestor Auxiliar',
      description: 'Você será orientado diretamente por um gestor via WhatsApp.',
      icon: Users,
      menuAction: null,
      actionLabel: null
    },
    {
      id: 5,
      title: 'Recarregar valor para tráfego pago',
      description: 'Combine o valor e forma de recarga com o gestor auxiliar.',
      icon: DollarSign,
      menuAction: null,
      actionLabel: null
    },
    {
      id: 6,
      title: 'Analisar Métricas e Escalar',
      description: 'No menu "Vendas", você poderá acompanhar seus resultados com o gestor.',
      icon: BarChart3,
      menuAction: () => onTabChange('vendas'),
      actionLabel: 'Ir para Vendas'
    }
  ]

  const handleToggleStep = async (stepId: number) => {
    const success = await togglePasso(stepId)
    if (!success) {
      // Opcional: mostrar toast de erro
      console.error('Erro ao salvar progresso')
    }
  }

  const progressPercentage = Math.round((progresso.size / steps.length) * 100)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trafego-accent-primary mx-auto mb-2"></div>
          <p className="text-trafego-text-secondary">Carregando progresso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4 px-2">
        <h1 className={`${
          isMobile ? 'text-2xl' : 'text-3xl'
        } font-black text-trafego-text-primary flex items-center justify-center gap-2 sm:gap-3`}>
          🧭 Bem-vindo!
        </h1>
        <p className={`${
          isMobile ? 'text-base' : 'text-lg'
        } text-trafego-text-secondary leading-relaxed`}>
          Veja abaixo o passo a passo da sua campanha:
        </p>
      </div>

      {/* Progress Summary Card */}
      <Card 
        className="border-trafego-border-subtle shadow-lg shadow-trafego-accent-primary/5"
        style={{backgroundColor: '#1f2937'}}
      >
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
          <div className="space-y-4">
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-trafego-accent-primary`}>
              Progresso Atual
            </h3>
            <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-black text-trafego-text-primary`}>
              {progresso.size} / {steps.length}
            </div>
            <div className="w-full bg-trafego-bg-input rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-trafego h-3 rounded-full transition-all duration-500 shadow-md" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className={`${isMobile ? 'text-sm' : 'text-base'} text-trafego-text-muted`}>
              {progresso.size === steps.length 
                ? '🎉 Parabéns! Você completou todos os passos!'
                : `${progressPercentage}% concluído`
              }
            </p>
            {saving && (
              <div className="flex items-center justify-center gap-2 text-sm text-trafego-text-secondary">
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando progresso...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-3 sm:space-y-4">
        {steps.map((step) => {
          const isCompleted = progresso.has(step.id)
          const StepIcon = step.icon
          const isFirstStep = step.id === 1 // Destaque especial para o chat
          
          return (
            <Card 
              key={step.id} 
              className={`transition-all duration-300 border-trafego-border-subtle shadow-md hover:shadow-lg hover:shadow-trafego-accent-primary/10 ${
                isCompleted 
                  ? 'shadow-trafego-accent-primary/20 border-trafego-accent-primary/40' 
                  : 'hover:border-trafego-accent-secondary/30'
              } ${
                isFirstStep ? 'border-orange-500/50 shadow-orange-500/20' : ''
              }`}
              style={{
                backgroundColor: isCompleted ? '#1f2937' : (isFirstStep ? '#1a1a2e' : '#1a1a1a')
              }}
            >
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Step Icon */}
                  <div className={`flex-shrink-0 ${
                    isMobile ? 'w-8 h-8' : 'w-10 h-10'
                  } rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30' 
                      : isFirstStep
                        ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-gradient-trafego text-white shadow-lg shadow-trafego-accent-primary/30'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    ) : (
                      <StepIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`${
                            isMobile ? 'text-xs' : 'text-sm'
                          } w-fit ${
                            isFirstStep 
                              ? 'border-orange-500/50 text-orange-400 bg-orange-500/10'
                              : 'border-trafego-accent-primary/50 text-trafego-accent-primary bg-trafego-accent-primary/10'
                          }`}
                        >
                          Passo {step.id}
                        </Badge>
                        {isFirstStep && (
                          <Badge 
                            variant="outline" 
                            className={`${
                              isMobile ? 'text-xs' : 'text-sm'
                            } border-orange-600/50 text-orange-300 bg-orange-600/20 font-bold`}
                          >
                            IMPORTANTE
                          </Badge>
                        )}
                      </div>
                      <h3 className={`${
                        isMobile ? 'text-base' : 'text-lg'
                      } font-bold ${
                        isCompleted 
                          ? 'text-trafego-accent-primary'
                          : isFirstStep
                            ? 'text-orange-300' 
                            : 'text-trafego-text-primary'
                      } break-words`}>
                        {step.title}
                      </h3>
                    </div>
                    
                    <p className={`${
                      isMobile ? 'text-sm' : 'text-base'
                    } ${
                      isFirstStep 
                        ? 'text-orange-200' 
                        : 'text-trafego-text-secondary'
                    } leading-relaxed`}>
                      {step.description}
                    </p>
                    
                    {/* Action Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        {step.menuAction && (
                          <Button
                            variant="outline"
                            size={isMobile ? "sm" : "default"}
                            onClick={step.menuAction}
                            className={`w-full sm:w-auto flex items-center gap-2 border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                              isFirstStep
                                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white'
                                : 'bg-gradient-trafego hover:bg-gradient-trafego-hover text-white'
                            }`}
                          >
                            {step.actionLabel}
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Checkbox */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Checkbox
                          id={`step-${step.id}`}
                          checked={isCompleted}
                          onCheckedChange={() => handleToggleStep(step.id)}
                          disabled={saving}
                          className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 border-trafego-accent-primary"
                        />
                        <label 
                          htmlFor={`step-${step.id}`}
                          className={`${
                            isMobile ? 'text-sm' : 'text-base'
                          } font-semibold cursor-pointer whitespace-nowrap text-trafego-text-primary ${
                            saving ? 'opacity-50' : ''
                          }`}
                        >
                          Marcar como feito
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Observação */}
      <Card 
        className="border-trafego-accent-primary/30 shadow-lg shadow-trafego-accent-primary/10"
        style={{backgroundColor: '#1f2937'}}
      >
        <CardHeader className={isMobile ? 'pb-3' : ''}>
          <CardTitle className={`${
            isMobile ? 'text-base' : 'text-lg'
          } text-trafego-accent-primary flex items-center gap-2 font-bold`}>
            📌 Observação
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? 'pt-0' : ''}>
          <div className={`space-y-2 text-trafego-text-primary ${
            isMobile ? 'text-sm' : 'text-base'
          }`}>
            <p>
              Todo esse processo pode durar até <strong className="text-trafego-accent-primary">15 dias</strong>, dependendo do seu projeto.
            </p>
            <p>
              Fique tranquilo, sua campanha vai ao ar dentro desse prazo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
