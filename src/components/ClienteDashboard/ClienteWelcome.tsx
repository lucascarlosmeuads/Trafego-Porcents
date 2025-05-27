
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, FileText, Folder, BarChart3, DollarSign, Users } from 'lucide-react'

interface ClienteWelcomeProps {
  onTabChange: (tab: string) => void
}

export function ClienteWelcome({ onTabChange }: ClienteWelcomeProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

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
      menuAction: () => onTabChange('briefing')
    },
    {
      id: 2,
      title: 'Enviar Materiais',
      description: 'Você pode anexar imagens, vídeos ou textos no menu "Criativos".',
      icon: Folder,
      menuAction: () => onTabChange('materiais')
    },
    {
      id: 3,
      title: 'Configurar sua BM com o Gestor Auxiliar',
      description: 'Você será orientado diretamente por um gestor via WhatsApp.',
      icon: Users,
      menuAction: null
    },
    {
      id: 4,
      title: 'Recarregar valor para tráfego pago',
      description: 'Combine o valor e forma de recarga com o gestor auxiliar.',
      icon: DollarSign,
      menuAction: null
    },
    {
      id: 5,
      title: 'Analisar Métricas e Escalar',
      description: 'No menu "Vendas", você poderá acompanhar seus resultados com o gestor.',
      icon: BarChart3,
      menuAction: () => onTabChange('vendas')
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
          🧭 Bem-vindo!
        </h1>
        <p className="text-lg text-muted-foreground">
          Veja abaixo o passo a passo da sua campanha:
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step) => {
          const isCompleted = completedSteps.has(step.id)
          const StepIcon = step.icon
          
          return (
            <Card key={step.id} className={`transition-all ${
              isCompleted ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'hover:shadow-md'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Step Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        Passo {step.id}
                      </Badge>
                      <h3 className={`text-lg font-semibold ${
                        isCompleted ? 'text-green-700 dark:text-green-300' : 'text-foreground'
                      }`}>
                        {step.title}
                      </h3>
                    </div>
                    
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                    
                    {/* Action Row */}
                    <div className="flex items-center justify-between">
                      {step.menuAction && (
                        <button
                          onClick={step.menuAction}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          Ir para {step.title}
                        </button>
                      )}
                      
                      {/* Checkbox */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`step-${step.id}`}
                          checked={isCompleted}
                          onCheckedChange={() => toggleStep(step.id)}
                        />
                        <label 
                          htmlFor={`step-${step.id}`}
                          className="text-sm font-medium cursor-pointer"
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
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800 dark:text-blue-200 flex items-center gap-2">
            📌 Observação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-blue-700 dark:text-blue-300">
            <p>
              Todo esse processo pode durar até <strong>15 dias</strong>, dependendo do seu projeto.
            </p>
            <p>
              Fique tranquilo, sua campanha vai ao ar dentro desse prazo.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Progresso Atual</h3>
            <div className="text-3xl font-bold text-primary">
              {completedSteps.size} / {steps.length}
            </div>
            <p className="text-sm text-muted-foreground">
              {completedSteps.size === steps.length 
                ? '🎉 Parabéns! Você completou todos os passos!'
                : `Você completou ${completedSteps.size} de ${steps.length} passos`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
