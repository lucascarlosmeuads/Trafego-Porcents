
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, FileText, Folder, BarChart3, DollarSign, Users, ArrowRight } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

interface ClienteWelcomeProps {
  onTabChange: (tab: string) => void
}

export function ClienteWelcome({ onTabChange }: ClienteWelcomeProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const isMobile = useIsMobile()

  const toggleStep = (stepNumber: number) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(stepNumber)) {
      newCompleted.delete(stepNumber)
    } else {
      newCompleted.add(stepNumber)
    }
    setCompletedSteps(newCompleted)
  }

  const steps = [
    {
      id: 1,
      title: 'Preencher Formulário',
      description: 'Clique no menu lateral em "Briefing" e preencha com seus dados.',
      icon: FileText,
      menuAction: () => onTabChange('briefing'),
      actionLabel: 'Ir para Briefing'
    },
    {
      id: 2,
      title: 'Enviar Materiais',
      description: 'Você pode anexar imagens, vídeos ou textos no menu "Criativos".',
      icon: Folder,
      menuAction: () => onTabChange('arquivos'),
      actionLabel: 'Ir para Criativos'
    },
    {
      id: 3,
      title: 'Configurar sua BM com o Gestor Auxiliar',
      description: 'Você será orientado diretamente por um gestor via WhatsApp.',
      icon: Users,
      menuAction: null,
      actionLabel: null
    },
    {
      id: 4,
      title: 'Recarregar valor para tráfego pago',
      description: 'Combine o valor e forma de recarga com o gestor auxiliar.',
      icon: DollarSign,
      menuAction: null,
      actionLabel: null
    },
    {
      id: 5,
      title: 'Analisar Métricas e Escalar',
      description: 'No menu "Vendas", você poderá acompanhar seus resultados com o gestor.',
      icon: BarChart3,
      menuAction: () => onTabChange('vendas'),
      actionLabel: 'Ir para Vendas'
    }
  ]

  const progressPercentage = Math.round((completedSteps.size / steps.length) * 100)

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4 px-2">
        <h1 className={`${
          isMobile ? 'text-2xl' : 'text-3xl'
        } font-bold text-card-foreground flex items-center justify-center gap-2 sm:gap-3`}>
          🧭 Bem-vindo!
        </h1>
        <p className={`${
          isMobile ? 'text-base' : 'text-lg'
        } text-muted-foreground leading-relaxed`}>
          Veja abaixo o passo a passo da sua campanha:
        </p>
      </div>

      {/* Progress Summary Card */}
      <Card className="bg-card border-primary/20">
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
          <div className="space-y-3">
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-primary`}>
              Progresso Atual
            </h3>
            <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-primary`}>
              {completedSteps.size} / {steps.length}
            </div>
            <div className="w-full bg-muted rounded-full h-2 sm:h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 sm:h-3 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className={`${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground`}>
              {completedSteps.size === steps.length 
                ? '🎉 Parabéns! Você completou todos os passos!'
                : `${progressPercentage}% concluído`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-3 sm:space-y-4">
        {steps.map((step) => {
          const isCompleted = completedSteps.has(step.id)
          const StepIcon = step.icon
          
          return (
            <Card key={step.id} className={`transition-all duration-200 ${
              isCompleted 
                ? 'bg-accent border-primary/40 shadow-md' 
                : 'bg-card hover:shadow-md border-border hover:bg-accent/50'
            }`}>
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Step Icon */}
                  <div className={`flex-shrink-0 ${
                    isMobile ? 'w-8 h-8' : 'w-10 h-10'
                  } rounded-full flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : 'bg-blue-500 text-white'
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
                      <Badge variant="outline" className={`${
                        isMobile ? 'text-xs' : 'text-sm'
                      } w-fit`}>
                        Passo {step.id}
                      </Badge>
                      <h3 className={`${
                        isMobile ? 'text-base' : 'text-lg'
                      } font-semibold ${
                        isCompleted 
                          ? 'text-primary' 
                          : 'text-card-foreground'
                      } break-words`}>
                        {step.title}
                      </h3>
                    </div>
                    
                    <p className={`${
                      isMobile ? 'text-sm' : 'text-base'
                    } text-muted-foreground leading-relaxed`}>
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
                            className="w-full sm:w-auto flex items-center gap-2 text-primary border-primary/20 hover:bg-accent hover:border-primary/30"
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
                          onCheckedChange={() => toggleStep(step.id)}
                          className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                        />
                        <label 
                          htmlFor={`step-${step.id}`}
                          className={`${
                            isMobile ? 'text-sm' : 'text-base'
                          } font-medium cursor-pointer whitespace-nowrap text-card-foreground`}
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
      <Card className="bg-card border-primary/20">
        <CardHeader className={isMobile ? 'pb-3' : ''}>
          <CardTitle className={`${
            isMobile ? 'text-base' : 'text-lg'
          } text-primary flex items-center gap-2`}>
            📌 Observação
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? 'pt-0' : ''}>
          <div className={`space-y-2 text-card-foreground ${
            isMobile ? 'text-sm' : 'text-base'
          }`}>
            <p>
              Todo esse processo pode durar até <strong>15 dias</strong>, dependendo do seu projeto.
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
