
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useClienteData } from '@/hooks/useClienteData'
import { useAuth } from '@/hooks/useAuth'
import { 
  FileText, 
  Upload, 
  Headphones, 
  DollarSign,
  Globe,
  BarChart3,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

interface MobileOnboardingStepsProps {
  onTabChange: (tab: string) => void
}

export function MobileOnboardingSteps({ onTabChange }: MobileOnboardingStepsProps) {
  const { user } = useAuth()
  const { cliente, briefing, arquivos } = useClienteData(user?.email || '')

  const steps = [
    {
      id: 'briefing',
      title: 'Formulário',
      description: 'Complete as informações',
      icon: FileText,
      completed: !!briefing,
      required: true
    },
    {
      id: 'arquivos', 
      title: 'Materiais',
      description: 'Upload de fotos/vídeos',
      icon: Upload,
      completed: arquivos.length > 0,
      required: true
    },
    {
      id: 'suporte',
      title: 'Suporte',
      description: 'Se necessário',
      icon: Headphones,
      completed: false,
      required: false
    },
    {
      id: 'comissao',
      title: 'Comissão',
      description: 'Confirme o valor',
      icon: DollarSign,
      completed: cliente?.comissao_confirmada || false,
      required: true
    },
    {
      id: 'site',
      title: 'Site',
      description: 'Descreva como deseja',
      icon: Globe,
      completed: !!cliente?.site_descricao_personalizada,
      required: false
    },
    {
      id: 'vendas',
      title: 'Métricas',
      description: 'Após campanha ativa',
      icon: BarChart3,
      completed: false,
      required: false
    }
  ]

  const completedSteps = steps.filter(step => step.completed).length
  const progress = (completedSteps / steps.length) * 100

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Configure Sua Campanha</CardTitle>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{completedSteps}/{steps.length} Concluído</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {Math.round(progress)}%
            </Badge>
          </div>
          <Progress value={progress} className="w-full h-2" />
        </CardHeader>
      </Card>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 gap-3">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = step.completed
          const isDisabled = index > 0 && !steps[0].completed
          
          return (
            <Card 
              key={step.id}
              className={`
                transition-all duration-200
                ${isCompleted 
                  ? 'border-green-200 bg-green-50' 
                  : isDisabled 
                    ? 'border-gray-200 bg-gray-50 opacity-60' 
                    : 'border-gray-200 hover:border-blue-300'
                }
              `}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isDisabled 
                          ? 'bg-gray-300 text-gray-500'
                          : 'bg-blue-100 text-blue-600'
                      }
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {step.title}
                        </h4>
                        {step.required && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200 flex-shrink-0">
                            Obrig.
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">{step.description}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => onTabChange(step.id)}
                    disabled={isDisabled}
                    variant={isCompleted ? "outline" : "default"}
                    size="sm"
                    className={`
                      ml-2 flex-shrink-0
                      ${isCompleted ? "text-green-600 border-green-300" : ""}
                    `}
                  >
                    {isCompleted ? (
                      'Ver'
                    ) : (
                      <>
                        {isDisabled ? 'Block.' : 'Ir'}
                        {!isDisabled && <ArrowRight className="w-3 h-3 ml-1" />}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tips */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-yellow-800 mb-2 text-sm">💡 Dicas:</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Complete o briefing primeiro</li>
            <li>• Envie bastante material visual</li>
            <li>• Métricas aparecem após ativação</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
